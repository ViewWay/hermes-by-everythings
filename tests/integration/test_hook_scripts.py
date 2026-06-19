"""
Hook 脚本完整性测试

防止 hook 链静默崩溃的回归测试。

背景：bash-hook-dispatcher.js 曾 require 7 个错误路径的模块
（文件实际在 _optional/ 和 _ecc/ 子目录），导致 block-no-verify
（拦截 git --no-verify）和 gateguard（fact-forcing）等安全 hook
完全没运行，且因 install.sh 末尾的 2>/dev/null || true 静默吞错
而长期未被发现。

本测试做两件事：
1. require() 所有 dispatcher 脚本，验证 require 链完整（抓 MODULE_NOT_FOUND）
2. 解析 settings.json + hooks/hooks.json，验证引用的脚本路径全部存在
"""

import json
import re
import subprocess
from pathlib import Path

import pytest

from tests.conftest import PROJECT_ROOT


# 所有应该能被 require 的 dispatcher / 入口脚本
# （被 hook 配置直接引用，require 链必须完整）
HOOK_ENTRY_SCRIPTS = [
    "scripts/hooks/bash-hook-dispatcher.js",
    "scripts/hooks/pre-bash-dispatcher.js",
    "scripts/hooks/post-bash-dispatcher.js",
    "scripts/hooks/session-start.js",
    "scripts/hooks/session-end.js",
    "scripts/hooks/post-tool.js",
    "scripts/hooks/block-no-verify.js",
    "scripts/hooks/auto-tmux-dev.js",
]


def _extract_script_paths_from_command(command: str) -> str | None:
    """从 hook command 字符串提取相对脚本路径。

    例：
      'node scripts/hooks/session-start.js' -> 'scripts/hooks/session-start.js'
      'bash scripts/core/hooks/auto-learn.sh' -> 'scripts/core/hooks/auto-learn.sh'
      'node "${CLAUDE_PLUGIN_ROOT}/scripts/hooks/x.js"' -> 'scripts/hooks/x.js'
    """
    # 去掉 ${...}/ 前缀
    cleaned = re.sub(r"\$\{[^}]+\}/?", "", command)
    # 去掉 node / bash 前缀
    cleaned = re.sub(r"^(node|bash|sh)\s+", "", cleaned).strip()
    # 去掉首尾引号
    cleaned = cleaned.strip('"').strip("'")
    # 取第一个 token（脚本路径，可能后跟参数）
    cleaned = cleaned.split()[0] if cleaned else ""
    return cleaned if cleaned.endswith((".js", ".sh", ".py")) else None


def _all_hook_commands() -> list[tuple[str, str]]:
    """收集所有 hook 配置里的 command 字符串。

    返回 [(source_file, command), ...]
    """
    commands = []
    sources = [
        PROJECT_ROOT / "hooks" / "hooks.json",
        PROJECT_ROOT / ".claude" / "settings.json",
    ]
    for src in sources:
        if not src.exists():
            continue
        data = json.loads(src.read_text())

        def walk(obj):
            if isinstance(obj, dict):
                if "command" in obj:
                    commands.append((str(src.relative_to(PROJECT_ROOT)), obj["command"]))
                for v in obj.values():
                    walk(v)
            elif isinstance(obj, list):
                for item in obj:
                    walk(item)

        walk(data)
    return commands


@pytest.mark.integration
class TestHookRequireChain:
    """验证 hook dispatcher 的 require 链完整。"""

    @pytest.mark.parametrize("script", HOOK_ENTRY_SCRIPTS,
                             ids=lambda s: s.split("/")[-1])
    def test_dispatcher_can_be_required(self, script):
        """每个 hook 入口脚本必须能被 require()，不抛 MODULE_NOT_FOUND。

        这是阶段 1 修复的核心回归测试。bash-hook-dispatcher.js 曾因
        require 路径错误（7 个模块指向错误子目录）导致整个 pre-bash
        安全 hook 链崩溃。
        """
        script_path = PROJECT_ROOT / script
        if not script_path.exists():
            pytest.skip(f"{script} not found")

        # 用子进程 require，避免污染当前 Python 进程
        result = subprocess.run(
            ["node", "-e", f"require('./{script}');"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            timeout=10,
        )
        assert result.returncode == 0, (
            f"require('{script}') failed with exit {result.returncode}.\n"
            f"stderr: {result.stderr}\n"
            f"This means the hook's require chain is broken — the hook "
            f"will crash silently at runtime (often hidden by 2>/dev/null)."
        )


@pytest.mark.integration
class TestHookScriptPathsExist:
    """验证 hook 配置引用的所有脚本路径真实存在。"""

    def test_all_referenced_hook_scripts_exist(self):
        """settings.json + hooks/hooks.json 引用的脚本必须存在。

        回归保护：.claude/settings.json 曾引用 scripts/hooks/auto-learn.sh
        和 file-type-detect.sh，但实际在 scripts/core/hooks/ 下，
        导致每次 SessionEnd/PostToolUse 报 command not found。
        """
        commands = _all_hook_commands()
        assert len(commands) > 0, "No hook commands found — config parsing broken?"

        missing = []
        for source, command in commands:
            script_rel = _extract_script_paths_from_command(command)
            if script_rel is None:
                continue  # 非 .js/.sh 命令，跳过
            script_path = PROJECT_ROOT / script_rel
            if not script_path.exists():
                missing.append(f"{source}: '{command}' -> {script_rel} (missing)")

        assert not missing, (
            "Hook configs reference non-existent scripts:\n  "
            + "\n  ".join(missing)
        )

    def test_no_legacy_hbe_colon_in_settings(self):
        """.claude/settings.json 不得残留 /hbe:xxx 旧命名。

        回归保护：settings.json 的 failures 映射曾用 hbe:build-fix /
        hbe:tdd 冒号格式，且 hbe:fix-types 命令根本不存在。
        """
        settings = PROJECT_ROOT / ".claude" / "settings.json"
        if not settings.exists():
            pytest.skip("settings.json not found")
        content = settings.read_text()
        # 找 hbe: 后跟字母的旧命名（排除 json:// 等 url）
        legacy = re.findall(r'"hbe:[a-z]', content)
        assert not legacy, (
            f"settings.json contains legacy hbe:xxx command(s): {legacy}. "
            f"Namespace migrated to hbe-xxx (hyphen)."
        )

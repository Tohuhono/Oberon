#!/bin/bash

INPUT=$(cat)

extract_command() {
  if command -v jq >/dev/null 2>&1; then
    echo "$INPUT" | jq -r '.tool_input.command // ""'
    return
  fi

  if command -v node >/dev/null 2>&1; then
    echo "$INPUT" | node -e '
      let input = "";
      process.stdin.on("data", (chunk) => {
        input += chunk;
      });
      process.stdin.on("end", () => {
        try {
          const payload = JSON.parse(input);
          const command = payload?.tool_input?.command;
          process.stdout.write(typeof command === "string" ? command : "");
        } catch {
          process.stdout.write("");
        }
      });
    '
    return
  fi

  if command -v python3 >/dev/null 2>&1; then
    echo "$INPUT" | python3 -c 'import json, sys
try:
    payload = json.load(sys.stdin)
except Exception:
    payload = {}
command = payload.get("tool_input", {}).get("command", "")
if isinstance(command, str):
    sys.stdout.write(command)
'
    return
  fi

  echo ""
}

COMMAND=$(extract_command)

if [ -z "$COMMAND" ]; then
  exit 0
fi

block_command() {
  local reason="$1"
  echo "BLOCKED: '$COMMAND'. $reason" >&2
  exit 2
}

if echo "$COMMAND" | grep -qE '(^|[[:space:]])pnpm([[:space:]]|$)' &&
  echo "$COMMAND" | grep -qE -- '(^|[[:space:]])--lockfile-only([[:space:]=]|$)'; then
  block_command "Do not use '--lockfile-only'. Use plain 'pnpm install' so the lockfile is refreshed."
fi

if echo "$COMMAND" | grep -qE '(^|[[:space:]])pnpm([[:space:]]|$)' &&
  echo "$COMMAND" | grep -qE -- '(^|[[:space:]])--filter([[:space:]=]|$)'; then
  block_command "Do not use 'pnpm --filter'. Use commands from the base package.json to ensure dependency caching with turborepo."
fi

if echo "$COMMAND" | grep -qE '(^|[[:space:]])pnpm([[:space:]]|$)' &&
  echo "$COMMAND" | grep -qE -- '(^|[[:space:]])-F([[:space:]]|$)'; then
  block_command "Do not use 'pnpm --filter'. Use commands from the base package.json to ensure dependency caching with turborepo."
fi

if echo "$COMMAND" | grep -qE '(^|[;&|][[:space:]]*)rm[[:space:]][^;&|]*-[^[:space:]]*f[^[:space:]]*'; then
  block_command "Do not use 'rm' with '-f'. Remove files without forcing."
fi

if echo "$COMMAND" | grep -qE '(^|[;&|][[:space:]]*)rm[[:space:]][^;&|]*--force([[:space:]]|$)'; then
  block_command "Do not use 'rm' with '--force'. Remove files without forcing."
fi

DANGEROUS_PATTERNS=(
  "gh alias"
  "gh api"
  "gh auth"
  "gh cache"
  "gh codespace"
  "gh extension"
  "gh gist"
  "gh gpg-key"
  "gh issue delete"
  "gh label delete"
  "gh project"
  "gh release"
  "gh repo"
  "gh run"
  "gh secret"
  "gh ssh-key"
  "gh variable"
  "gh workflow"
  "git branch -D"
  "git checkout \."
  "git clean -f"
  "git clean -fd"
  "git reset --hard"
  "git restore \."
  "push --force"
  "reset --hard"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    echo "BLOCKED: '$COMMAND' matches dangerous pattern '$pattern'. The user has prevented you from doing this." >&2
    exit 2
  fi
done

exit 0
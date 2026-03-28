#!/bin/bash
# Ralph stream-json formatter
# Reads NDJSON from stdin, prints human-readable lines to stdout.
# Usage: claude --print --verbose --output-format stream-json | ralph-format.sh

while IFS= read -r line; do
  # Skip malformed lines
  TYPE=$(echo "$line" | jq -r '.type // empty' 2>/dev/null) || continue
  [[ -z "$TYPE" ]] && continue

  TS=$(date +"%H:%M:%S")

  case "$TYPE" in
    assistant)
      # Show tool calls: "name<TAB>param" per line
      echo "$line" | jq -r '
        .message.content[]? | select(.type == "tool_use") |
        .name + "\t" + (
          if .name == "Bash" then (.input.command // "")[0:80]
          elif .name == "Grep" or .name == "Glob" then (.input.pattern // "")[0:80]
          else (.input.file_path // .input.path // "")[0:80]
          end
        )
      ' 2>/dev/null | while IFS=$'\t' read -r tool_name tool_param; do
        printf "[%s] %s — %s\n" "$TS" "$tool_name" "$tool_param"
      done

      # Show text content (separate pass to avoid delimiter issues)
      TEXT=$(echo "$line" | jq -r '
        [.message.content[]? | select(.type == "text") | .text] | join(" ")
      ' 2>/dev/null)
      if [[ -n "$TEXT" && "$TEXT" != "null" ]]; then
        [[ ${#TEXT} -gt 200 ]] && TEXT="${TEXT:0:197}..."
        printf "[%s] %s\n" "$TS" "$TEXT"
      fi
      ;;
    result)
      DURATION=$(echo "$line" | jq -r '.duration_ms // 0' 2>/dev/null)
      COST=$(echo "$line" | jq -r '.total_cost_usd // 0' 2>/dev/null)
      # Format duration
      SECS=$(( DURATION / 1000 ))
      printf "[%s] Done — %ds · \$%s\n" "$TS" "$SECS" "$COST"
      ;;
  esac
done

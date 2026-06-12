#!/usr/bin/env bash
# Print the exact GitHub status check names from the security workflow.
# Run this locally to get the strings to paste into branch protection settings.

set -euo pipefail

workflow=".github/workflows/security.yml"

if [[ ! -f "$workflow" ]]; then
  echo "Error: $workflow not found" >&2
  exit 1
fi

echo "Exact status check names (copy into branch protection):"
echo "---"
grep '^    name:' "$workflow" | sed 's/^    name: //'
echo "---"

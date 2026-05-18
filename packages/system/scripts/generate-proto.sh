#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if command -v buf >/dev/null 2>&1; then
  BUF=buf
elif [[ -x "${ROOT}/node_modules/.bin/buf" ]]; then
  BUF="${ROOT}/node_modules/.bin/buf"
else
  echo "buf is required: pnpm add -D @bufbuild/buf (https://buf.build/docs/installation)" >&2
  exit 1
fi

"$BUF" lint
"$BUF" generate

echo "Proto types generated in src/generated/federation"

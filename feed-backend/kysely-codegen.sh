#!/usr/bin/env bash

set -euo pipefail

here="$(cd "$(dirname "$0")" >/dev/null 2>&1 && pwd)"

DATABASE_URL=postgres://postgres:password@localhost:5432/postgres npx kysely-codegen --out-file src/db/kysely-types/postgres.d.ts

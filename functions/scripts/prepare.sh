#!/bin/bash
set -o verbose

if [[ -z "$GOOGLE_FUNCTION_TARGET" ]]; then
    npm run build
fi

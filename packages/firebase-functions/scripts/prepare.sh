#!/bin/bash
set -o verbose

# Only run if the GOOGLE_FUNCTION_TARGET is not set
if [[ -z "$GOOGLE_FUNCTION_TARGET" ]]; then
    npm run build
fi

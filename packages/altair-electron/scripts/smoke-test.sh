#!/usr/bin/env bash
# smoke-test.sh <launch_cmd>
#
# Launches the Electron app with --smoke-test, which causes it to exit cleanly
# once the window's ready-to-show event fires, verifying the full startup path:
# custom protocol handler, altair-static file loading, and renderer initialisation.
#
# --enable-logging is also passed so Chromium/main-process logs appear in CI output.
#
# Usage:
#   ./smoke-test.sh "xvfb-run --auto-servernum ./app.AppImage --appimage-extract-and-run --no-sandbox"
#   ./smoke-test.sh "./Altair GraphQL Client"
#   ./smoke-test.sh "./altair.exe"

set -euo pipefail

LAUNCH_CMD="${1:-}"

if [ -z "$LAUNCH_CMD" ]; then
  echo "Usage: $0 <launch_cmd>"
  exit 1
fi

echo "Launching: $LAUNCH_CMD"

eval "$LAUNCH_CMD" --enable-logging --smoke-test &
APP_PID=$!

# Wait up to 60s for the app to exit cleanly on its own (smoke-test mode)
for i in $(seq 1 60); do
  if ! kill -0 $APP_PID 2>/dev/null; then
    wait $APP_PID
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 0 ]; then
      echo "Smoke test passed: app exited cleanly (code 0)"
    else
      echo "Smoke test failed: app exited with code $EXIT_CODE"
      exit 1
    fi
    exit 0
  fi
  sleep 1
done

echo "Smoke test failed: app did not reach ready-to-show within 60s"
kill $APP_PID
exit 1

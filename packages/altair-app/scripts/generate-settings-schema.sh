#!/bin/bash

yarn --cwd ../altair-core typescript-json-schema --ignoreErrors src/types/state/settings.interfaces.ts SettingsState  --out ../altair-app/src/app/modules/altair/utils/settings.schema.json
yarn ajv compile -s src/app/modules/altair/utils/settings.schema.json -o src/app/modules/altair/utils/validate_settings_schema.js

#!/bin/bash

yarn typescript-json-schema --ignoreErrors src/types/state/settings.interfaces.ts SettingsState  --out build/settings.schema.json
yarn ajv compile -s build/settings.schema.json -o build/validate-settings.js
yarn cpy src/validate-settings.d.ts build/

yarn typescript-json-schema --ignoreErrors src/types/state/settings.interfaces.ts PartialSettingsState  --out build/partial_settings.schema.json
yarn ajv compile -s build/partial_settings.schema.json -o build/validate-partial-settings.js
yarn cpy src/validate-partial-settings.d.ts build/

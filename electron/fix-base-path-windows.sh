#!/bin/bash

OLD_BASE='<base href="/">'
NEW_BASE='<base href="./">'
sed -i '' "s|$OLD_BASE|$NEW_BASE|g" .\dist\index.html

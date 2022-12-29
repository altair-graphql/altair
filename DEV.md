## Troubleshooting

I've encountered some weird specific behavior that occur often, so documenting here when I see such what to do

### "no elements in sequence" error

https://stackoverflow.com/a/55380827/3929126
EmptyError is thrown by the `first` pipe if the source observable is closed before it could emit any notification.

Fix: Use `take(1)` instead of `first()`.


### Firebase: The caller does not have permission
`The caller does not have permission; Please refer to https://firebase.google.com/docs/auth/admin/create-custom-tokens for more details on how to use and troubleshoot this feature.`

For this error, you need to open your Google Cloud Console and add `Service Account Token Creator` role to your:
- `App Engine default service account` (this is the one that worked for me)
- `Firebase service account`
- `Google Cloud Functions Service Agent`

https://dev.to/wceolin/permission-error-when-generating-a-custom-token-on-cloud-functions-1e6c
https://firebase.google.com/docs/auth/admin/create-custom-tokens#service_account_does_not_have_required_permissions

### Something weird is broken, with no obvious way to fix
Delete all node_modules (rm -rf node_modules && rm -rf packages/*/node_modules)
Remove node_modules/.cache/nx
Remove angular cache (packages/altair-app/.angular)

### TSC CLI and VS Code showing different behavior for typescript errors
Check that the typescript versions in all the relevant packages are the same (use `yarn why typescript`)

### Typescript is not detecting possibly undefined issues
Check that you have `strictNullChecks` option enabled in tsconfig.json

### Firestore getDocs() failing with permission denied
https://firebase.google.com/docs/firestore/security/rules-query#rules_are_not_filters
https://stackoverflow.com/a/71948534/3929126
Firestore compares the condition added to the query with the security rules, and they have to match. Otherwise it fails, even if the actual data set that would be returned would have met the conditions.

### Colorize firestore rules coverage
https://github.com/firebase/firebase-tools/issues/1289
```css
.coverage-expr:hover {
    border-bottom: 3px dashed rgb(0, 0, 0);
    cursor: default;
}

.coverage-expr[title="Expression never evaluated"] {
    background: lightyellow;
}

.coverage-expr[title^="Value true returned"] {
    background: lightgreen;
}

.coverage-expr[title^="Value false returned"] {
    background: lightcoral;
}

.coverage-expr[title^="Expression short-circuited"] {
    background: lightgrey;
}

.coverage-expr[title^="Error"] {
    background: red;
}
```
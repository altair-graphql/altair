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

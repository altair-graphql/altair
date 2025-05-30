## Manual testing flows

We don't have as much unit tests in place as I would like (while there are extensive unit tests for some flows, a lot of components just have one unit test which just checks that the component can be created). These manual testing flows tests the critical flows as well. These should be migrated to automated integration testing where possible, and just the flows that can't be automated should be tested manually.

1. Create new window
1. Send request with pre- and post-request scripts.
1. Manage collection (create, open query, create nested, delete).

## Troubleshooting

I've encountered some weird specific behavior that occur often, so documenting here when I see such what to do

### "no elements in sequence" error

https://stackoverflow.com/a/55380827/3929126
EmptyError is thrown by the `first` pipe if the source observable is closed before it could emit any notification.

Fix: Use `take(1)` instead of `first()`.

### Multiple actions/requests, only one is going through

In the ngrx effects, use `mergeMap` instead of `switchMap`

### Firebase: The caller does not have permission

`The caller does not have permission; Please refer to https://firebase.google.com/docs/auth/admin/create-custom-tokens for more details on how to use and troubleshoot this feature.`

For this error, you need to open your Google Cloud Console and add `Service Account Token Creator` role to your:

- `App Engine default service account` (this is the one that worked for me)
- `Firebase service account`
- `Google Cloud Functions Service Agent`

https://dev.to/wceolin/permission-error-when-generating-a-custom-token-on-cloud-functions-1e6c
https://firebase.google.com/docs/auth/admin/create-custom-tokens#service_account_does_not_have_required_permissions

### Something weird is broken, with no obvious way to fix

Delete all node_modules (`rm -rf node_modules && rm -rf packages/\*/node_modules`)
Remove all caches
Run `pnpm i` to install all dependencies again.
Run bootstrap script with --force flag (`pnpm bootstrap --force`) to ignore any turbo cache

```bash
rm -rf node_modules && rm -rf packages/*/node_modules
rm -rf .turbo && rm -rf packages/*/.turbo
rm -rf .nx/ .turbo/ .parcel-cache/ packages/altair-app/.angular
pnpm i
pnpm bootstrap --force
```

### TSC CLI and VS Code showing different behavior for typescript errors

Check that the typescript versions in all the relevant packages are the same (use `yarn why typescript`)

### Typescript is not detecting possibly undefined issues

Check that you have `strictNullChecks` option enabled in tsconfig.json

### Firestore getDocs() failing with permission denied

https://firebase.google.com/docs/firestore/security/rules-query#rules_are_not_filters
https://stackoverflow.com/a/71948534/3929126
Firestore compares the condition added to the query with the security rules, and they have to match. Otherwise it fails, even if the actual data set that would be returned would have met the conditions.

Always check for presence of property on `resource.data` before use e.g. `'ownerUid' in resource.data ? resource.data.ownerUid : false`.

### Colorize firestore rules coverage

https://github.com/firebase/firebase-tools/issues/1289

```css
.coverage-expr:hover {
  border-bottom: 3px dashed rgb(0, 0, 0);
  cursor: default;
}

.coverage-expr[title='Expression never evaluated'] {
  background: lightyellow;
}

.coverage-expr[title^='Value true returned'] {
  background: lightgreen;
}

.coverage-expr[title^='Value false returned'] {
  background: lightcoral;
}

.coverage-expr[title^='Expression short-circuited'] {
  background: lightgrey;
}

.coverage-expr[title^='Error'] {
  background: red;
}
```

docker build --platform=linux/amd64 -t test-demo .
docker run -p 3000:3000 test-demo

### Adding resolution for `oauth` package to fix [this issue](https://github.com/jaredhanson/passport-google-oauth2/issues/87) as the passport-google-oauth20 uses an older version with the issue

### SSL too many redirects

If using Cloudflare DNS, you need to setup full SSL mode instead of flexible mode

### Stripe (altair subscription) product requirements

- Always create plan config in the database first
- Product should have `role` metadata that corresponds to `PlanConfig` id in the database
- Product should have `type` metadata set to `plan`
- Product should have recurring pricing

### Stripe credit product requirements

- Create a product with `type` metadata set to `credit`

<!-- background:linear-gradient(135deg,#00F5A0 0%,#00D9F5 100%); -->

### Signing MacOS app

https://www.codiga.io/blog/notarize-sign-electron-app/

### Updating angular

- Temporarily replace all local packages with their `file:` protocol versions (so that yarn doesn't fail while searching registry for them)
- Run the update command e.g. `yarn ng update @angular/core@16 @angular/cli@16 --allow-dirty --force`
- Run migrate only commands if not completely successful
  - `yarn ng update @angular/core --allow-dirty --force --migrate-only --from=15 --to=16`
  - `yarn ng update @angular/cli --allow-dirty --force --migrate-only --from=15 --to=16`

### Stripe listen throwing api_key_expired error

Login to stripe CLI using `stripe login` and it should work again

### Running `prisma migrate dev` wants to wipe all data

- Backup the data before running the command.
- Remove all database and table creation commands from the backup file.
- Run the migration command.
- Restore it after the command.
  - Run the restore command multiple times if it fails due to foreign key constraints, until all foreign key constraints are replaced with duplicate key value errors.

```bash
env $(cat .env | xargs) pg_dump --dbname=altairgraphql-db --port=5432 --host=localhost --username=my_db_user > data.sql

yarn prisma migrate dev

psql --file=data.sql --dbname=altairgraphql-db --port=5432 --host=localhost --username=my_db_user
```

## Tips

- add `&pgbouncer=true` to your connection url in order to enable pgbouncer mode in Prisma

### Slow running development application

If the local development application feels extremely slow, check if you have the [Angular DevTools extension](https://chromewebstore.google.com/detail/angular-devtools/ienfalfjdbdpebioblfackkekamfmbnh) installed on your browser and disable it. It slows down the application significantly.

## Importing request data in chrome extension

Setup a web extension service, which sets up a listener for messages from the devtools panel. To import request data from the devtools panel, we open the Altair app, then send a message to the Altair app which is part of the extension (so can be considered an extension page) using the `chrome.runtime.sendMessage` method. The extension page processes the message and imports the request data into the Altair app.

To make sure the Altair app is loaded and ready to receive the message, we send a ping message to the Altair app, and wait for the pong message before sending the actual message. We also wait for the ready message from the Altair app in case it is not loaded yet to have received the ping message.

## Services using GraphQL

https://medium.com/
https://www.apollographql.com/docs/
https://github.com/graphql-kit/graphql-apis
https://hivdb.stanford.edu/page/graphiql/
https://www.playstation.com/en-us/uncharted/
https://www.lego.com/de-de
https://shop.line.me/@nutriliving?=null
https://www.twitch.tv/vicebean
https://www.kickstarter.com/projects/curtisclow/the-wild-cosmos-1-3-a-sci-fi-fantasy-adventure

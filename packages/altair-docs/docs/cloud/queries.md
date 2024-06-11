---
title: Queries
parent: Cloud
order: 3
---

# Managing your queries

## Workspaces

After signing up for an account, each user gets a workspace. This is where personal queries and collections are stored. Every team has its own workspace as well, where team members can collaborate on queries and collections.

Currently all workspace lifecycles (except `Local`) are tied to the owning user or team. This means that if a user is removed from a team, their workspace is also removed. If a team is deleted, the team's workspace is also deleted. You cannot manually create or delete a workspace.

There is a special workspace called `Local` that is not tied to any user or team. This workspace is used to store queries and collections that are local to the device and not synced to the cloud. This workspace is not shared with other users or teams.

![Available workspaces](/assets/img/docs/available-workspaces.png)

## Collections

Collections are used to organize queries. You can create collections to categorize your queries logically. This makes it easier to find what you need quickly and easily. Collections are `Local` by default unless you add them to a cloud-based workspace (user or team workspace).
![Saving query to collecion in cloud workspace](/assets/img/docs/user-account-saving-query-collection-workspace.png)

Alternatively, you can sync a local collection to your cloud workspace after creating it by clicking the `Sync to remote` button in the collection list. This will move the collection from your local workspace to your cloud workspace.

![Sync collection to cloud](/assets/img/docs/collection-sync-to-remote.png)

## Queries

Queries are the heart of Altair GraphQL Cloud. You can create, edit, and delete queries in collections in your workspace and team workspaces. You can get a shareable link to a query by clicking the `Copy Share URL` link in the available options.

::: tip 💡 Note
Shareable links only work with the desktop apps for now.
:::

![Synced query options](/assets/img/docs/user-account-query-menu.png)

Queries are versioned, so you can keep a history of changes and rollback to a previous version if needed.
![Query version history](/assets/img/docs/user-account-query-revision.png)

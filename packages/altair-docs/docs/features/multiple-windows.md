---
parent: Features
---

# Window management

Altair provides the option to open multiple windows each with a distinct state that is preserved across browser sessions. In addition, you can give each window a custom name. Each window can be used to work on different queries or projects, with distinct endpoints, headers, etc. You don't have to be limited to working on a single query at a time!

![multiple windows](/assets/img/docs/window-management-window-tabs.png)

## Creating a new window

To create a new window, click on the `+ Add New` button on the top right corner of the window. This will open a new window with the same URL as the current window.

## Desktop app deep linking

If you are using the desktop app, you can use deep linking to open a new window with a specific URL. To do this, you can use `altair://new` with the URL you want to open. For example, `altair://new?endpoint=https://api.example.com/graphql`. This will open a new window with the specified URL in the desktop app.

Another deep linking option is for sharing a query with a team member. You can use `altair://share` with the query you want to share. For example, `altair://share?q=<query-id>`. This will open a new window with the shared query in the desktop app.

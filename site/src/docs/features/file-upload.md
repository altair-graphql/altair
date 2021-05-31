---
parent: Features
---

# File Upload

Originally written about [here](https://www.xkoji.dev/blog/working-with-file-uploads-using-altair-graphql/).

You can use binary files as variables to upload them via GraphQL to server (if it implemented the [GraphQL multipart request specification](https://github.com/jaydenseric/graphql-multipart-request-spec)).

Altair supports uploading both single files and an array of files (by switching the file upload from single to multiple file mode, or using the dot notation in single file mode e.g. for an array named `fileList`, you define the files as `fileList.0`, `fileList.1`, `fileList.2` and so on).

![file variables](https://i.imgur.com/dVqWVoA.png)

You add your files in the variables pane, and the files are added to the request as variables when the request is sent to the server.

---
parent: Features
---

# File Upload

_Originally written about [here](https://www.xkoji.dev/blog/working-with-file-uploads-using-altair-graphql/)._

Altair provides convenient support for setting GraphQL query variables. These allow you create dynamic queries based on [provided input](https://graphql.org/graphql-js/passing-arguments/).

You can use binary files as variables to upload them via GraphQL to server (if it implemented the [GraphQL multipart request specification](https://github.com/jaydenseric/graphql-multipart-request-spec)).

Altair supports uploading both single files and an array of files (by switching the file upload from single to multiple file mode, or using the dot notation in single file mode e.g. for an array named `fileList`, you define the files as `fileList.0`, `fileList.1`, `fileList.2` and so on).

![file variables](https://i.imgur.com/dVqWVoA.png)

You add your files in the variables pane, and the files are added to the request as variables when the request is sent to the server.

### Handling nested multiple file upload

Consider the following schema:

```graphql
input FileInput {
  file: Upload!!
}

input MyInput {
  images: [FileInput!]!
}
```

And the following query:

```graphql
mutation ($input: MyInput!) {
  uploadImages(input: $input) {
    success
  }
}
```

You can upload multiple files with the single file mode by defining each file name as `input.images.0.file`, `input.images.1.file`, `input.images.2.file` and so on. This works but can be a bit daunting when you have a lot of files to upload.
You can switch to multiple file mode to make it easier to upload multiple files. For this case, you would define the file name for the files as `input.images.$$.file` (with `$$` as a placeholder for the index of the file). Altair would automatically replace `$$` with the index of the file when sending the request.

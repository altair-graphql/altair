---
parent: Features
---

# Collections

As the number of GraphQL operations you work with increase, you would want to be able to organize and group all these queries in a nice and easy way. This is where collections come in.

![Add to collection](/assets/img/docs/add-to-collection.gif)

You can create and save multiple collections, and organize your queries into different collections and sub collections (for even more scoped queries) based on their purpose or use case. For example, you could create a collection for queries related to a specific project, or for a specific type or data model in the schema.

![Collections side pane](/assets/img/docs/query-collection.png)

To create a collection, click the "Add to collection" button in your query window. Then under **choose a collection**, select "create a new collection". Specify the name and hit "Save".

You can also import/export collections for easy sharing with other members of your team.

## Collection environments

Each collection can have its own set of [environment variables](/docs/features/environment-variables), allowing you to customize the behavior of your queries within that collection. This is particularly useful when working with different stages of development (e.g., development, staging, production) or when collaborating with team members who may have different environment configurations.

<!-- To set up collection-specific environments, navigate to the collection settings and define the environment variables you need. These variables will be used whenever you run queries from that collection, ensuring that you have the right context for your requests. -->

## Collection headers

You can also define custom headers for each collection. This is useful when you need to include specific authentication tokens or other metadata with your requests.

<!-- To set up collection-specific headers, navigate to the collection settings and define the headers you need. These headers will be included in all requests made from that collection. -->

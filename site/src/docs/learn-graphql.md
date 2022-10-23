---
title: Learn GraphQL
---

# Learn about GraphQL

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/GraphQL_Logo.svg/1200px-GraphQL_Logo.svg.png" width="200" height="200">

[GraphQL](https://graphql.org/) is an alternative to [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) for fetching data from a server. Traditionally, the de-facto interface for fetching data from a server to a client is using RESTful APIs to fetch data. However there are a few challenges with using RESTful APIs including uncertain type safety, overfetching or underfetching, out-of-sync documentation, rapid product development cycle, etc. There are ways to address each of these concerns but all that requires extra work and have to be built by the developers. However GraphQL solves these issues natively without extra work required.

GraphQL (short for _Graph Query Language_) is a declarative query language for gatting and updating data from your APIs. It was developed and [opensourced](https://reactjs.org/blog/2015/05/01/graphql-introduction.html) by Facebook in 2015 (although it was already in use internally for several years before that).

It allows you _declare_ the data that you want to receive and the GraphQL API returns exactly that, nothing more _(goodbye overfetching!)_. This also works for complex nested data structures, which would typically require multiple roundtrips to fetch all the data. This helps you create network performant applications since you no longer have to fetch bloated data sets when you only need a subset of the data.

Also it makes use of a single endpoint for all requests and request types, instead of multiple endpoints that return only a predefined set of data.

GraphQL is also strongly-typed. All the data types and structures expected to be returned from the GraphQL API have to be designed and defined as a schema which would be used to validate requests that are received by the GraphQL API. This guarantees that the server only receives the data type it expects.

One other really cool feature is that GraphQL allows [introspection](https://graphql.org/learn/introspection/) of the schema such that clients and tools can know exactly what data types an API needs. This helps with developing awesome GraphQL developer tools like [Altair](/) and allows clients validate their queries before sending them to the API.

## An example
Now that we know what GraphQL is, what does it actually look like? Assuming we have an API for a blog at `api.blog.io`. In this API we have a couple entities as defined below (using typescript annotation):

```ts
interface Post {
  id: number;
  title: string;
  content: string;
  imageIds: number[];
  authorId: number;
  categoryId: number;
}

interface Category {
  id: number;
  title: string;
}

interface Author {
  id: number;
  name: string;
  postIds: number[];
}

interface Image {
  id: number;
  postId: number;
  name: string;
  url: string;
}
```
In a traditional REST setup, this will consist of at least the following endpoints:

- Post - `api.blog.io/posts`
- Category - `api.blog.io/categories`
- Author - `api.blog.io/authors`
- Image - `api.blog.io/posts/{id}/images`

Now let's consider different scenarios:

### Scenario 1 - Get name and ID of all posts
We can achieve this in REST by making a GET request to `api.blog.io/posts`. This will return all the posts. _(1 query in total)_

::: tip
The REST API could be improved to accept an `include` query parameter which will allow you to specify the exact fields you want to receive, like `api.blog.io/posts?include=id,title`. However this gets a lot more complicated the more complex and nested your data is.
:::

We can achieve this in GraphQL using the following query:

```graphql
{
  posts {
    id
    title
  }
}
```

This returns a list of objects containing `id` and `title` for all the posts.

As you can see, we are able to fetch exactly the data we want instead of fetching the whole thing. Also the query syntax is concise and easy to read.

### Scenario 2 - Get all the posts of an author
We can achieve this in REST by making a GET request to `api.blog.io/authors/{id}`. This gives us the `author` object. Then we either query each of the posts in `author.postIds` one after the other using `api.blog.io/posts/{id}`, or we fetch all posts again and filter by the post IDs list for the author. _(2 queries in total)_

::: tip
The REST API could be improved by implementing filtering functionality on it such that you can pass a list of IDs to `api.blog.io/posts` and it returns the filtered list.
:::

We can achieve this in GraphQL using the following query:

```graphql
query authorPosts($authorId: Int!){
  author(id: $authorId) {
    posts
  }
}
```

This query is a little more complicated because we are using [GraphQL variables](/docs/features/variables) for the `authorId` instead of setting it directly like `author(id: 1)`. Using GraphQL variables make it much easier to reuse GraphQL queries.

### Scenario 3 - Get a list of names of the authors and URLs of the images of all posts in a category
We can achieve this in REST by making a GET request to `api.blog.io/categories/{id}/posts`. This gives us the list of `posts` for that category. Then we make a GET request to `api.blog.io/authors/{authorId}` with the `authorId` for each post, which gives us a list of `author`s. Then we make a GET request to `api.blog.io/posts/{postId}/images` for each post, which gives us a list of image lists. _(2n + 1 queries)_

We can achieve this in GraphQL using the following query:

```graphql
query categoryAuthorsAndImages($categoryId: Int!){
  category(id: $categoryId) {
    posts {
      author {
        name
      }
      images {
        url
      }
    }
  }
}
```

With just a single query, we can fetch complicated nested data from our API, and yet it is easy to understand what we are doing from the query!

::: tip
So far we have looked at sending `query` requests for fetching data. However GraphQL also support the `mutation` (for updating/mutating data) and `subscription` (for subscribing to realtime changes) request types. Learn more about them [here](https://graphql.org/learn/queries/).
:::

## GraphQL Schema
As mentioned above, GraphQL is strongly typed and requires developers of a GraphQL API to define the structure of the data that will be received and returned by the API. This defined structure is what is referred to as the GraphQL schema. The GraphQL schema needs to be implemented in the programming language of the API. However since GraphQL is language agnostic, it has its own language for defining the GraphQL schema called [SDL (Schema Definition Language)](https://www.prisma.io/blog/graphql-sdl-schema-definition-language-6755bcb9ce51) which has a simple yet powerful syntax.

::: tip
You can download the SDL for a GraphQL API in Altair from the menu inside the docs section. You can also load a GraphQL schema directly into Altair if for example, you are offline and can't connect to the API, or the API has [introspection disabled](/docs/features/documentation), which is required to power the docs.
:::

The SDL for our hypothetical [blog API](#an-example) could look like this:

```graphql
type Post {
  id: Int!;
  title: String!
  content: String!
  images: [Image!]!
  author: Author!
  category: Category!
}

type Category {
  id: Int!
  title: String!
  posts: [Post!]!
}

type Author {
  id: Int!
  name: String!
  posts: [Post!]!
}

type Image {
  id: Int!
  post: Post!
  name: String!
  url: String!
}
```

## Conclusion
GraphQL is a powerful tool and has a lot of potential. This gives you a brief introduction into what GraphQL has to offer but it definitely does not cover it all. GraphQL is still evolving everyday with the community constantly working to improve the existing standards. There are several other features in GraphQL like [directives](https://graphql.org/learn/queries/#directives) that are not covered here.

To learn more about all the features of GraphQL, take a look at the [graphql docs](https://graphql.org/learn/). You can also explore the GraphQL features within Altair GraphQL client. [Download it today](/#download) and try it out with a public GraphQL API (e.g. Rick and Morty [https://rickandmortyapi.graphcdn.app/](https://rickandmortyapi.graphcdn.app/)).

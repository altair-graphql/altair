---
parent: Tips
---

# Deprecated Collection queries

You might have noticed a confusing warning of deprecated queries within your collections. This is because of changes and improvements made over time on the collections feature. Queries that were added to collections during the first couple of weeks after the collections feature release lacked the required set of metadata for properly managing the queries. While it is possible to add fallbacks for those queries, it makes more sense to just re create those queries to make sure they have the required metadata, rather than adding a fallback into the system that would persist over time.

If you want to re create the query in the collection,

1. Select the query in the collections list to open it.
1. Once it is open, make sure the query name in the collection is unique, delete the query from the collections.
1. After the query is deleted, in the open query window (from the save options), choose to "Add to collection", and save it in the same collection with the same name.
1. After saving it, it should no longer have the deprecated warning.

It is important to ensure that the query name in the collection is unique, because that is how the query would be identified to be deleted.
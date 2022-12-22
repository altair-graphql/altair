// TODO: Use this
interface CollectionRemoteSync {
  sync(): void;
  // when there is a local change, we indicate what change it is [ changeType(CREATE, UPDATE, DELETE), objType(query, collection) ]
  // acknowledge receipt of change from the server
  // clear changes queue
  onChanges(): void;
  // TODO: Listen for server changes
  stopSync(): void;
}

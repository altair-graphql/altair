## Troubleshooting

I've encountered some weird specific behavior that occur often, so documenting here when I see such what to do

### "no elements in sequence" error

https://stackoverflow.com/a/55380827/3929126
EmptyError is thrown by the `first` pipe if the source observable is closed before it could emit any notification.

Fix: Use `take(1)` instead of `first()`.


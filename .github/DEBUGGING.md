### Error fetching account information from store: The request is missing an Authorization header field containing a valid macaroon

Snap login credentials have expired.
`snapcraft login`
`snapcraft export-login --snaps altair -`
That extends the expiration date another year. 
Update `SNAP_STORE_LOGIN` in secrets then simply reran the broken build and that fixed the issue.


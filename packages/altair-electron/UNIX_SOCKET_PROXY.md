# Unix Domain Socket Proxy Support

This feature adds support for Unix domain socket proxies in the Altair GraphQL desktop application, which are commonly used in corporate environments.

## Overview

Unix domain sockets provide IPC (Inter-Process Communication) through filesystem paths instead of network addresses. Some corporate proxy servers listen on Unix sockets for better performance and security.

## Configuration

The feature adds a new proxy setting option: **"Use Unix domain socket proxy"**

### Settings Required:

1. **Socket Path**: The filesystem path to the Unix domain socket (e.g., `/var/run/proxy.sock`)
2. **Socket Type**: Choose between:
   - **HTTP**: Standard HTTP proxy through Unix socket
   - **SOCKS5**: SOCKS5 proxy through Unix socket

## Proxy Rules Format

The implementation follows Electron's proxy configuration format:

- **HTTP proxy**: `unix:/path/to/socket`
- **SOCKS5 proxy**: `socks5://unix:/path/to/socket`

## Example Configuration

### HTTP Proxy Example:
- Socket Path: `/var/run/corporate-proxy.sock`
- Socket Type: HTTP
- Generated Proxy Rule: `unix:/var/run/corporate-proxy.sock`

### SOCKS5 Proxy Example:
- Socket Path: `/tmp/socks-proxy.sock`
- Socket Type: SOCKS5
- Generated Proxy Rule: `socks5://unix:/tmp/socks-proxy.sock`

## Implementation Details

The feature is implemented across three main packages:

1. **altair-electron-interop**: Type definitions for settings
2. **altair-electron-settings**: UI component for configuration
3. **altair-electron**: Proxy configuration logic

## Testing

Unit tests are included in `src/app/proxy-config.spec.ts` to verify:
- Correct formatting of HTTP Unix socket proxy rules
- Correct formatting of SOCKS5 Unix socket proxy rules
- Default behavior when socket type is not specified
- Graceful handling of empty socket paths

## References

- [Electron Proxy Configuration](https://www.electronjs.org/docs/latest/api/session#sessetproxyconfig)
- [Unix Domain Sockets](https://en.wikipedia.org/wiki/Unix_domain_socket)

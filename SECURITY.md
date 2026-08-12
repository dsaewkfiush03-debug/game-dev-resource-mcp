# Security Policy

## Supported versions

Security fixes are applied to the latest stable release line. During the current 1.x series, users should run the newest 1.x release.

## Reporting a vulnerability

Please do not publish exploitable details in a public issue before a fix is available.

If GitHub private vulnerability reporting is enabled for this repository, use **Security → Report a vulnerability**. Otherwise open a minimal public issue that only states that you have a security report and asks the maintainer for a private contact channel; do not include secrets, exploit payloads, private URLs, credentials or weaponized proof-of-concept details in that issue.

Useful reports include:

- affected version/commit;
- affected MCP tool or provider;
- reproduction conditions;
- expected versus observed behavior;
- impact;
- whether the issue can escape the configured project root, bypass the trusted-host allowlist, skip size/hash checks, expose credentials, or cause downloaded content to execute.

## Security boundaries

The project intentionally keeps automatic installation narrow:

- downloads require trusted HTTPS hosts;
- destination paths must remain inside an explicit absolute project root;
- size limits are enforced;
- provider hashes are verified when available;
- downloaded content is never executed;
- archive extraction, shell execution, package-manager execution and arbitrary repository cloning are out of scope for automatic installation.

A change that weakens one of these boundaries requires explicit security review and tests.

## Secrets

Never submit API keys, GitHub tokens, cookies, credentials, signed private URLs or proprietary assets in issues, pull requests, logs or test fixtures.

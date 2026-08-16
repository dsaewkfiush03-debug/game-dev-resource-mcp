# Verified catalog freshness

GameDev Resource MCP distinguishes **license rights** from **verification freshness**.

A resource can still have a permissive license even when the project's cached verification is old. Freshness metadata tells maintainers and agents when the source/license metadata should be rechecked; it does not rewrite the upstream license.

## Metadata

Verified catalog records may include:

```text
verificationStatus: verified | needs-review
verifiedAt: YYYY-MM-DD
```

Live providers normally rely on fresh runtime retrieval/provenance instead of static `verifiedAt` dates.

## MCP audit tool

Use:

```text
audit_resource_verification
```

Default stale threshold:

```text
365 days
```

The tool audits maintained `verified-catalog` providers and returns four buckets:

- `current` — tracked and still within the configured freshness window;
- `stale` — previously verified but older than the threshold;
- `needs-review` — explicitly marked for manual re-verification;
- `untracked` — no reliable verification date/status is recorded yet.

It returns provider-level summaries plus an `attention` list containing everything that is not current.

Example intent:

```text
Audit all verified catalogs and show anything not rechecked within 365 days.
```

Or limit the scan to selected providers:

```text
Audit Kenney and Google Fonts verification freshness with a 180-day threshold.
```

## Important semantics

`stale` does **not** mean “illegal” or “unusable.” It means the project's verification evidence is old enough that the canonical source/license should be checked again before relying on that cached metadata for a release.

`untracked` is deliberate fail-visible behavior. The project should not fabricate a recent verification date for legacy catalog entries that have not actually been rechecked.

`needs-review` is stronger than age. An entry explicitly marked `needs-review` remains in that bucket even if its date is recent.

## Current rollout

V1.7 begins tracked verification dates for catalogs that were explicitly rechecked during this release, including the expanded Kenney catalog, the curated Google Fonts game catalog, Godot official demo collections and Phaser official starters.

Other older static catalogs may initially appear as `untracked` until they receive a real re-verification pass.

## Maintainer workflow

```text
catalog expansion or scheduled review
    ↓
verify canonical source + license source
    ↓
update metadata
    ↓
set verificationStatus = verified
    ↓
set verifiedAt to the actual review date
    ↓
run npm test / CI
    ↓
audit_resource_verification
```

Do not update `verifiedAt` merely to silence a stale warning. The date should represent an actual source/license review.

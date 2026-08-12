# OpenGameArt ingestion policy

OpenGameArt is a multi-license source and does not currently provide a stable official public API that this project can depend on. The project therefore does **not** implement broad or aggressive scraping.

## Rules

1. Treat every asset page as an independent licensing decision.
2. Never infer rights from the OpenGameArt domain alone.
3. Record the original asset page, author/attribution text, selected license(s), and license evidence.
4. If an asset offers multiple licenses, keep all offered licenses and select a reuse path explicitly rather than collapsing them into one guessed license.
5. CC0 can enter the low-risk verified catalog after source verification.
6. CC-BY and OGA-BY may enter the catalog with mandatory attribution metadata.
7. CC-BY-SA, GPL, and LGPL assets remain `conditional` and should require manual/project-level review before installation into a commercial game.
8. Missing, conflicting, custom, or unclear license information fails closed to manual review.
9. Do not mirror downloaded OpenGameArt files in this repository by default.
10. Any future automated ingestion must be rate-limited, cache-aware, provenance-preserving, and respectful of site operators.

## Planned ingestion flow

```text
asset URL supplied or discovered
  -> fetch one asset page at low frequency
  -> extract title / author / license choices / attribution instructions / file links
  -> normalize licenses through check_license
  -> reject or flag ambiguity
  -> store metadata + provenance only
  -> optionally return original provider-hosted file URL
```

This project provides technical classification, not legal advice. The original license text remains authoritative.

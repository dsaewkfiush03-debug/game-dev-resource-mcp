# Search UX

V1.17 keeps GameDev Resource MCP focused as a game-development resource search engine for AI coding agents.

## Compact direct search

`find_game_assets` defaults to `responseMode = summary`.

Summary results keep the fields an agent normally needs to choose a candidate:

- provider asset ID and name;
- provider and canonical source URL;
- license and conservative license risk;
- search score;
- dimension, style, formats, asset types and game genres when available;
- reuse/bundled-asset status for code/project candidates;
- a bounded set of the most useful lexical/semantic match reasons.

Use `responseMode = full` only when complete provider metadata, creator/provenance fields or detailed audit information is required.

## Pagination

`find_game_assets` accepts:

```text
offset = 0
limit = 10
```

The response includes:

```text
pagination.offset
pagination.limit
pagination.returned
pagination.hasMore
pagination.nextOffset
```

When `hasMore` is true, pass `nextOffset` as the next request's `offset` while keeping the other search parameters unchanged.

The response layer asks semantic search for enough relevant candidates to cover the requested page. This prevents a later page from becoming empty merely because the ordinary shallow fallback quality target was already satisfied on page one.

## Repeated-search cache

Identical paged cross-provider searches are cached in the running MCP process for five minutes by default.

Diagnostics include:

```text
diagnostics.cache.hit
diagnostics.cache.ttlSeconds
```

The cache:

- is process-local only;
- is not written to disk;
- does not collect telemetry;
- does not change license, engine, dimension or relevance filtering;
- is cleared when the MCP process restarts.

A different query, filter set, page size or offset-depth requirement produces a different cache key.

## Product boundary

Search UX does not import, convert or adapt assets for a target engine. The MCP finds and screens resources; the coding agent remains responsible for project-specific integration.

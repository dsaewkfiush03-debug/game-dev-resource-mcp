# Resource coverage benchmark

V1.11 adds a repeatable way to answer a practical question: **does the current provider/search stack return enough usable choices for real game-development needs?**

The benchmark measures retrieval coverage without weakening the existing license rules.

## MCP tool

Use `benchmark_resource_coverage`.

Default smoke run:

```text
benchmark_resource_coverage
  suite: smoke
```

Full run:

```text
benchmark_resource_coverage
  suite: full
```

Target one ecosystem:

```text
benchmark_resource_coverage
  suite: full
  groups: [godot]
```

Or select explicit scenario IDs:

```text
benchmark_resource_coverage
  scenarioIds:
    - godot-pixel-road-survival
    - unity-lowpoly-survival
```

## Scenario suite

The maintained suite contains 39 representative game concepts across six groups:

- Godot;
- Phaser/Web;
- Raylib;
- Unity;
- Unreal;
- engine-agnostic / generic concepts.

The 12-scenario smoke suite includes representative cases from all six groups. The full suite covers pixel, low-poly, realistic, fantasy, sci-fi, horror, racing, survival, RPG, roguelike, tower defense, multiplayer, procedural generation, CJK, city-building and other common game-development needs.

Scenarios are deliberately allowed to expose unsupported engines or resource slots. Unity/Unreal starter gaps, for example, stay in the denominator until verified providers actually solve them.

## Metrics

### Required-slot coverage

A required slot is covered when `recommend_stack` returns at least one primary candidate that passed the current search and license filters.

```text
covered required slots / all required slots
```

This answers: **can the system find anything usable for the required need?**

### Depth-3 coverage

A required slot has depth-3 coverage when at least three candidates are returned for that slot.

```text
required slots with >= 3 candidates / all required slots
```

This is the more important long-term health metric. One candidate is enough to avoid a hard gap, but it does not provide meaningful choice across style, quality or implementation tradeoffs.

### Complete-scenario rate

A scenario is complete when every required slot has at least one candidate.

### Unsupported required slots

If a required slot has no configured providers, it remains a failure in the benchmark rather than being excluded. This prevents benchmark inflation by hiding known product gaps.

### Provider errors

Temporary live-provider failures are reported separately. A network/API error may reduce one benchmark run, but it is not automatically the same thing as a permanent catalog gap.

## Weak-slot ranking

The result includes per-slot metrics and a `weakSlots` ranking. Slots are prioritized by:

1. lowest required-slot coverage;
2. lowest depth-3 coverage;
3. lowest average candidate count.

This ranking is intended to drive provider/catalog expansion work.

Example interpretation:

```text
networking        coverage 62%   depth-3 18%
music             coverage 88%   depth-3 35%
shader            coverage 91%   depth-3 41%
environment        coverage 100%  depth-3 96%
icons              coverage 100%  depth-3 100%
```

The next expansion cycle should focus on networking, music and shaders before adding more icon sources.

## Measurement integrity rules

Benchmark scores must not be improved by weakening safety or changing the denominator cosmetically.

Do not:

- disable `commercialOnly` to raise coverage;
- enable share-alike by default just to raise coverage;
- treat unknown/missing licenses as valid candidates;
- remove difficult scenarios because they score poorly;
- exclude required slots with no providers;
- lower the depth target below three and call it equivalent;
- count discovery-only registry links as verified provider candidates;
- convert temporary provider errors into fake successful results.

Improve benchmark scores by:

- adding trustworthy providers;
- expanding verified catalogs;
- improving query aliases/taxonomy;
- improving provider-specific search mapping;
- adding verified starter/code sources for weak engines;
- fixing genuine provider reliability issues.

## Live benchmark caveat

The MCP benchmark uses the real `recommend_stack` pipeline and therefore may call live APIs. Results can vary with upstream availability and index changes. CI tests cover the benchmark's selection and aggregation logic with deterministic injected results; CI does not depend on third-party APIs.

This separation keeps release validation stable while preserving a real live benchmark for resource-health work.

## Baseline snapshots

If a benchmark run is saved as a comparison baseline, record at least:

- package/runtime version;
- `generatedAt` timestamp;
- suite or explicit scenario IDs;
- required-slot coverage;
- depth-3 coverage;
- unsupported required-slot count;
- provider-error count.

Do not treat a run with material live-provider failures as a clean permanent baseline without noting those failures. Baselines are measurements of a particular run, not immutable claims about the resource catalog.

## Goal

The long-term target is not merely 100% one-result coverage. A healthier target is:

```text
required-slot coverage -> near 100%
depth-3 coverage       -> near 100%
complete scenarios      -> near 100%
provider error rate     -> low and explainable
```

A score is a product/retrieval metric, not legal clearance and not proof that every returned asset is aesthetically suitable for a particular game.

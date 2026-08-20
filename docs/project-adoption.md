# Project adoption planning

V1.10 adds a planning layer between **finding a reusable project** and **actually modifying a user's game**.

The goal is not to automate cloning or execution. The goal is to give an AI coding agent a conservative, explicit adoption manifest before it starts changing code.

## Tool

Use `plan_project_adoption` after selecting a result from `find_reusable_projects`.

Example:

```text
plan_project_adoption
  provider: raylib
  projectId: raylib-game-template
  targetDescription: "2D road survival game with vehicles, combat and inventory"
```

The planner resolves the maintained catalog entry and returns:

- the selected project and its verified reuse metadata;
- an adoption `decision`;
- allowed reuse boundaries;
- forbidden assumptions;
- concrete keep/replace/review/remove actions;
- project and component license obligations;
- target resource needs inferred from the game description;
- recommended next MCP calls;
- safety warnings.

## Current verified project providers

| Provider | Typical adoption posture | Path-level guidance |
|---|---|---|
| Godot demos | `whole-project` / `same-license` for maintained official demos | System-level by default unless a specific path is recorded later |
| Phaser starters | `code-only` / `needs-review` for bundled presentation media | System/resource-category guidance by default |
| Raylib projects | Official game template can be `whole-project`; game collection references are `code-only` | The maintained game-template record includes explicit paths such as `src/`, `CMakeLists.txt`, `projects/` and `screenshots/` |

A provider being supported by this planner does not imply that every project from that ecosystem has the same reuse posture. The selected maintained record remains the source of truth.

## Adoption decisions

| Decision | Meaning |
|---|---|
| `adopt-project-base` | The maintained record supports using the project as a base under the stated obligations. |
| `adopt-project-with-component-obligations` | The project may be used as a base, but separately licensed components must retain their own obligations. |
| `reuse-code-only` | Reuse the explicitly licensed code/structure; bundled media must be replaced or independently verified. |
| `reference-only` | Study the project as an implementation reference; direct copying remains blocked pending component review. |
| `not-a-project-base` | The selected record is scoped to assets/media rather than a reusable code project. |
| `manual-review-before-adoption` | Maintained metadata is not sufficient for automated project adoption. |

The planner never upgrades a weaker scope based on popularity, stars, framework ownership or model judgment.

## Adoption actions

Actions use explicit target types:

```text
path
system
asset-category
dependency
notice
```

and actions:

```text
keep
replace
review
remove
```

A path-level action is only emitted when maintained catalog metadata explicitly records that path. The planner must not invent project directories.

For example, the maintained Raylib game-template entry records concrete guidance for `src/`, `CMakeLists.txt`, `projects/` and `screenshots/` because those paths were inspected as part of the source review. Other projects without path-level evidence receive system/resource-category guidance instead.

## Resource needs

The planner reuses the deterministic stack-planning model after selecting the project base.

The `starter` slot is removed because a project has already been selected. Remaining target slots are reported as either:

- `declared-in-candidate` — maintained metadata explicitly says the candidate contains that subsystem/resource class; or
- `verify-or-source` — the catalog does not explicitly declare it, so inspect the project and source a replacement if needed.

`verify-or-source` does not mean the feature is definitely absent. It prevents the model from assuming coverage that the maintained metadata has not established.

## Next tool calls

For unresolved required slots, the adoption plan emits suggested `find_game_assets` calls using the same commercial/license defaults as the rest of the project:

```text
commercialOnly = true
allowAttribution = true
allowShareAlike = false
```

It also emits a `generate_project_attribution` call for the adopted project so source/license provenance is not lost during development.

These are recommendations only. The planning tool does not execute the suggested calls automatically.

## Safety boundary

`plan_project_adoption` does not:

- clone a repository;
- copy files into a project;
- execute project code;
- run a package manager;
- install dependencies;
- extract archives;
- delete or replace user files;
- infer unverified project paths;
- convert `code-only` media into commercially cleared content.

The output is a technical adoption plan, not legal clearance.

## Recommended agent workflow

```text
find_reusable_projects
        ↓
select candidate
        ↓
plan_project_adoption
        ↓
review decision + actions + obligations
        ↓
inspect project when needed
        ↓
find_game_assets for unresolved required slots
        ↓
perform engine-specific implementation
        ↓
generate_project_attribution
        ↓
release review
```

Project discovery, adoption planning, file installation and code execution remain separate capabilities with separate trust boundaries.

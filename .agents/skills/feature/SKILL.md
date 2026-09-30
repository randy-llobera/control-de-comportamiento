---
name: feature
description: Load, start, review, explain, test, or complete the current project feature when requested.
---

# Feature Workflow

Usage: `$feature load|start|review|explain|test|complete`.

Read [the project workflow](../../../context/ai-interaction.md) and [current feature](../../../context/current-feature.md), then only the requested action:

| Action | Instructions |
| --- | --- |
| Load a spec or inline description | [load](actions/load.md) |
| Begin implementation | [start](actions/start.md) |
| Review against acceptance | [review](actions/review.md) |
| Explain the diff | [explain](actions/explain.md) |
| Select and run relevant tests | [test](actions/test.md) |
| Commit, merge locally, reset, and push working | [complete](actions/complete.md) |

If no action is provided, list these choices. Do not treat load, review, explain, or test as permission to complete or release. Document ownership, statuses, and approval rules belong to the project workflow.

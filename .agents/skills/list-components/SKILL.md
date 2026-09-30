---
name: list-components
description: List component source files and their responsibilities in the project or a requested component subdirectory.
---

# List Components

Usage: `$list-components [subdirectory]`.

Inspect `src/components` or the requested subdirectory and list component files with a brief source-based responsibility and total count. Distinguish helper files from components; do not infer behavior from filenames alone. If the directory is missing or empty, say so. Return the inventory in conversation without maintaining a duplicate component catalog.

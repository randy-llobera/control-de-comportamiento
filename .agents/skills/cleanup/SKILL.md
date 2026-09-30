---
name: cleanup
description: Inspect repository housekeeping and documentation drift; apply selected fixes when requested.
---

# Cleanup

Usage: `$cleanup check|run` (default `check`).

Use [document ownership](../../../context/ai-interaction.md#document-ownership) to inspect stale guidance, duplicate records, broken references, and feature-history ordering. Check source for unused imports/files, debug output, stale TODOs, and obsolete suppression comments. Confirm consumers before calling a file unused.

Compare required environment variable names with templates and owning guides only when relevant. Do not print values or require local, staging, and production files to have identical variables; their roles differ.

In check mode, report numbered, evidence-based findings without edits. In run/fix mode, use the user's selected items or existing scope authorization; if no selection is clear, present findings and request the selection before changing files. Do not extend the cleanup into application redesign.

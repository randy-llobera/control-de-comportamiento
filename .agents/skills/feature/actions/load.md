# Load Action

1. Resolve the supplied spec path or basename under `context/features`. For inline input, create a focused spec there using the existing naming pattern. Both features and fixes use this directory; use a `fix-` prefix when it clarifies the record.
2. If no spec/description is supplied, ask for it. If replacing a different active feature would lose progress, resolve that first.
3. Set current-feature's heading, status `Not Started`, and spec link under Goals. Keep immediate constraints in Notes, not a duplicate acceptance checklist.
4. Preserve section comments and History. Confirm the loaded feature briefly; do not implement it.

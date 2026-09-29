# Complete Action

Execute the completion steps in the project change lifecycle only within the user's existing commit/merge/push authorization.

Before staging, review the full diff, acceptance evidence, document update matrix, and relevant task/defect records. Stage only this feature's intended files; preserve unrelated work. Do not complete when required checks fail or material work remains.

Follow the workflow's local merge, feature-status reconciliation, current-feature reset (including status), and single push to `working`. Remove the remote feature branch only if it was previously pushed and its removal is authorized. Report the resulting commit/branch state and staging outcome if verified. Do not merge a production PR as an implicit part of feature completion.

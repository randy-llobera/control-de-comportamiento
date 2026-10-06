# Product Overview

## Purpose

Control de Comportamiento helps a school record and review student incidents. Teachers record incidents; coordinators manage classroom organization and reporting; admins also manage student records and user roles. The interface is Spanish, with English code identifiers.

This document owns the product contract. Implementation details belong in [coding standards](coding-standards.md), setup and release instructions in the [README](../README.md).

## Roles and permissions

| Operation                                  | Teacher  | Coordinator | Admin |
| ------------------------------------------ | -------- | ----------- | ----- |
| Read/create students in existing groups    | Yes      | Yes         | Yes   |
| Update/delete students                     | No       | No          | Yes   |
| Read/create incidents; filter and export   | Yes      | Yes         | Yes   |
| Update/delete incidents                    | Own only | All         | All   |
| Read groups and categories for selection   | Yes      | Yes         | Yes   |
| Create/update/delete groups and categories | No       | Yes         | Yes   |
| View dashboard                             | No       | Yes         | Yes   |
| View user management and assign roles      | No       | No          | Yes   |

A user's school-role description is profile text, not an authorization role. Roles are `teacher`, `coordinator`, and `admin`; new registrations receive `teacher`. Each incident retains the identity of its creator. Role-based controls must be enforced on the server and in the database, not just hidden in the interface.

## User workflows

| Page           | Behavior                                                                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`            | Introduces the app and links to authentication                                                                                                            |
| `/auth`        | Email/password login and registration; registration collects display name and school-role description, and requires a password of at least six characters |
| `/incidentes`  | Landing page after login; create, review, filter, edit, delete, and export incidents according to permissions                                             |
| `/estudiantes` | Create students in existing groups; admins also edit/delete records                                                                                       |
| `/grupos`      | Manage student groups                                                                                                                                     |
| `/categorias`  | Manage incident categories                                                                                                                                |
| `/dashboard`   | Review incident totals, severity counts, category/group summaries, and recent incidents                                                                   |
| `/usuarios`    | Assign existing user roles                                                                                                                                |

Navigation shows the pages available to the signed-in role. Signup follows the configured Auth email-confirmation policy. Logout ends the session and returns to authentication.

To create an incident, select a group and student, category, severity (`low`, `medium`, or `high`), description, and incident date. The creator comes from the session. Editing changes category, severity, description, and date; it does not transfer the incident to a different student or creator.

Incident filters cover category, severity, group, and inclusive date range. CSV export uses the same filters and includes date, student, group, category, severity, description, and teacher. Files use `incidentes-YYYYMMDD.csv`, UTF-8 with a BOM, Spanish headers, and displayed dates in `DD-MM-YYYY` format.

Deletion must preserve related records: a referenced group, category, or student cannot be removed while dependent records remain. Destructive UI operations require explicit confirmation.

## Domain relationships

- An Auth account has an application profile linked to one role.
- A student belongs to one group; names are unique within that group.
- Groups and categories have unique names and record their creator.
- An incident links a student, category, and creator, with severity, description, and incident date.
- Database severity is text constrained to the allowed values, not a Postgres enum.

[Migrations](../supabase/migrations/) own exact columns, defaults, grants, constraints, and RLS. [Generated database types](../src/types/supabase.ts) describe the database contract used by TypeScript. Do not maintain a second column-by-column schema here.

## Product requirements

- Recording an incident should require few steps and provide clear confirmation or actionable validation feedback.
- Permissions must remain consistent across navigation, individual operations, exports, and reporting.
- Reports and exports should represent the selected data accurately; implementation defects do not change that requirement.
- Forms must support keyboard operation, visible focus, accessible labels, and field-level errors. WCAG 2.1 AA is the accessibility target, not a claim of completed certification.
- User-facing errors must be safe and understandable in Spanish. Do not reveal database details or credentials.
- Support usable layouts on phones, tablets, and desktop screens. Keep product complexity proportional to the school's needs.

Proposed extensions and implementation gaps are maintained in the internal work records described by the [documentation workflow](ai-interaction.md), not in the available-feature list.

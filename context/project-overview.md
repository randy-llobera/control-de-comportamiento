# Control de Comportamiento. Project Overview.

## 1. Overview

The _Control de Comportamiento_ app is a role-based incident tracking system for schools. Teachers, coordinators, and admins can log and manage student incidents across classes and categories. The app will be simple, intuitive, and maintainable, leveraging modern frameworks and cloud infrastructure. The app will be in Spanish (UI, wording, labels, texts). The code and backend should be written in English.

---

## 2. Goals and Principles

- Primary Goal: Allow teachers to record incidents quickly, coordinators to manage categories/groups, and admins to manage roles/permissions and oversee the system.
- Keep it Simple: Minimize overengineering. Use modern libraries and frameworks, but avoid unnecessary complexity.
- Maintainability: Clean, well-structured, and documented code with scalable architecture.
- Role-Based Access Control (RBAC): Strict separation of concerns between roles.
- Internationalization-ready (i18n): Default app language is Spanish, but support for multilingual expansion. To be implemented in future iteration.
- Accessibility: Follow accessibility standards (WCAG 2.1 AA).

---

## 3. User Roles & Permissions

### Admin

- Assign and manage roles/permissions.
- Access Admin Dashboard.
- Manage coordinators, teachers, students, groups, and categories.
- Create incidents.
- Access to all current and future features.

### Coordinator

- Create/manage incident categories.
- Create/manage groups/classes.
- Perform all teacher actions.
- Access features explicitly assigned by admins.

### Teacher

- Add students (assign them to existing groups/classes).
- Create incidents by selecting:
  - Student
  - Category
  - Severity (Low, Medium, High)
  - Description (optional text field).
- Filter/search incidents by:
  - Category
  - Severity
  - Group/class
  - Date range
- Export incidents as CSV based on applied filters.
- No access to create categories/groups.

---

## 4. Core Features

### Authentication & Authorization

- Supabase Auth for login and role management.
- Roles stored in Supabase and enforced via policies.
- JWT-based access control in frontend.
- Session persistence.

### Incident Management

- CRUD for incidents (create, read, update, delete – based on role).
- Filtering by category, severity, group, and date.
- CSV export (teachers and above).

### Student & Group Management

- Teachers: add students (must select an existing group).
- Coordinators: create/manage groups.
- Admins: full management.

### Category Management

- Coordinators and admins can create/edit incident categories.

### Dashboard (Admin Only)

- User management (assign/remove roles).
- Overview of incidents by:
  - Category
  - Severity
  - Group/class
  - Timeline trends (basic charts).

### CSV Export

- Based on applied filters

---

## 5. Data Model (Supabase – PostgreSQL)

### system users (Supabase auth.users)

- id (UUID, PK)
- email (string)

### roles

- id (UUID, PK)
- name (string: 'admin', 'coordinator', 'teacher')
- created_at (timestamp)

### users

- id (UUID, PK, FK → auth.users.id)
- role_id (FK → roles.id, defaults to teacher on signup)
- display_name (string, user’s full name provided at signup)
- school_role (string, e.g., "Technology Teacher")
- created_at (timestamp)
- updated_at (timestamp)

### students

- id (UUID, PK)
- name (string)
- group_id (FK → groups.id)
- created_at (timestamp)

### groups

- id (UUID, PK)
- name (string)
- created_by (FK → users.id)
- created_at (timestamp)

### categories

- id (UUID, PK)
- name (string)
- created_by (FK → users.id)
- created_at (timestamp)

### incidents

- id (UUID, PK)
- student_id (FK → students.id)
- category_id (FK → categories.id)
- severity (enum: low, medium, high)
- description (text)
- date (date)
- teacher_id (FK → users.id, automatically assigned based on logged-in user)
- created_at (timestamp)

---

## 6. Architecture

### Frontend

- Framework: React + Next.js.
- Styling: Tailwind CSS v4.\* .
- State Management:
  - Server state: TanStack Query or similar if Next.js Server Components and Server Actions becomes insufficient.
  - Client state: Zustand.
- i18n: `next-i18next` for Spanish default. (Added in future iterations)

### Backend

- Supabase (Postgres DB + Auth + Storage + Edge Functions).
- Row-Level Security (RLS) policies for role-based permissions.
- Edge Functions for sensitive role-management logic.

### Deployment

- Vercel for frontend hosting.
- Supabase for backend (DB + auth + storage).
- CI/CD via GitHub → Vercel.

---

## 7. Role-Based Access (Supabase Policies)

- Teachers: Insert `incidents`, insert `students`, select/filter `incidents`.
- Coordinators: Teacher permissions + insert/update `categories` and `groups`.
- Admins: Full access to all tables, including updating user roles.

---

## 8. UI/UX Guidelines

- All roles land on the **Incidents page** after login.
- Sidebar navigation:
  - Teacher: Incidents, Students
  - Coordinator: Incidents, Students, Groups, Categories, Dashboard
  - Admin: Incidents, Students, Groups, Categories, Dashboard, User Management
- Dashboard provides statistics.
- Teacher identity is automatically filled from the `users` table when logging incidents.

---

## 9. CSV Export

- Teachers and above can export incidents filtered by parameters.
- File naming convention: `incidentes-YYYYMMDD.csv`.
- Encoding: UTF-8 with headers.

---

## 10. Development Guidelines

- Coding Standards: ESLint + Prettier.
- Version Control: GitHub (feature branching).
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`).
- Testing: Vitest
- Error Handling:
  - User-friendly error messages.
  - Logging (Supabase functions + Vercel monitoring).

---

## 11. Non-Functional Requirements

- Performance: Fast response.
- Scalability: Designed to scale to multiple schools in future.
- Security:
  - RLS policies in Supabase.
  - HTTPS enforced.
  - Passwordless login via OAuth & Office 365 (To be added in the future).
  - Localization: Spanish default; prepared for translations (To be added in the future).
- Accessibility: Keyboard navigation, ARIA labels.

---

## 12. Roadmap (MVP → Future)

### MVP

- Authentication (Supabase).

* Users table linked to auth.users with default role = teacher
* Role-based RLS
* Incident logging with required description and date; teacher automatically linked

- Students/groups/categories management.
- Dashboard (basic version).

* CSV export

### Future Enhancements

- Passwordless login via OAuth & Office 365
- Internationalization support for other languages.

* Notifications (email/SMS).
* Incident resolution workflow (status: open, closed).
* Multi-school support.
* Advanced analytics dashboards.
* Parent portal.

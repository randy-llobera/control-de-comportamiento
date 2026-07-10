# Control de Comportamiento

A comprehensive student incident management system with role-based user access (Teacher, Coordinator, Administrator).

## Features

- **Authentication**: Supabase Auth with user registration
- **Role-based Access**: Teacher (default), Coordinator, Administrator
- **Incident Management**: Create, filter, and export incidents
- **Student Management**: CRUD operations for students by teachers
- **Group & Category Management**: Available for coordinators and administrators
- **Dashboard**: Statistics and analytics for coordinators and administrators
- **User Management**: Role assignment by administrators
- **CSV Export**: Apply filters to exported data

## Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Row Level Security)
- **Development**: ESLint, PostCSS
- **Deployment**: Vercel (frontend) + Supabase (backend)

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd control-de-comportamiento
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `env.example` to `.env`
3. Fill in the environment variables with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PROJECT_REF=
RESEND_API_KEY=
```

### 4. Configure the database

Run the SQL scripts in Supabase SQL Editor following the instructions in `supabase/README.md`:

1. Create tables (roles, users, groups, categories, students, incidents)
2. Insert default roles (admin, coordinator, teacher)
3. Configure RLS (Row Level Security) policies
4. Create function to handle new user registration

### 5. Run the project

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### User Flow

1. **Registration**: New users are registered as "Teacher" by default
2. **Login**: All users are redirected to `/incidentes` after login
3. **Navigation**: Sidebar shows options based on user role

### Roles and Permissions

#### Teacher (default)

- View and create incidents
- Manage students
- Filter and export incidents

#### Coordinator

- All Teacher functions
- Manage groups
- Manage categories
- View dashboard with statistics

#### Administrator

- All Coordinator functions
- Manage users and assign roles

### Main Pages

- **`/`**: Home page with authentication link
- **`/auth`**: User login and registration
- **`/incidentes`**: Incident list with filters and creation form
- **`/estudiantes`**: Student CRUD operations (teachers)
- **`/grupos`**: Group CRUD operations (coordinators+)
- **`/categorias`**: Category CRUD operations (coordinators+)
- **`/dashboard`**: Statistics and summaries (coordinators+)
- **`/usuarios`**: User management and role assignment (administrators)

## Project Structure

```
src/
├── app/                    # Next.js pages (App Router)
│   ├── auth/              # Authentication
│   │   └── page.tsx       # Login/register page
│   ├── incidentes/        # Incident management
│   │   └── page.tsx       # Incident list and creation
│   ├── estudiantes/       # Student management
│   │   └── page.tsx       # Student CRUD operations
│   ├── grupos/            # Group management
│   │   └── page.tsx       # Group CRUD operations
│   ├── categorias/        # Category management
│   │   └── page.tsx       # Category CRUD operations
│   ├── dashboard/         # Analytics dashboard
│   │   └── page.tsx       # Statistics and charts
│   ├── usuarios/          # User management
│   │   └── page.tsx       # User role assignment
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── Layout.tsx         # Main layout with navigation
│   └── Navigation.tsx     # Role-based navigation sidebar
├── lib/                   # Utilities and configuration
│   ├── supabase.ts        # Supabase client (browser)
│   └── supabase-server.ts # Supabase client (server)
└── types/                 # TypeScript types
    ├── database.ts        # Database types and relationships
    └── supabase.ts        # Generated Supabase types

Root files:
├── supabase/              # Database setup
│   └── README.md          # Database migration instructions
├── scripts/               # Database utilities
│   └── seed.sql           # Sample data for testing
├── reqs/                  # Requirements documentation
├── package.json           # Dependencies and scripts
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── env.local.example      # Environment variables template
└── SETUP.md               # Detailed setup instructions
```

## Deployment

### Frontend (Vercel)

1. Connect the repository to Vercel
2. Configure environment variables in Vercel
3. Deploy automatically

### Backend (Supabase)

The backend is already configured in Supabase. You only need to apply the SQL migrations.

## Development

### Available Scripts

```bash
npm run dev      # Run in development mode
npm run build    # Build for production
npm run start    # Run in production mode
npm run lint     # Run ESLint
```

### Database Management

The database is fully managed through Supabase. Schema changes are applied by running SQL in the SQL Editor.

### Key Components

- **Layout.tsx**: Main application layout with authentication check
- **Navigation.tsx**: Role-based sidebar navigation with user profile
- **supabase.ts**: Browser-side Supabase client configuration
- **supabase-server.ts**: Server-side Supabase client for SSR
- **database.ts**: TypeScript types for all database entities and relationships

## Security

- **RLS (Row Level Security)**: All tables have RLS policies configured
- **Authentication**: Supabase Auth handles user authentication
- **Authorization**: Permissions are verified on both frontend and backend
- **Validation**: Forms have required field validation
- **Role-based Access**: Features are restricted based on user roles

## Database Schema

### Core Tables

- **roles**: User role definitions (admin, coordinator, teacher)
- **users**: User profiles with role assignments
- **groups**: Student class/group organization
- **categories**: Incident categorization
- **students**: Student records linked to groups
- **incidents**: Behavior incident records with severity levels

### Key Relationships

- Users belong to roles (many-to-one)
- Students belong to groups (many-to-one)
- Incidents reference students, categories, and teachers (many-to-one each)
- Groups and categories are created by users (many-to-one)

## Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is under the MIT License. See the `LICENSE` file for more details.

# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

## 2. Apply Migrations

Run the following SQL commands in your Supabase SQL Editor:

### 1. Create roles table and seed data

```sql
-- Create roles table
CREATE TABLE roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (name IN ('admin', 'coordinator', 'teacher')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name) VALUES
  ('admin'),
  ('coordinator'),
  ('teacher');
```

### 2. Create users table

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id),
  display_name TEXT NOT NULL,
  school_role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### 3. Create groups table

```sql
-- Create groups table
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
```

### 4. Create categories table

```sql
-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
```

### 5. Create students table

```sql
-- Create students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  group_id UUID NOT NULL REFERENCES groups(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
```

### 6. Create incidents table

```sql
-- Create incidents table
CREATE TABLE incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT NOT NULL,
  date DATE NOT NULL,
  teacher_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
```

### 7. Create RLS Policies

```sql

-- Users table policies

-- Admins: can SELECT all rows
create policy "Admins can view all users"
on public.users for select
using ( public.is_admin() );

-- Admins: can INSERT any row
create policy "Admins can insert users"
on public.users for insert
with check ( public.is_admin() );

-- Admins: can UPDATE any row
create policy "Admins can update users"
on public.users for update
using ( public.is_admin() );

-- Admins: can DELETE any row
create policy "Admins can delete users"
on public.users for delete
using ( public.is_admin() );

CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Groups table policies
CREATE POLICY "Teachers can view all groups" ON groups
  FOR SELECT USING (true);

CREATE POLICY "Coordinators and admins can manage groups" ON groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role_id IN (
        SELECT id FROM roles WHERE name IN ('coordinator', 'admin')
      )
    )
  );

-- Categories table policies
CREATE POLICY "Teachers can view all categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Coordinators and admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role_id IN (
        SELECT id FROM roles WHERE name IN ('coordinator', 'admin')
      )
    )
  );

-- Students table policies
CREATE POLICY "Teachers can manage students" ON students
  FOR ALL USING (true);

-- Incidents table policies
CREATE POLICY "Teachers can manage incidents" ON incidents
  FOR ALL USING (true);
```

### 8. Create function to handle user creation

```sql

--Helper function: returns true iff the current auth user is an admin
-- NOTE: SECURITY DEFINER + owned by table owner avoids recursion.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    join public.roles r on r.id = u.role_id
    where u.id = auth.uid()
      and r.name = 'admin'
  );
$$;

-- Lock down function and allow only app roles to call it
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  teacher_role_id UUID;
BEGIN
  -- Get the teacher role ID
  SELECT id INTO teacher_role_id FROM public.roles WHERE name = 'teacher' LIMIT 1;

  -- Insert user with teacher role as default
  INSERT INTO public.users (id, role_id, display_name, school_role)
  VALUES (NEW.id, teacher_role_id, NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'school_role');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 3. Environment Variables

Copy `env.example` to `.env` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 4. Test the Setup

1. Start the development server: `npm run dev`
2. Go to `/auth` and try to sign up
3. Check that a user record is created in the `users` table with role 'teacher'

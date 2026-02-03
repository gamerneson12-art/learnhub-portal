-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create categories table for PDF categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PDFs table
CREATE TABLE public.pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  file_size INTEGER,
  page_count INTEGER,
  author TEXT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create download_history table for tracking
CREATE TABLE public.download_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pdf_id UUID REFERENCES public.pdfs(id) ON DELETE CASCADE NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_history ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Categories policies (public read for authenticated users)
CREATE POLICY "Authenticated users can view categories"
ON public.categories FOR SELECT
TO authenticated
USING (true);

-- PDFs policies (authenticated users can view)
CREATE POLICY "Authenticated users can view PDFs"
ON public.pdfs FOR SELECT
TO authenticated
USING (true);

-- Download history policies
CREATE POLICY "Users can view their own download history"
ON public.download_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own downloads"
ON public.download_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_username TEXT;
BEGIN
  -- Generate a unique username from email or random
  generated_username := COALESCE(
    SPLIT_PART(NEW.email, '@', 1),
    'user_' || SUBSTRING(NEW.id::TEXT, 1, 8)
  );
  
  -- Ensure uniqueness by appending random suffix if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = generated_username) LOOP
    generated_username := generated_username || '_' || FLOOR(RANDOM() * 1000)::TEXT;
  END LOOP;

  -- Create profile
  INSERT INTO public.profiles (user_id, username, email, avatar_url)
  VALUES (
    NEW.id,
    generated_username,
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url'
  );

  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pdfs_updated_at
  BEFORE UPDATE ON public.pdfs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment download count
CREATE OR REPLACE FUNCTION public.increment_download_count(pdf_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.pdfs
  SET download_count = download_count + 1
  WHERE id = pdf_id;
END;
$$;

-- Insert initial categories for programming languages
INSERT INTO public.categories (name, slug, description, icon, color) VALUES
  ('Python', 'python', 'Python programming language tutorials and guides', '🐍', '#3776AB'),
  ('JavaScript', 'javascript', 'JavaScript language and frameworks', '📜', '#F7DF1E'),
  ('CSS', 'css', 'Cascading Style Sheets tutorials', '🎨', '#264DE4'),
  ('HTML', 'html', 'HyperText Markup Language guides', '🌐', '#E34F26'),
  ('C', 'c', 'C programming language fundamentals', '⚙️', '#A8B9CC'),
  ('C++', 'cpp', 'C++ programming and OOP concepts', '➕', '#00599C'),
  ('Java', 'java', 'Java programming and enterprise development', '☕', '#ED8B00'),
  ('React', 'react', 'React.js library and ecosystem', '⚛️', '#61DAFB'),
  ('Node.js', 'nodejs', 'Node.js backend development', '🟢', '#339933'),
  ('PHP', 'php', 'PHP web development', '🐘', '#777BB4'),
  ('SQL', 'sql', 'SQL database management', '🗃️', '#4479A1'),
  ('Ruby', 'ruby', 'Ruby programming language', '💎', '#CC342D'),
  ('Go', 'go', 'Go programming language', '🔵', '#00ADD8'),
  ('Rust', 'rust', 'Rust systems programming', '🦀', '#CE412B'),
  ('Swift', 'swift', 'Swift iOS/macOS development', '🍎', '#FA7343'),
  ('Kotlin', 'kotlin', 'Kotlin Android development', '🤖', '#7F52FF'),
  ('TypeScript', 'typescript', 'TypeScript typed JavaScript', '📘', '#3178C6'),
  ('Angular', 'angular', 'Angular framework development', '🅰️', '#DD0031');
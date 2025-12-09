-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  UNIQUE (user_id, role)
);

-- Create course categories table
CREATE TABLE public.course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  category_id UUID REFERENCES public.course_categories(id),
  course_type TEXT NOT NULL DEFAULT 'diploma' CHECK (course_type IN ('diploma', 'short_course')),
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  duration TEXT,
  is_published BOOLEAN DEFAULT false,
  payment_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create modules table (course sections)
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER NOT NULL DEFAULT 70,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enrollments table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (user_id, course_id)
);

-- Create lesson progress table
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (user_id, lesson_id)
);

-- Create quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  answers JSONB NOT NULL DEFAULT '{}',
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'student');
  
  RETURN new;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_roles (read only for users)
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for course_categories (public read)
CREATE POLICY "Anyone can view categories"
  ON public.course_categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for courses (public read for published)
CREATE POLICY "Anyone can view published courses"
  ON public.courses FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- RLS Policies for modules (public read for enrolled users)
CREATE POLICY "Enrolled users can view modules"
  ON public.modules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.courses c ON c.id = modules.course_id
      WHERE e.user_id = auth.uid() AND e.course_id = c.id
    )
  );

CREATE POLICY "Anyone can view modules of published courses"
  ON public.modules FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = modules.course_id AND c.is_published = true
    )
  );

-- RLS Policies for lessons
CREATE POLICY "Enrolled users can view lessons"
  ON public.lessons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.modules m ON m.id = lessons.module_id
      WHERE e.user_id = auth.uid() AND e.course_id = m.course_id
    )
  );

-- RLS Policies for quizzes
CREATE POLICY "Enrolled users can view quizzes"
  ON public.quizzes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.modules m ON m.id = quizzes.module_id
      WHERE e.user_id = auth.uid() AND e.course_id = m.course_id
    )
  );

-- RLS Policies for quiz_questions
CREATE POLICY "Enrolled users can view quiz questions"
  ON public.quiz_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.quizzes q ON q.id = quiz_questions.quiz_id
      JOIN public.modules m ON m.id = q.module_id
      WHERE e.user_id = auth.uid() AND e.course_id = m.course_id
    )
  );

-- RLS Policies for enrollments
CREATE POLICY "Users can view their own enrollments"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments"
  ON public.enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for lesson_progress
CREATE POLICY "Users can view their own lesson progress"
  ON public.lesson_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lesson progress"
  ON public.lesson_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress"
  ON public.lesson_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view their own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz attempts"
  ON public.quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default categories
INSERT INTO public.course_categories (name, slug, description, icon) VALUES
  ('Business & Management', 'business-management', 'Develop essential business and management skills', 'Briefcase'),
  ('HR & Administration', 'hr-administration', 'Master human resources and administrative practices', 'Users'),
  ('IT & Technology', 'it-technology', 'Build technical skills for the digital age', 'Monitor'),
  ('Healthcare & Support', 'healthcare-support', 'Learn healthcare and support services fundamentals', 'Heart');

-- Insert sample courses
INSERT INTO public.courses (title, slug, description, short_description, category_id, course_type, price, duration, is_published, payment_link) VALUES
  ('Diploma in Business Management', 'diploma-business-management', 'Comprehensive business management training covering leadership, strategy, and operations.', 'Master the fundamentals of business management and leadership.', (SELECT id FROM public.course_categories WHERE slug = 'business-management'), 'diploma', 4999.00, '12 months', true, 'https://payfast.co.za'),
  ('Diploma in Project Management', 'diploma-project-management', 'Learn to plan, execute, and deliver projects successfully with industry-standard methodologies.', 'Become a certified project management professional.', (SELECT id FROM public.course_categories WHERE slug = 'business-management'), 'diploma', 4999.00, '12 months', true, 'https://payfast.co.za'),
  ('Diploma in Human Resource Management', 'diploma-hr-management', 'Develop expertise in recruitment, employee relations, and HR strategy.', 'Build a career in human resource management.', (SELECT id FROM public.course_categories WHERE slug = 'hr-administration'), 'diploma', 4999.00, '12 months', true, 'https://payfast.co.za'),
  ('Diploma in Office Administration', 'diploma-office-administration', 'Master essential administrative skills for modern office environments.', 'Become an expert office administrator.', (SELECT id FROM public.course_categories WHERE slug = 'hr-administration'), 'diploma', 4999.00, '12 months', true, 'https://payfast.co.za'),
  ('Diploma in IT Support', 'diploma-it-support', 'Gain practical IT support skills including hardware, software, and networking.', 'Start your career in IT support and helpdesk.', (SELECT id FROM public.course_categories WHERE slug = 'it-technology'), 'diploma', 4999.00, '12 months', true, 'https://payfast.co.za'),
  ('Diploma in Healthcare Administration', 'diploma-healthcare-admin', 'Learn healthcare administration, medical terminology, and patient care systems.', 'Enter the healthcare administration field.', (SELECT id FROM public.course_categories WHERE slug = 'healthcare-support'), 'diploma', 4999.00, '12 months', true, 'https://payfast.co.za'),
  ('Short Course: Leadership Fundamentals', 'short-leadership-fundamentals', 'Essential leadership skills for new and aspiring managers.', 'Develop core leadership capabilities.', (SELECT id FROM public.course_categories WHERE slug = 'business-management'), 'short_course', 2999.00, '3 months', true, 'https://payfast.co.za'),
  ('Short Course: Excel for Business', 'short-excel-business', 'Master Microsoft Excel for business productivity and data analysis.', 'Boost your Excel skills for the workplace.', (SELECT id FROM public.course_categories WHERE slug = 'it-technology'), 'short_course', 2999.00, '3 months', true, 'https://payfast.co.za');
-- Add RLS policies for admin access to view all data

-- Admins can view all enrollments
CREATE POLICY "Admins can view all enrollments"
ON public.enrollments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all lesson progress
CREATE POLICY "Admins can view all lesson progress"
ON public.lesson_progress
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all quiz attempts
CREATE POLICY "Admins can view all quiz attempts"
ON public.quiz_attempts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all courses (including unpublished)
CREATE POLICY "Admins can view all courses"
ON public.courses
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update courses
CREATE POLICY "Admins can update courses"
ON public.courses
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert courses
CREATE POLICY "Admins can insert courses"
ON public.courses
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can view all modules
CREATE POLICY "Admins can view all modules"
ON public.modules
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all lessons
CREATE POLICY "Admins can view all lessons"
ON public.lessons
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all quizzes
CREATE POLICY "Admins can view all quizzes"
ON public.quizzes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all quiz questions
CREATE POLICY "Admins can view all quiz questions"
ON public.quiz_questions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all user roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
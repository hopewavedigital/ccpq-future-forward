-- Allow admins to insert enrollments on behalf of students
CREATE POLICY "Admins can create enrollments"
ON public.enrollments
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));
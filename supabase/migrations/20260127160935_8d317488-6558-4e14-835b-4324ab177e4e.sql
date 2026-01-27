-- Allow admins to manage modules
CREATE POLICY "Admins can insert modules"
ON public.modules
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update modules"
ON public.modules
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete modules"
ON public.modules
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to manage lessons
CREATE POLICY "Admins can insert lessons"
ON public.lessons
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update lessons"
ON public.lessons
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete lessons"
ON public.lessons
FOR DELETE
USING (has_role(auth.uid(), 'admin'));
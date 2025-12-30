-- Add unique constraint on enrollments for user_id and course_id
ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_user_course_unique UNIQUE (user_id, course_id);
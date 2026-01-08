-- Add new columns for richer course data
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS curriculum TEXT,
ADD COLUMN IF NOT EXISTS learning_outcomes TEXT,
ADD COLUMN IF NOT EXISTS who_should_take TEXT,
ADD COLUMN IF NOT EXISTS external_url TEXT,
ADD COLUMN IF NOT EXISTS module_count INTEGER DEFAULT 0;

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_courses_title ON public.courses USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_courses_course_type ON public.courses(course_type);
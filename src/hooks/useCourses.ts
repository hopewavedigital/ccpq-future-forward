import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course, CourseCategory } from '@/types/database';

const COURSES_PAGE_SIZE = 1000;

export function useCourses(categorySlug?: string) {
  return useQuery({
    queryKey: ['courses', categorySlug],
    queryFn: async () => {
      let categoryId: string | null = null;

      if (categorySlug) {
        const { data: category, error: categoryError } = await supabase
          .from('course_categories')
          .select('id')
          .eq('slug', categorySlug)
          .maybeSingle();

        if (categoryError) throw categoryError;
        categoryId = category?.id ?? null;
      }

      const all: (Course & { category: CourseCategory })[] = [];
      let from = 0;

      while (true) {
        let query = supabase
          .from('courses')
          .select(
            `
            *,
            category:course_categories(*)
          `
          )
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .range(from, from + COURSES_PAGE_SIZE - 1);

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;
        if (error) throw error;

        const page = (data ?? []) as (Course & { category: CourseCategory })[];
        all.push(...page);

        if (page.length < COURSES_PAGE_SIZE) break;
        from += COURSES_PAGE_SIZE;
      }

      return all;
    },
  });
}

export function useCourse(slug: string) {
  return useQuery({
    queryKey: ['course', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(
          `
          *,
          category:course_categories(*)
        `
        )
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      return data as (Course & { category: CourseCategory }) | null;
    },
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as CourseCategory[];
    },
  });
}

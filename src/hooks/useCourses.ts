import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course, CourseCategory } from '@/types/database';

export function useCourses(categorySlug?: string) {
  return useQuery({
    queryKey: ['courses', categorySlug],
    queryFn: async () => {
      let query = supabase
        .from('courses')
        .select(`
          *,
          category:course_categories(*)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (categorySlug) {
        const { data: category } = await supabase
          .from('course_categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();
        
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (Course & { category: CourseCategory })[];
    },
  });
}

export function useCourse(slug: string) {
  return useQuery({
    queryKey: ['course', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          category:course_categories(*)
        `)
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LessonProgress } from '@/types/database';

export function useLessonProgress(courseId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lesson-progress', user?.id, courseId],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('lesson_progress')
        .select(`
          *,
          lesson:lessons(
            *,
            module:modules(course_id)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Filter by course
      const filtered = (data as any[]).filter(
        (p) => p.lesson?.module?.course_id === courseId
      );

      return filtered as LessonProgress[];
    },
    enabled: !!user && !!courseId,
  });
}

export function useMarkLessonComplete() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress'] });
    },
  });
}
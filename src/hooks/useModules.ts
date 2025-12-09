import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Module, Lesson, Quiz } from '@/types/database';

export function useModules(courseId: string) {
  return useQuery({
    queryKey: ['modules', courseId],
    queryFn: async () => {
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (modulesError) throw modulesError;

      const modulesWithContent = await Promise.all(
        (modules as Module[]).map(async (module) => {
          const [lessonsRes, quizzesRes] = await Promise.all([
            supabase
              .from('lessons')
              .select('*')
              .eq('module_id', module.id)
              .order('order_index'),
            supabase
              .from('quizzes')
              .select('*')
              .eq('module_id', module.id)
              .order('order_index'),
          ]);

          return {
            ...module,
            lessons: (lessonsRes.data || []) as Lesson[],
            quizzes: (quizzesRes.data || []) as Quiz[],
          };
        })
      );

      return modulesWithContent;
    },
    enabled: !!courseId,
  });
}
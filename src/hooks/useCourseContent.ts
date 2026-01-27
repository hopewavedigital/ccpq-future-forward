import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  created_at: string;
}

export function useCourseModules(courseId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as Module[];
    },
    enabled: !!courseId && !!user,
  });
}

export function useModuleLessons(moduleId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['module-lessons', moduleId],
    queryFn: async () => {
      if (!moduleId) return [];
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!moduleId && !!user,
  });
}

export function useCreateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (module: { course_id: string; title: string; description?: string; order_index: number }) => {
      const { data, error } = await supabase
        .from('modules')
        .insert(module)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['course-modules', data.course_id] });
      toast({ title: 'Module created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; title?: string; description?: string; order_index?: number }) => {
      const { data, error } = await supabase
        .from('modules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['course-modules', data.course_id] });
      toast({ title: 'Module updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, courseId }: { id: string; courseId: string }) => {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { courseId };
    },
    onSuccess: ({ courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['course-modules', courseId] });
      toast({ title: 'Module deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lesson: { module_id: string; title: string; content?: string; video_url?: string; duration_minutes?: number; order_index: number }) => {
      const { data, error } = await supabase
        .from('lessons')
        .insert(lesson)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['module-lessons', data.module_id] });
      toast({ title: 'Lesson created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; title?: string; content?: string; video_url?: string; duration_minutes?: number; order_index?: number }) => {
      const { data, error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['module-lessons', data.module_id] });
      toast({ title: 'Lesson updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, moduleId }: { id: string; moduleId: string }) => {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { moduleId };
    },
    onSuccess: ({ moduleId }) => {
      queryClient.invalidateQueries({ queryKey: ['module-lessons', moduleId] });
      toast({ title: 'Lesson deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useBulkImportContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, modules }: { 
      courseId: string; 
      modules: Array<{ title: string; description?: string; lessons: Array<{ title: string; content?: string; video_url?: string; duration_minutes?: number }> }> 
    }) => {
      // Insert modules one by one and collect their IDs
      for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
        const moduleData = modules[moduleIndex];
        
        const { data: insertedModule, error: moduleError } = await supabase
          .from('modules')
          .insert({
            course_id: courseId,
            title: moduleData.title,
            description: moduleData.description || null,
            order_index: moduleIndex,
          })
          .select()
          .single();

        if (moduleError) throw moduleError;

        // Insert lessons for this module
        if (moduleData.lessons && moduleData.lessons.length > 0) {
          const lessonsToInsert = moduleData.lessons.map((lesson, lessonIndex) => ({
            module_id: insertedModule.id,
            title: lesson.title,
            content: lesson.content || null,
            video_url: lesson.video_url || null,
            duration_minutes: lesson.duration_minutes || null,
            order_index: lessonIndex,
          }));

          const { error: lessonsError } = await supabase
            .from('lessons')
            .insert(lessonsToInsert);

          if (lessonsError) throw lessonsError;
        }
      }

      return { courseId };
    },
    onSuccess: ({ courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['course-modules', courseId] });
      toast({ title: 'Content imported successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Import Error', description: error.message, variant: 'destructive' });
    },
  });
}

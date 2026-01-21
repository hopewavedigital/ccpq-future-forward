import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useIsAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!user,
  });
}

export function useAdminEnrollments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-enrollments'],
    queryFn: async () => {
      // First get enrollments with courses
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(id, title, slug, price)
        `)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;

      // Then get profiles for each enrollment
      const userIds = [...new Set(enrollments?.map(e => e.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      // Map profiles to enrollments
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      return enrollments?.map(e => ({
        ...e,
        profile: profileMap.get(e.user_id) || null
      })) || [];
    },
    enabled: !!user,
  });
}

export function useAdminCourses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          category:course_categories(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAdminProfiles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAdminLessonProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-lesson-progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select(`
          *,
          lesson:lessons(title, module:modules(title, course:courses(title)))
        `)
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAdminQuizAttempts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-quiz-attempts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          quiz:quizzes(title, module:modules(title, course:courses(title)))
        `)
        .order('attempted_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAdminStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [coursesRes, enrollmentsRes, profilesRes, progressRes] = await Promise.all([
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('enrollments').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('lesson_progress').select('id', { count: 'exact', head: true }).eq('completed', true),
      ]);

      return {
        totalCourses: coursesRes.count || 0,
        totalEnrollments: enrollmentsRes.count || 0,
        totalStudents: profilesRes.count || 0,
        completedLessons: progressRes.count || 0,
      };
    },
    enabled: !!user,
  });
}

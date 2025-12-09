import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Quiz, QuizQuestion, QuizAttempt } from '@/types/database';

export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;

      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (questionsError) throw questionsError;

      return {
        ...quiz,
        questions: questions as QuizQuestion[],
      } as Quiz & { questions: QuizQuestion[] };
    },
    enabled: !!quizId,
  });
}

export function useQuizAttempts(quizId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['quiz-attempts', user?.id, quizId],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('quiz_id', quizId)
        .order('attempted_at', { ascending: false });

      if (error) throw error;
      return data as QuizAttempt[];
    },
    enabled: !!user && !!quizId,
  });
}

export function useSubmitQuiz() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quizId,
      answers,
      score,
      passed,
    }: {
      quizId: string;
      answers: Record<string, number>;
      score: number;
      passed: boolean;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          score,
          passed,
          answers,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
    },
  });
}
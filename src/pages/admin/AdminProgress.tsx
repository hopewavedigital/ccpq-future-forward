import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminLessonProgress, useAdminQuizAttempts } from '@/hooks/useAdminData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminProgress() {
  const { data: lessonProgress, isLoading: lessonsLoading } = useAdminLessonProgress();
  const { data: quizAttempts, isLoading: quizzesLoading } = useAdminQuizAttempts();

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Student Progress</h1>
          <p className="text-muted-foreground">Track lesson completions and quiz attempts</p>
        </div>

        <Tabs defaultValue="lessons" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lessons">Lesson Completions</TabsTrigger>
            <TabsTrigger value="quizzes">Quiz Attempts</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons">
            <Card>
              <CardHeader>
                <CardTitle>Recent Lesson Completions</CardTitle>
              </CardHeader>
              <CardContent>
                {lessonsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-accent" />
                  </div>
                ) : lessonProgress && lessonProgress.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lesson</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Completed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lessonProgress.map((progress: any) => (
                        <TableRow key={progress.id}>
                          <TableCell className="font-medium">
                            {progress.lesson?.title || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {progress.lesson?.module?.title || '-'}
                          </TableCell>
                          <TableCell>
                            {progress.lesson?.module?.course?.title || '-'}
                          </TableCell>
                          <TableCell>
                            {progress.completed_at 
                              ? format(new Date(progress.completed_at), 'MMM d, yyyy HH:mm')
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No lesson completions yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <CardTitle>Recent Quiz Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                {quizzesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-accent" />
                  </div>
                ) : quizAttempts && quizAttempts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quiz</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Attempted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizAttempts.map((attempt: any) => (
                        <TableRow key={attempt.id}>
                          <TableCell className="font-medium">
                            {attempt.quiz?.title || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {attempt.quiz?.module?.title || '-'}
                          </TableCell>
                          <TableCell>
                            {attempt.quiz?.module?.course?.title || '-'}
                          </TableCell>
                          <TableCell>{attempt.score}%</TableCell>
                          <TableCell>
                            <Badge variant={attempt.passed ? 'default' : 'destructive'}>
                              {attempt.passed ? 'Passed' : 'Failed'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(attempt.attempted_at), 'MMM d, yyyy HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No quiz attempts yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

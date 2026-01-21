import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { useAdminStats, useAdminEnrollments } from '@/hooks/useAdminData';
import { BookOpen, Users, GraduationCap, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: enrollments, isLoading: enrollmentsLoading } = useAdminEnrollments();

  const recentEnrollments = enrollments?.slice(0, 5) || [];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your learning platform</p>
        </div>

        {statsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Courses"
              value={stats?.totalCourses || 0}
              icon={BookOpen}
            />
            <StatsCard
              title="Total Enrollments"
              value={stats?.totalEnrollments || 0}
              icon={GraduationCap}
            />
            <StatsCard
              title="Total Students"
              value={stats?.totalStudents || 0}
              icon={Users}
            />
            <StatsCard
              title="Lessons Completed"
              value={stats?.completedLessons || 0}
              icon={CheckCircle}
            />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            {enrollmentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : recentEnrollments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEnrollments.map((enrollment: any) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">
                        {enrollment.profile?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell>{enrollment.course?.title || 'Unknown Course'}</TableCell>
                      <TableCell>
                        {format(new Date(enrollment.enrolled_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={enrollment.completed_at ? 'default' : 'secondary'}>
                          {enrollment.completed_at ? 'Completed' : 'In Progress'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">No enrollments yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

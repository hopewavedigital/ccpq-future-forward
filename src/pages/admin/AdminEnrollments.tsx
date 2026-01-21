import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminEnrollments } from '@/hooks/useAdminData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminEnrollments() {
  const { data: enrollments, isLoading } = useAdminEnrollments();

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Enrollments</h1>
          <p className="text-muted-foreground">Track all student enrollments</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Enrollments ({enrollments?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : enrollments && enrollments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment: any) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">
                        {enrollment.profile?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell>{enrollment.course?.title || 'Unknown Course'}</TableCell>
                      <TableCell>R{Number(enrollment.course?.price || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        {format(new Date(enrollment.enrolled_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {enrollment.completed_at 
                          ? format(new Date(enrollment.completed_at), 'MMM d, yyyy')
                          : '-'
                        }
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

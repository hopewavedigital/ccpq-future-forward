import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminCourses } from '@/hooks/useAdminData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminCourses() {
  const { data: courses, isLoading } = useAdminCourses();

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage all courses on the platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Courses ({courses?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : courses && courses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course: any) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>{course.category?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{course.course_type}</Badge>
                      </TableCell>
                      <TableCell>R{Number(course.price).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={course.is_published ? 'default' : 'secondary'}>
                          {course.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(course.created_at), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">No courses found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminProfiles } from '@/hooks/useAdminData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminStudents() {
  const { data: profiles, isLoading } = useAdminProfiles();

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Students</h1>
          <p className="text-muted-foreground">View all registered students</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Students ({profiles?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : profiles && profiles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile: any) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={profile.avatar_url || ''} />
                            <AvatarFallback>
                              {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {profile.full_name || 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={profile.user_roles?.[0]?.role === 'admin' ? 'default' : 'secondary'}>
                          {profile.user_roles?.[0]?.role || 'student'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(profile.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(profile.updated_at), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">No students found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminProfiles, useAdminCourses } from '@/hooks/useAdminData';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';

export function ManualEnrollmentDialog() {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  const { data: profiles, isLoading: profilesLoading } = useAdminProfiles();
  const { data: courses, isLoading: coursesLoading } = useAdminCourses();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !selectedCourse) {
      toast({
        title: 'Error',
        description: 'Please select both a student and a course',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if enrollment already exists
      const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', selectedUser)
        .eq('course_id', selectedCourse)
        .maybeSingle();

      if (existing) {
        toast({
          title: 'Already Enrolled',
          description: 'This student is already enrolled in this course',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Create enrollment
      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: selectedUser,
          course_id: selectedCourse,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Student has been enrolled in the course',
      });

      // Refresh the enrollments list
      queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      
      // Reset and close
      setSelectedUser('');
      setSelectedCourse('');
      setOpen(false);
    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create enrollment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Enrollment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manual Enrollment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="student">Student</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder={profilesLoading ? "Loading..." : "Select a student"} />
              </SelectTrigger>
              <SelectContent>
                {profiles?.map((profile: any) => (
                  <SelectItem key={profile.user_id} value={profile.user_id}>
                    {profile.full_name || 'Unnamed User'} 
                    {profile.user_roles?.[0]?.role === 'admin' && ' (Admin)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder={coursesLoading ? "Loading..." : "Select a course"} />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((course: any) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedUser || !selectedCourse}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                'Enroll Student'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

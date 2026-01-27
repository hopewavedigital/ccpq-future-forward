import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminProfiles, useAdminCourses } from '@/hooks/useAdminData';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Loader2, UserPlus, ExternalLink, CreditCard } from 'lucide-react';

export function ManualEnrollmentDialog() {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayPal, setIsProcessingPayPal] = useState(false);
  
  const queryClient = useQueryClient();
  const { data: profiles, isLoading: profilesLoading } = useAdminProfiles();
  const { data: courses, isLoading: coursesLoading } = useAdminCourses();

  const selectedCourseData = courses?.find((c: any) => c.id === selectedCourse);

  const handlePayPalPayment = async () => {
    if (!selectedCourseData) return;
    
    setIsProcessingPayPal(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: {
          courseId: selectedCourseData.id,
          courseTitle: selectedCourseData.title,
          amount: Number(selectedCourseData.price),
          returnUrl: `${window.location.origin}/payment-success`,
          cancelUrl: window.location.href,
        },
      });

      if (error) throw error;

      if (data?.approvalUrl) {
        // Open PayPal in new tab
        window.open(data.approvalUrl, '_blank');
        toast({
          title: 'PayPal Opened',
          description: 'Complete the payment in the PayPal tab, then check "Payment Received" and enroll.',
        });
      } else {
        throw new Error('No approval URL returned');
      }
    } catch (error: any) {
      console.error('PayPal error:', error);
      toast({
        title: 'PayPal Error',
        description: error.message || 'Failed to create PayPal order',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingPayPal(false);
    }
  };

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
        description: 'Student has been enrolled and now has access to the course content',
      });

      // Refresh the enrollments list
      queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      
      // Reset and close
      setSelectedUser('');
      setSelectedCourse('');
      setPaymentReceived(false);
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
      <DialogContent className="sm:max-w-lg">
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
                    {course.title} - R{Number(course.price).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCourseData && (
            <div className="rounded-lg border p-4 bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Course Price:</span>
                <span className="text-lg font-bold">R{Number(selectedCourseData.price).toFixed(2)}</span>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handlePayPalPayment}
                disabled={isProcessingPayPal}
              >
                {isProcessingPayPal ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening PayPal...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Process Payment via PayPal
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </>
                )}
              </Button>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="payment" 
                  checked={paymentReceived}
                  onCheckedChange={(checked) => setPaymentReceived(checked === true)}
                />
                <Label htmlFor="payment" className="text-sm cursor-pointer">
                  Payment received / Free enrollment
                </Label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedUser || !selectedCourse || (!paymentReceived && selectedCourseData?.price > 0)}
            >
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

          {selectedCourseData?.price > 0 && !paymentReceived && (
            <p className="text-xs text-muted-foreground text-center">
              Check "Payment received" after confirming payment to enable enrollment
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

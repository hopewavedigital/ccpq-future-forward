import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCourse } from '@/hooks/useCourses';
import { useEnrollment } from '@/hooks/useEnrollments';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Tag, Check, ArrowRight, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: course, isLoading } = useCourse(slug || '');
  const { user } = useAuth();
  const { data: enrollment } = useEnrollment(course?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayPalCheckout = async () => {
    if (!course) return;

    setIsProcessing(true);
    try {
      const returnUrl = `${window.location.origin}/payment-success?course=${course.slug}`;
      const cancelUrl = `${window.location.origin}/courses/${course.slug}`;

      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: {
          courseId: course.id,
          courseTitle: course.title,
          amount: course.price,
          returnUrl,
          cancelUrl,
        },
      });

      if (error) throw error;

      if (data?.approvalUrl) {
        // Store order info for later
        sessionStorage.setItem('pendingOrder', JSON.stringify({
          orderId: data.orderId,
          courseId: course.id,
          courseSlug: course.slug,
        }));
        
        // Redirect to PayPal
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('No approval URL received');
      }
    } catch (error) {
      console.error('PayPal checkout error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <Link to="/courses"><Button>View All Courses</Button></Link>
        </div>
      </Layout>
    );
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(price);

  return (
    <Layout>
      <section className="hero-gradient text-primary-foreground py-16">
        <div className="container-custom">
          <div className="max-w-3xl">
            <Badge className={course.course_type === 'diploma' ? 'bg-accent mb-4' : 'mb-4'}>
              {course.course_type === 'diploma' ? 'Diploma' : 'Certificate Course'}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-primary-foreground/80 mb-6">{course.short_description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              {course.duration && (
                <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{course.duration}</div>
              )}
              <div className="flex items-center gap-2"><Tag className="h-4 w-4" />{formatPrice(course.price)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-display font-bold mb-4">About This Course</h2>
              <p className="text-muted-foreground mb-8">{course.description}</p>
              
              <h3 className="text-xl font-display font-bold mb-4">What You'll Learn</h3>
              <ul className="space-y-3 mb-8">
                {['Industry-relevant skills', 'Practical knowledge', 'Professional development', 'Career advancement'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-accent" /><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="bg-card p-6 rounded-xl shadow-card sticky top-24">
                <div className="text-3xl font-display font-bold text-foreground mb-2">{formatPrice(course.price)}</div>
                <p className="text-sm text-muted-foreground mb-4">Secure payment via PayPal</p>
                
                {enrollment ? (
                  <Link to={`/learn/${course.slug}`}>
                    <Button className="w-full bg-accent hover:bg-accent/90 gap-2">
                      Continue Learning <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button 
                      onClick={handlePayPalCheckout} 
                      disabled={isProcessing} 
                      className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white gap-2"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          Pay with PayPal
                        </>
                      )}
                    </Button>
                    
                    {!user && (
                      <p className="text-xs text-muted-foreground mt-3 text-center">
                        You'll be asked to create an account after payment
                      </p>
                    )}
                  </>
                )}

                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-semibold mb-3">This course includes:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Full online access
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Certificate on completion
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Study at your own pace
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Student support
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CourseDetail;
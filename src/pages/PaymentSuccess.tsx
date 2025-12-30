import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Loader2, XCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [courseSlug, setCourseSlug] = useState<string>('');

  useEffect(() => {
    const capturePayment = async () => {
      const pendingOrderStr = sessionStorage.getItem('pendingOrder');
      
      if (!pendingOrderStr) {
        setStatus('error');
        return;
      }

      const pendingOrder = JSON.parse(pendingOrderStr);
      setCourseSlug(pendingOrder.courseSlug);

      try {
        const { data, error } = await supabase.functions.invoke('capture-paypal-order', {
          body: {
            orderId: pendingOrder.orderId,
            userId: user?.id,
          },
        });

        if (error) throw error;

        if (data?.status === 'COMPLETED') {
          setStatus('success');
          sessionStorage.removeItem('pendingOrder');
          toast.success('Payment successful! You are now enrolled.');
        } else {
          throw new Error('Payment not completed');
        }
      } catch (error) {
        console.error('Payment capture error:', error);
        setStatus('error');
        toast.error('Payment verification failed. Please contact support.');
      }
    };

    capturePayment();
  }, [user]);

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-md mx-auto text-center">
            {status === 'processing' && (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-accent mx-auto mb-6" />
                <h1 className="text-2xl font-display font-bold mb-4">Processing Payment...</h1>
                <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                <h1 className="text-2xl font-display font-bold mb-4">Payment Successful!</h1>
                <p className="text-muted-foreground mb-8">
                  Thank you for your purchase. You now have full access to the course.
                </p>
                {user ? (
                  <Link to={courseSlug ? `/learn/${courseSlug}` : '/dashboard'}>
                    <Button className="bg-accent hover:bg-accent/90 gap-2">
                      Start Learning <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth?mode=signup">
                    <Button className="bg-accent hover:bg-accent/90 gap-2">
                      Create Account to Access <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                <h1 className="text-2xl font-display font-bold mb-4">Payment Issue</h1>
                <p className="text-muted-foreground mb-8">
                  There was an issue processing your payment. If you were charged, please contact our support team.
                </p>
                <div className="flex flex-col gap-3">
                  <Link to="/contact">
                    <Button variant="outline" className="w-full">Contact Support</Button>
                  </Link>
                  <Link to="/courses">
                    <Button className="w-full bg-accent hover:bg-accent/90">Back to Courses</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PaymentSuccess;
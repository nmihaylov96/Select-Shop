import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';

const PaymentConfirmation: React.FC = () => {
  const [, navigate] = useLocation();
  const { state: authState } = useAuth();
  const [status, setStatus] = useState<'success' | 'failure' | 'processing'>('processing');
  
  // Parse URL parameters to get payment status
  useEffect(() => {
    // Check if user is authenticated
    if (!authState.isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    
    const url = new URL(window.location.href);
    const redirectStatus = url.searchParams.get('redirect_status');
    const paymentIntentId = url.searchParams.get('payment_intent');
    
    if (redirectStatus === 'succeeded') {
      setStatus('success');
    } else if (redirectStatus === 'failed') {
      setStatus('failure');
    } else if (paymentIntentId) {
      // If we have a payment intent ID but no status, we can assume it's still processing
      setStatus('processing');
    } else {
      // If no parameters are present, redirect to home
      navigate(ROUTES.HOME);
    }
  }, [authState.isAuthenticated, navigate]);
  
  return (
    <>
      <Helmet>
        <title>Потвърждение на плащане - SportZone</title>
      </Helmet>
      
      <div className="py-10 bg-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 font-heading">Потвърждение на плащане</h1>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="text-gray-600 hover:text-primary">Начало</a>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-primary">Потвърждение на плащане</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                {status === 'success' && 'Успешно плащане'}
                {status === 'failure' && 'Неуспешно плащане'}
                {status === 'processing' && 'Обработване на плащане'}
              </CardTitle>
              <CardDescription className="text-center">
                {status === 'success' && 'Вашата поръчка е успешно приета'}
                {status === 'failure' && 'Възникна проблем при обработката на плащането'}
                {status === 'processing' && 'Вашето плащане се обработва'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex flex-col items-center justify-center py-8">
              {status === 'success' && (
                <div className="text-center">
                  <div className="mb-6">
                    <CheckCircleIcon className="mx-auto h-24 w-24 text-green-500" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Благодарим ви за поръчката!</h2>
                  <p className="text-gray-600 mb-6">
                    Вашата поръчка е приета и се обработва. Скоро ще получите имейл с потвърждение.
                  </p>
                </div>
              )}
              
              {status === 'failure' && (
                <div className="text-center">
                  <div className="mb-6">
                    <XCircleIcon className="mx-auto h-24 w-24 text-red-500" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Възникна проблем с плащането</h2>
                  <p className="text-gray-600 mb-6">
                    За съжаление, възникна проблем при обработката на вашето плащане. Моля, опитайте отново или се свържете с нас за съдействие.
                  </p>
                </div>
              )}
              
              {status === 'processing' && (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="mx-auto h-24 w-24 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-2">Обработване на плащането</h2>
                  <p className="text-gray-600 mb-6">
                    Вашето плащане се обработва. Това може да отнеме няколко минути.
                  </p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-center gap-4">
              <Button asChild>
                <Link href={ROUTES.HOME}>
                  Към началната страница
                </Link>
              </Button>
              {status !== 'success' && (
                <Button asChild variant="outline">
                  <Link href={ROUTES.CHECKOUT}>
                    Опитайте отново
                  </Link>
                </Button>
              )}
              {status === 'success' && (
                <Button asChild variant="outline">
                  <Link href={ROUTES.PROFILE}>
                    Вижте поръчките си
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PaymentConfirmation;
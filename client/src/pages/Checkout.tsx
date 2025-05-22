import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/lib/constants';
import { apiRequest } from '@/lib/queryClient';
import { formatPrice } from '@/lib/utils';
import { 
  loadStripe, 
  StripeElementsOptions,
} from '@stripe/stripe-js';
import { 
  Elements, 
  PaymentElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Shipping form schema
const shippingSchema = z.object({
  address: z.string().min(5, { message: "Адресът трябва да бъде поне 5 символа" }),
  city: z.string().min(2, { message: "Градът трябва да бъде поне 2 символа" }),
  phone: z.string().min(10, { message: "Невалиден телефонен номер" }),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

// CheckoutForm component that contains the payment elements
const CheckoutForm = ({ clientSecret, onSuccess }: { clientSecret: string, onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/payment-confirmation',
      },
      redirect: 'if_required'
    });

    setIsProcessing(false);

    if (error) {
      setPaymentError(error.message || "Възникна грешка при обработката на плащането");
      toast({
        title: "Грешка при плащане",
        description: error.message || "Възникна грешка при обработката на плащането",
        variant: "destructive",
      });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast({
        title: "Успешно плащане",
        description: "Вашето плащане беше успешно обработено",
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-6">
      <PaymentElement />
      
      {paymentError && (
        <div className="text-sm text-red-500 mt-2">
          {paymentError}
        </div>
      )}
      
      <Button 
        disabled={!stripe || isProcessing} 
        className="w-full"
        type="submit"
      >
        {isProcessing ? "Обработване..." : "Плати сега"}
      </Button>
    </form>
  );
};

// Main Checkout component
const Checkout: React.FC = () => {
  const { state: authState } = useAuth();
  const { state: cartState, clearCart } = useCart();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string>("");
  const [shippingInfo, setShippingInfo] = useState<ShippingFormValues | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  
  // Initialize shipping form
  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      address: authState.user?.address || "",
      city: authState.user?.city || "",
      phone: authState.user?.phone || "",
    },
  });
  
  // Check if user is logged in
  useEffect(() => {
    if (!authState.isAuthenticated) {
      toast({
        title: "Необходимо е да влезете в профила си",
        description: "Моля, влезте в профила си, за да продължите с поръчката",
        variant: "destructive",
      });
      navigate(ROUTES.LOGIN);
    }
  }, [authState.isAuthenticated, navigate, toast]);
  
  // Check if cart is empty
  useEffect(() => {
    if (cartState.items.length === 0 && !isCreatingOrder) {
      toast({
        title: "Празна количка",
        description: "Вашата количка е празна",
        variant: "destructive",
      });
      navigate(ROUTES.HOME);
    }
  }, [cartState.items.length, navigate, toast, isCreatingOrder]);
  
  // Calculate cart total
  const cartTotal = cartState.items.reduce((total, item) => {
    return total + (item.product.discountedPrice || item.product.price) * item.quantity;
  }, 0);
  
  // Handle shipping form submission
  const onShippingSubmit = async (values: ShippingFormValues) => {
    setShippingInfo(values);
    
    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: cartTotal,
      });
      
      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Error creating payment intent:", error);
      toast({
        title: "Грешка",
        description: "Възникна грешка при подготовката на плащането",
        variant: "destructive",
      });
    }
  };
  
  // Handle successful payment
  const handlePaymentSuccess = async () => {
    if (!shippingInfo) return;
    
    setIsCreatingOrder(true);
    
    try {
      // Create order
      const orderResponse = await apiRequest("POST", "/api/orders", {
        ...shippingInfo,
        total: cartTotal,
        items: cartState.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.discountedPrice || item.product.price,
        })),
      });
      
      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }
      
      // Clear cart
      await clearCart();
      
      toast({
        title: "Поръчката е успешна",
        description: "Благодарим ви за вашата поръчка!",
      });
      
      // Navigate to confirmation page or home
      navigate(ROUTES.PROFILE);
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Грешка",
        description: "Възникна грешка при създаването на поръчката",
        variant: "destructive",
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };
  
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3b82f6',
      },
    },
  };
  
  return (
    <>
      <Helmet>
        <title>Плащане - SportZone</title>
      </Helmet>
      
      <div className="py-10 bg-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 font-heading">Плащане</h1>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="text-gray-600 hover:text-primary">Начало</a>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-primary">Плащане</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Order Details */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Преглед на поръчката</CardTitle>
                  <CardDescription>Проверете артикулите във вашата поръчка</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartState.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden mr-4">
                            <img 
                              src={item.product.image} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">{item.product.name}</h3>
                            <p className="text-sm text-gray-500">Количество: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right font-medium">
                          {formatPrice((item.product.discountedPrice || item.product.price) * item.quantity)}
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-between pt-3">
                      <span className="font-medium">Общо:</span>
                      <span className="font-bold text-lg">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Payment */}
            <div>
              {!clientSecret ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Информация за доставка</CardTitle>
                    <CardDescription>Попълнете вашите данни за доставка</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onShippingSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Адрес</FormLabel>
                              <FormControl>
                                <Input placeholder="ул. Иван Вазов 12" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Град</FormLabel>
                              <FormControl>
                                <Input placeholder="София" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Телефон</FormLabel>
                              <FormControl>
                                <Input placeholder="+359888123456" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="w-full">Продължи към плащане</Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Плащане</CardTitle>
                    <CardDescription>Въведете данните за вашата карта</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Test Card Information */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Тестови карти за демонстрация</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p><strong>Успешно плащане:</strong> 4242 4242 4242 4242</p>
                        <p><strong>Неуспешно плащане:</strong> 4000 0000 0000 0002</p>
                        <p><strong>Изтичащ срок:</strong> Всяка бъдеща дата (напр. 12/25)</p>
                        <p><strong>CVC:</strong> Всеки 3-цифрен код (напр. 123)</p>
                      </div>
                    </div>
                    
                    <Elements stripe={stripePromise} options={options}>
                      <CheckoutForm 
                        clientSecret={clientSecret} 
                        onSuccess={handlePaymentSuccess} 
                      />
                    </Elements>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
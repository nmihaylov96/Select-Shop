import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'wouter';
import { ROUTES, API_ENDPOINTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatPrice, calculateTotal } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { CartItemWithProduct } from '@/lib/types';
import { 
  VisaIcon, 
  MastercardIcon, 
  PayPalIcon, 
  CashIcon 
} from '@/lib/icons';

// Checkout form schema
const checkoutSchema = z.object({
  firstName: z.string().min(2, { message: "Името трябва да бъде поне 2 символа" }),
  lastName: z.string().min(2, { message: "Фамилията трябва да бъде поне 2 символа" }),
  email: z.string().email({ message: "Невалиден имейл адрес" }),
  phone: z.string().min(10, { message: "Телефонът трябва да бъде поне 10 символа" }),
  address: z.string().min(5, { message: "Адресът трябва да бъде поне 5 символа" }),
  city: z.string().min(2, { message: "Градът трябва да бъде поне 2 символа" }),
  zipCode: z.string().min(4, { message: "Пощенският код трябва да бъде поне 4 символа" }),
  paymentMethod: z.enum(["card", "paypal", "cash"], {
    required_error: "Моля, изберете метод на плащане",
  }),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout: React.FC = () => {
  const { state: authState } = useAuth();
  const { state: cartState, clearCart } = useCart();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  
  // Redirect if not authenticated
  if (!authState.isAuthenticated) {
    navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.CHECKOUT}`);
    return null;
  }
  
  // Redirect if cart is empty
  if (cartState.items.length === 0 && !cartState.loading) {
    navigate(ROUTES.PRODUCTS);
    return null;
  }
  
  const user = authState.user;
  const cartItems = cartState.items;
  const cartTotal = calculateTotal(cartItems);
  const shippingCost = cartTotal > 50 ? 0 : 4.99;
  const totalWithShipping = cartTotal + shippingCost;
  
  // Initialize form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      zipCode: "",
      paymentMethod: "cash",
      notes: "",
    },
  });
  
  // Update payment method when changed in form
  form.watch("paymentMethod", (value) => {
    if (value) {
      setPaymentMethod(value);
    }
  });
  
  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (data: {
      address: string;
      city: string;
      phone: string;
    }) => {
      const response = await apiRequest('POST', API_ENDPOINTS.ORDERS, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CART] });
      toast({
        title: "Поръчката е направена успешно",
        description: "Ще получите имейл с потвърждение на поръчката.",
      });
      clearCart();
      navigate('/');
    },
    onError: (error) => {
      toast({
        title: "Грешка при създаване на поръчка",
        description: "Възникна проблем. Моля, опитайте отново.",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (values: CheckoutFormValues) => {
    placeOrderMutation.mutate({
      address: values.address,
      city: values.city,
      phone: values.phone,
    });
  };
  
  return (
    <>
      <Helmet>
        <title>Завършване на поръчката - SportZone</title>
        <meta 
          name="description" 
          content="Завършете вашата поръчка в SportZone. Безопасна и бърза доставка на спортни стоки." 
        />
      </Helmet>
      
      <div className="py-10 bg-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 font-heading">Завършване на поръчката</h1>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href={ROUTES.HOME} className="text-gray-600 hover:text-primary">
                  Начало
                </Link>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-primary">Завършване на поръчката</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      
      <div className="py-16">
        <div className="container mx-auto px-4">
          {cartState.loading ? (
            <div className="flex justify-center py-20">
              <div className="loading-spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Checkout Form */}
              <div className="w-full lg:w-2/3">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-6 font-heading">Информация за доставка</h2>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Име *</FormLabel>
                              <FormControl>
                                <Input placeholder="Вашето име" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Фамилия *</FormLabel>
                              <FormControl>
                                <Input placeholder="Вашата фамилия" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Имейл адрес *</FormLabel>
                              <FormControl>
                                <Input placeholder="Вашият имейл" {...field} />
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
                              <FormLabel>Телефон *</FormLabel>
                              <FormControl>
                                <Input placeholder="Вашият телефон" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Адрес *</FormLabel>
                            <FormControl>
                              <Input placeholder="Вашият адрес" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Град *</FormLabel>
                              <FormControl>
                                <Input placeholder="Вашият град" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Пощенски код *</FormLabel>
                              <FormControl>
                                <Input placeholder="Пощенски код" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Бележки по поръчката</FormLabel>
                            <FormControl>
                              <textarea 
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Специални инструкции за доставка" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div>
                        <h3 className="text-lg font-bold mb-4 font-heading">Метод на плащане</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <>
                                <div 
                                  className={`border rounded-md p-4 cursor-pointer flex items-center ${field.value === 'card' ? 'border-primary bg-blue-50' : 'border-gray-200'}`}
                                  onClick={() => field.onChange('card')}
                                >
                                  <input
                                    type="radio"
                                    id="card"
                                    className="mr-2"
                                    checked={field.value === 'card'}
                                    onChange={() => field.onChange('card')}
                                  />
                                  <div>
                                    <Label htmlFor="card" className="font-medium cursor-pointer">Карта</Label>
                                    <div className="flex mt-1 space-x-1">
                                      <span className="text-xl"><VisaIcon /></span>
                                      <span className="text-xl"><MastercardIcon /></span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div 
                                  className={`border rounded-md p-4 cursor-pointer flex items-center ${field.value === 'paypal' ? 'border-primary bg-blue-50' : 'border-gray-200'}`}
                                  onClick={() => field.onChange('paypal')}
                                >
                                  <input
                                    type="radio"
                                    id="paypal"
                                    className="mr-2"
                                    checked={field.value === 'paypal'}
                                    onChange={() => field.onChange('paypal')}
                                  />
                                  <div>
                                    <Label htmlFor="paypal" className="font-medium cursor-pointer">PayPal</Label>
                                    <div className="flex mt-1">
                                      <span className="text-xl"><PayPalIcon /></span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div 
                                  className={`border rounded-md p-4 cursor-pointer flex items-center ${field.value === 'cash' ? 'border-primary bg-blue-50' : 'border-gray-200'}`}
                                  onClick={() => field.onChange('cash')}
                                >
                                  <input
                                    type="radio"
                                    id="cash"
                                    className="mr-2"
                                    checked={field.value === 'cash'}
                                    onChange={() => field.onChange('cash')}
                                  />
                                  <div>
                                    <Label htmlFor="cash" className="font-medium cursor-pointer">Наложен платеж</Label>
                                    <div className="flex mt-1">
                                      <span className="text-xl"><CashIcon /></span>
                                    </div>
                                  </div>
                                </div>
                                <FormMessage />
                              </>
                            )}
                          />
                        </div>
                      </div>
                      
                      {paymentMethod === 'card' && (
                        <div className="p-6 border border-primary rounded-md bg-blue-50">
                          <h3 className="text-lg font-bold mb-4 font-heading">Информация за картата</h3>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="card-number">Номер на картата</Label>
                              <Input id="card-number" placeholder="1234 5678 9012 3456" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="expiry">Валидна до</Label>
                                <Input id="expiry" placeholder="MM/YY" />
                              </div>
                              
                              <div>
                                <Label htmlFor="cvv">CVV</Label>
                                <Input id="cvv" placeholder="123" />
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="card-name">Име на картата</Label>
                              <Input id="card-name" placeholder="Име върху картата" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {paymentMethod === 'paypal' && (
                        <div className="p-6 border border-primary rounded-md bg-blue-50">
                          <p className="text-gray-700">Ще бъдете пренасочени към PayPal за завършване на плащането след като потвърдите поръчката.</p>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-blue-600 text-lg py-6"
                        disabled={placeOrderMutation.isPending}
                      >
                        {placeOrderMutation.isPending ? "Обработка..." : "Завърши поръчката"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="w-full lg:w-1/3">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                  <h2 className="text-2xl font-bold mb-6 font-heading">Вашата поръчка</h2>
                  
                  <div className="space-y-4 mb-6">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-20 h-20 flex-shrink-0">
                          <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Количество: {item.quantity}</span>
                            <span>
                              {formatPrice(
                                (item.product.discountedPrice || item.product.price) * item.quantity
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Междинна сума:</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Доставка:</span>
                      <span>
                        {shippingCost === 0 
                          ? "Безплатна" 
                          : formatPrice(shippingCost)
                        }
                      </span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Общо:</span>
                    <span className="text-primary">{formatPrice(totalWithShipping)}</span>
                  </div>
                  
                  {shippingCost === 0 && (
                    <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
                      Получавате безплатна доставка!
                    </div>
                  )}
                  
                  {cartTotal < 50 && shippingCost > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
                      Добавете още продукти за {formatPrice(50 - cartTotal)} за безплатна доставка.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Checkout;

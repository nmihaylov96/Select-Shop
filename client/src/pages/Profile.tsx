import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { ROUTES, API_ENDPOINTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { Order, OrderItem } from '@shared/schema';
import { OrderWithItems } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { UserIcon } from '@/lib/icons';

// Profile update schema
const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email({ message: "Невалиден имейл адрес" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

// Password update schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, { message: "Паролата трябва да бъде поне 6 символа" }),
  newPassword: z.string().min(6, { message: "Паролата трябва да бъде поне 6 символа" }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Паролите не съвпадат",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const Profile: React.FC = () => {
  const { state: authState, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  
  // Redirect if not authenticated
  if (!authState.isAuthenticated) {
    navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.PROFILE}`);
    return null;
  }
  
  const user = authState.user;
  
  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery<OrderWithItems[]>({
    queryKey: [API_ENDPOINTS.ORDERS],
    enabled: !!user,
  });
  
  // Initialize profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
    },
  });
  
  // Initialize password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Handle profile update
  const onProfileSubmit = async (values: ProfileFormValues) => {
    try {
      // For demonstration purposes, we'll just show a success toast
      // In a real app, we would update the user profile on the server
      toast({
        title: "Профилът е обновен",
        description: "Вашият профил беше успешно обновен.",
      });
    } catch (error) {
      toast({
        title: "Грешка",
        description: "Възникна грешка при обновяване на профила.",
        variant: "destructive",
      });
    }
  };
  
  // Handle password update
  const onPasswordSubmit = async (values: PasswordFormValues) => {
    try {
      // For demonstration purposes, we'll just show a success toast
      // In a real app, we would update the password on the server
      toast({
        title: "Паролата е сменена",
        description: "Вашата парола беше успешно променена.",
      });
      
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Грешка",
        description: "Възникна грешка при смяна на паролата.",
        variant: "destructive",
      });
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };
  
  return (
    <>
      <Helmet>
        <title>Моят профил - SportZone</title>
        <meta 
          name="description" 
          content="Управлявайте вашия профил, преглеждайте поръчки и променяйте настройките си в SportZone." 
        />
      </Helmet>
      
      <div className="py-10 bg-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 font-heading">Моят профил</h1>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href={ROUTES.HOME} className="text-gray-600 hover:text-primary">
                  Начало
                </Link>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-primary">Моят профил</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mr-4 text-3xl">
                    <UserIcon />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user?.username || 'Потребител'}
                    </h3>
                    <p className="text-gray-600 text-sm">{user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveTab("profile")}
                    className={`w-full py-2 px-4 text-left rounded-md ${activeTab === "profile" ? "bg-primary text-white" : "hover:bg-gray-100"}`}
                  >
                    Лична информация
                  </button>
                  <button 
                    onClick={() => setActiveTab("orders")}
                    className={`w-full py-2 px-4 text-left rounded-md ${activeTab === "orders" ? "bg-primary text-white" : "hover:bg-gray-100"}`}
                  >
                    Моите поръчки
                  </button>
                  <button 
                    onClick={() => setActiveTab("password")}
                    className={`w-full py-2 px-4 text-left rounded-md ${activeTab === "password" ? "bg-primary text-white" : "hover:bg-gray-100"}`}
                  >
                    Смяна на парола
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full py-2 px-4 text-left rounded-md text-red-500 hover:bg-red-50"
                  >
                    Изход от профила
                  </button>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="w-full md:w-3/4">
              <div className="bg-white rounded-lg shadow-md p-6">
                {/* Profile Information Tab */}
                {activeTab === "profile" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 font-heading">Лична информация</h2>
                    
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={profileForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Име</FormLabel>
                                <FormControl>
                                  <Input placeholder="Вашето име" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Фамилия</FormLabel>
                                <FormControl>
                                  <Input placeholder="Вашата фамилия" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Имейл адрес</FormLabel>
                              <FormControl>
                                <Input placeholder="Вашият имейл адрес" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Телефон</FormLabel>
                              <FormControl>
                                <Input placeholder="Вашият телефон" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={profileForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Град</FormLabel>
                                <FormControl>
                                  <Input placeholder="Вашият град" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Адрес</FormLabel>
                                <FormControl>
                                  <Input placeholder="Вашият адрес" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="bg-primary hover:bg-blue-600"
                        >
                          Запази промените
                        </Button>
                      </form>
                    </Form>
                  </div>
                )}
                
                {/* Orders Tab */}
                {activeTab === "orders" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 font-heading">Моите поръчки</h2>
                    
                    {ordersLoading ? (
                      <div className="flex justify-center py-10">
                        <div className="loading-spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : orders && orders.length > 0 ? (
                      <div className="space-y-6">
                        {orders.map((order) => (
                          <Card key={order.id} className="shadow-sm">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between flex-wrap gap-2">
                                <div>
                                  <CardTitle>Поръчка #{order.id}</CardTitle>
                                  <CardDescription>
                                    Дата: {new Date(order.createdAt).toLocaleDateString('bg-BG')}
                                  </CardDescription>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="font-medium">Статус:</span>
                                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                    order.status === 'canceled' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {ORDER_STATUS_LABELS[order.status] || order.status}
                                  </span>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {order.items?.map((item) => (
                                  <div key={item.id} className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0"></div>
                                    <div className="flex-grow">
                                      <p className="font-medium">{`Продукт #${item.productId}`}</p>
                                      <p className="text-sm text-gray-600">Количество: {item.quantity}</p>
                                      <p className="text-sm text-gray-600">Цена: {formatPrice(item.price)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <Separator className="my-4" />
                              <div className="flex justify-between">
                                <span>Адрес за доставка:</span>
                                <span>{order.address}, {order.city}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Телефон:</span>
                                <span>{order.phone}</span>
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-between pt-2">
                              <span className="font-bold">Общо:</span>
                              <span className="font-bold text-xl text-primary">{formatPrice(order.total)}</span>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-gray-50 rounded-lg">
                        <h3 className="text-xl font-bold mb-2">Нямате поръчки</h3>
                        <p className="text-gray-600 mb-6">Все още не сте направили поръчка в нашия магазин.</p>
                        <Link href={ROUTES.PRODUCTS}>
                          <Button>Разгледайте продуктите</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Password Change Tab */}
                {activeTab === "password" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 font-heading">Смяна на парола</h2>
                    
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Текуща парола</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Въведете текущата парола" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Нова парола</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Въведете нова парола" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Потвърдете нова парола</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Повторете новата парола" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="bg-primary hover:bg-blue-600"
                        >
                          Смени паролата
                        </Button>
                      </form>
                    </Form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;

import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'wouter';
import { useAuth, RegisterData } from '@/context/AuthContext';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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

// Form validation schema
const registerSchema = z.object({
  username: z.string().min(3, { message: "Потребителското име трябва да бъде поне 3 символа" }),
  email: z.string().email({ message: "Невалиден имейл адрес" }),
  password: z.string().min(6, { message: "Паролата трябва да бъде поне 6 символа" }),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  terms: z.boolean().refine(val => val === true, { message: "Трябва да приемете общите условия" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Паролите не съвпадат",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      terms: false,
    },
  });
  
  // Form submission handler
  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      const registerData: RegisterData = {
        username: values.username,
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      };
      
      const success = await register(registerData);
      
      if (success) {
        navigate(ROUTES.LOGIN);
      } else {
        setError("Възникна грешка при регистрацията. Моля, опитайте отново.");
      }
    } catch (err) {
      setError("Възникна грешка при регистрацията. Моля, опитайте отново.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Регистрация - SportZone</title>
        <meta 
          name="description" 
          content="Създайте профил в SportZone, за да пазарувате по-лесно, да запазвате любими продукти и да получавате специални оферти." 
        />
      </Helmet>
      
      <div className="py-10 bg-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 font-heading">Регистрация</h1>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="text-gray-600 hover:text-primary">Начало</a>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-primary">Регистрация</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6 font-heading text-center">Създайте нов профил</h2>
              
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Име</FormLabel>
                          <FormControl>
                            <Input placeholder="Въведете име" {...field} />
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
                          <FormLabel>Фамилия</FormLabel>
                          <FormControl>
                            <Input placeholder="Въведете фамилия" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Потребителско име *</FormLabel>
                        <FormControl>
                          <Input placeholder="Въведете потребителско име" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Имейл адрес *</FormLabel>
                        <FormControl>
                          <Input placeholder="Въведете имейл адрес" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Парола *</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Въведете парола" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Потвърдете парола *</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Повторете паролата" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="terms"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel htmlFor="terms">
                            Прочетох и приемам{' '}
                            <a href="#" className="text-primary hover:underline">
                              общите условия
                            </a>{' '}
                            и{' '}
                            <a href="#" className="text-primary hover:underline">
                              политиката за поверителност
                            </a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-blue-600"
                    disabled={loading}
                  >
                    {loading ? "Изчакайте..." : "Регистрация"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Вече имате профил?{' '}
                  <Link href={ROUTES.LOGIN} className="text-primary hover:underline">
                    Влезте тук
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;

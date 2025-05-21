import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/lib/constants';
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

// Form validation schema
const loginSchema = z.object({
  username: z.string().min(3, { message: "Потребителското име трябва да бъде поне 3 символа" }),
  password: z.string().min(6, { message: "Паролата трябва да бъде поне 6 символа" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Parse redirect URL from query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const redirectTo = urlParams.get('redirect') || ROUTES.HOME;
  
  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Form submission handler
  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await login(values.username, values.password);
      
      if (success) {
        navigate(redirectTo);
      } else {
        setError("Невалидно потребителско име или парола.");
      }
    } catch (err) {
      setError("Възникна грешка при опит за вход. Моля, опитайте отново.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Вход - SportZone</title>
        <meta 
          name="description" 
          content="Влезте в своя акаунт за да проследите поръчки, достъп до желаните продукти и персонализирани препоръки." 
        />
      </Helmet>
      
      <div className="py-10 bg-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 font-heading">Вход</h1>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="text-gray-600 hover:text-primary">Начало</a>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-primary">Вход</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6 font-heading text-center">Вход в профила</h2>
              
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Потребителско име</FormLabel>
                        <FormControl>
                          <Input placeholder="Въведете потребителско име" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Парола</FormLabel>
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
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Запомни ме
                      </label>
                    </div>
                    
                    <div className="text-sm">
                      <a href="#" className="text-primary hover:underline">
                        Забравена парола?
                      </a>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-blue-600"
                    disabled={loading}
                  >
                    {loading ? "Изчакайте..." : "Вход"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Нямате профил?{' '}
                  <Link href={ROUTES.REGISTER} className="text-primary hover:underline">
                    Регистрирайте се тук
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

export default Login;

import React from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';
import { LocationIcon, PhoneIcon, EmailIcon } from '@/lib/icons';

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(3, { message: "Името трябва да бъде поне 3 символа" }),
  email: z.string().email({ message: "Невалиден имейл адрес" }),
  phone: z.string().min(10, { message: "Телефонният номер трябва да бъде поне 10 цифри" }),
  subject: z.string().min(3, { message: "Темата трябва да бъде поне 3 символа" }),
  message: z.string().min(10, { message: "Съобщението трябва да бъде поне 10 символа" }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const Contact: React.FC = () => {
  const { toast } = useToast();
  
  // Initialize form
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });
  
  // Form submission handler
  const onSubmit = (values: ContactFormValues) => {
    console.log(values);
    
    // Show success toast
    toast({
      title: "Съобщението е изпратено",
      description: "Благодарим ви за съобщението. Ще се свържем с вас възможно най-скоро.",
    });
    
    // Reset form
    form.reset();
  };
  
  return (
    <>
      <Helmet>
        <title>Контакти - SportZone</title>
        <meta 
          name="description" 
          content="Свържете се с нас за въпроси относно продукти, поръчки, доставки или друга информация. Нашият екип е на ваше разположение." 
        />
      </Helmet>
      
      <div className="py-10 bg-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 font-heading">Контакти</h1>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="text-gray-600 hover:text-primary">Начало</a>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-primary">Контакти</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6 font-heading">Изпратете ни съобщение</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Имейл *</FormLabel>
                          <FormControl>
                            <Input placeholder="Вашият имейл" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Тема *</FormLabel>
                          <FormControl>
                            <Input placeholder="Тема на съобщението" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Съобщение *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Вашето съобщение" 
                            className="min-h-[150px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-blue-600"
                  >
                    Изпрати съобщение
                  </Button>
                </form>
              </Form>
            </div>
            
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold mb-6 font-heading">Информация за контакт</h2>
              
              <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="mt-1 mr-4 text-primary text-xl">
                      <LocationIcon />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Адрес</h3>
                      <p className="text-gray-700">
                        ул. Спортна 123<br />
                        София 1000, България
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-1 mr-4 text-primary text-xl">
                      <PhoneIcon />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Телефон</h3>
                      <p className="text-gray-700">
                        +359 2 123 4567
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-1 mr-4 text-primary text-xl">
                      <EmailIcon />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Имейл</h3>
                      <p className="text-gray-700">
                        info@sportzone.bg
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-4 font-heading">Работно време</h3>
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="font-medium">Понеделник - Петък:</span>
                    <span>9:00 - 18:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Събота:</span>
                    <span>10:00 - 16:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Неделя:</span>
                    <span>Почивен ден</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 font-heading">Намерете ни</h3>
                <div className="bg-gray-200 h-[300px] rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Карта на местоположението</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 font-heading text-center">Често задавани въпроси</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2">Как мога да направя поръчка?</h3>
              <p className="text-gray-700">
                Можете да направите поръчка онлайн чрез нашия уебсайт или по телефона. Следвайте простите стъпки в нашата платформа за пазаруване или се обадете на нашия екип за съдействие.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2">Колко струва доставката?</h3>
              <p className="text-gray-700">
                Доставката е безплатна за поръчки над 50 лв. За поръчки под тази сума таксата за доставка е 4.99 лв.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2">Какъв е срокът за доставка?</h3>
              <p className="text-gray-700">
                Стандартният срок за доставка е 1-3 работни дни за територията на цялата страна, в зависимост от наличността на продуктите.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2">Мога ли да върна или заменя продукт?</h3>
              <p className="text-gray-700">
                Да, имате право да върнете продукт в рамките на 14 дни от получаването му, ако той е в оригиналната си опаковка и не е използван.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;

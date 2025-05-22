import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { ROUTES, API_ENDPOINTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Product, Category, Order } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from '@/components/ui/switch';
import { TrashIcon, SearchIcon } from '@/lib/icons';

// Product form schema
const productSchema = z.object({
  name: z.string().min(3, { message: "Името трябва да бъде поне 3 символа" }),
  nameEn: z.string().min(3, { message: "Английското име трябва да бъде поне 3 символа" }),
  description: z.string().min(10, { message: "Описанието трябва да бъде поне 10 символа" }),
  descriptionEn: z.string().min(10, { message: "Английското описание трябва да бъде поне 10 символа" }),
  price: z.coerce.number().min(0.01, { message: "Цената трябва да бъде по-голяма от 0" }),
  discountedPrice: z.coerce.number().nullable().optional(),
  categoryId: z.coerce.number(),
  image: z.string().url({ message: "Невалиден URL адрес" }),
  stock: z.coerce.number().min(0, { message: "Наличността не може да бъде отрицателно число" }),
  badge: z.string().optional().nullable(),
  badgeEn: z.string().optional().nullable(),
  featured: z.boolean().default(false),
});

// Category form schema
const categorySchema = z.object({
  name: z.string().min(3, { message: "Името трябва да бъде поне 3 символа" }),
  nameEn: z.string().min(3, { message: "Английското име трябва да бъде поне 3 символа" }),
  image: z.string().url({ message: "Невалиден URL адрес" }),
  icon: z.string(),
});

type ProductFormValues = z.infer<typeof productSchema>;
type CategoryFormValues = z.infer<typeof categorySchema>;

const Admin: React.FC = () => {
  const { state: authState } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isOrderDetailDialogOpen, setIsOrderDetailDialogOpen] = useState(false);
  
  // Check if user is admin - moved after all hooks
  const isAdmin = authState.isAuthenticated && authState.user?.isAdmin;
  
  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: [API_ENDPOINTS.PRODUCTS],
  });
  
  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: [API_ENDPOINTS.CATEGORIES],
  });

  // Fetch all orders for admin
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
  });
  
  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (product: ProductFormValues) => {
      const response = await apiRequest('POST', API_ENDPOINTS.ADMIN.PRODUCTS, product);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PRODUCTS] });
      toast({
        title: "Успешно добавен продукт",
        description: "Продуктът беше успешно добавен.",
      });
      setIsAddProductDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Грешка",
        description: "Възникна грешка при добавяне на продукта.",
        variant: "destructive",
      });
    },
  });
  
  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, product }: { id: number, product: Partial<ProductFormValues> }) => {
      const response = await apiRequest('PUT', API_ENDPOINTS.ADMIN.PRODUCT(id), product);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PRODUCTS] });
      toast({
        title: "Успешно обновен продукт",
        description: "Продуктът беше успешно обновен.",
      });
      setCurrentProductId(null);
    },
    onError: (error) => {
      toast({
        title: "Грешка",
        description: "Възникна грешка при обновяване на продукта.",
        variant: "destructive",
      });
    },
  });
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', API_ENDPOINTS.ADMIN.PRODUCT(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PRODUCTS] });
      toast({
        title: "Успешно изтрит продукт",
        description: "Продуктът беше успешно изтрит.",
      });
    },
    onError: (error) => {
      toast({
        title: "Грешка",
        description: "Възникна грешка при изтриване на продукта.",
        variant: "destructive",
      });
    },
  });
  
  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (category: CategoryFormValues) => {
      const response = await apiRequest('POST', API_ENDPOINTS.ADMIN.CATEGORIES, category);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CATEGORIES] });
      toast({
        title: "Успешно добавена категория",
        description: "Категорията беше успешно добавена.",
      });
      setIsAddCategoryDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Грешка",
        description: "Възникна грешка при добавяне на категорията.",
        variant: "destructive",
      });
    },
  });
  
  // Initialize product form
  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      nameEn: "",
      description: "",
      descriptionEn: "",
      price: 0,
      discountedPrice: null,
      categoryId: 1,
      image: "",
      stock: 0,
      badge: null,
      badgeEn: null,
      featured: false,
    },
  });
  
  // Initialize edit product form
  const editProductForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      nameEn: "",
      description: "",
      descriptionEn: "",
      price: 0,
      discountedPrice: null,
      categoryId: 1,
      image: "",
      stock: 0,
      badge: null,
      badgeEn: null,
      featured: false,
    },
  });
  
  // Initialize category form
  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      nameEn: "",
      image: "",
      icon: "fa-futbol",
    },
  });
  
  // Handle product form submission
  const onProductSubmit = (values: ProductFormValues) => {
    addProductMutation.mutate(values);
  };
  
  // Handle edit product form submission
  const onEditProductSubmit = (values: ProductFormValues) => {
    if (currentProductId) {
      updateProductMutation.mutate({
        id: currentProductId,
        product: values,
      });
    }
  };
  
  // Handle category form submission
  const onCategorySubmit = (values: CategoryFormValues) => {
    addCategoryMutation.mutate(values);
  };

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({
        title: "Статусът е актуализиран",
        description: "Статусът на поръчката беше успешно актуализиран.",
      });
      setIsOrderDetailDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Грешка",
        description: "Възникна грешка при актуализиране на статуса.",
        variant: "destructive",
      });
    },
  });

  // Handle order status change
  const handleOrderStatusChange = (orderId: number, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };
  
  // Set up edit product form when a product is selected
  React.useEffect(() => {
    if (currentProductId && products) {
      const product = products.find(p => p.id === currentProductId);
      if (product) {
        editProductForm.reset({
          name: product.name,
          nameEn: product.nameEn,
          description: product.description,
          descriptionEn: product.descriptionEn,
          price: product.price,
          discountedPrice: product.discountedPrice || null,
          categoryId: product.categoryId,
          image: product.image,
          stock: product.stock,
          badge: product.badge || null,
          badgeEn: product.badgeEn || null,
          featured: product.featured,
        });
      }
    }
  }, [currentProductId, products, editProductForm]);
  
  // Filter products by search query
  const filteredProducts = React.useMemo(() => {
    if (!products) return [];
    
    if (!searchQuery) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.nameEn.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);
  
  // Get category name by ID
  const getCategoryName = (categoryId: number): string => {
    return categories?.find(c => c.id === categoryId)?.name || '';
  };
  
  // Loading state
  if (productsLoading || categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex justify-center">
          <div className="loading-spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Администраторски панел - SportZone</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="py-10 bg-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 font-heading">Администраторски панел</h1>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="text-gray-600 hover:text-primary">Начало</a>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-primary">Админ панел</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      
      <div className="py-16">
        <div className="container mx-auto px-4">
          {/* Tabs */}
          <Tabs defaultValue="products" onValueChange={value => setActiveTab(value)}>
            <TabsList className="mb-8">
              <TabsTrigger value="products">Продукти</TabsTrigger>
              <TabsTrigger value="categories">Категории</TabsTrigger>
              <TabsTrigger value="orders">Поръчки</TabsTrigger>
            </TabsList>
            
            {/* Products Tab */}
            <TabsContent value="products">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-heading">Управление на продукти</h2>
                <Button 
                  onClick={() => {
                    productForm.reset();
                    setIsAddProductDialogOpen(true);
                  }}
                  className="bg-primary hover:bg-blue-600"
                >
                  Добави нов продукт
                </Button>
              </div>
              
              <div className="mb-6">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Търси продукти..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <SearchIcon />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <Table>
                  <TableCaption>Общо продукти: {filteredProducts.length}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Име</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead className="text-right">Цена (лв.)</TableHead>
                      <TableHead className="text-center">Наличност</TableHead>
                      <TableHead className="text-center">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.id}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                        <TableCell className="text-right">
                          {product.discountedPrice ? (
                            <>
                              <span className="text-primary font-bold">{product.discountedPrice.toFixed(2)}</span>
                              <span className="text-gray-500 line-through ml-2">{product.price.toFixed(2)}</span>
                            </>
                          ) : (
                            product.price.toFixed(2)
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.stock > 10 ? 'bg-green-100 text-green-800' :
                            product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setCurrentProductId(product.id)}
                            >
                              Редактирай
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                              onClick={() => {
                                if (window.confirm('Сигурни ли сте, че искате да изтриете този продукт?')) {
                                  deleteProductMutation.mutate(product.id);
                                }
                              }}
                            >
                              <TrashIcon />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Няма намерени продукти
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            {/* Categories Tab */}
            <TabsContent value="categories">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-heading">Управление на категории</h2>
                <Button 
                  onClick={() => {
                    categoryForm.reset();
                    setIsAddCategoryDialogOpen(true);
                  }}
                  className="bg-primary hover:bg-blue-600"
                >
                  Добави нова категория
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories?.map(category => (
                  <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">#{category.id} - {category.name}</h3>
                      <p className="text-gray-600 mb-4">Английско име: {category.nameEn}</p>
                      <p className="text-gray-600">Икона: {category.icon}</p>
                    </div>
                  </div>
                ))}
                
                {categories?.length === 0 && (
                  <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Няма намерени категории</h3>
                    <p className="text-gray-600 mb-4">Все още няма добавени категории.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Orders Tab */}
            <TabsContent value="orders">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-heading">Управление на поръчки</h2>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Филтрирай по статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всички поръчки</SelectItem>
                      <SelectItem value="pending">В очакване</SelectItem>
                      <SelectItem value="processing">Обработва се</SelectItem>
                      <SelectItem value="shipped">Изпратена</SelectItem>
                      <SelectItem value="delivered">Доставена</SelectItem>
                      <SelectItem value="canceled">Отказана</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    type="text" 
                    placeholder="Търсене на поръчка..."
                    className="w-[250px]"
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <Table>
                  <TableCaption>Списък с поръчки</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">№</TableHead>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Адрес</TableHead>
                      <TableHead className="text-right">Сума</TableHead>
                      <TableHead className="text-center">Статус</TableHead>
                      <TableHead className="text-center">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders && orders.length > 0 ? (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>Клиент #{order.userId}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString('bg-BG')}</TableCell>
                          <TableCell>{order.address}, {order.city}</TableCell>
                          <TableCell className="text-right font-bold">{formatPrice(order.total)}</TableCell>
                          <TableCell className="text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'canceled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status === 'pending' ? 'В очакване' :
                               order.status === 'processing' ? 'Обработва се' :
                               order.status === 'shipped' ? 'Изпратена' :
                               order.status === 'delivered' ? 'Доставена' :
                               order.status === 'canceled' ? 'Отказана' :
                               order.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedOrderId(order.id);
                                setIsOrderDetailDialogOpen(true);
                              }}
                            >
                              Преглед
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Няма намерени поръчки
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Order Details Dialog */}
              <Dialog open={isOrderDetailDialogOpen} onOpenChange={setIsOrderDetailDialogOpen}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <DialogTitle>Поръчка #{selectedOrderId}</DialogTitle>
                        <DialogDescription>
                          Детайли за поръчката и статус на изпълнение
                        </DialogDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsOrderDetailDialogOpen(false)}
                      >
                        Назад към поръчки
                      </Button>
                    </div>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Информация за клиента</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Име:</span> Regular User</p>
                        <p><span className="font-medium">Email:</span> user@example.com</p>
                        <p><span className="font-medium">Телефон:</span> +359888123456</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Адрес за доставка</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Адрес:</span> Ul. Ivan Vazov 12</p>
                        <p><span className="font-medium">Град:</span> София</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Продукти в поръчката</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Продукт</TableHead>
                          <TableHead className="text-center">Количество</TableHead>
                          <TableHead className="text-right">Цена</TableHead>
                          <TableHead className="text-right">Общо</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Баскетболни обувки Nike Air Jordan XXXVI</TableCell>
                          <TableCell className="text-center">1</TableCell>
                          <TableCell className="text-right">189.99 лв.</TableCell>
                          <TableCell className="text-right">189.99 лв.</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Тенис ракета Wilson Pro Staff RF97</TableCell>
                          <TableCell className="text-center">1</TableCell>
                          <TableCell className="text-right">59.99 лв.</TableCell>
                          <TableCell className="text-right">59.99 лв.</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-bold">Обща сума:</TableCell>
                          <TableCell className="text-right font-bold">249.98 лв.</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Статус на поръчката</h3>
                    <div className="flex items-center gap-4">
                      <Select 
                        value={orders?.find(o => o.id === selectedOrderId)?.status || 'pending'}
                        onValueChange={(newStatus) => {
                          if (selectedOrderId) {
                            handleOrderStatusChange(selectedOrderId, newStatus);
                          }
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Избери статус" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">В очакване</SelectItem>
                          <SelectItem value="processing">Обработва се</SelectItem>
                          <SelectItem value="shipped">Изпратена</SelectItem>
                          <SelectItem value="delivered">Доставена</SelectItem>
                          <SelectItem value="canceled">Отказана</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-gray-500">
                        Статусът се актуализира автоматично
                      </span>
                    </div>
                  </div>
                  
                  <DialogFooter className="mt-6">
                    <Button 
                      variant="outline" 
                      className="mr-2"
                      onClick={() => setIsOrderDetailDialogOpen(false)}
                    >
                      Назад към поръчки
                    </Button>
                    <Button variant="outline" className="mr-2">Принтирай фактура</Button>
                    <DialogClose asChild>
                      <Button variant="secondary">Затвори</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
          
          {/* Add Product Dialog */}
          <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Добавяне на нов продукт</DialogTitle>
                <DialogDescription>
                  Попълнете формата, за да добавите нов продукт към каталога.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...productForm}>
                <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={productForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Име на продукта (BG) *</FormLabel>
                          <FormControl>
                            <Input placeholder="Име на български" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={productForm.control}
                      name="nameEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Име на продукта (EN) *</FormLabel>
                          <FormControl>
                            <Input placeholder="Име на английски" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={productForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Описание (BG) *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Описание на български" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={productForm.control}
                      name="descriptionEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Описание (EN) *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Описание на английски" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={productForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Цена *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              min="0" 
                              placeholder="0.00" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={productForm.control}
                      name="discountedPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Намалена цена</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              min="0" 
                              placeholder="0.00" 
                              value={field.value === null ? "" : field.value}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={productForm.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Наличност *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              placeholder="0" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={productForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Категория *</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Изберете категория" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map(category => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={productForm.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL на изображение *</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={productForm.control}
                      name="badge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Баджове (BG)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Нов, -15%, Хит, Топ, Последни" 
                              value={field.value === null ? "" : field.value}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={productForm.control}
                      name="badgeEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Баджове (EN)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="New, -15%, Hot, Top, Last items" 
                              value={field.value === null ? "" : field.value}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={productForm.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Препоръчан продукт</FormLabel>
                          <FormDescription>
                            Продуктът ще се показва в секцията "Препоръчани продукти"
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={addProductMutation.isPending}>
                      {addProductMutation.isPending ? "Добавяне..." : "Добави продукт"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Edit Product Dialog */}
          <Dialog open={!!currentProductId} onOpenChange={(open) => !open && setCurrentProductId(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Редактиране на продукт</DialogTitle>
                <DialogDescription>
                  Редактирайте информацията за продукта.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...editProductForm}>
                <form onSubmit={editProductForm.handleSubmit(onEditProductSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={editProductForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Име на продукта (BG) *</FormLabel>
                          <FormControl>
                            <Input placeholder="Име на български" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editProductForm.control}
                      name="nameEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Име на продукта (EN) *</FormLabel>
                          <FormControl>
                            <Input placeholder="Име на английски" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={editProductForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Описание (BG) *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Описание на български" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editProductForm.control}
                      name="descriptionEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Описание (EN) *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Описание на английски" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={editProductForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Цена *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              min="0" 
                              placeholder="0.00" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editProductForm.control}
                      name="discountedPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Намалена цена</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              min="0" 
                              placeholder="0.00" 
                              value={field.value === null ? "" : field.value}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editProductForm.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Наличност *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              placeholder="0" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={editProductForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Категория *</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Изберете категория" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map(category => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editProductForm.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL на изображение *</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={editProductForm.control}
                      name="badge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Баджове (BG)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Нов, -15%, Хит, Топ, Последни" 
                              value={field.value === null ? "" : field.value}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editProductForm.control}
                      name="badgeEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Баджове (EN)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="New, -15%, Hot, Top, Last items" 
                              value={field.value === null ? "" : field.value}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={editProductForm.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Препоръчан продукт</FormLabel>
                          <FormDescription>
                            Продуктът ще се показва в секцията "Препоръчани продукти"
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={updateProductMutation.isPending}>
                      {updateProductMutation.isPending ? "Запазване..." : "Запази промените"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Add Category Dialog */}
          <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Добавяне на нова категория</DialogTitle>
                <DialogDescription>
                  Попълнете формата, за да добавите нова категория.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...categoryForm}>
                <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={categoryForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Име на категорията (BG) *</FormLabel>
                          <FormControl>
                            <Input placeholder="Име на български" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={categoryForm.control}
                      name="nameEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Име на категорията (EN) *</FormLabel>
                          <FormControl>
                            <Input placeholder="Име на английски" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={categoryForm.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL на изображение *</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={categoryForm.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Икона *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Изберете икона" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fa-futbol">Футбол</SelectItem>
                            <SelectItem value="fa-basketball-ball">Баскетбол</SelectItem>
                            <SelectItem value="fa-table-tennis">Тенис</SelectItem>
                            <SelectItem value="fa-dumbbell">Фитнес</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={addCategoryMutation.isPending}>
                      {addCategoryMutation.isPending ? "Добавяне..." : "Добави категория"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default Admin;

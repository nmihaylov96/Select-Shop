import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@shared/schema";

export default function MyOrders() {
  const { state: authState } = useAuth();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    enabled: !!authState.user,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'canceled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'В очакване';
      case 'processing':
        return 'Обработва се';
      case 'shipped':
        return 'Изпратена';
      case 'delivered':
        return 'Доставена';
      case 'canceled':
        return 'Отказана';
      default:
        return status;
    }
  };

  if (!authState.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Моите поръчки</h1>
          <p className="text-gray-600 mb-4">Моля, влезте в профила си, за да видите поръчките.</p>
          <Button>Вход</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Моите поръчки</h1>
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Моите поръчки</h1>
        
        {!orders || orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Няма поръчки</h3>
              <p className="text-gray-600 mb-4">Все още не сте направили поръчка.</p>
              <Button>Разгледайте продуктите</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Поръчка #{order.id}</CardTitle>
                      <CardDescription>
                        Дата: {new Date(order.createdAt).toLocaleDateString('bg-BG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`flex items-center gap-1 ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Адрес за доставка</h4>
                      <p className="text-gray-600">
                        {order.address}<br />
                        {order.city}<br />
                        Телефон: {order.phone}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Обща сума</h4>
                      <p className="text-2xl font-bold text-primary">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      ID на поръчката: {order.id}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Детайли
                      </Button>
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm">
                          Оценете продуктите
                        </Button>
                      )}
                      {(order.status === 'pending' || order.status === 'processing') && (
                        <Button variant="outline" size="sm">
                          Отменете поръчката
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
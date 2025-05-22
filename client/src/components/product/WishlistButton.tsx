import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: number;
  size?: "sm" | "md" | "lg";
  variant?: "outline" | "ghost" | "default";
}

export default function WishlistButton({ 
  productId, 
  size = "md",
  variant = "ghost"
}: WishlistButtonProps) {
  const { state: authState } = useAuth();
  const { toast } = useToast();

  const { data: wishlistItems } = useQuery({
    queryKey: ['/api/wishlist'],
    enabled: !!authState.user,
  });

  const isInWishlist = wishlistItems?.some((item: any) => item.productId === productId) || false;

  const addToWishlistMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/wishlist', { productId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast({
        title: "Успешно!",
        description: "Продуктът е добавен във вашия списък с желания.",
      });
    },
    onError: () => {
      toast({
        title: "Грешка",
        description: "Възникна проблем при добавянето в списъка с желания.",
        variant: "destructive",
      });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', `/api/wishlist/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast({
        title: "Премахнато",
        description: "Продуктът е премахнат от списъка с желания.",
      });
    },
    onError: () => {
      toast({
        title: "Грешка", 
        description: "Възникна проблем при премахването от списъка.",
        variant: "destructive",
      });
    },
  });

  const handleWishlistToggle = () => {
    if (!authState.user) {
      toast({
        title: "Вход необходим",
        description: "Моля, влезте в профила си за да използвате списъка с желания.",
        variant: "destructive",
      });
      return;
    }

    if (isInWishlist) {
      removeFromWishlistMutation.mutate();
    } else {
      addToWishlistMutation.mutate();
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  return (
    <Button
      variant={variant}
      size="icon"
      className={cn(
        sizeClasses[size],
        "transition-all duration-200",
        isInWishlist && "text-red-500 hover:text-red-600"
      )}
      onClick={handleWishlistToggle}
      disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-all duration-200",
          isInWishlist ? "fill-current text-red-500" : "text-gray-400 hover:text-red-500"
        )}
      />
    </Button>
  );
}
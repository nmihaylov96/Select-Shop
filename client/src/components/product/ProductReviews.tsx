import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, User } from "lucide-react";
import StarRating from "./StarRating";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Review } from "@shared/schema";

interface ProductReviewsProps {
  productId: number;
}

interface ReviewWithUser extends Review {
  user: {
    username: string;
  };
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: reviews, isLoading } = useQuery<ReviewWithUser[]>({
    queryKey: [`/api/reviews/${productId}`],
  });

  const createReviewMutation = useMutation({
    mutationFn: (reviewData: { rating: number; comment: string }) =>
      apiRequest('POST', '/api/reviews', {
        productId,
        ...reviewData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/reviews/${productId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setNewComment("");
      setNewRating(5);
      setShowReviewForm(false);
      toast({
        title: "Успешно!",
        description: "Вашата оценка беше добавена успешно.",
      });
    },
    onError: () => {
      toast({
        title: "Грешка",
        description: "Възникна проблем при добавянето на оценката.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = () => {
    if (!newComment.trim()) {
      toast({
        title: "Грешка",
        description: "Моля, напишете коментар.",
        variant: "destructive",
      });
      return;
    }

    createReviewMutation.mutate({
      rating: newRating,
      comment: newComment.trim(),
    });
  };

  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Отзиви и оценки</h3>
        {authState.user && !showReviewForm && (
          <Button onClick={() => setShowReviewForm(true)}>
            Напишете отзив
          </Button>
        )}
      </div>

      {reviews && reviews.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div>
                <CardTitle className="text-3xl">{averageRating.toFixed(1)}</CardTitle>
                <StarRating rating={averageRating} readonly showValue={false} size="lg" />
              </div>
              <div className="text-sm text-gray-600">
                Базиран на {reviews.length} {reviews.length === 1 ? 'отзив' : 'отзива'}
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {showReviewForm && authState.user && (
        <Card>
          <CardHeader>
            <CardTitle>Напишете своя отзив</CardTitle>
            <CardDescription>
              Споделете вашето мнение за този продукт
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Оценка</label>
              <StarRating
                rating={newRating}
                onRatingChange={setNewRating}
                size="lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Коментар</label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Опишете вашето преживяване с този продукт..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitReview}
                disabled={createReviewMutation.isPending}
              >
                {createReviewMutation.isPending ? "Публикува..." : "Публикувай отзив"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewForm(false);
                  setNewComment("");
                  setNewRating(5);
                }}
              >
                Отказ
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!authState.user && (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Влезте за да оставите отзив</h3>
            <p className="text-gray-600 mb-4">
              Трябва да влезете в профила си, за да можете да оставите отзив.
            </p>
            <Link href="/login">
              <Button>Вход</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{review.user.username}</h4>
                        <StarRating rating={review.rating} readonly size="sm" />
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('bg-BG')}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Няма отзиви</h3>
              <p className="text-gray-600">
                Бъдете първият, който ще остави отзив за този продукт.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
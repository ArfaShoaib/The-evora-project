"use client";

import * as React from "react";
import Link from "next/link";
import { Star, X, LogIn, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema, type ReviewInput } from "@/lib/validations";
import { getProductReviews, addReview } from "@/lib/actions";

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  review: string | null;
  created_at: string;
  profiles?: { name: string | null; avatar_url: string | null } | null;
}

interface ReviewSectionProps {
  productId: string;
  onReviewsLoaded?: (rating: number, count: number) => void;
}

export function ReviewSection({ productId, onReviewsLoaded }: ReviewSectionProps) {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [hoveredStar, setHoveredStar] = React.useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, review: "" },
  });

  const ratingValue = watch("rating");

  React.useEffect(() => {
    getProductReviews(productId).then((data) => {
      const reviewList = data as Review[];
      setReviews(reviewList);
      setLoading(false);
      if (onReviewsLoaded) {
        const avg = reviewList.length
          ? reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length
          : 0;
        onReviewsLoaded(avg, reviewList.length);
      }
    });
  }, [productId, onReviewsLoaded]);

  const onSubmit = async (data: ReviewInput) => {
    try {
      await addReview(productId, data.rating, data.review);
      const updated = await getProductReviews(productId);
      const reviewList = updated as Review[];
      setReviews(reviewList);
      reset({ rating: 5, review: "" });
      if (onReviewsLoaded) {
        const avg = reviewList.length
          ? reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length
          : 0;
        onReviewsLoaded(avg, reviewList.length);
      }
    } catch (err) {
      const msg = typeof err === "string" ? err : String(err);
      const isAuthError =
        msg.toLowerCase().includes("not authenticated") ||
        msg.toLowerCase().includes("row-level security") ||
        msg.toLowerCase().includes("permission denied") ||
        msg.toLowerCase().includes("unauthorized");
      if (isAuthError) {
        setShowLoginPrompt(true);
      }
    }
  };

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="mt-16 sm:mt-24">
      <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-8">
        Customer Reviews
      </h2>

      {/* Summary */}
      <div className="flex items-center gap-6 mb-10 pb-10 border-b border-border">
        <div className="text-center">
          <div className="font-serif text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</div>
          <div className="flex mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`size-4 ${i < Math.round(avgRating) ? "text-gold fill-gold" : "text-muted"}`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="size-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground mb-10">
          No reviews yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="flex flex-col gap-6 mb-10">
          {reviews.map((review) => (
            <div key={review.id} className="pb-6 border-b border-border last:border-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${i < review.rating ? "text-gold fill-gold" : "text-muted"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {review.profiles?.name || "Anonymous"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {review.review && (
                <p className="text-sm text-muted-foreground leading-relaxed">{review.review}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Write a Review */}
      <div className="p-6 bg-muted/30 border border-border">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
          Write a Review
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue("rating", star, { shouldValidate: true })}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-0.5"
                >
                  <Star
                    className={`size-6 transition-colors ${
                      star <= (hoveredStar || ratingValue)
                        ? "text-gold fill-gold"
                        : "text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="mt-1 text-xs text-red-600">{errors.rating.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Your Review
            </label>
            <textarea
              rows={4}
              placeholder="Share your experience with this product..."
              {...register("review")}
              className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors resize-none"
            />
            {errors.review && (
              <p className="mt-1 text-xs text-red-600">{errors.review.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="self-start px-8 py-3 bg-foreground text-background text-xs font-semibold tracking-[0.2em] uppercase hover:bg-gold hover:text-foreground transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLoginPrompt(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Gold top accent */}
            <div className="h-1 bg-gold" />

            {/* Close button */}
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            >
              <X className="size-4" />
            </button>

            {/* Content */}
            <div className="p-8 text-center">
              {/* Icon */}
              <div className="mx-auto mb-5 size-14 rounded-full bg-gold/10 flex items-center justify-center">
                <LogIn className="size-6 text-gold" />
              </div>

              <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                Sign In Required
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-8">
                Please sign in to share your review and help other customers make the right choice.
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-[#111111] text-white text-xs font-semibold tracking-[0.15em] uppercase rounded-lg hover:bg-gold hover:text-[#111111] transition-all duration-300"
                >
                  <LogIn className="size-4" />
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3.5 border border-[#111111] text-[#111111] text-xs font-semibold tracking-[0.15em] uppercase rounded-lg hover:bg-[#111111] hover:text-white transition-all duration-300"
                >
                  <UserPlus className="size-4" />
                  Create Account
                </Link>
              </div>

              <p className="mt-6 text-xs text-gray-400">
                New to EVORA?{" "}
                <Link href="/auth/register" className="text-gold hover:underline font-medium">
                  Join us
                </Link>{" "}
                for an exclusive experience.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

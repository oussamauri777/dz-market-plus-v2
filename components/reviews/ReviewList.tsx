import StarRating from './StarRating';

interface Review {
    _id: string;
    reviewer: {
        name: string;
        image?: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
}

interface ReviewListProps {
    reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
    if (reviews.length === 0) {
        return <p className="text-gray-500 text-center py-4">No reviews yet.</p>;
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div key={review._id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {review.reviewer.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{review.reviewer.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <StarRating rating={review.rating} readonly size={16} />
                    <p className="mt-2 text-gray-700 text-sm">{review.comment}</p>
                </div>
            ))}
        </div>
    );
}

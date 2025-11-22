import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    setRating?: (rating: number) => void;
    readonly?: boolean;
    size?: number;
}

export default function StarRating({ rating, setRating, readonly = false, size = 20 }: StarRatingProps) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => !readonly && setRating && setRating(star)}
                    className={`${readonly ? 'cursor-default' : 'cursor-pointer'} focus:outline-none`}
                    disabled={readonly}
                >
                    <Star
                        size={size}
                        className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            } transition-colors`}
                    />
                </button>
            ))}
        </div>
    );
}

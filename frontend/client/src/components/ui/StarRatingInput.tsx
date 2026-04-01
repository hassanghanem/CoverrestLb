import React, { useState } from "react";
import { Star } from "lucide-react"; // assuming you're using lucide-react

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
}

export const StarRatingInput: React.FC<StarRatingInputProps> = ({
  value,
  onChange,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  return (
    <div className="flex gap-1 justify-center">
      {[...Array(5)].map((_, i) => {
        const starNumber = i + 1;
        const isFilled = hoverValue !== null ? starNumber <= hoverValue : starNumber <= value;

        return (
          <Star
            key={i}
            className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${
              isFilled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            }`}
            onMouseEnter={() => setHoverValue(starNumber)}
            onMouseLeave={() => setHoverValue(null)}
            onClick={() => onChange(starNumber)}
          />
        );
      })}
    </div>
  );
};

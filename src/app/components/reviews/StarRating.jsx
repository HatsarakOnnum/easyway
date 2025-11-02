"use client";
import React, { useState } from 'react';
import { StarIcon } from '@/app/components/ui/Icons'; // Import StarIcon

export const StarRatingDisplay = ({ rating = 0, count = 0 }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) stars.push(<StarIcon key={i} className="text-yellow-400" filled />);
        else if (i === Math.ceil(rating) && !Number.isInteger(rating)) stars.push(<StarIcon key={i} className="text-yellow-400" half />);
        else stars.push(<StarIcon key={i} className="text-gray-300 dark:text-gray-600" filled />);
    }
    return <div className="flex items-center">{stars} <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({count || 0} reviews)</span></div>;
};

export const StarRatingInput = ({ rating, setRating }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex space-x-1">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return ( <label key={index}><input type="radio" name="rating" value={ratingValue} onClick={() => setRating(ratingValue)} className="hidden" /><StarIcon className={`cursor-pointer transition-colors duration-200 ${ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} onMouseEnter={() => setHover(ratingValue)} onMouseLeave={() => setHover(0)} filled /></label> );
            })}
        </div>
    );
};
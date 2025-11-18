'use client'

import { Star } from 'lucide-react';
import React, { useState } from 'react'
import { XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { submitOrderRating } from '@/utils/ratingUtils';

const RatingModal = ({ ratingModal, setRatingModal }) => {

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);
    const user = useSelector(state => state.auth.user);

    const handleSubmit = async () => {
        if (rating < 1 || rating > 5) {
            return toast.error('Please select a rating');
        }
        if (review.trim().length < 5) {
            return toast.error('Please write at least 5 characters for your review');
        }

        if (!ratingModal?.id || !ratingModal?.restaurantId || !user?.uid) {
            return toast.error('Order information is missing');
        }

        setLoading(true);
        try {
            await submitOrderRating(
                ratingModal.id,
                ratingModal.restaurantId,
                user.uid,
                rating,
                review.trim()
            );
            toast.success('Thank you for your rating!');
            setRatingModal(null);
        } catch (error) {
            console.error('Error submitting rating:', error);
            toast.error('Failed to submit rating. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='fixed inset-0 z-120 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto'>
            <div className='bg-white p-8 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto relative my-8'>
                <button onClick={() => setRatingModal(null)} className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'>
                    <XIcon size={20} />
                </button>
                <h2 className='text-xl font-medium text-[#366055] mb-4'>Rate Restaurant</h2>
                <div className='flex items-center justify-center mb-4'>
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            className={`size-8 cursor-pointer ${rating > i ? "text-[#FC8A06] fill-current" : "text-gray-300"}`}
                            onClick={() => setRating(i + 1)}
                        />
                    ))}
                </div>
                <textarea
                    className='w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-400'
                    placeholder='Write your review (minimum 5 characters)'
                    rows='4'
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    disabled={loading}
                ></textarea>
                <div className='text-xs text-gray-500 mb-4'>
                    {review.trim().length}/5 characters minimum
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading || rating === 0}
                    className='w-full bg-[#366055] text-white py-2 rounded-md hover:bg-[#2b4c44] transition disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    {loading ? 'Submitting...' : 'Submit Rating'}
                </button>
            </div>
        </div>
    )
}

export default RatingModal

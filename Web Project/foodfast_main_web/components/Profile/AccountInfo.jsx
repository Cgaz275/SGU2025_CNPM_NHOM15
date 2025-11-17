'use client'
import { Mail } from 'lucide-react';
import { format } from 'date-fns';

export default function AccountInfo({ user }) {
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        
        try {
            if (timestamp.toDate) {
                return format(timestamp.toDate(), 'dd/MM/yyyy \'at\' HH:mm');
            }
            return format(new Date(timestamp), 'dd/MM/yyyy \'at\' HH:mm');
        } catch (error) {
            return 'N/A';
        }
    };

    return (
        <div className="mt-12">
            <h3 className="text-base sm:text-lg font-medium text-black mb-6">
                Your account
            </h3>

            <div className="flex items-start gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#4182F9]/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-[#366055]" />
                </div>

                <div>
                    <p className="text-sm sm:text-base text-black mb-1">
                        {user?.email}
                    </p>
                    <p className="text-sm sm:text-base text-black opacity-50 mb-2">
                        Created at: {formatDate(user?.createdAt)}
                    </p>
                    <button className="text-xs sm:text-sm text-black opacity-50 underline hover:opacity-70 transition-opacity">
                        Change password?
                    </button>
                </div>
            </div>
        </div>
    )
}

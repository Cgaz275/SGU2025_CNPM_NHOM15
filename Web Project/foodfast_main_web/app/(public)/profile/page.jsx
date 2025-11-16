'use client';

import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import useCurrentUser from '@/hooks/useCurrentUser';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/FirebaseConfig';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useCurrentUser();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    defaultAddress: '',
    phone: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
      toast.error('Please login to view your profile');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        defaultAddress: user.defaultAddress || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const userRef = doc(db, 'user', user.uid);
      await updateDoc(userRef, {
        name: formData.name,
        defaultAddress: formData.defaultAddress,
        phone: formData.phone
      });
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#366055] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#366055] mb-8">
            Personal Profile
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-lg sm:text-xl font-medium text-black mb-1">
                {user.name || 'User'}
              </h2>
              <p className="text-sm sm:text-base text-black opacity-50">
                {user.email}
              </p>
            </div>

            {isEditing ? (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name || '',
                      defaultAddress: user.defaultAddress || '',
                      phone: user.phone || ''
                    });
                  }}
                  className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 rounded-lg bg-[#366055] text-white font-medium hover:bg-[#2b4c44] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 rounded-lg bg-[#366055] text-white font-medium hover:bg-[#2b4c44] transition-colors self-start sm:self-auto"
              >
                Edit
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm sm:text-base text-black opacity-80 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Your First Name"
                className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg bg-[#F9F9F9] text-sm sm:text-base text-black placeholder-black/40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#366055]"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base text-black opacity-80 mb-2">
                Default Address
              </label>
              <input
                type="text"
                name="defaultAddress"
                value={formData.defaultAddress}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Your Address"
                className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg bg-[#F9F9F9] text-sm sm:text-base text-black placeholder-black/40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#366055]"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base text-black opacity-80 mb-2">
                Phone number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Your phone number"
                className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg bg-[#F9F9F9] text-sm sm:text-base text-black placeholder-black/40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#366055]"
              />
            </div>
          </div>

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
                  {user.email}
                </p>
                <p className="text-sm sm:text-base text-black opacity-50 mb-2">
                  Created at: {formatDate(user.createdAt)}
                </p>
                <button className="text-xs sm:text-sm text-black opacity-50 underline hover:opacity-70 transition-opacity">
                  Change password?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import useCurrentUser from '@/hooks/useCurrentUser';
import { doc, updateDoc, collection, addDoc, query, where, getDocs, GeoPoint } from 'firebase/firestore';
import { db } from '@/config/FirebaseConfig';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import AddressPickerModal from '@/components/Modals/AddressPickerModal';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import ProfileForm from '@/components/Profile/ProfileForm';
import AccountInfo from '@/components/Profile/AccountInfo';
import MerchantRestaurantEditor from '@/components/Profile/MerchantRestaurantEditor';

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
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddressData, setSelectedAddressData] = useState(null);

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

      const updateData = {
        name: formData.name,
        phone: formData.phone
      };

      const addressCollectionRef = collection(db, 'address');
      const q = query(addressCollectionRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (selectedAddressData) {
        if (querySnapshot.size > 0) {
          const existingDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'address', existingDoc.id), {
            address: selectedAddressData.address,
            latlong: new GeoPoint(selectedAddressData.lat, selectedAddressData.lng),
            name: formData.name,
            phone: formData.phone,
            note: "",
            userId: user.uid
          });
        } else {
          await addDoc(addressCollectionRef, {
            address: selectedAddressData.address,
            latlong: new GeoPoint(selectedAddressData.lat, selectedAddressData.lng),
            name: formData.name,
            phone: formData.phone,
            note: "",
            userId: user.uid,
            createdAt: new Date()
          });
        }
        updateData.defaultAddress = selectedAddressData.address;
      } else {
        if (querySnapshot.size > 0) {
          const existingDoc = querySnapshot.docs[0];
          const existingData = existingDoc.data();
          await updateDoc(doc(db, 'address', existingDoc.id), {
            name: formData.name,
            phone: formData.phone,
            note: "",
            address: formData.defaultAddress || existingData.address || "",
            latlong: existingData.latlong || null,
            userId: user.uid
          });
        } else {
          await addDoc(addressCollectionRef, {
            address: formData.defaultAddress || "",
            latlong: null,
            name: formData.name,
            phone: formData.phone,
            note: "",
            userId: user.uid,
            createdAt: new Date()
          });
        }
        updateData.defaultAddress = formData.defaultAddress;
      }

      await updateDoc(userRef, updateData);

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setSelectedAddressData(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAddress = (addressData) => {
    setSelectedAddressData(addressData);
    setFormData(prev => ({
      ...prev,
      defaultAddress: addressData.address
    }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || '',
      defaultAddress: user.defaultAddress || '',
      phone: user.phone || ''
    });
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

          <ProfileHeader
            user={user}
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onCancel={handleCancel}
            onSave={handleSave}
            isSaving={saving}
          />

          <ProfileForm
            formData={formData}
            onInputChange={handleInputChange}
            isEditing={isEditing}
            onMapClick={() => setIsAddressModalOpen(true)}
          />

          <AccountInfo user={user} />

          {user?.role === 'merchant' && (
            <MerchantRestaurantEditor user={user} />
          )}
        </div>
      </div>

      <AddressPickerModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSelectAddress={handleSelectAddress}
        initialLat={selectedAddressData?.lat || user?.defaultLat}
        initialLng={selectedAddressData?.lng || user?.defaultLng}
      />
    </div>
  );
}

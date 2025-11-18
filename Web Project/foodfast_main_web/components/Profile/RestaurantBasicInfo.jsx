'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc, GeoPoint } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'
import { MapPin, Upload, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import AddressPickerModal from '@/components/Modals/AddressPickerModal'

export default function RestaurantBasicInfo({ restaurantId }) {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [uploadingBanner, setUploadingBanner] = useState(false)
    const [isEnabled, setIsEnabled] = useState(true)

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        latitude: '',
        longitude: ''
    })

    const [images, setImages] = useState({
        logo: null,
        banner: null
    })

    const [imageUrls, setImageUrls] = useState({
        logo: null,
        banner: null
    })

    // Fetch restaurant data
    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const docRef = doc(db, 'restaurants', restaurantId)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    const data = docSnap.data()
                    setFormData({
                        name: data.name || '',
                        address: data.address || '',
                        latitude: data.latlong?.latitude || '',
                        longitude: data.latlong?.longitude || ''
                    })
                    setImageUrls({
                        logo: data.imageUrl || null,
                        banner: data.bannerURL || null
                    })
                    setIsEnabled(data.is_enable !== false)
                }
            } catch (error) {
                console.error('Error fetching restaurant:', error)
                toast.error('Failed to load restaurant information')
            } finally {
                setLoading(false)
            }
        }

        fetchRestaurant()
    }, [restaurantId])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSelectAddress = async (addressData) => {
        const updatedData = {
            address: addressData.address,
            latitude: addressData.lat,
            longitude: addressData.lng
        }

        setFormData(prev => ({
            ...prev,
            ...updatedData
        }))

        // Auto-save the location changes
        setSaving(true)
        try {
            const updatePayload = {
                address: addressData.address,
                latlong: new GeoPoint(
                    parseFloat(addressData.lat),
                    parseFloat(addressData.lng)
                )
            }

            const docRef = doc(db, 'restaurants', restaurantId)
            await updateDoc(docRef, updatePayload)

            toast.success('Location updated successfully!')
        } catch (error) {
            console.error('Error updating location:', error)
            toast.error('Failed to update location')
        } finally {
            setSaving(false)
        }
    }

    const uploadFile = async (file) => {
        try {
            const formDataObj = new FormData()
            formDataObj.append('file', file)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formDataObj
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Upload failed')
            }

            const { downloadURL } = await response.json()
            return downloadURL
        } catch (error) {
            console.error('Error uploading file:', error)
            throw error
        }
    }

    const handleFileSelect = async (e, imageType) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB')
            return
        }

        try {
            if (imageType === 'logo') {
                setUploadingLogo(true)
            } else {
                setUploadingBanner(true)
            }

            const downloadURL = await uploadFile(file)
            setImageUrls(prev => ({
                ...prev,
                [imageType]: downloadURL
            }))
            toast.success(`${imageType === 'logo' ? 'Logo' : 'Banner'} uploaded successfully`)
        } catch (error) {
            toast.error('Failed to upload image')
        } finally {
            if (imageType === 'logo') {
                setUploadingLogo(false)
            } else {
                setUploadingBanner(false)
            }
        }
    }

    const handleSave = async () => {
        if (!formData.name || !formData.address || !formData.latitude || !formData.longitude) {
            toast.error('Please fill in all required fields')
            return
        }

        setSaving(true)
        try {
            const updateData = {
                name: formData.name,
                address: formData.address,
                latlong: new GeoPoint(
                    parseFloat(formData.latitude),
                    parseFloat(formData.longitude)
                )
            }

            if (imageUrls.logo) {
                updateData.imageUrl = imageUrls.logo
            }
            if (imageUrls.banner) {
                updateData.bannerURL = imageUrls.banner
            }

            const docRef = doc(db, 'restaurants', restaurantId)
            await updateDoc(docRef, updateData)

            toast.success('Restaurant information updated successfully!')
        } catch (error) {
            console.error('Error updating restaurant:', error)
            toast.error('Failed to update restaurant information')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#366055] mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Banned Restaurant Alert */}
            {!isEnabled && (
                <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-4 flex gap-4">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="font-semibold text-red-900 mb-1">Restaurant Banned</h3>
                        <p className="text-red-800 text-sm">
                            Your restaurant has been banned by an administrator and will not appear in customer view. Please contact support for more information.
                        </p>
                    </div>
                </div>
            )}
            {/* Restaurant Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Name *
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter restaurant name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                />
            </div>

            {/* Address */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                </label>
                <div className="flex gap-3">
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter address"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055]"
                    />
                    <button
                        type="button"
                        onClick={() => setIsAddressModalOpen(true)}
                        className="px-4 py-3 bg-[#366055] text-white rounded-lg font-medium hover:bg-[#2b4c44] transition flex items-center gap-2 whitespace-nowrap"
                    >
                        <MapPin size={18} />
                        <span className="hidden sm:inline">Pick Location</span>
                        <span className="sm:hidden">Map</span>
                    </button>
                </div>
            </div>

            {/* Coordinates Display */}
            {formData.latitude && formData.longitude && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                        <span className="font-medium">Location:</span> {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
                    </p>
                </div>
            )}

            {/* Logo Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Logo
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e, 'logo')}
                            disabled={uploadingLogo}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055] disabled:opacity-50"
                        />
                    </div>
                    {imageUrls.logo && (
                        <img
                            src={imageUrls.logo}
                            alt="Restaurant logo"
                            className="w-24 h-24 object-cover rounded-lg"
                        />
                    )}
                </div>
                {uploadingLogo && <p className="text-sm text-gray-600 mt-2">Uploading...</p>}
            </div>

            {/* Banner Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Banner
                </label>
                <div className="flex flex-col gap-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'banner')}
                        disabled={uploadingBanner}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055] disabled:opacity-50"
                    />
                    {imageUrls.banner && (
                        <img
                            src={imageUrls.banner}
                            alt="Restaurant banner"
                            className="w-full h-32 object-cover rounded-lg"
                        />
                    )}
                </div>
                {uploadingBanner && <p className="text-sm text-gray-600 mt-2">Uploading...</p>}
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-[#366055] text-white rounded-lg font-medium hover:bg-[#2b4c44] transition disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Address Picker Modal */}
            <AddressPickerModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                onSelectAddress={handleSelectAddress}
                initialLat={parseFloat(formData.latitude) || 0}
                initialLng={parseFloat(formData.longitude) || 0}
            />
        </div>
    )
}

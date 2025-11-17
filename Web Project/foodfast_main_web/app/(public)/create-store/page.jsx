'use client'
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import AddressPickerModal from "@/components/Modals/AddressPickerModal"
import { db, auth } from "@/config/FirebaseConfig"
import { doc, setDoc, serverTimestamp, GeoPoint } from "firebase/firestore"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { useRouter } from "next/navigation"
import { MapPin, Upload } from "lucide-react"

export default function CreateStore() {
    const router = useRouter()
    const [showAddressPicker, setShowAddressPicker] = useState(false)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Unified form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirm: "",
        address: "",
        latitude: "",
        longitude: ""
    })

    const [files, setFiles] = useState({
        logo: null,
        banner: null
    })

    const [previewUrls, setPreviewUrls] = useState({
        logo: null,
        banner: null
    })

    useEffect(() => {
        setLoading(false)
    }, [])

    // Handle text input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    // Handle address selection
    const handleSelectAddress = (selectedAddress) => {
        setFormData({
            ...formData,
            address: selectedAddress.address,
            latitude: selectedAddress.lat,
            longitude: selectedAddress.lng
        })
        toast.success('Location selected successfully')
    }

    // Handle file selection
    const handleFileSelect = (e, fileType) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB')
            return
        }

        setFiles({
            ...files,
            [fileType]: file
        })

        const reader = new FileReader()
        reader.onloadend = () => {
            setPreviewUrls({
                ...previewUrls,
                [fileType]: reader.result
            })
        }
        reader.readAsDataURL(file)
    }

    // Upload file to storage via API
    const uploadFile = async (file, path) => {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('path', path)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
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

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate all required fields
        if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirm) {
            toast.error('Please fill in all account fields')
            return
        }

        if (formData.password !== formData.confirm) {
            toast.error('Passwords do not match')
            return
        }

        if (!formData.address || !formData.latitude || !formData.longitude) {
            toast.error('Please fill in all restaurant location fields')
            return
        }

        if (!files.logo || !files.banner) {
            toast.error('Please upload both logo and banner images')
            return
        }

        setSubmitting(true)
        try {
            console.log('Starting registration process...')

            // Create user account
            console.log('Creating user account...')
            const authRes = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
            const user = authRes.user
            console.log('User account created:', user.uid)

            await updateProfile(user, { displayName: formData.name })

            // Upload images
            console.log('Uploading images...')
            const logoPath = `restaurants/${user.uid}/logo_${Date.now()}`
            const bannerPath = `restaurants/${user.uid}/banner_${Date.now()}`
            const logoURL = await uploadFile(files.logo, logoPath)
            console.log('Logo uploaded:', logoURL)

            const bannerURL = await uploadFile(files.banner, bannerPath)
            console.log('Banner uploaded:', bannerURL)

            // Save user document to user collection
            console.log('Saving user document...')
            await setDoc(doc(db, "user", user.uid), {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: "merchant",
                is_enable: true,
                createdAt: serverTimestamp(),
            })
            console.log('User document saved')

            // Save restaurant document to restaurants collection
            console.log('Saving restaurant document...')
            await setDoc(doc(db, "restaurants", user.uid), {
                name: formData.name,
                address: formData.address,
                bannerURL: bannerURL,
                imageUrl: logoURL,
                latlong: new GeoPoint(parseFloat(formData.latitude), parseFloat(formData.longitude)),
                is_enable: true,
                rating: 0,
                status: "pending",
                createdAt: serverTimestamp(),
            })
            console.log('Restaurant document saved')
            console.log('Registration completed successfully!')

            setTimeout(() => {
                router.push('/')
            }, 1000)
        } catch (error) {
            console.error('Error submitting registration:', error)
            console.error('Error code:', error.code)
            console.error('Error message:', error.message)
            if (error.code === 'auth/email-already-in-use') {
                toast.error('Email already in use. Please use a different email.')
            } else {
                toast.error(error.message || 'Failed to complete registration')
            }
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <Loading />
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()
        return handleSubmit(e)
    }

    return (
        <div className="mx-6 min-h-screen my-16">
            <form onSubmit={(e) => {
                const promise = handleFormSubmit(e)
                toast.promise(promise, {
                    loading: "Completing registration...",
                    success: "Registration successful!",
                    error: (err) => err.message || "Registration failed"
                })
            }} className="max-w-2xl mx-auto flex flex-col items-start gap-4 text-slate-500">
                {/* Title */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-800">Become a <span className="text-[#366055]">Partner</span></h1>
                    <p className="max-w-lg text-slate-600 mt-3">Register your merchant account and restaurant with us to start accepting orders.</p>
                </div>

                {/* Account Information Section */}
                <div className="w-full">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-6">Account Information</h2>

                    <p className="font-medium text-slate-700 mb-2">Restaurant Name *</p>
                    <input
                        name="name"
                        onChange={handleInputChange}
                        value={formData.name}
                        type="text"
                        placeholder="Enter your restaurant name"
                        className="border border-slate-300 outline-slate-400 w-full p-3 rounded mb-4"
                        required
                    />

                    <p className="font-medium text-slate-700 mb-2">Email *</p>
                    <input
                        name="email"
                        onChange={handleInputChange}
                        value={formData.email}
                        type="email"
                        placeholder="Enter your email"
                        className="border border-slate-300 outline-slate-400 w-full p-3 rounded mb-4"
                        required
                    />

                    <p className="font-medium text-slate-700 mb-2">Phone *</p>
                    <input
                        name="phone"
                        onChange={handleInputChange}
                        value={formData.phone}
                        type="tel"
                        placeholder="Enter your phone number"
                        className="border border-slate-300 outline-slate-400 w-full p-3 rounded mb-4"
                        required
                    />

                    <p className="font-medium text-slate-700 mb-2">Password *</p>
                    <input
                        name="password"
                        onChange={handleInputChange}
                        value={formData.password}
                        type="password"
                        placeholder="Enter a strong password"
                        className="border border-slate-300 outline-slate-400 w-full p-3 rounded mb-4"
                        required
                    />

                    <p className="font-medium text-slate-700 mb-2">Confirm Password *</p>
                    <input
                        name="confirm"
                        onChange={handleInputChange}
                        value={formData.confirm}
                        type="password"
                        placeholder="Confirm your password"
                        className="border border-slate-300 outline-slate-400 w-full p-3 rounded mb-6"
                        required
                    />
                </div>

                {/* Restaurant Information Section */}
                <div className="w-full border-t pt-8">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-6">Restaurant Information</h2>

                    <p className="font-medium text-slate-700 text-lg mb-2">Restaurant Location *</p>
                    <div className="w-full space-y-3 mb-6">
                        <textarea
                            name="address"
                            value={formData.address}
                            rows={3}
                            placeholder="Selected address will appear here"
                            className="border border-slate-300 outline-slate-400 w-full p-3 rounded resize-none"
                            readOnly
                        />
                        <button
                            type="button"
                            onClick={() => setShowAddressPicker(true)}
                            className="w-full flex items-center justify-center gap-2 bg-[#366055] hover:bg-[#2b4c44] text-white px-4 py-3 rounded transition font-medium"
                        >
                            <MapPin size={20} />
                            Select Location on Map
                        </button>
                        {formData.latitude && formData.longitude && (
                            <p className="text-sm text-slate-600">
                                Coordinates: {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                            </p>
                        )}
                    </div>

                    <p className="font-medium text-slate-700 text-lg mb-2">Banner Image *</p>
                    <div className="w-full mb-6">
                        <label className="flex flex-col gap-3 cursor-pointer">
                            <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-slate-400 transition">
                                {previewUrls.banner ? (
                                    <img src={previewUrls.banner} alt="Banner preview" className="w-full h-32 object-cover rounded" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                        <Upload size={24} />
                                        <p className="text-sm">Click to upload banner image</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileSelect(e, 'banner')}
                                    className="hidden"
                                    required={!files.banner}
                                />
                            </div>
                            {files.banner && <p className="text-sm text-slate-600">Selected: {files.banner.name}</p>}
                        </label>
                    </div>

                    <p className="font-medium text-slate-700 text-lg mb-2">Restaurant Logo *</p>
                    <div className="w-full mb-6">
                        <label className="flex flex-col gap-3 cursor-pointer">
                            <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-slate-400 transition">
                                {previewUrls.logo ? (
                                    <img src={previewUrls.logo} alt="Logo preview" className="w-full h-32 object-cover rounded" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                        <Upload size={24} />
                                        <p className="text-sm">Click to upload restaurant logo</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileSelect(e, 'logo')}
                                    className="hidden"
                                    required={!files.logo}
                                />
                            </div>
                            {files.logo && <p className="text-sm text-slate-600">Selected: {files.logo.name}</p>}
                        </label>
                    </div>

                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#366055] text-white px-12 py-3 rounded font-semibold mt-8 mb-40 active:scale-95 hover:bg-[#2b4c44] transition disabled:opacity-50"
                >
                    {submitting ? 'Registering...' : 'Complete Registration'}
                </button>
            </form>

            <AddressPickerModal
                isOpen={showAddressPicker}
                onClose={() => setShowAddressPicker(false)}
                onSelectAddress={handleSelectAddress}
                initialLat={formData.latitude ? parseFloat(formData.latitude) : undefined}
                initialLng={formData.longitude ? parseFloat(formData.longitude) : undefined}
            />
        </div>
    )
}

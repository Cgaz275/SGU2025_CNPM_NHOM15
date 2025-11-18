'use client'
import { useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon, AlertCircle } from "lucide-react"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"
import { dummyStoreData } from "@/assets/assets"
import { db, auth } from "@/config/FirebaseConfig"
import { doc, getDoc, onSnapshot } from "firebase/firestore"

const StoreLayout = ({ children }) => {

    const [isSeller, setIsSeller] = useState(false)
    const [loading, setLoading] = useState(true)
    const [storeInfo, setStoreInfo] = useState(null)
    const [isApproved, setIsApproved] = useState(true)

    const fetchIsSeller = async () => {
        try {
            const user = auth.currentUser
            if (!user) {
                setLoading(false)
                return
            }

            // Listen to restaurant document for real-time approval status
            const restaurantRef = doc(db, 'restaurants', user.uid)
            const unsubscribe = onSnapshot(restaurantRef, (docSnap) => {
                if (docSnap.exists()) {
                    const restaurantData = docSnap.data()
                    setStoreInfo(restaurantData)
                    // Check if approved (status is 'approved' and is_enable is true)
                    setIsApproved(restaurantData.status === 'approved' && restaurantData.is_enable === true)
                    setIsSeller(true)
                } else {
                    setIsSeller(false)
                }
                setLoading(false)
            })

            return unsubscribe
        } catch (error) {
            console.error('Error fetching seller info:', error)
            setLoading(false)
        }
    }

    useEffect(() => {
        const unsubscribe = fetchIsSeller()
        return () => {
            if (unsubscribe) unsubscribe()
        }
    }, [])

    return loading ? (
        <Loading />
    ) : isSeller ? (
        <div className="flex flex-col h-screen">
            <SellerNavbar />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <SellerSidebar storeInfo={storeInfo} isApproved={isApproved} />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {!isApproved && (
                        <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={24} />
                            <div className="flex-1">
                                <h3 className="font-semibold text-yellow-900">Awaiting Admin Approval</h3>
                                <p className="text-yellow-800 text-sm mt-1">Your restaurant is currently under review by our admin team. Please wait for approval to access all features. This typically takes 24-48 hours.</p>
                            </div>
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">You are not authorized to access this page</h1>
            <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 mt-8 p-2 px-6 max-sm:text-sm rounded-full">
                Go to home <ArrowRightIcon size={18} />
            </Link>
        </div>
    )
}

export default StoreLayout

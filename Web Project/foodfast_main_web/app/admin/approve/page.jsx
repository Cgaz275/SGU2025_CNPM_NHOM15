'use client'
import StoreInfo from "@/components/admin/StoreInfo"
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { db } from "@/config/FirebaseConfig"
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc } from "firebase/firestore"

export default function AdminApprove() {

    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)
    const [approvingIds, setApprovingIds] = useState({})

    const handleApprove = async ({ storeId, status }) => {
        setApprovingIds(prev => ({ ...prev, [storeId]: true }))
        try {
            const restaurantRef = doc(db, 'restaurants', storeId)
            const userRef = doc(db, 'user', storeId)

            if (status === 'approved') {
                await updateDoc(restaurantRef, {
                    status: 'approved',
                    is_enable: true
                })
                await updateDoc(userRef, {
                    is_enable: true
                })
                toast.success('Restaurant approved successfully')
            } else if (status === 'rejected') {
                await updateDoc(restaurantRef, {
                    status: 'rejected',
                    is_enable: false
                })
                await updateDoc(userRef, {
                    is_enable: false
                })
                toast.success('Restaurant rejected')
            }
        } catch (error) {
            console.error('Error updating restaurant:', error)
            toast.error('Failed to update restaurant status')
        } finally {
            setApprovingIds(prev => ({ ...prev, [storeId]: false }))
        }
    }

    useEffect(() => {
        const restaurantsRef = collection(db, 'restaurants')
        const q = query(restaurantsRef, where('status', '==', 'approve_await'))

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const storesData = []
            for (const restaurantDoc of snapshot.docs) {
                const restaurantData = restaurantDoc.data()
                const userDoc = await getDoc(doc(db, 'user', restaurantData.userId))
                const userData = userDoc.exists() ? userDoc.data() : {}

                storesData.push({
                    id: restaurantDoc.id,
                    name: restaurantData.name,
                    logo: restaurantData.imageUrl,
                    username: restaurantData.userId,
                    status: restaurantData.status,
                    description: restaurantData.description || '',
                    address: restaurantData.address,
                    contact: restaurantData.phone || userData.phone || '',
                    email: userData.email || restaurantData.email || '',
                    createdAt: restaurantData.createdAt?.toDate?.() || new Date(),
                    user: {
                        name: userData.name || restaurantData.name,
                        email: userData.email || '',
                        image: userData.image || restaurantData.imageUrl || 'https://via.placeholder.com/36'
                    },
                    restaurantId: restaurantDoc.id,
                    userId: restaurantData.userId
                })
            }
            setStores(storesData)
            setLoading(false)
        }, (error) => {
            console.error('Error fetching stores:', error)
            toast.error('Failed to load restaurants')
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    return !loading ? (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">Approve <span className="text-slate-800 font-medium">Stores</span></h1>

            {stores.length ? (
                <div className="flex flex-col gap-4 mt-4">
                    {stores.map((store) => (
                        <div key={store.id} className="bg-white border rounded-lg shadow-sm p-6 flex max-md:flex-col gap-4 md:items-end max-w-4xl" >
                            {/* Store Info */}
                            <StoreInfo store={store} />

                            {/* Actions */}
                            <div className="flex gap-3 pt-2 flex-wrap">
                                <button
                                    onClick={() => handleApprove({ storeId: store.restaurantId, status: 'approved' })}
                                    disabled={approvingIds[store.restaurantId]}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {approvingIds[store.restaurantId] ? 'Approving...' : 'Approve'}
                                </button>
                                <button
                                    onClick={() => handleApprove({ storeId: store.restaurantId, status: 'rejected' })}
                                    disabled={approvingIds[store.restaurantId]}
                                    className="px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {approvingIds[store.restaurantId] ? 'Rejecting...' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    ))}

                </div>) : (
                <div className="flex items-center justify-center h-80">
                    <h1 className="text-3xl text-slate-400 font-medium">No Application Pending</h1>
                </div>
            )}
        </div>
    ) : <Loading />
}

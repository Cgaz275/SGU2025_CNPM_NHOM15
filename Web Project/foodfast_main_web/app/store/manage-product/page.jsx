'use client'

import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"
import { productDummyData } from "@/assets/assets"
import { formatPrice } from "@/utils/currencyFormatter"
import { db, auth } from "@/config/FirebaseConfig"
import { doc, getDoc } from "firebase/firestore"

export default function StoreManageProducts() {

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])
    const [isApproved, setIsApproved] = useState(true)

    const fetchProducts = async () => {
        setProducts(productDummyData)
        setLoading(false)
    }

    const toggleStock = async (productId) => {
        if (!isApproved) {
            toast.error('You cannot manage products until your store is approved')
            return
        }
    }

    useEffect(() => {
        const checkApprovalStatus = async () => {
            try {
                const user = auth.currentUser
                if (user) {
                    const restaurantRef = doc(db, 'restaurants', user.uid)
                    const docSnap = await getDoc(restaurantRef)
                    if (docSnap.exists()) {
                        const data = docSnap.data()
                        setIsApproved(data.status === 'approved' && data.is_enable === true)
                    }
                }
            } catch (error) {
                console.error('Error checking approval status:', error)
            }
        }
        
        checkApprovalStatus()
        fetchProducts()
    }, [])

    if (loading) return <Loading />

    return (
        <>
            {!isApproved && (
                <div className="mb-6 bg-red-50 border border-red-300 rounded-lg p-4">
                    <p className="text-red-700 font-semibold">Store Not Approved</p>
                    <p className="text-red-600 text-sm mt-1">Product management is currently disabled. Please wait for admin approval.</p>
                </div>
            )}
            <h1 className="text-2xl text-slate-500 mb-5">Manage <span className="text-slate-800 font-medium">Products</span></h1>
            <table className="w-full max-w-4xl text-left ring ring-slate-200 rounded overflow-hidden text-sm">
                <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
                    <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 hidden md:table-cell">Description</th>
                        <th className="px-4 py-3 hidden md:table-cell">MRP</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-slate-700">
                    {products.map((product) => (
                        <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <div className="flex gap-2 items-center">
                                    <Image width={40} height={40} className='p-1 shadow rounded cursor-pointer' src={product.images[0]} alt="" />
                                    {product.name}
                                </div>
                            </td>
                            <td className="px-4 py-3 max-w-md text-slate-600 hidden md:table-cell truncate">{product.description}</td>
                            <td className="px-4 py-3 hidden md:table-cell">{formatPrice(product.mrp)}</td>
                            <td className="px-4 py-3">{formatPrice(product.price)}</td>
                            <td className="px-4 py-3 text-center">
                                <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                                    <input type="checkbox" className="sr-only peer" onChange={() => toast.promise(toggleStock(product.id), { loading: "Updating data..." })} checked={product.inStock} disabled={!isApproved} />
                                    <div className={`w-9 h-5 rounded-full peer transition-colors duration-200 ${isApproved ? 'bg-slate-300 peer-checked:bg-green-600' : 'bg-slate-200'}`}></div>
                                    <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                                </label>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}

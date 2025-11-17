'use client'
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { clearAdmin } from "@/lib/features/auth/adminAuthSlice"
import { signOut } from "firebase/auth"
import { auth } from "@/config/FirebaseConfig"
import { LogOut } from "lucide-react"
import toast from "react-hot-toast"

const AdminNavbar = () => {
    const dispatch = useDispatch()
    const router = useRouter()
    const admin = useSelector(state => state.adminAuth.admin)

    const handleLogout = async () => {
        try {
            await signOut(auth)
            dispatch(clearAdmin())
            toast.success('Signed out successfully')
            router.push('/admin/auth')
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Failed to sign out')
        }
    }

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/admin" className="relative text-4xl font-semibold text-slate-700">
                <span className="text-green-600">go</span>cart<span className="text-green-600 text-5xl leading-0">.</span>
                <p className="absolute text-xs font-semibold -top-1 -right-13 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                    Admin
                </p>
            </Link>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <p className="text-slate-700 font-medium">
                        Hi, {admin?.name || 'Admin'}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Sign out"
                >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    )
}

export default AdminNavbar

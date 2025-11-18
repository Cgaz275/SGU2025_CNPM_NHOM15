'use client'
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/Orders/OrdersAreaChart"
import { CircleDollarSignIcon, Users2Icon, StoreIcon, TagsIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchDashboardMetrics, formatRevenueVND } from "@/utils/admin/calculateDashboardMetrics"

export default function AdminDashboard() {

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        customers: 0,
        revenue: '0.00',
        orders: 0,
        stores: 0,
        allOrders: [],
    })

    const dashboardCardsData = [
        { title: 'Total Customers', value: dashboardData.customers, icon: Users2Icon },
        { title: 'Total Revenue', value: formatRevenueVND(dashboardData.revenue) + ' VND', icon: CircleDollarSignIcon },
        { title: 'Total Orders', value: dashboardData.orders, icon: TagsIcon },
        { title: 'Total Stores', value: dashboardData.stores, icon: StoreIcon },
    ]

    const fetchDashboardData = async () => {
        try {
            const metrics = await fetchDashboardMetrics()
            setDashboardData(metrics)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500">
            <h1 className="text-2xl">Admin <span className="text-slate-800 font-medium">Dashboard</span></h1>

            {/* Cards */}
            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            {/* Area Chart */}
            <OrdersAreaChart allOrders={dashboardData.allOrders} />
        </div>
    )
}

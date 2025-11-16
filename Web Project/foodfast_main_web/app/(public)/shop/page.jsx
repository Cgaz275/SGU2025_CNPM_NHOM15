'use client'
import { Suspense } from "react"
import ProductCard from "@/components/Products/ProductCard"
import { MoveLeftIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"
import PopularRestaurants from "@/components/Restaurants/PopularRestaurants";
import Hero_restaurant from "@/components/Hero/Hero_restaurant";
import AllRestaurant from "@/components/Restaurants/AllRestaurant"
import AllCategories from "@/components/Categories/AllCategories"

 function ShopContent() {

    // get query params ?search=abc
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()

    const products = useSelector(state => state.product.list)

    const filteredProducts = search
        ? products.filter(product =>
            product.name.toLowerCase().includes(search.toLowerCase())
        )
        : products;

    return (
        <div className="min-h-[70vh] mx-6">
            <div className=" max-w-7xl mx-auto">
                <h1 onClick={() => router.push('/shop')} className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"> {search && <MoveLeftIcon size={20} />}  All <span className="text-slate-700 font-medium">Products</span></h1>
                <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
                    {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
            </div>
        </div>
    )
}


export default function Shop() {
  return (
    // <Suspense fallback={<div>Loading shop...</div>}>
    //   <ShopContent />
    // </Suspense>
       <div className="min-h-screen bg-white">
            <Hero_restaurant />
            <PopularRestaurants />
            <AllCategories />
            <AllRestaurant/>/
        </div>
  );
}
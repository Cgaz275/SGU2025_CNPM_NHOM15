'use client'
import Hero from "@/components/Hero/Hero";
import ExclusiveDeals from "@/components/ExclusiveDeals";
import PopularCategories from "@/components/Categories/PopularCategories";
import PopularRestaurants from "@/components/Restaurants/PopularRestaurants";
import AppDownload from "@/components/AppDownload";
import PartnerWithUs from "@/components/PartnerWithUs";

export default function Home() {
    return (
        <div className="min-h-screen bg-white">
            <Hero />
            <ExclusiveDeals />
            <PopularCategories />
            <PopularRestaurants />
            <AppDownload />
            <PartnerWithUs />
            
        </div>
    );
}

'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartWidget from "@/components/CartWidget";

export default function PublicLayout({ children }) {

    return (
        <>
            <CartWidget />
            <Banner />
            <Navbar />
            {children}
            <Footer />
        </>
    );
}

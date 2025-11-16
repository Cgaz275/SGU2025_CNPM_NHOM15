'use client'
import Banner from "@/components/General/Banner";
import Navbar from "@/components/General/Navbar";
import Footer from "@/components/General/Footer";
import CartWidget from "@/components/CartWidget";
import AuthWatcher from "../../lib/AuthWatcher";


export default function PublicLayout({ children }) {

    return (
        <>
            <AuthWatcher />
            <CartWidget />
            <Banner />
            <Navbar />

            {children}
            <Footer />
        </>
    );
}

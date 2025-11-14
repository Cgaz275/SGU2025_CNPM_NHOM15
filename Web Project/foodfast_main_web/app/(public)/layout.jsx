'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartWidget from "@/components/CartWidget";
import AuthWatcher from "../../lib/AuthWatcher";
import { Provider } from "react-redux";
import { makeStore } from "../../lib/store";

export default function PublicLayout({ children }) {

    return (
        <>
         <Provider store={makeStore ()}>
             <AuthWatcher />
            <CartWidget />
            <Banner />
            <Navbar />
            {children}
            <Footer />
            </Provider>
        </>
    );
}

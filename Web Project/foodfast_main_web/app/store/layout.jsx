import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "Foodfast - Drone Delivery",
    description: "GoCart. - Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}

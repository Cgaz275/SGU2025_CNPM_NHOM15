import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "FoodFast - Admin",
    description: "FoodFast - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}

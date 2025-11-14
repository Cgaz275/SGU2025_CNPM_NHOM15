export default function PopularCategories() {
    const categories = [
        {
            image: "https://api.builder.io/api/v1/image/assets/TEMP/f8c3efb8333bf04bfb52f1a34dd6871cc2fca030?width=476",
            title: "Burgers & Fast food",
            count: "21 Restaurants"
        },
        {
            image: "https://api.builder.io/api/v1/image/assets/TEMP/eabf1b24c50c8dbb52bba7092747ccebd35afdbc?width=476",
            title: "Salads",
            count: "32 Restaurants"
        },
        {
            image: "https://api.builder.io/api/v1/image/assets/TEMP/43e0c02310a57e06af3c012e488e3bdf253d7f49?width=476",
            title: "Pasta & Casuals",
            count: "4 Restaurants"
        },
        {
            image: "https://api.builder.io/api/v1/image/assets/TEMP/8d49ff435a9a3e4cfac440d3609e7643c13f6deb?width=476",
            title: "Pizza",
            count: "32 Restaurants"
        },
        {
            image: "https://api.builder.io/api/v1/image/assets/TEMP/b3e8f445f2b3cb09b2a192118bb38a0c3edc08a1?width=476",
            title: "Breakfast",
            count: "4 Restaurants"
        },
        {
            image: "https://api.builder.io/api/v1/image/assets/TEMP/c180d0269192d23c97a04963d78a33e3f24de9cb?width=476",
            title: "Soups",
            count: "32 Restaurants"
        }
    ];

    return (
        <section className="w-full max-w-7xl mx-auto px-6 my-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
                FoodFast Popular Categories
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categories.map((category, index) => (
                    <div 
                        key={index}
                        className="bg-neutral-100 rounded-xl border border-black/10 overflow-hidden hover:shadow-lg transition cursor-pointer group"
                    >
                        <div className="relative h-48 overflow-hidden">
                            <img 
                                src={category.image} 
                                alt={category.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                            />
                        </div>
                        <div className="p-4">
                            <h3 className="text-[#FC8A06] text-lg font-bold mb-1">
                                {category.title}
                            </h3>
                            <p className="text-[#366055] text-sm">
                                {category.count}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default function NearbyRestaurants() {
    const restaurants = [
        {
            image: "https://api.builder.io/api/v1/image/assets/TEMP/74bc30f073608985a75282e391fa71fa0632b74a?width=476",
            name: "McDonald's London"
        },
        {
            image: "https://api.builder.io/api/v1/image/assets/TEMP/2c6abd496ed1aaf3d3a5d50641504bd08c7267e8?width=476",
            name: "Papa Johns"
        },
        {
            image: "https://api.builder.io/api/v1/image/assets/TEMP/10c184839f607d9bcfadeeec99186afd373ac726?width=476",
            name: "KFC West London"
        },
        {
            image: "https://api.builder.io/api/v1/image/assets/TEMP/97e33e77de602323414921ad13c780bc5dd264a4?width=476",
            name: "Texas Chicken"
        },
        {
            image: "https://api.builder.io/api/v1/image/assets/TEMP/6ecdd4fee68dd0afc09ee17e93e3ec1d2ac0e2ad?width=476",
            name: "Burger King"
        },
        {
            image: "https://api.builder.io/api/v1/image/assets/TEMP/32d344eecd2c5adfb2987658e1a6649065145c35?width=476",
            name: "Shaurma 1"
        }
    ];

    return (
        <section className="w-full max-w-7xl mx-auto px-6 my-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
                Nearby Restaurant
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {restaurants.map((restaurant, index) => (
                    <div 
                        key={index}
                        className="bg-[#366055] rounded-xl overflow-hidden hover:shadow-xl transition cursor-pointer group"
                    >
                        <div className="relative h-48 overflow-hidden">
                            <img 
                                src={restaurant.image} 
                                alt={restaurant.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                            />
                        </div>
                        <div className="p-4 text-center">
                            <h3 className="text-white text-lg font-bold">
                                {restaurant.name}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

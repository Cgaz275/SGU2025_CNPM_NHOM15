export default function ExclusiveDeals() {
    const deals = [
        {
            image: "https://api.builder.io/api/v1/image/assets/TEMP/d8cbf9ed31645861e03826f9edf8efc43f5a1f25?width=992",
            restaurant: "Chef Burgers London",
            discount: "-40%"
        },
        {
            image: "https://api.builder.io/api/v1/image/assets/TEMP/094f0f599a6c03803ab36b806f3ed1c8a944bf91?width=992",
            restaurant: "Grand Ai Cafe London",
            discount: "-20%"
        },
        {
            image: "https://api.builder.io/api/v1/image/assets/TEMP/d8cbf9ed31645861e03826f9edf8efc43f5a1f25?width=992",
            restaurant: "Butterbrot Caf'e London",
            discount: "-17%"
        }
    ];

    const categories = ['Vegan', 'Sushi', 'Pizza & Fast food', 'others'];

    return (
        <section className="w-full max-w-7xl mx-auto px-6 my-16">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl md:text-3xl font-bold">
                    Up to -40% FoodFast exclusive deals
                </h2>
                <div className="flex items-center gap-4 md:gap-8 flex-wrap">
                    {categories.map((category, index) => (
                        <button 
                            key={index}
                            className={`text-sm md:text-base ${
                                category === 'Pizza & Fast food' 
                                    ? 'font-semibold text-[#366055] border border-[#366055] rounded-full px-6 py-3' 
                                    : 'text-black'
                            } hover:text-[#366055] transition`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map((deal, index) => (
                    <div 
                        key={index} 
                        className="relative rounded-xl overflow-hidden group cursor-pointer"
                    >
                        {/* Image */}
                        <div className="relative h-80">
                            <img 
                                src={deal.image} 
                                alt={deal.restaurant}
                                className="w-full h-full object-cover"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[rgba(3,8,31,0.19)] to-[rgba(3,8,31,0.89)]"></div>
                        </div>

                        {/* Discount Badge */}
                        <div className="absolute top-0 right-0 bg-[#FC8A06] rounded-bl-xl px-6 py-5">
                            <span className="text-white text-lg font-bold">{deal.discount}</span>
                        </div>

                        {/* Restaurant Info */}
                        <div className="absolute bottom-0 left-0 p-8">
                            <p className="text-[#366055] text-lg font-medium mb-2">Restaurant</p>
                            <h3 className="text-white text-2xl font-bold">{deal.restaurant}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

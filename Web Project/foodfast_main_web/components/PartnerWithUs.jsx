import Link from 'next/link';

export default function PartnerWithUs() {
    return (
        <section className="w-full max-w-7xl mx-auto px-6 my-16">
            <div className="relative rounded-xl overflow-hidden h-[400px] md:h-[500px]">
                {/* Background Image */}
                <img 
                    src="https://api.builder.io/api/v1/image/assets/TEMP/c26dcfbff992a33195a91f270cef856295e22317?width=3056" 
                    alt="Partner with us" 
                    className="w-full h-full object-cover"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[rgba(3,8,31,0.19)] to-[rgba(3,8,31,0.89)]"></div>

                {/* Top Badge */}
                <div className="absolute top-0 left-0 md:left-12 bg-white rounded-b-xl px-8 md:px-12 py-4 md:py-5">
                    <p className="text-[#366055] text-base md:text-lg font-bold text-center">
                        Become our partner to earn more with lower fees
                    </p>
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                    <div className="px-6 md:px-12 lg:px-20 max-w-3xl">
                        <p className="text-[#FC8A06] text-lg md:text-xl font-medium mb-2">
                            Signup as a business
                        </p>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8">
                            Partner with us
                        </h2>
                        <Link 
                            href="/create-store"
                            className="inline-block bg-[#366055] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-[#2d5046] transition"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

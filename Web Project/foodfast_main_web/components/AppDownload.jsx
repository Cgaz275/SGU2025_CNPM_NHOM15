export default function AppDownload() {
    return (
        <section className="w-full max-w-7xl mx-auto px-6 my-16">
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-neutral-200 to-neutral-300/90">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 md:p-12">
                    {/* Left Side - Images */}
                    <div className="relative flex justify-center lg:justify-start">
                        {/* Background Image with Opacity */}
                        <img 
                            src="https://api.builder.io/api/v1/image/assets/TEMP/dde775128d3804f21e73780f05945fddc8fb533d?width=1664" 
                            alt="Friends using mobile" 
                            className="absolute left-0 top-0 w-full h-auto opacity-20 max-w-lg"
                        />
                        {/* Main Image */}
                        <img 
                            src="https://api.builder.io/api/v1/image/assets/TEMP/cc49af893d16d00cafb09519b912b69082b3f2f0?width=1664" 
                            alt="Friends laughing using mobiles" 
                            className="relative w-full h-auto max-w-lg z-10"
                        />
                    </div>

                    {/* Right Side - Content */}
                    <div className="flex flex-col justify-center text-center lg:text-left">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#366055] mb-6 tracking-tight">
                            Ordering is more
                        </h2>
                        <div className="bg-[#FC8A06] rounded-full py-6 px-8 mb-8 inline-block">
                            <h3 className="text-3xl md:text-4xl lg:text-5xl font-medium text-white tracking-tight">
                                Personalised & Instant
                            </h3>
                        </div>
                        <p className="text-xl md:text-2xl text-black mb-8 tracking-tight">
                            Download the FoodFast app for faster ordering
                        </p>
                        <div className="flex justify-center lg:justify-start">
                            <img 
                                src="https://api.builder.io/api/v1/image/assets/TEMP/19c47b79ed4c29f094efb173c47fbb2d10dcd5a4?width=824" 
                                alt="App Store Badges" 
                                className="w-full max-w-md h-auto"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

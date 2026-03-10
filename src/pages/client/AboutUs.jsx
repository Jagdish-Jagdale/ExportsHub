import React from 'react';
import { HiOutlineUserGroup, HiOutlineGlobe, HiOutlineShieldCheck, HiOutlineSparkles } from 'react-icons/hi';

const AboutUs = () => {
    const stats = [
        { label: 'Orders Delivered', value: '10,000+' },
        { label: 'Global Clients', value: '500+' },
        { label: 'Quality Reviews', value: '4.9/5' },
        { label: 'Years of Trust', value: '15+' },
    ];

    const values = [
        {
            icon: <HiOutlineShieldCheck className="w-8 h-8 text-emerald-600" />,
            title: 'Uncompromised Quality',
            description: 'We adhere to strict international standards, ensuring every product meets the highest quality benchmarks before it reaches you.'
        },
        {
            icon: <HiOutlineGlobe className="w-8 h-8 text-emerald-600" />,
            title: 'Global Reach',
            description: 'With a robust logistics network, we connect premium Indian heritage products to every corner of the globe seamlessly.'
        },
        {
            icon: <HiOutlineUserGroup className="w-8 h-8 text-emerald-600" />,
            title: 'Client Centric',
            description: 'Your satisfaction is our priority. We provide personalized support and transparent processes from quotation to delivery.'
        },
        {
            icon: <HiOutlineSparkles className="w-8 h-8 text-emerald-600" />,
            title: 'Innovation',
            description: 'We continuously evolve our sourcing and shipping methods to bring you the most efficient and reliable export experience.'
        }
    ];

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <div className="relative py-12 md:py-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-50 rounded-l-[100px] -z-10 translate-x-20" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-block px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full uppercase tracking-wider mb-4">
                                Established 2009
                            </span>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                                Bringing Premium Exports <br />
                                <span className="text-emerald-600">to Your Doorstep</span>
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                ExportsHub is a leading global export house dedicated to sourcing and delivering
                                the finest quality products from India’s rich heritage. We bridge the gap between
                                local artisans and global markets with transparency, efficiency, and trust.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                {stats.map((stat, idx) => (
                                    <div key={idx}>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                        <p className="text-sm text-gray-500">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl skew-y-1">
                                <img
                                    src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800"
                                    alt="Export Warehouse"
                                    className="w-full h-[500px] object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            </div>
                            {/* Accent graphics */}
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-600 rounded-3xl -z-10 animate-pulse" />
                            <div className="absolute top-1/2 -right-4 w-12 h-12 bg-amber-400 rounded-full -z-10" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Our Values */}
            <div className="py-16 md:py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Principles that Drive Us</h2>
                        <p className="text-gray-600">At ExportsHub, we don't just export products; we package reliability and deliver confidence.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((v, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group">
                                <div className="mb-6 transform transition-transform group-hover:scale-110">
                                    {v.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{v.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{v.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mission Section */}
            <div className="py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-emerald-900 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden text-white">
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
                            <p className="text-emerald-100 text-lg leading-relaxed mb-8">
                                To empower global businesses with seamless access to high-quality Indian
                                commodities and artisanal products, fostering sustainable growth and
                                lasting international partnerships built on the bedrock of integrity.
                            </p>
                            <button className="px-8 py-3 bg-white text-emerald-900 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg shadow-emerald-950/20">
                                Contact Our Team
                            </button>
                        </div>
                        {/* Abstract Background */}
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-800 rounded-full opacity-50 blur-3xl" />
                        <div className="absolute top-0 right-0 p-20 hidden lg:block">
                            <HiOutlineGlobe className="w-64 h-64 text-emerald-800/30" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;

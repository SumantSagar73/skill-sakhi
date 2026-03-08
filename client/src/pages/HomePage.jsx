import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineAcademicCap,
    HiOutlineUserGroup,
    HiOutlineTrophy,
    HiOutlineBanknotes,
    HiOutlineCake,
    HiOutlineCommandLine,
    HiOutlinePaintBrush,
    HiOutlineBriefcase,
    HiOutlineBeaker,
    HiOutlineLanguage,
    HiOutlineRocketLaunch,
    HiOutlineChatBubbleLeftRight
} from 'react-icons/hi2';

const HomePage = () => {
    const { user } = useAuth();

    const categories = [
        { icon: HiOutlineCake, name: 'Cooking', color: 'bg-orange-100 text-orange-600' },
        { icon: HiOutlineCommandLine, name: 'Technology', color: 'bg-blue-100 text-blue-600' },
        { icon: HiOutlinePaintBrush, name: 'Art & Design', color: 'bg-pink-100 text-pink-600' },
        { icon: HiOutlineBriefcase, name: 'Business', color: 'bg-indigo-100 text-indigo-600' },
        { icon: HiOutlineBeaker, name: 'Science', color: 'bg-emerald-100 text-emerald-600' },
        { icon: HiOutlineLanguage, name: 'Language', color: 'bg-amber-100 text-amber-600' },
        { icon: HiOutlineRocketLaunch, name: 'Marketing', color: 'bg-purple-100 text-purple-600' },
        { icon: HiOutlineChatBubbleLeftRight, name: 'Soft Skills', color: 'bg-cyan-100 text-cyan-600' },
    ];

    const features = [
        {
            icon: HiOutlineAcademicCap,
            title: 'Learn from Experts',
            desc: 'Connect with skilled women instructors across various professional domains.'
        },
        {
            icon: HiOutlineUserGroup,
            title: 'Join Communities',
            desc: 'Be part of supportive groups with women who share your career and life interests.'
        },
        {
            icon: HiOutlineTrophy,
            title: 'Earn Certificates',
            desc: 'Complete certified courses and get recognized globally for your achievements.'
        },
        {
            icon: HiOutlineBanknotes,
            title: 'Teach & Earn',
            desc: 'Share your unique skills and build a sustainable, independent income stream.'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white py-24 px-4 md:px-8 border-b border-slate-100">
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
                    <div className="flex-1 text-center md:text-left">
                        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-rose-600 uppercase bg-rose-50 rounded-lg border border-rose-100">
                            🌸 Empowering Women Everywhere
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8">
                            Teach What You Know. <br />
                            <span className="text-indigo-600">Learn What You Love.</span>
                        </h1>
                        <p className="text-lg text-slate-600 mb-10 max-w-xl leading-relaxed mx-auto md:mx-0 font-medium">
                            Skill Sakhi is a premium ecosystem where women share professional expertise, host impactful workshops, and lead global communities.
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <Link to="/courses" className="btn btn-primary px-8 py-4 text-base rounded-2xl">
                                Explore All Courses
                            </Link>
                            {!user && (
                                <Link to="/register" className="btn btn-outline px-8 py-4 text-base rounded-2xl">
                                    Join the Community
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center text-9xl bg-slate-50 border border-slate-100 rounded-[3rem] transition-all duration-500 shadow-sm hover:shadow-md">
                            <HiOutlineAcademicCap className="text-indigo-500" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 text-center md:text-left">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Explore Categories</h2>
                        <p className="text-slate-500 font-medium">Pick a domain and start your learning journey today.</p>
                    </div>
                    <Link to="/courses" className="text-indigo-600 font-bold hover:underline">View All →</Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {categories.map((cat) => (
                        <Link
                            key={cat.name}
                            to={`/courses?category=${cat.name}`}
                            className="group flex flex-col items-center gap-4 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all duration-300"
                        >
                            <div className={`p-4 rounded-xl ${cat.color} group-hover:scale-105 transition-transform`}>
                                <cat.icon className="w-8 h-8" />
                            </div>
                            <span className="font-bold text-slate-700">{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Why Skill Sakhi Section */}
            <section className="bg-slate-900 py-24 px-4 md:px-8 overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]"></div>
                </div>
                <div className="max-w-7xl mx-auto relative z-10 text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-white mb-4">Why Skill Sakhi?</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto font-medium">We provide the tools and network for women to achieve their highest professional potential.</p>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    {features.map((feature, i) => (
                        <div key={i} className="p-8 bg-slate-800/50 border border-slate-700 rounded-3xl hover:bg-slate-800 transition-colors">
                            <feature.icon className="w-10 h-10 text-indigo-400 mb-6" />
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed font-medium">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            {!user && (
                <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
                    <div className="rounded-[3rem] bg-indigo-600 p-12 md:p-20 text-center relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to Start Your Journey?</h2>
                            <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto font-medium">Join thousands of women who are learning, teaching, and leading the future on Skill Sakhi.</p>
                            <Link to="/register" className="inline-block bg-white text-indigo-700 font-extrabold px-10 py-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                Get Started for Free
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default HomePage;

import { Link } from 'react-router-dom';
import { HiOutlineHeart } from 'react-icons/hi2';

const Footer = () => (
    <footer className="bg-slate-900 text-slate-300 py-16 px-4 md:px-8 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
            <div className="col-span-1 md:col-span-1 flex flex-col items-center md:items-start">
                <Link to="/" className="flex items-center mb-4">
                    <img src="/logo.png" alt="Skill Sakhi" className="h-12 w-auto" />
                </Link>
                <p className="text-sm leading-relaxed max-w-xs">
                    Sophisticated learning and inclusive community for modern women to lead, learn, and grow together.
                </p>
            </div>

            <div>
                <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Quick Links</h4>
                <ul className="space-y-4 text-sm">
                    <li><Link to="/courses" className="hover:text-indigo-400 transition-colors tracking-wide">Explore Courses</Link></li>
                    <li><Link to="/community" className="hover:text-indigo-400 transition-colors tracking-wide">Community Hall</Link></li>
                    <li><Link to="/instructors" className="hover:text-indigo-400 transition-colors tracking-wide">Our Instructors</Link></li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Platform</h4>
                <ul className="space-y-4 text-sm">
                    <li><Link to="/login" className="hover:text-indigo-400 transition-colors tracking-wide">Login</Link></li>
                    <li><Link to="/register" className="hover:text-indigo-400 transition-colors tracking-wide">Register</Link></li>
                    <li><Link to="/dashboard" className="hover:text-indigo-400 transition-colors tracking-wide">Dashboard</Link></li>
                </ul>
            </div>

            <div className="flex flex-col items-center md:items-start">
                <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Our Vision</h4>
                <p className="text-sm italic text-slate-400 mb-4 px-4 md:px-0">
                    "Empowering women isn't just a goal; it's our mission to build a future where every woman has the skills to lead."
                </p>
                <div className="flex items-center gap-2 text-rose-500">
                    <HiOutlineHeart className="w-5 h-5 fill-current" />
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto border-top border-slate-800 pt-8 mt-16 text-center text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Skill Sakhi. Crafted with precision for the global woman.</p>
        </div>
    </footer>
);

export default Footer;

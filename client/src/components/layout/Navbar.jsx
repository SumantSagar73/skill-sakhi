import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineUser,
    HiOutlineArrowLeftOnRectangle,
    HiOutlineArrowRightOnRectangle,
    HiOutlineAcademicCap,
    HiOutlineBookOpen,
    HiOutlineSquares2X2,
    HiOutlinePencilSquare,
    HiOutlineBars3,
    HiOutlineXMark,
    HiOutlineUserGroup,
} from 'react-icons/hi2';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    const navLinkClass = (path) =>
        `flex items-center gap-1.5 text-sm font-bold transition-colors px-1 pb-0.5 border-b-2 ${isActive(path)
            ? 'text-indigo-600 border-indigo-600'
            : 'text-slate-600 border-transparent hover:text-indigo-600'
        }`;

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 md:px-8 py-0">
            <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
                {/* Logo */}
                <Link to="/" className="flex items-center shrink-0" onClick={() => setMobileOpen(false)}>
                    <img src="/logo.png" alt="Skill Sakhi" className="h-9 w-auto" />
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-7">
                    <Link to="/courses" className={navLinkClass('/courses')}>
                        <HiOutlineAcademicCap className="w-4 h-4" /> All Courses
                    </Link>
                    {user && (
                        <>
                            <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                                <HiOutlineSquares2X2 className="w-4 h-4" /> Dashboard
                            </Link>
                            <Link to="/dashboard?tab=courses" className={`flex items-center gap-1.5 text-sm font-bold transition-colors px-1 pb-0.5 border-b-2 ${location.search === '?tab=courses' ? 'text-indigo-600 border-indigo-600' : 'text-slate-600 border-transparent hover:text-indigo-600'}`}>
                                <HiOutlineBookOpen className="w-4 h-4" /> My Courses
                            </Link>
                            <Link to="/community" className={navLinkClass('/community')}>
                                <HiOutlineUserGroup className="w-4 h-4" /> Community
                            </Link>
                            {user.role === 'instructor' && (
                                <Link to="/dashboard?tab=create" className={`flex items-center gap-1.5 text-sm font-bold transition-colors px-3 py-1.5 rounded-xl border ${location.search === '?tab=create' ? 'bg-indigo-600 text-white border-indigo-600' : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}>
                                    <HiOutlinePencilSquare className="w-4 h-4" /> Create Course
                                </Link>
                            )}
                        </>
                    )}
                </div>

                {/* Right: Auth */}
                <div className="flex items-center gap-2">
                    {user ? (
                        <>
                            {/* User pill */}
                            <Link to="/dashboard" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-sm font-bold text-slate-700">
                                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                {user.name?.split(' ')[0]}
                            </Link>
                            <button
                                className="hidden md:flex p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                                onClick={handleLogout}
                                title="Logout"
                            >
                                <HiOutlineArrowLeftOnRectangle className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 px-3 py-2 transition-colors flex items-center gap-1.5">
                                <HiOutlineArrowRightOnRectangle className="w-4 h-4" /> Login
                            </Link>
                            <Link to="/register" className="btn btn-primary text-sm px-5 py-2 rounded-xl font-bold">
                                Join Free
                            </Link>
                        </div>
                    )}

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2.5 rounded-xl border border-slate-200 text-slate-500"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <HiOutlineXMark className="w-5 h-5" /> : <HiOutlineBars3 className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white py-4 px-2 space-y-1">
                    <MobileLink to="/courses" onClick={() => setMobileOpen(false)} icon={<HiOutlineAcademicCap className="w-5 h-5" />}>All Courses</MobileLink>
                    {user ? (
                        <>
                            <MobileLink to="/dashboard" onClick={() => setMobileOpen(false)} icon={<HiOutlineSquares2X2 className="w-5 h-5" />}>Dashboard</MobileLink>
                            <MobileLink to="/dashboard?tab=courses" onClick={() => setMobileOpen(false)} icon={<HiOutlineBookOpen className="w-5 h-5" />}>My Courses</MobileLink>
                            <MobileLink to="/community" onClick={() => setMobileOpen(false)} icon={<HiOutlineUserGroup className="w-5 h-5" />}>Community</MobileLink>
                            {user.role === 'instructor' && (
                                <MobileLink to="/dashboard?tab=create" onClick={() => setMobileOpen(false)} icon={<HiOutlinePencilSquare className="w-5 h-5" />}>Create Course</MobileLink>
                            )}
                            <div className="pt-2 mt-2 border-t border-slate-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 font-bold text-sm hover:bg-rose-50 transition-colors"
                                >
                                    <HiOutlineArrowLeftOnRectangle className="w-5 h-5" /> Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="pt-2 mt-2 border-t border-slate-100 flex flex-col gap-2">
                            <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-50">
                                <HiOutlineArrowRightOnRectangle className="w-5 h-5" /> Login
                            </Link>
                            <Link to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary text-sm py-3 rounded-xl font-bold w-full justify-center">
                                Join Free
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

const MobileLink = ({ to, icon, children, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-bold text-sm hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
    >
        <span className="text-indigo-500">{icon}</span>
        {children}
    </Link>
);

export default Navbar;

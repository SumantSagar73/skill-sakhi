import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineUser,
    HiOutlineArrowLeftOnRectangle,
    HiOutlineArrowRightOnRectangle,
    HiOutlineAcademicCap,
    HiOutlineUserGroup,
    HiOutlineQueueList
} from 'react-icons/hi2';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="sticky top-0 z-50 glass px-4 md:px-8 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center">
                    <img src="/logo.png" alt="Skill Sakhi" className="h-10 w-auto" />
                </Link>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                    <Link to="/courses" className="hover:text-violet-700 flex items-center gap-1.5 transition-colors">
                        <HiOutlineAcademicCap className="w-4 h-4" /> Courses
                    </Link>
                    <Link to="/instructors" className="hover:text-violet-700 flex items-center gap-1.5 transition-colors">
                        <HiOutlineUserGroup className="w-4 h-4" /> Instructors
                    </Link>
                    <Link to="/community" className="hover:text-violet-700 flex items-center gap-1.5 transition-colors">
                        <HiOutlineQueueList className="w-4 h-4" /> Community
                    </Link>
                </div>

                {/* Auth */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <Link
                                to="/dashboard"
                                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-all text-sm font-semibold"
                            >
                                <HiOutlineUser className="w-4 h-4" />
                                {user.name?.split(' ')[0]}
                            </Link>
                            <button
                                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition-all"
                                onClick={handleLogout}
                                title="Logout"
                            >
                                <HiOutlineArrowLeftOnRectangle className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-violet-700 px-3 py-2 transition-colors flex items-center gap-1.5">
                                <HiOutlineArrowRightOnRectangle className="w-4 h-4" /> Login
                            </Link>
                            <Link to="/register" className="btn btn-primary text-sm px-5 py-2.5 rounded-xl">
                                Join Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

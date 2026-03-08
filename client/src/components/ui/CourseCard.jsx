import { Link } from 'react-router-dom';
import { HiOutlineClock, HiOutlineChartBar, HiOutlineStar, HiOutlineBookOpen } from 'react-icons/hi2';

const CourseCard = ({ course }) => (
    <div className="card-premium h-full flex flex-col overflow-hidden">
        <div className="relative aspect-video">
            {course.thumbnail ? (
                <img
                    src={`http://localhost:5000${course.thumbnail}`}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            ) : (
                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-4xl border-b border-slate-100">
                    <HiOutlineBookOpen className="text-slate-400" />
                </div>
            )}
            <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white text-indigo-600 border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {course.category}
                </span>
            </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-2 leading-tight">
                {course.title}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
                by <span className="font-semibold text-slate-700">{course.instructor?.name || 'Expert Sakhi'}</span>
            </p>

            <div className="grid grid-cols-3 gap-2 mb-6 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg">
                    <HiOutlineClock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg">
                    <HiOutlineChartBar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.level}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 text-rose-600 rounded-lg">
                    <HiOutlineStar className="w-3.5 h-3.5 fill-current" />
                    <span>{course.rating || 'New'}</span>
                </div>
            </div>

            <div className="mt-auto flex items-center justify-between gap-4">
                <span className="text-xl font-extrabold text-slate-900">
                    {course.price === 0 ? 'Free' : `₹${course.price}`}
                </span>
                <Link to={`/courses/${course._id}`} className="btn btn-primary text-xs px-4 py-2 rounded-lg">
                    Enroll Now
                </Link>
            </div>
        </div>
    </div>
);

export default CourseCard;

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCourseById, checkEnrollment } from '../services/skillSakhiAPI';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';
import { toast } from 'react-toastify';
import { getYouTubeEmbed, extractYouTubeId } from '../utils/youtube';
import { HiOutlineVideoCamera, HiOutlinePlayCircle, HiOutlineLockClosed, HiOutlineChevronDown, HiOutlineArrowLeft } from 'react-icons/hi2';

const CoursePlayerPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    // Curriculum player state
    const [activeTopic, setActiveTopic] = useState(null);  // { moduleIdx, topicIdx }
    const [openModules, setOpenModules] = useState({});    // { [moduleIdx]: true/false }

    useEffect(() => {
        const fetchCourseAndAccess = async () => {
            if (!user) {
                toast.error('Please log in to access the course player.');
                navigate('/login');
                return;
            }

            try {
                // Check enrollment first
                const enrollmentRes = await checkEnrollment(id);
                if (!enrollmentRes.data.isEnrolled) {
                    toast.error('You must be enrolled to view the course player.');
                    navigate(`/courses/${id}`);
                    return;
                }

                // Fetch course data
                const courseRes = await getCourseById(id);
                setCourse(courseRes.data);

                // Auto-open first module and select first topic
                if (courseRes.data.modules?.length) {
                    setOpenModules({ 0: true });
                    const firstVideoTopic = courseRes.data.modules[0]?.topics?.findIndex(t => t.videoUrl);
                    if (firstVideoTopic >= 0) {
                        setActiveTopic({ moduleIdx: 0, topicIdx: firstVideoTopic });
                    } else if (courseRes.data.modules[0].topics.length > 0) {
                        setActiveTopic({ moduleIdx: 0, topicIdx: 0 })
                    }
                }
            } catch (error) {
                toast.error('Error loading course player');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseAndAccess();
    }, [id, user, navigate]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Spinner /></div>;
    if (!course) return null;

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
            {/* Player Header */}
            <header className="bg-slate-900 border-b border-white/10 px-6 py-4 flex items-center justify-between z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/courses/${id}`)}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                        title="Back to Course Details"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-white font-bold text-lg leading-tight line-clamp-1">{course.title}</h1>
                        <p className="text-white/50 text-xs font-medium">Instructor: {course.instructor?.name}</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <span className="px-3 py-1 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                        Enrolled
                    </span>
                </div>
            </header>

            {/* Split Layout */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                {/* Left: Video Player Area */}
                <div className="flex-1 bg-black flex flex-col relative overflow-y-auto">
                    {course.modules?.length > 0 ? (
                        <>
                            {activeTopic !== null ? (() => {
                                const topic = course.modules[activeTopic.moduleIdx]?.topics[activeTopic.topicIdx];
                                const embedUrl = topic ? getYouTubeEmbed(topic.videoUrl) : null;
                                return (
                                    <>
                                        {embedUrl ? (
                                            <div className="w-full aspect-video lg:h-auto lg:flex-1 bg-black max-h-[80vh] lg:max-h-none flex items-center justify-center">
                                                <iframe
                                                    className="w-full h-full max-w-6xl mx-auto shadow-2xl"
                                                    src={embedUrl}
                                                    title={topic.title}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 text-white/40 bg-slate-900 p-12">
                                                <HiOutlineVideoCamera className="w-20 h-20 opacity-20" />
                                                <p className="text-lg font-bold text-white/60 text-center">{topic?.title}</p>
                                                <p className="text-sm">No video attached to this lesson. Please read the supplementary materials.</p>
                                            </div>
                                        )}
                                        {/* Description area beneath video (if needed, otherwise just black spacing) */}
                                        <div className="p-8 lg:p-12 max-w-5xl mx-auto w-full">
                                            <h2 className="text-2xl font-extrabold text-white mb-4">
                                                {topic?.title}
                                            </h2>
                                            {topic?.description && (
                                                <p className="text-white/70 leading-relaxed text-lg">
                                                    {topic.description}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                );
                            })() : (
                                <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 text-white/40">
                                    <HiOutlinePlayCircle className="w-20 h-20 opacity-20" />
                                    <p className="text-lg">Select a lesson from the curriculum to begin playing.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 text-white/40">
                            <p className="text-lg">This course has no curriculum yet.</p>
                        </div>
                    )}
                </div>

                {/* Right: Curriculum Sidebar */}
                <div className="w-full lg:w-[400px] xl:w-[450px] bg-slate-800 border-l border-white/5 flex flex-col shrink-0 lg:h-[calc(100vh-73px)] overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-slate-800/50">
                        <h2 className="text-lg font-bold text-white mb-1">Course Content</h2>
                        <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden mt-4">
                            {/* Optional: Add progress bar here later */}
                            <div className="bg-violet-500 w-0 h-full rounded-full transition-all"></div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {course.modules?.map((mod, mi) => (
                            <div key={mi} className="border-b border-white/5 last:border-0">
                                {/* Module header */}
                                <button
                                    className="w-full flex items-center justify-between px-6 py-5 bg-slate-800/40 hover:bg-slate-800/80 transition-colors text-left"
                                    onClick={() => setOpenModules(prev => ({ ...prev, [mi]: !prev[mi] }))}
                                >
                                    <div className="flex flex-col gap-1 pr-4">
                                        <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Module {mi + 1}</span>
                                        <span className="font-bold text-white leading-snug">{mod.title}</span>
                                    </div>
                                    <HiOutlineChevronDown className={`w-5 h-5 text-white/40 shrink-0 transition-transform ${openModules[mi] ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Topics list */}
                                {openModules[mi] && (
                                    <div className="bg-slate-900/40 divide-y divide-white/5">
                                        {mod.topics.map((topic, ti) => {
                                            const isActive = activeTopic?.moduleIdx === mi && activeTopic?.topicIdx === ti;
                                            return (
                                                <button
                                                    key={ti}
                                                    className={`w-full flex items-start gap-4 px-6 py-4 text-left transition-colors group
                                                        ${isActive ? 'bg-violet-500/10' : 'hover:bg-white/5'}
                                                    `}
                                                    onClick={() => {
                                                        setActiveTopic({ moduleIdx: mi, topicIdx: ti });
                                                    }}
                                                >
                                                    <div className={`mt-0.5 shrink-0 ${isActive ? 'text-violet-400' : 'text-white/30 group-hover:text-white/50'}`}>
                                                        {extractYouTubeId(topic.videoUrl) ? (
                                                            <HiOutlinePlayCircle className="w-5 h-5" />
                                                        ) : (
                                                            <HiOutlineVideoCamera className="w-5 h-5" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium leading-snug ${isActive ? 'text-violet-200' : 'text-white/80'}`}>
                                                            {ti + 1}. {topic.title}
                                                        </p>
                                                        {topic.duration && (
                                                            <p className="text-xs text-white/40 mt-1.5 flex items-center gap-1.5">
                                                                {topic.duration}
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CoursePlayerPage;

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineAcademicCap, HiOutlinePlus, HiOutlinePencilSquare,
    HiOutlineTrash, HiOutlineUserGroup, HiOutlineXMark,
    HiOutlineBookOpen, HiOutlineClock, HiOutlineCurrencyRupee,
    HiOutlineStar, HiOutlineArrowLeft, HiOutlineCheckCircle,
} from 'react-icons/hi2';
import {
    getCoursesByInstructor, createCourse, updateCourse,
    deleteCourse, getCourseEnrollments,
} from '../services/skillSakhiAPI';
import Spinner from '../components/ui/Spinner';
import { toast } from 'react-toastify';
import { getYouTubeThumbnail, extractYouTubeId } from '../utils/youtube';

const CATEGORIES = ['Cooking', 'Technology', 'Art & Design', 'Business', 'Fitness', 'Language', 'Handicrafts', 'Digital Marketing', 'Other'];
const emptyTopic = () => ({ title: '', description: '', videoUrl: '', duration: '', isFree: false });
const emptyModule = () => ({ title: '', topics: [emptyTopic()] });

const StepWizard = ({ steps, current }) => (
    <div className="flex items-center gap-3 mb-10">
        {steps.map((label, i) => (
            <div key={i} className="flex items-center gap-3 flex-1">
                <div className={`flex items-center gap-2 ${current > i + 1 ? 'text-violet-600' : current === i + 1 ? 'text-violet-600' : 'text-slate-300'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all
                        ${current > i + 1 ? 'bg-violet-600 border-violet-600 text-white'
                            : current === i + 1 ? 'border-violet-600 text-violet-600'
                                : 'border-slate-200 text-slate-300'}`}>
                        {current > i + 1 ? '✓' : i + 1}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest hidden sm:block">{label}</span>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${current > i + 1 ? 'bg-violet-600' : 'bg-slate-100'}`} />}
            </div>
        ))}
    </div>
);

const InstructorCoursesPage = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const view = searchParams.get('view') || 'list'; // list | create | edit
    const setView = (v) => setSearchParams({ view: v }, { replace: true });

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Students modal ─────────────────────────────────────────────────────
    const [studentsModal, setStudentsModal] = useState(null);
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const openStudents = async (course) => {
        setStudentsModal(course);
        setStudentsLoading(true);
        try {
            const { data } = await getCourseEnrollments(course._id);
            setStudents(data);
        } catch { toast.error('Failed to load students'); }
        finally { setStudentsLoading(false); }
    };

    // ── Delete confirmation ────────────────────────────────────────────────
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // ── Create course state ────────────────────────────────────────────────
    const [step, setStep] = useState(1);
    const [courseBasic, setCourseBasic] = useState({
        title: '', description: '', category: 'Cooking',
        price: '', duration: '', level: 'Beginner', availableSlots: 10,
    });
    const [modules, setModules] = useState([emptyModule()]);
    const [creating, setCreating] = useState(false);

    // ── Edit course state ──────────────────────────────────────────────────
    const [editingCourse, setEditingCourse] = useState(null);
    const [editStep, setEditStep] = useState(1);
    const [editBasic, setEditBasic] = useState({});
    const [editModules, setEditModules] = useState([emptyModule()]);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await getCoursesByInstructor(user._id);
                setCourses(data);
            } catch { /* silent */ }
            finally { setLoading(false); }
        };
        load();
    }, [user]);

    // ── Module helpers (create) ────────────────────────────────────────────
    const addModule = () => setModules([...modules, emptyModule()]);
    const removeModule = (mi) => setModules(modules.filter((_, i) => i !== mi));
    const updateModule = (mi, key, val) =>
        setModules(modules.map((m, i) => i === mi ? { ...m, [key]: val } : m));
    const addTopic = (mi) =>
        setModules(modules.map((m, i) => i === mi ? { ...m, topics: [...m.topics, emptyTopic()] } : m));
    const removeTopic = (mi, ti) =>
        setModules(modules.map((m, i) => i === mi ? { ...m, topics: m.topics.filter((_, j) => j !== ti) } : m));
    const updateTopic = (mi, ti, key, val) =>
        setModules(modules.map((m, i) => i === mi
            ? { ...m, topics: m.topics.map((t, j) => j === ti ? { ...t, [key]: val } : t) } : m));

    // ── Module helpers (edit) ──────────────────────────────────────────────
    const addEditModule = () => setEditModules([...editModules, emptyModule()]);
    const removeEditModule = (mi) => setEditModules(editModules.filter((_, i) => i !== mi));
    const updateEditModule = (mi, key, val) =>
        setEditModules(editModules.map((m, i) => i === mi ? { ...m, [key]: val } : m));
    const addEditTopic = (mi) =>
        setEditModules(editModules.map((m, i) => i === mi ? { ...m, topics: [...m.topics, emptyTopic()] } : m));
    const removeEditTopic = (mi, ti) =>
        setEditModules(editModules.map((m, i) => i === mi ? { ...m, topics: m.topics.filter((_, j) => j !== ti) } : m));
    const updateEditTopic = (mi, ti, key, val) =>
        setEditModules(editModules.map((m, i) => i === mi
            ? { ...m, topics: m.topics.map((t, j) => j === ti ? { ...t, [key]: val } : t) } : m));

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleCreate = async () => {
        setCreating(true);
        try {
            await createCourse({ ...courseBasic, modules, isDraft: false });
            toast.success('Course published!');
            setCourseBasic({ title: '', description: '', category: 'Cooking', price: '', duration: '', level: 'Beginner', availableSlots: 10 });
            setModules([emptyModule()]);
            setStep(1);
            const { data } = await getCoursesByInstructor(user._id);
            setCourses(data);
            setView('list');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create course');
        } finally { setCreating(false); }
    };

    const openEdit = (course) => {
        setEditBasic({
            title: course.title, description: course.description,
            category: course.category, price: course.price,
            duration: course.duration, level: course.level,
            availableSlots: course.availableSlots,
        });
        setEditModules(course.modules?.length ? course.modules : [emptyModule()]);
        setEditStep(1);
        setEditingCourse(course);
        setView('edit');
    };

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            await updateCourse(editingCourse._id, { ...editBasic, modules: editModules, isDraft: false });
            toast.success('Course updated!');
            const { data } = await getCoursesByInstructor(user._id);
            setCourses(data);
            setEditingCourse(null);
            setView('list');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update course');
        } finally { setUpdating(false); }
    };

    const handleDelete = async (courseId) => {
        try {
            await deleteCourse(courseId);
            setCourses(courses.filter(c => c._id !== courseId));
            toast.success('Course deleted');
        } catch { toast.error('Failed to delete course'); }
        finally { setDeleteConfirm(null); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Spinner /></div>;

    // ── COURSE LIST ─────────────────────────────────────────────────────────
    if (view === 'list') return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">My Courses</h1>
                        <p className="text-slate-500 mt-1">Manage your courses, content, and enrolled students.</p>
                    </div>
                    <button
                        onClick={() => { setStep(1); setView('create'); }}
                        className="flex items-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-violet-100 transition-all shrink-0"
                    >
                        <HiOutlinePlus className="w-5 h-5" /> New Course
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Total Courses', value: courses.length, color: 'text-violet-600 bg-violet-50' },
                        { label: 'Total Enrolled', value: courses.reduce((s, c) => s + (c.enrolledCount || 0), 0), color: 'text-emerald-600 bg-emerald-50' },
                        { label: 'Published', value: courses.filter(c => !c.isDraft).length, color: 'text-blue-600 bg-blue-50' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
                            <span className={`text-2xl font-black block mb-1 ${color.split(' ')[0]}`}>{value}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Course List */}
                {courses.length === 0 ? (
                    <div className="bg-white rounded-3xl p-24 text-center border-2 border-dashed border-slate-200">
                        <HiOutlineAcademicCap className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No courses yet</h3>
                        <p className="text-slate-400 mb-6">Start creating your first course to share your knowledge.</p>
                        <button
                            onClick={() => { setStep(1); setView('create'); }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-2xl font-bold text-sm"
                        >
                            <HiOutlinePlus className="w-4 h-4" /> Create First Course
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {courses.map((c) => (
                            <div key={c._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                                {/* Thumbnail */}
                                <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                                    {c.thumbnail
                                        ? <img src={c.thumbnail.startsWith('http') ? c.thumbnail : `http://localhost:5000${c.thumbnail}`} alt={c.title} className="w-full h-full object-cover" />
                                        : <HiOutlineBookOpen className="text-slate-300 w-8 h-8" />
                                    }
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full text-[10px] font-black uppercase tracking-wider">{c.category}</span>
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">{c.level}</span>
                                        {c.isDraft
                                            ? <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider">Draft</span>
                                            : <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><HiOutlineCheckCircle className="w-3 h-3" /> Published</span>
                                        }
                                    </div>
                                    <h3 className="font-extrabold text-slate-900 text-base truncate">{c.title}</h3>
                                    <div className="flex flex-wrap gap-4 mt-2 text-xs font-bold text-slate-400">
                                        <span className="flex items-center gap-1"><HiOutlineUserGroup className="w-3.5 h-3.5 text-violet-500" />{c.enrolledCount || 0} students</span>
                                        <span className="flex items-center gap-1"><HiOutlineClock className="w-3.5 h-3.5" />{c.duration}</span>
                                        <span className="flex items-center gap-1"><HiOutlineCurrencyRupee className="w-3.5 h-3.5" />{c.price === 0 ? 'Free' : `₹${c.price}`}</span>
                                        <span className="flex items-center gap-1"><HiOutlineStar className="w-3.5 h-3.5 text-amber-400" />{c.rating || '—'}</span>
                                        <span className="text-slate-300">•</span>
                                        <span>{c.modules?.length || 0} modules / {c.modules?.reduce((s, m) => s + (m.topics?.length || 0), 0)} lessons</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                    <button
                                        onClick={() => openStudents(c)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-all text-xs font-bold"
                                    >
                                        <HiOutlineUserGroup className="w-4 h-4" /> Students
                                    </button>
                                    <button
                                        onClick={() => openEdit(c)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-all text-xs font-bold"
                                    >
                                        <HiOutlinePencilSquare className="w-4 h-4" /> Edit
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(c._id)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all text-xs font-bold"
                                    >
                                        <HiOutlineTrash className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Students Modal */}
                {studentsModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
                            <div className="flex items-start justify-between p-6 border-b border-slate-100">
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900">Enrolled Students</h3>
                                    <p className="text-sm text-slate-500 truncate max-w-xs mt-0.5">{studentsModal.title}</p>
                                </div>
                                <button onClick={() => setStudentsModal(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
                                    <HiOutlineXMark className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="overflow-y-auto flex-1 p-4">
                                {studentsLoading ? (
                                    <div className="py-12 text-center text-slate-400 font-medium">Loading...</div>
                                ) : students.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <HiOutlineUserGroup className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                        <p className="text-slate-400 font-medium">No students enrolled yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {students.map((booking) => (
                                            <div key={booking._id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                                                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 font-black text-sm flex items-center justify-center shrink-0">
                                                    {booking.user?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-900 text-sm truncate">{booking.user?.name}</p>
                                                    <p className="text-xs text-slate-400 truncate">{booking.user?.email}</p>
                                                </div>
                                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider shrink-0">Enrolled</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-slate-100 text-center text-xs text-slate-400 font-bold">
                                {students.length} student{students.length !== 1 ? 's' : ''} enrolled
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
                            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                                <HiOutlineTrash className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-extrabold text-slate-900 mb-2">Delete Course?</h3>
                            <p className="text-slate-500 text-sm mb-6">This cannot be undone. All course content will be permanently removed.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition-colors">Delete</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // ── COURSE WIZARD (Create / Edit) ───────────────────────────────────────
    const isEdit = view === 'edit';
    const currentStep = isEdit ? editStep : step;
    const setCurrentStep = isEdit ? setEditStep : setStep;
    const basic = isEdit ? editBasic : courseBasic;
    const setBasic = isEdit ? setEditBasic : setCourseBasic;
    const mods = isEdit ? editModules : modules;
    const addMod = isEdit ? addEditModule : addModule;
    const removeMod = isEdit ? removeEditModule : removeModule;
    const updateMod = isEdit ? updateEditModule : updateModule;
    const addTop = isEdit ? addEditTopic : addTopic;
    const removeTop = isEdit ? removeEditTopic : removeTopic;
    const updateTop = isEdit ? updateEditTopic : updateTopic;
    const handleSubmit = isEdit ? handleUpdate : handleCreate;
    const submitting = isEdit ? updating : creating;

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">

                {/* Page Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => setView('list')}
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">{isEdit ? 'Edit Course' : 'Create New Course'}</h1>
                        {isEdit && <p className="text-slate-500 text-sm truncate max-w-sm mt-0.5">{editingCourse?.title}</p>}
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm">
                    <StepWizard steps={['Basic Info', 'Curriculum', 'Review & Publish']} current={currentStep} />

                    {/* ── Step 1: Basic Info ─────────────────────────────── */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900 mb-1">Course Details</h2>
                                <p className="text-slate-500 text-sm">Tell learners what your course is about.</p>
                            </div>
                            <div>
                                <label className="field-label">Course Title *</label>
                                <input className="field-input" placeholder="e.g. Master Traditional Indian Cooking"
                                    value={basic.title} onChange={(e) => setBasic({ ...basic, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="field-label">Description *</label>
                                <textarea className="field-input resize-none" rows="5"
                                    placeholder="What will students learn? What makes this course special?"
                                    value={basic.description} onChange={(e) => setBasic({ ...basic, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="field-label">Category *</label>
                                    <select className="field-input" value={basic.category}
                                        onChange={(e) => setBasic({ ...basic, category: e.target.value })}>
                                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="field-label">Skill Level *</label>
                                    <select className="field-input" value={basic.level}
                                        onChange={(e) => setBasic({ ...basic, level: e.target.value })}>
                                        <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="field-label">Price (₹) — 0 for free</label>
                                    <input type="number" min="0" className="field-input" placeholder="0"
                                        value={basic.price} onChange={(e) => setBasic({ ...basic, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="field-label">Total Duration *</label>
                                    <input className="field-input" placeholder="e.g. 4 hours, 6 weeks"
                                        value={basic.duration} onChange={(e) => setBasic({ ...basic, duration: e.target.value })} />
                                </div>
                                <div>
                                    <label className="field-label">Max Students</label>
                                    <input type="number" min="1" className="field-input" value={basic.availableSlots}
                                        onChange={(e) => setBasic({ ...basic, availableSlots: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button className="px-12 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold transition-all"
                                    onClick={() => {
                                        if (!basic.title || !basic.description || basic.price === '' || !basic.duration)
                                            return toast.error('Please fill all required fields');
                                        setCurrentStep(2);
                                    }}>
                                    Next: Build Curriculum →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Curriculum Builder ─────────────────────── */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900 mb-1">{isEdit ? 'Edit Curriculum' : 'Build Your Curriculum'}</h2>
                                <p className="text-slate-500 text-sm">Add modules and lessons. Paste YouTube links for video lessons.</p>
                            </div>

                            {mods.map((mod, mi) => (
                                <div key={mi} className="border-2 border-violet-50 rounded-3xl overflow-hidden">
                                    <div className="bg-violet-50 px-6 py-4 flex items-center gap-4">
                                        <span className="text-xs font-black text-violet-400 uppercase tracking-widest w-20 shrink-0">Module {mi + 1}</span>
                                        <input
                                            className="flex-1 bg-white rounded-xl px-4 py-2 text-sm font-bold text-slate-700 border-none focus:ring-4 focus:ring-violet-100 outline-none"
                                            placeholder="Module title, e.g. Introduction"
                                            value={mod.title}
                                            onChange={(e) => updateMod(mi, 'title', e.target.value)}
                                        />
                                        {mods.length > 1 && (
                                            <button onClick={() => removeMod(mi)} className="text-rose-400 hover:text-rose-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-xl hover:bg-rose-50 transition-all">✕</button>
                                        )}
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {mod.topics.map((topic, ti) => (
                                            <div key={ti} className="px-6 py-5 bg-white">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-xs font-black text-slate-300 uppercase tracking-widest mt-3 w-16 shrink-0">Lesson {ti + 1}</span>
                                                    <div className="flex-1 space-y-3">
                                                        <input
                                                            className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 border-none focus:ring-4 focus:ring-violet-100 outline-none"
                                                            placeholder="Lesson title, e.g. Knife Skills Basics"
                                                            value={topic.title}
                                                            onChange={(e) => updateTop(mi, ti, 'title', e.target.value)}
                                                        />
                                                        <div className="relative">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 text-lg">▶</span>
                                                            <input
                                                                className="w-full bg-slate-50 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-600 border-none focus:ring-4 focus:ring-red-100 outline-none"
                                                                placeholder="Paste YouTube URL e.g. https://www.youtube.com/watch?v=..."
                                                                value={topic.videoUrl}
                                                                onChange={(e) => updateTop(mi, ti, 'videoUrl', e.target.value)}
                                                            />
                                                        </div>
                                                        {extractYouTubeId(topic.videoUrl) && (
                                                            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                                                                <img src={getYouTubeThumbnail(topic.videoUrl)} alt="preview" className="w-20 h-12 object-cover rounded-lg" />
                                                                <div>
                                                                    <p className="text-xs font-black text-red-600 uppercase tracking-wider">YouTube Video Detected ✓</p>
                                                                    <p className="text-xs text-slate-500 font-mono truncate max-w-xs">{extractYouTubeId(topic.videoUrl)}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="flex flex-wrap gap-3">
                                                            <input
                                                                className="bg-slate-50 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 border-none focus:ring-2 focus:ring-violet-100 outline-none w-36"
                                                                placeholder="Duration e.g. 10 min"
                                                                value={topic.duration}
                                                                onChange={(e) => updateTop(mi, ti, 'duration', e.target.value)}
                                                            />
                                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                                <input type="checkbox" checked={topic.isFree}
                                                                    onChange={(e) => updateTop(mi, ti, 'isFree', e.target.checked)}
                                                                    className="w-4 h-4 rounded accent-violet-600" />
                                                                <span className="text-xs font-bold text-slate-500">Free Preview</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    {mod.topics.length > 1 && (
                                                        <button onClick={() => removeTop(mi, ti)} className="text-slate-300 hover:text-rose-400 mt-2 text-lg font-bold transition-colors">✕</button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-6 py-4 bg-slate-50">
                                        <button onClick={() => addTop(mi)} className="text-xs font-black text-violet-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                                            + Add Lesson
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button onClick={addMod} className="w-full py-4 border-2 border-dashed border-violet-200 rounded-3xl text-violet-500 font-black text-sm hover:border-violet-400 hover:bg-violet-50 transition-all">
                                + Add Module
                            </button>

                            <div className="flex justify-between pt-4">
                                <button className="px-8 py-3 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                    onClick={() => setCurrentStep(1)}>← Back</button>
                                <button className="px-12 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold transition-all"
                                    onClick={() => {
                                        if (mods.some(m => !m.title.trim())) return toast.error('All module titles are required');
                                        if (mods.some(m => m.topics.some(t => !t.title.trim()))) return toast.error('All lesson titles are required');
                                        setCurrentStep(3);
                                    }}>
                                    Next: Review →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Review & Publish ───────────────────────── */}
                    {currentStep === 3 && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900 mb-1">Review & {isEdit ? 'Update' : 'Publish'}</h2>
                                <p className="text-slate-500 text-sm">Everything look good? {isEdit ? 'Save your changes.' : 'Hit publish to make it live.'}</p>
                            </div>

                            <div className="bg-slate-50 rounded-3xl p-8 space-y-4">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-black">{basic.category}</span>
                                    <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-black">{basic.level}</span>
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black">{basic.price === 0 || basic.price === '0' ? 'Free' : `₹${basic.price}`}</span>
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-900">{basic.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">{basic.description}</p>
                                <div className="flex gap-6 text-xs font-bold text-slate-500">
                                    <span>⏱ {basic.duration}</span>
                                    <span>👥 Up to {basic.availableSlots} students</span>
                                    <span>📚 {mods.length} modules / {mods.reduce((s, m) => s + m.topics.length, 0)} lessons</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 mb-4">Curriculum Overview</h3>
                                <div className="space-y-3">
                                    {mods.map((mod, mi) => (
                                        <div key={mi} className="border border-slate-100 rounded-2xl overflow-hidden">
                                            <div className="bg-slate-50 px-5 py-3 font-bold text-slate-700 text-sm flex items-center justify-between">
                                                <span>{mod.title}</span>
                                                <span className="text-xs text-slate-400 font-medium">{mod.topics.length} lessons</span>
                                            </div>
                                            <div className="px-5 py-3 space-y-2">
                                                {mod.topics.map((t, ti) => (
                                                    <div key={ti} className="flex items-center gap-3 text-sm text-slate-600">
                                                        <span className="text-red-500">▶</span>
                                                        <span className="font-medium flex-1">{t.title}</span>
                                                        {t.duration && <span className="text-xs text-slate-400">{t.duration}</span>}
                                                        {t.isFree && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">FREE</span>}
                                                        {extractYouTubeId(t.videoUrl) && <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full">YT ✓</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button className="px-8 py-3 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                    onClick={() => setCurrentStep(2)}>← Edit Curriculum</button>
                                <button
                                    className="px-12 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-violet-100 transition-all disabled:opacity-60"
                                    disabled={submitting}
                                    onClick={handleSubmit}
                                >
                                    {submitting ? (isEdit ? 'Saving...' : 'Publishing...') : (isEdit ? '✓ Save Changes' : '🚀 Publish Course')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorCoursesPage;

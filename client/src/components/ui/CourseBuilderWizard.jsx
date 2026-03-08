import { useState } from 'react';
import { createCourse, updateCourse } from '../../services/skillSakhiAPI';
import { toast } from 'react-toastify';
import {
    HiOutlineClipboardDocumentList,
    HiOutlineFilm,
    HiOutlineRocketLaunch,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlinePlay,
    HiOutlineCheckCircle
} from 'react-icons/hi2';

const CATEGORIES = ['Cooking', 'Technology', 'Art & Design', 'Business', 'Fitness', 'Language', 'Handicrafts', 'Digital Marketing', 'Other'];

export default function CourseBuilderWizard({ onSuccess, onCancel, initialData }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1: Basics
    const [basics, setBasics] = useState(initialData ? {
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'Cooking',
        level: initialData.level || 'Beginner',
        price: initialData.price || '',
        duration: initialData.duration || '',
        availableSlots: initialData.availableSlots || 10,
    } : {
        title: '',
        description: '',
        category: 'Cooking',
        level: 'Beginner',
        price: '',
        duration: '',
        availableSlots: 10,
    });

    // Step 2: Curriculum
    const [modules, setModules] = useState(initialData?.modules?.length ? initialData.modules : [
        { title: 'Introduction', topics: [{ title: '', videoUrl: '', duration: '', isFree: false }] }
    ]);

    // Step 3: Publish
    const [isDraft, setIsDraft] = useState(initialData ? initialData.isDraft : true);

    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleModuleChange = (index, field, value) => {
        const newModules = [...modules];
        newModules[index][field] = value;
        setModules(newModules);
    };

    const addModule = () => {
        setModules([...modules, { title: '', topics: [{ title: '', videoUrl: '', duration: '', isFree: false }] }]);
    };

    const removeModule = (index) => {
        setModules(modules.filter((_, i) => i !== index));
    };

    const handleTopicChange = (modIndex, topIndex, field, value) => {
        const newModules = [...modules];
        newModules[modIndex].topics[topIndex][field] = value;
        setModules(newModules);
    };

    const addTopic = (modIndex) => {
        const newModules = [...modules];
        newModules[modIndex].topics.push({ title: '', videoUrl: '', duration: '', isFree: false });
        setModules(newModules);
    };

    const removeTopic = (modIndex, topIndex) => {
        const newModules = [...modules];
        newModules[modIndex].topics = newModules[modIndex].topics.filter((_, i) => i !== topIndex);
        setModules(newModules);
    };

    const validateStep1 = () => {
        if (!basics.title || !basics.description || !basics.price || !basics.duration || !basics.availableSlots) {
            toast.error('Please fill all basic details');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        for (let i = 0; i < modules.length; i++) {
            if (!modules[i].title) {
                toast.error(`Module ${i + 1} needs a title`);
                return false;
            }
            if (modules[i].topics.length === 0) {
                toast.error(`Module ${i + 1} needs at least one topic`);
                return false;
            }
            for (let j = 0; j < modules[i].topics.length; j++) {
                const t = modules[i].topics[j];
                if (!t.title || !t.videoUrl) {
                    toast.error(`Topic ${j + 1} in Module ${i + 1} needs a title and YouTube URL`);
                    return false;
                }
                if (!getYoutubeId(t.videoUrl)) {
                    toast.error(`Invalid YouTube URL in Module ${i + 1}, Topic ${j + 1}`);
                    return false;
                }
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const courseData = { ...basics, modules, isDraft };
            if (initialData?._id) {
                await updateCourse(initialData._id, courseData);
                toast.success('Course updated successfully! 🎉');
            } else {
                await createCourse(courseData);
                toast.success(isDraft ? 'Draft saved! 📝' : 'Course published successfully! 🎉');
            }
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    const stepsInfo = [
        { num: 1, title: 'Basics', icon: HiOutlineClipboardDocumentList },
        { num: 2, title: 'Curriculum', icon: HiOutlineFilm },
        { num: 3, title: 'Publish', icon: HiOutlineRocketLaunch },
    ];

    return (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
            {/* Header / Stepper view */}
            <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4 md:gap-8 w-full">
                    {stepsInfo.map((s, i) => (
                        <div key={s.num} className={`flex-1 flex flex-col items-center relative gap-3`}>
                            {i !== stepsInfo.length - 1 && (
                                <div className={`absolute top-6 left-1/2 w-full h-[2px] -z-10 transition-colors duration-500
                                    ${step > s.num ? 'bg-violet-600' : 'bg-slate-100'}`} />
                            )}
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 transform
                                ${step === s.num ? 'bg-violet-600 text-white shadow-lg scale-110' :
                                    step > s.num ? 'bg-violet-100 text-violet-600 border border-violet-200' :
                                        'bg-slate-50 text-slate-300 border border-slate-100'}`}>
                                {step > s.num ? <HiOutlineCheckCircle className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-widest text-center
                                ${step === s.num ? 'text-violet-900' : step > s.num ? 'text-violet-600' : 'text-slate-400'}`}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {/* STEP 1: BASICS */}
                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Course Title</label>
                                <input
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none text-slate-800 font-bold"
                                    placeholder="e.g. Master Traditional Cooking"
                                    value={basics.title}
                                    onChange={(e) => setBasics({ ...basics, title: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Description</label>
                                <textarea
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none text-slate-800 font-medium resize-none"
                                    placeholder="What will students learn?"
                                    rows="4"
                                    value={basics.description}
                                    onChange={(e) => setBasics({ ...basics, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Category</label>
                                <select
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none text-slate-800 font-bold cursor-pointer"
                                    value={basics.category}
                                    onChange={(e) => setBasics({ ...basics, category: e.target.value })}
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Level</label>
                                <select
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none text-slate-800 font-bold cursor-pointer"
                                    value={basics.level}
                                    onChange={(e) => setBasics({ ...basics, level: e.target.value })}
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Price (₹)</label>
                                <input
                                    type="number" min="0"
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none text-slate-800 font-bold"
                                    placeholder="0 for free"
                                    value={basics.price}
                                    onChange={(e) => setBasics({ ...basics, price: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Duration</label>
                                    <input
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none text-slate-800 font-bold"
                                        placeholder="e.g. 5 hours"
                                        value={basics.duration}
                                        onChange={(e) => setBasics({ ...basics, duration: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Max capacity</label>
                                    <input
                                        type="number" min="1"
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none text-slate-800 font-bold"
                                        placeholder="Slots"
                                        value={basics.availableSlots}
                                        onChange={(e) => setBasics({ ...basics, availableSlots: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: CURRICULUM */}
                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                        {modules.map((mod, modIndex) => (
                            <div key={modIndex} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 relative group">
                                <button
                                    onClick={() => removeModule(modIndex)}
                                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors md:opacity-0 group-hover:opacity-100"
                                    title="Remove Module"
                                >
                                    <HiOutlineTrash className="w-5 h-5" />
                                </button>

                                <div className="mb-6 mr-10">
                                    <label className="text-xs font-black text-violet-500 uppercase tracking-widest mb-2 ml-1 block">Module {modIndex + 1}</label>
                                    <input
                                        className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none text-slate-900 font-extrabold text-lg"
                                        placeholder="Module Title (e.g. Basics of Baking)"
                                        value={mod.title}
                                        onChange={(e) => handleModuleChange(modIndex, 'title', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-4 pl-4 md:pl-8 border-l-2 border-slate-200">
                                    {mod.topics.map((topic, topIndex) => {
                                        const ytId = getYoutubeId(topic.videoUrl);
                                        return (
                                            <div key={topIndex} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm relative group/topic flex flex-col md:flex-row gap-6">
                                                <button
                                                    onClick={() => removeTopic(modIndex, topIndex)}
                                                    className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors md:opacity-0 group-hover/topic:opacity-100"
                                                >
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </button>

                                                <div className="flex-1 space-y-4 pr-6">
                                                    <input
                                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none text-slate-800 font-bold text-sm"
                                                        placeholder={`Topic ${topIndex + 1} Title`}
                                                        value={topic.title}
                                                        onChange={(e) => handleTopicChange(modIndex, topIndex, 'title', e.target.value)}
                                                    />
                                                    <div className="flex flex-col md:flex-row gap-4">
                                                        <input
                                                            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none text-slate-600 font-medium text-sm"
                                                            placeholder="YouTube Video URL"
                                                            value={topic.videoUrl}
                                                            onChange={(e) => handleTopicChange(modIndex, topIndex, 'videoUrl', e.target.value)}
                                                        />
                                                        <div className="flex gap-2">
                                                            <input
                                                                className="w-24 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-violet-200 outline-none text-slate-600 font-medium text-sm text-center"
                                                                placeholder="10 min"
                                                                value={topic.duration}
                                                                onChange={(e) => handleTopicChange(modIndex, topIndex, 'duration', e.target.value)}
                                                            />
                                                            <label className="flex items-center gap-2 px-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
                                                                <input
                                                                    type="checkbox"
                                                                    className="accent-violet-600 w-4 h-4"
                                                                    checked={topic.isFree}
                                                                    onChange={(e) => handleTopicChange(modIndex, topIndex, 'isFree', e.target.checked)}
                                                                />
                                                                <span className="text-xs font-bold text-slate-600">Free Preview</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="w-full md:w-48 h-28 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 shrink-0 relative">
                                                    {ytId ? (
                                                        <>
                                                            <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="Video Thumbnail" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-violet-600 shadow-lg">
                                                                    <HiOutlinePlay className="w-4 h-4 translate-x-0.5" />
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs font-bold text-slate-400 flex flex-col items-center gap-1">
                                                            <HiOutlineFilm className="w-6 h-6" /> No Video
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <button
                                        onClick={() => addTopic(modIndex)}
                                        className="text-sm font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1.5 py-2 px-4 rounded-xl hover:bg-violet-50 transition-colors"
                                    >
                                        <HiOutlinePlus className="w-4 h-4" /> Add Topic
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addModule}
                            className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-500 font-bold hover:bg-slate-50 hover:border-violet-300 hover:text-violet-700 transition-all flex justify-center items-center gap-2"
                        >
                            <HiOutlinePlus className="w-5 h-5" /> Add New Module
                        </button>
                    </div>
                )}

                {/* STEP 3: PUBLISH */}
                {step === 3 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300 py-6">
                        <div className="text-center max-w-lg mx-auto">
                            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">You're almost there!</h3>
                            <p className="text-slate-500 font-medium mb-10">Review your visibility settings before saving. Drafts are only visible to you.</p>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setIsDraft(true)}
                                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-3
                                        ${isDraft ? 'border-amber-400 bg-amber-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                >
                                    <div className={`p-3 rounded-2xl ${isDraft ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                                        <HiOutlineClipboardDocumentList className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className={`block font-extrabold ${isDraft ? 'text-amber-900' : 'text-slate-700'}`}>Save as Draft</span>
                                        <span className="text-xs font-medium text-slate-500 mt-1 block">Work on it later</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setIsDraft(false)}
                                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-3
                                        ${!isDraft ? 'border-green-500 bg-green-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                >
                                    <div className={`p-3 rounded-2xl ${!isDraft ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                                        <HiOutlineRocketLaunch className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className={`block font-extrabold ${!isDraft ? 'text-green-900' : 'text-slate-700'}`}>Publish Now</span>
                                        <span className="text-xs font-medium text-slate-500 mt-1 block">Live for students</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer / Navigation Buttons */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                    <button
                        onClick={onCancel}
                        className="text-slate-500 font-bold hover:text-slate-700 hover:underline text-sm px-4"
                    >
                        Cancel
                    </button>
                </div>
                <div className="flex gap-3">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="btn btn-outline px-6 py-3 rounded-2xl text-sm"
                        >
                            Back
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            onClick={() => {
                                if (step === 1 && validateStep1()) setStep(2);
                                if (step === 2 && validateStep2()) setStep(3);
                            }}
                            className="btn btn-primary px-8 py-3 rounded-2xl text-sm"
                        >
                            Next Step
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`btn px-8 py-3 rounded-2xl text-sm text-white font-extrabold transition-colors border-0
                                ${isDraft ? 'bg-amber-500 hover:bg-amber-600 shadow-[0_4px_15px_-3px_rgba(245,158,11,0.4)]' : 'bg-green-500 hover:bg-green-600 shadow-[0_4px_15px_-3px_rgba(34,197,94,0.4)]'}
                            `}
                        >
                            {loading ? 'Saving...' : isDraft ? 'Save Draft' : 'Publish Course'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

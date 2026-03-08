import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updatePreferences } from '../../services/skillSakhiAPI';
import { HiOutlineSparkles, HiOutlineCheck } from 'react-icons/hi2';

const CATEGORIES = [
    { name: 'Technology', icon: '💻' },
    { name: 'Business', icon: '💼' },
    { name: 'Art & Design', icon: '🎨' },
    { name: 'Fitness', icon: '🏋️‍♀️' },
    { name: 'Language', icon: '🌐' },
    { name: 'Cooking', icon: '🍳' },
    { name: 'Handicrafts', icon: '🧶' },
    { name: 'Digital Marketing', icon: '📣' },
    { name: 'Other', icon: '✨' },
];

const PreferencesModal = () => {
    const { user, setUser } = useAuth();
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);

    // Show modal if user is logged in but hasn't completed onboarding
    useEffect(() => {
        if (user && user.onboardingDone === false && !show) {
            setShow(true);
        }
    }, [user, show]);

    if (!show) return null;

    const toggleCategory = (cat) => {
        if (selected.includes(cat)) {
            setSelected(selected.filter(c => c !== cat));
        } else {
            setSelected([...selected, cat]);
        }
    };

    const handleSave = async () => {
        if (selected.length === 0) return;
        setLoading(true);
        try {
            const { data } = await updatePreferences(selected);
            setUser({ ...user, preferences: data.preferences, onboardingDone: data.onboardingDone });
            setShow(false);
        } catch (error) {
            console.error('Error saving preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-violet-700 p-8 text-center text-white relative overflow-hidden shrink-0">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />
                    <div className="relative z-10 hidden sm:flex justify-center mb-4">
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                            <HiOutlineSparkles className="w-8 h-8 text-pink-200" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold mb-2 relative z-10">Welcome to Skill Sakhi! 🎉</h2>
                    <p className="text-violet-100 font-medium relative z-10 flex items-center justify-center gap-2">
                        What are you interested in learning?
                    </p>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto no-scrollbar">
                    <p className="text-slate-500 text-center mb-8 font-medium">
                        Select topics you love, and we'll personalize your experience with course recommendations just for you.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {CATEGORIES.map((cat) => {
                            const isSelected = selected.includes(cat.name);
                            return (
                                <button
                                    key={cat.name}
                                    onClick={() => toggleCategory(cat.name)}
                                    className={`
                                        relative group flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300
                                        ${isSelected
                                            ? 'border-violet-600 bg-violet-50 shadow-[0_4px_20px_-4px_rgba(109,40,217,0.3)]'
                                            : 'border-slate-100 bg-white hover:border-violet-300 hover:bg-slate-50'}
                                    `}
                                >
                                    <span className="text-3xl mb-2 sm:mb-3 block group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                                    <span className={`text-sm font-bold text-center ${isSelected ? 'text-violet-900' : 'text-slate-700'}`}>
                                        {cat.name}
                                    </span>

                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-sm">
                                            <HiOutlineCheck className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
                    <button
                        onClick={handleSave}
                        disabled={selected.length === 0 || loading}
                        className="w-full btn btn-primary py-4 text-lg"
                    >
                        {loading ? 'Personalizing...' : selected.length === 0 ? 'Select at least one topic' : `Let's Get Started (${selected.length})`}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PreferencesModal;

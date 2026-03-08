import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCommunities, createCommunity, joinCommunity } from '../services/skillSakhiAPI';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';
import { toast } from 'react-toastify';
import { HiOutlinePlus, HiOutlineUserGroup, HiOutlineChatBubbleLeftRight, HiOutlineSparkles, HiOutlineBookOpen, HiOutlineXMark } from 'react-icons/hi2';

const CommunityPage = () => {
    const { user } = useAuth();
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', category: '' });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        getCommunities()
            .then(({ data }) => setCommunities(data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const { data } = await createCommunity(form);
            setCommunities([data, ...communities]);
            setShowForm(false);
            setForm({ name: '', description: '', category: '' });
            toast.success('Community created! 🎉');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create');
        } finally {
            setCreating(false);
        }
    };

    const handleJoin = async (id) => {
        if (!user) return toast.error('Please login to join');
        try {
            await joinCommunity(id);
            toast.success('Joined community!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to join');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Spinner /></div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Community Groups</h1>
                        <p className="text-slate-500 font-medium">Connect, share, and grow with like-minded women worldwide.</p>
                    </div>
                    {user && (
                        <button
                            className="btn btn-primary px-8 flex items-center gap-2"
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? <HiOutlineXMark className="w-5 h-5" /> : <HiOutlinePlus className="w-5 h-5" />}
                            {showForm ? 'Close Form' : 'Create Group'}
                        </button>
                    )}
                </div>

                {showForm && (
                    <div className="max-w-2xl mx-auto mb-16 bg-white p-10 rounded-[2.5rem] shadow-xl border border-indigo-50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-16 -translate-x-16"></div>
                        <h3 className="text-2xl font-extrabold text-slate-900 mb-8 relative z-10 flex items-center gap-2">
                            <HiOutlineSparkles className="text-indigo-600" /> Start a New Community
                        </h3>
                        <form onSubmit={handleCreate} className="space-y-6 relative z-10">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Group Name</label>
                                <input
                                    className="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 text-sm"
                                    placeholder="Enter a catchy name..."
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 text-sm resize-none"
                                    placeholder="What is this community about?"
                                    rows="4"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                                <input
                                    className="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 text-sm"
                                    placeholder="e.g. Technology, Wellness, Art"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-full py-5 text-lg rounded-2xl" disabled={creating}>
                                {creating ? 'Creating...' : 'Launch Community'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {communities.length === 0 ? (
                        <div className="col-span-full bg-white rounded-[2.5rem] p-24 text-center border-2 border-dashed border-slate-200">
                            <div className="text-6xl mb-6">🤝</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No communities yet</h3>
                            <p className="text-slate-500">Be the first to create a home for sakhis!</p>
                        </div>
                    ) : (
                        communities.map((c) => (
                            <div key={c._id} className="card-premium h-full flex flex-col overflow-hidden bg-white p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-bold">
                                        <HiOutlineChatBubbleLeftRight />
                                    </div>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {c.category}
                                    </span>
                                </div>

                                <h3 className="text-xl font-extrabold text-slate-900 mb-3">{c.name}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3">
                                    {c.description}
                                </p>

                                <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-1.5 text-indigo-600 font-black text-xs uppercase tracking-widest">
                                        <HiOutlineUserGroup className="w-4 h-4" />
                                        <span>{c.members?.length || 0} Members</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link to={`/community/${c._id}`} className="text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase hover:underline">View</Link>
                                        <button
                                            className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
                                            onClick={() => handleJoin(c._id)}
                                        >
                                            Join Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;

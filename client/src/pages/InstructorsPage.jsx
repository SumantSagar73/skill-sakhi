import { useState, useEffect } from 'react';
import { getMembers } from '../services/skillSakhiAPI';
import { Link } from 'react-router-dom';
import Spinner from '../components/ui/Spinner';
import { HiOutlineUser, HiOutlineStar, HiOutlineMapPin, HiOutlineSparkles } from 'react-icons/hi2';

const InstructorsPage = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMembers()
            .then(({ data }) => setInstructors(data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Spinner /></div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Our Members 🌸</h1>
                    <p className="text-slate-500">Every woman here is both a teacher and a learner. Explore our community.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {instructors.length === 0 ? (
                        <div className="col-span-full bg-white rounded-[2.5rem] p-24 text-center border-2 border-dashed border-slate-200">
                            <div className="text-6xl mb-6">👩‍🤝‍👩</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No members yet</h3>
                            <p className="text-slate-500">Be the first to join the community!</p>
                        </div>
                    ) : (
                        instructors.map((i) => (
                            <Link to={`/instructors/${i._id}`} key={i._id} className="card-premium h-full flex flex-col p-8 items-center text-center">
                                <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl mb-6 bg-slate-50 flex items-center justify-center text-5xl">
                                    {i.profilePicture ? (
                                        <img src={`http://localhost:5000${i.profilePicture}`} alt={i.name} className="w-full h-full object-cover" />
                                    ) : <HiOutlineUser className="text-slate-300 w-16 h-16" />}
                                </div>

                                <h3 className="text-xl font-extrabold text-slate-900 mb-2">{i.name}</h3>
                                <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed italic">
                                    "{i.bio || 'Sharing expert skills to empower the community.'}"
                                </p>

                                <div className="flex items-center gap-4 mb-6 text-xs font-bold text-slate-400 tracking-widest uppercase">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg">
                                        <HiOutlineStar className="w-4 h-4 fill-current" />
                                        <span>{i.rating || 'New'}</span>
                                    </div>
                                    {i.location && (
                                        <div className="flex items-center gap-1.5">
                                            <HiOutlineMapPin className="w-4 h-4" />
                                            <span>{i.location}</span>
                                        </div>
                                    )}
                                </div>

                                {i.skills?.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-2 mt-auto pt-4 border-t border-slate-50 w-full">
                                        {i.skills.slice(0, 3).map((s) => (
                                            <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorsPage;

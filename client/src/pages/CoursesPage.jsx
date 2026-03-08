import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCourses, getRecommendedCourses } from '../services/skillSakhiAPI';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/ui/CourseCard';
import Spinner from '../components/ui/Spinner';
import {
    HiOutlineMagnifyingGlass,
    HiOutlineXMark,
    HiOutlineAdjustmentsHorizontal,
    HiOutlineChevronDown,
    HiOutlineChevronUp,
    HiOutlineSparkles,
} from 'react-icons/hi2';

const CATEGORIES = ['Cooking', 'Technology', 'Art & Design', 'Business', 'Fitness', 'Language', 'Handicrafts', 'Digital Marketing', 'Other'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const RATINGS = [
    { label: '4.5 & up', value: '4.5' },
    { label: '4.0 & up', value: '4.0' },
    { label: '3.5 & up', value: '3.5' },
];
const SORT_OPTIONS = [
    { label: 'Newest', value: '' },
    { label: 'Top Rated', value: 'rating' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
];

const FilterSection = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-slate-100 pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
            <button
                className="w-full flex items-center justify-between font-bold text-slate-900 text-sm mb-3"
                onClick={() => setOpen(!open)}
            >
                {title}
                {open ? <HiOutlineChevronUp className="w-4 h-4 text-slate-400" /> : <HiOutlineChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {open && children}
        </div>
    );
};

const CoursesPage = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const keyword = searchParams.get('keyword') || '';
    const category = searchParams.get('category') || '';
    const level = searchParams.get('level') || '';
    const sort = searchParams.get('sort') || '';
    const minRating = searchParams.get('minRating') || '';
    const priceType = searchParams.get('priceType') || ''; // 'free' | 'paid' | ''
    const forYou = searchParams.get('forYou') === 'true';

    useEffect(() => { setSearchInput(keyword); }, [keyword]);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                if (forYou && user) {
                    const { data } = await getRecommendedCourses();
                    setCourses(data);
                } else {
                    const params = {};
                    if (keyword) params.keyword = keyword;
                    if (category) params.category = category;
                    if (level) params.level = level;
                    if (sort) params.sort = sort;
                    if (priceType === 'free') { params.minPrice = 0; params.maxPrice = 0; }
                    if (priceType === 'paid') params.minPrice = 1;

                    const { data } = await getCourses(params);
                    // client-side rating filter
                    const filtered = minRating
                        ? data.filter(c => (c.rating || 0) >= parseFloat(minRating))
                        : data;
                    setCourses(filtered);
                }
            } catch {
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [keyword, category, level, sort, minRating, priceType, forYou, user]);

    const setFilter = (key, value) => {
        const current = Object.fromEntries(searchParams.entries());
        if (!value) {
            delete current[key];
        } else {
            current[key] = value;
        }
        setSearchParams(current);
    };

    const clearAll = () => setSearchParams({});

    const hasFilters = keyword || category || level || sort || minRating || priceType || forYou;

    const activeCount = [keyword, category, level, sort, minRating, priceType, forYou].filter(Boolean).length;

    const FilterPanel = () => (
        <div className="space-y-1">
            {/* Sort */}
            <FilterSection title="Sort By">
                <div className="space-y-2">
                    {SORT_OPTIONS.map(opt => (
                        <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                                type="radio"
                                name="sort"
                                checked={sort === opt.value}
                                onChange={() => setFilter('sort', opt.value)}
                                className="accent-violet-700 w-4 h-4"
                            />
                            <span className="text-sm text-slate-700 font-medium group-hover:text-violet-700 transition-colors">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Category */}
            <FilterSection title="Category">
                <div className="space-y-2">
                    {CATEGORIES.map(cat => (
                        <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                                type="radio"
                                name="category"
                                checked={category === cat}
                                onChange={() => setFilter('category', category === cat ? '' : cat)}
                                className="accent-violet-700 w-4 h-4"
                            />
                            <span className="text-sm text-slate-700 font-medium group-hover:text-violet-700 transition-colors">{cat}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Level */}
            <FilterSection title="Level">
                <div className="space-y-2">
                    {LEVELS.map(lvl => (
                        <label key={lvl} className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={level === lvl}
                                onChange={() => setFilter('level', level === lvl ? '' : lvl)}
                                className="accent-violet-700 w-4 h-4 rounded"
                            />
                            <span className="text-sm text-slate-700 font-medium group-hover:text-violet-700 transition-colors">{lvl}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Price */}
            <FilterSection title="Price">
                <div className="space-y-2">
                    {[{ label: 'All', value: '' }, { label: 'Free', value: 'free' }, { label: 'Paid', value: 'paid' }].map(opt => (
                        <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                                type="radio"
                                name="priceType"
                                checked={priceType === opt.value}
                                onChange={() => setFilter('priceType', opt.value)}
                                className="accent-violet-700 w-4 h-4"
                            />
                            <span className="text-sm text-slate-700 font-medium group-hover:text-violet-700 transition-colors">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Rating */}
            <FilterSection title="Rating" defaultOpen={false}>
                <div className="space-y-2">
                    {RATINGS.map(r => (
                        <label key={r.value} className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                                type="radio"
                                name="rating"
                                checked={minRating === r.value}
                                onChange={() => setFilter('minRating', minRating === r.value ? '' : r.value)}
                                className="accent-violet-700 w-4 h-4"
                            />
                            <span className="text-sm text-slate-700 font-medium group-hover:text-violet-700 transition-colors flex items-center gap-1">
                                <span className="text-amber-400">★</span> {r.label}
                            </span>
                        </label>
                    ))}
                </div>
            </FilterSection>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Bar */}
            <div className="bg-white border-b border-slate-200 py-6 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Skill Marketplace</h1>
                    <p className="text-slate-500 text-sm font-medium">Discover courses taught by amazing women worldwide.</p>

                    {/* Search bar */}
                    <div className="mt-4 flex gap-3">
                        <div className="flex-1 relative max-w-xl">
                            <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none text-slate-700 font-medium text-sm transition-all"
                                placeholder="Search courses..."
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') setFilter('keyword', searchInput); }}
                            />
                        </div>
                        <button
                            onClick={() => setFilter('keyword', searchInput)}
                            className="btn btn-primary px-6 py-3 rounded-2xl text-sm shrink-0"
                        >
                            Search
                        </button>
                        {user && user.onboardingDone && (
                            <button
                                onClick={() => setFilter('forYou', forYou ? '' : 'true')}
                                className={`hidden md:flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold border transition-all shrink-0
                                    ${forYou ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}
                                `}
                            >
                                <HiOutlineSparkles className={forYou ? 'text-pink-500' : 'text-slate-400'} />
                                For You
                            </button>
                        )}
                        {/* Mobile filter toggle */}
                        <button
                            className="md:hidden flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm relative"
                            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                        >
                            <HiOutlineAdjustmentsHorizontal className="w-5 h-5" />
                            Filters
                            {activeCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-violet-700 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                                    {activeCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Active filter chips */}
                    {hasFilters && (
                        <div className="mt-4 flex flex-wrap gap-2 items-center">
                            {forYou && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-bold border border-pink-200">
                                    <HiOutlineSparkles className="w-3.5 h-3.5" /> For You
                                    <button onClick={() => setFilter('forYou', '')}><HiOutlineXMark className="w-3.5 h-3.5" /></button>
                                </span>
                            )}
                            {category && !forYou && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-bold border border-violet-200">
                                    {category}
                                    <button onClick={() => setFilter('category', '')}><HiOutlineXMark className="w-3.5 h-3.5" /></button>
                                </span>
                            )}
                            {level && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-bold border border-violet-200">
                                    {level}
                                    <button onClick={() => setFilter('level', '')}><HiOutlineXMark className="w-3.5 h-3.5" /></button>
                                </span>
                            )}
                            {priceType && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-bold border border-violet-200">
                                    {priceType === 'free' ? 'Free' : 'Paid'}
                                    <button onClick={() => setFilter('priceType', '')}><HiOutlineXMark className="w-3.5 h-3.5" /></button>
                                </span>
                            )}
                            {minRating && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-bold border border-violet-200">
                                    ★ {minRating}+
                                    <button onClick={() => setFilter('minRating', '')}><HiOutlineXMark className="w-3.5 h-3.5" /></button>
                                </span>
                            )}
                            {keyword && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-bold border border-violet-200">
                                    "{keyword}"
                                    <button onClick={() => setFilter('keyword', '')}><HiOutlineXMark className="w-3.5 h-3.5" /></button>
                                </span>
                            )}
                            <button onClick={clearAll} className="text-xs text-slate-400 hover:text-pink-600 font-bold transition-colors ml-1">
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex gap-8">
                {/* Sidebar — Desktop */}
                <aside className="hidden md:block w-60 shrink-0">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
                        <div className="flex items-center justify-between mb-5">
                            <span className="font-extrabold text-slate-900 text-sm">Filters</span>
                            {hasFilters && (
                                <button onClick={clearAll} className="text-xs text-pink-600 font-bold hover:underline">
                                    Clear all
                                </button>
                            )}
                        </div>
                        <FilterPanel />
                    </div>
                </aside>

                {/* Mobile Filter Drawer */}
                {mobileFiltersOpen && (
                    <div className="md:hidden fixed inset-0 z-50 flex">
                        <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
                        <div className="relative ml-auto w-80 bg-white h-full overflow-y-auto p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <span className="font-extrabold text-slate-900">Filters</span>
                                <button onClick={() => setMobileFiltersOpen(false)}>
                                    <HiOutlineXMark className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                            <FilterPanel />
                        </div>
                    </div>
                )}

                {/* Course Grid */}
                <main className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-slate-500 font-medium">
                            {loading ? 'Loading...' : `${courses.length} course${courses.length !== 1 ? 's' : ''} found`}
                        </p>
                    </div>

                    {loading ? (
                        <div className="py-24"><Spinner /></div>
                    ) : courses.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-24 text-center border-2 border-dashed border-slate-200">
                            <HiOutlineMagnifyingGlass className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
                            <p className="text-slate-500 mb-6 text-sm">Try adjusting your filters or search keywords.</p>
                            <button onClick={clearAll} className="btn btn-outline text-sm">
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <CourseCard key={course._id} course={course} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CoursesPage;

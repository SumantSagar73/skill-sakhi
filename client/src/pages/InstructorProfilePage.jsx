import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile, getCoursesByInstructor } from '../services/skillSakhiAPI';
import CourseCard from '../components/ui/CourseCard';
import Spinner from '../components/ui/Spinner';

const InstructorProfilePage = () => {
    const { id } = useParams();
    const [instructor, setInstructor] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [u, c] = await Promise.all([getUserProfile(id), getCoursesByInstructor(id)]);
                setInstructor(u.data);
                setCourses(c.data);
            } catch { }
            finally { setLoading(false); }
        };
        load();
    }, [id]);

    if (loading) return <Spinner />;
    if (!instructor) return <p className="empty-state">Instructor not found.</p>;

    return (
        <div className="page instructor-profile">
            <div className="profile-header">
                <div className="profile-avatar">
                    {instructor.profilePicture ? (
                        <img src={`http://localhost:5000${instructor.profilePicture}`} alt={instructor.name} />
                    ) : <span className="avatar-placeholder">👤</span>}
                </div>
                <div className="profile-info">
                    <h1>{instructor.name}</h1>
                    <p className="profile-bio">{instructor.bio}</p>
                    {instructor.location && <p>📍 {instructor.location}</p>}
                    <div className="profile-stats">
                        <span>⭐ {instructor.rating || '—'} Rating</span>
                        <span>👩‍🏫 {courses.length} Courses</span>
                        <span>💬 {instructor.totalReviews || 0} Reviews</span>
                    </div>
                    {instructor.skills?.length > 0 && (
                        <div className="skills-tags">
                            {instructor.skills.map((s) => <span key={s} className="skill-tag">{s}</span>)}
                        </div>
                    )}
                </div>
            </div>

            <h2>Courses by {instructor.name}</h2>
            {courses.length === 0 ? (
                <p className="empty-state">No courses yet.</p>
            ) : (
                <div className="courses-grid">
                    {courses.map((c) => <CourseCard key={c._id} course={c} />)}
                </div>
            )}
        </div>
    );
};

export default InstructorProfilePage;

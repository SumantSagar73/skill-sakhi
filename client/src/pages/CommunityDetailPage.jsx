import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    getCommunityById, getCommunityPosts, createPost, likePost, addComment,
} from '../services/skillSakhiAPI';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';
import { toast } from 'react-toastify';

const CommunityDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [community, setCommunity] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postContent, setPostContent] = useState('');
    const [posting, setPosting] = useState(false);
    const [commentText, setCommentText] = useState({});

    useEffect(() => {
        const load = async () => {
            try {
                const [c, p] = await Promise.all([getCommunityById(id), getCommunityPosts(id)]);
                setCommunity(c.data);
                setPosts(p.data);
            } catch {
                toast.error('Failed to load community');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handlePost = async (e) => {
        e.preventDefault();
        if (!user) return toast.error('Please login');
        setPosting(true);
        try {
            const { data } = await createPost({ communityId: id, content: postContent });
            setPosts([data, ...posts]);
            setPostContent('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to post');
        } finally {
            setPosting(false);
        }
    };

    const handleLike = async (postId) => {
        if (!user) return toast.error('Please login to like');
        try {
            const { data } = await likePost(postId);
            setPosts(posts.map((p) =>
                p._id === postId ? { ...p, likes: Array(data.likes).fill(null) } : p
            ));
        } catch { }
    };

    const handleComment = async (postId) => {
        if (!user) return toast.error('Please login to comment');
        const text = commentText[postId];
        if (!text?.trim()) return;
        try {
            const { data } = await addComment(postId, text);
            setPosts(posts.map((p) => p._id === postId ? { ...p, comments: data } : p));
            setCommentText({ ...commentText, [postId]: '' });
        } catch { }
    };

    if (loading) return <Spinner />;

    return (
        <div className="page community-detail">
            {community && (
                <div className="community-detail-header">
                    <h1>💬 {community.name}</h1>
                    <p>{community.description}</p>
                    <span>👥 {community.members?.length} members</span>
                </div>
            )}

            {user && (
                <form onSubmit={handlePost} className="post-form">
                    <textarea
                        placeholder="Share something with the community..."
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-primary" disabled={posting}>
                        {posting ? 'Posting...' : 'Post'}
                    </button>
                </form>
            )}

            <div className="posts-list">
                {posts.length === 0 ? (
                    <p className="empty-state">No posts yet. Start the conversation!</p>
                ) : (
                    posts.map((post) => (
                        <div key={post._id} className="post-card">
                            <div className="post-header">
                                <strong>{post.author?.name}</strong>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p>{post.content}</p>
                            <div className="post-actions">
                                <button onClick={() => handleLike(post._id)}>
                                    ❤️ {post.likes?.length || 0}
                                </button>
                                <span>💬 {post.comments?.length || 0}</span>
                            </div>
                            <div className="comments-section">
                                {post.comments?.map((c, i) => (
                                    <div key={i} className="comment">
                                        <strong>{c.user?.name}:</strong> {c.text}
                                    </div>
                                ))}
                                {user && (
                                    <div className="comment-input">
                                        <input
                                            placeholder="Add a comment..."
                                            value={commentText[post._id] || ''}
                                            onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && handleComment(post._id)}
                                        />
                                        <button className="btn btn-sm btn-primary" onClick={() => handleComment(post._id)}>
                                            Send
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommunityDetailPage;

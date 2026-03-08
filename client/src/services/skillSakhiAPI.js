import API from './api';

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

export const getUserProfile = (id) => API.get(`/users/${id}`);
export const updateProfile = (data) => API.put('/users/profile', data);
export const getMembers = () => API.get('/users/members');
export const updatePreferences = (categories) => API.put('/users/preferences', { categories });

export const getCourses = (params) => API.get('/courses', { params });
export const getRecommendedCourses = () => API.get('/courses/recommended');
export const getCourseById = (id) => API.get(`/courses/${id}`);
export const checkEnrollment = (id) => API.get(`/courses/${id}/enrollment`);
export const createCourse = (data) => API.post('/courses', data);
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
export const updateCurriculum = (id, modules) => API.put(`/courses/${id}/curriculum`, { modules });
export const deleteCourse = (id) => API.delete(`/courses/${id}`);
export const getCoursesByInstructor = (id) => API.get(`/courses/instructor/${id}`);

export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings/my');
export const getInstructorBookings = () => API.get('/bookings/instructor');
export const getCourseEnrollments = (courseId) => API.get(`/bookings/course/${courseId}`);
export const updateBookingStatus = (id, status) => API.put(`/bookings/${id}`, { status });

export const createReview = (data) => API.post('/reviews', data);
export const getCourseReviews = (courseId) => API.get(`/reviews/${courseId}`);

export const getCommunities = () => API.get('/communities');
export const getCommunityById = (id) => API.get(`/communities/${id}`);
export const createCommunity = (data) => API.post('/communities', data);
export const joinCommunity = (id) => API.put(`/communities/${id}/join`);
export const leaveCommunity = (id) => API.put(`/communities/${id}/leave`);

export const getCommunityPosts = (communityId) => API.get(`/posts/${communityId}`);
export const createPost = (data) => API.post('/posts', data);
export const likePost = (id) => API.put(`/posts/${id}/like`);
export const addComment = (id, text) => API.post(`/posts/${id}/comment`, { text });

// Stories APIs
export const getStories = (params) => API.get('/stories', { params });
export const getTrendingStories = () => API.get('/stories/trending');
export const getStoryById = (id) => API.get(`/stories/${id}`);
export const getUserStories = (userId) => API.get(`/stories/user/${userId}`);
export const createStory = (data) => API.post('/stories', data);
export const updateStory = (id, data) => API.put(`/stories/${id}`, data);
export const deleteStory = (id) => API.delete(`/stories/${id}`);
export const likeStory = (id) => API.put(`/stories/${id}/like`);
export const commentOnStory = (id, text) => API.post(`/stories/${id}/comments`, { text });
export const deleteStoryComment = (storyId, commentId) => API.delete(`/stories/${storyId}/comments/${commentId}`);

import axios from 'axios';

const BASE_URL = 'https://route-posts.routemisr.com';

export const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export function getErrorMessage(error) {
  if (!error) return 'An unexpected error occurred.';
  const data = error.response?.data;
  if (data?.message) return data.message;
  if (data?.errors) {
    if (Array.isArray(data.errors)) return data.errors.join(', ');
    if (typeof data.errors === 'string') return data.errors;
    if (typeof data.errors === 'object') return Object.values(data.errors).join(', ');
  }
  return error.message || 'Something went wrong';
}

/* Auth & Users */
export async function loginUser(credentials) {
  const res = await api.post('/users/signin', credentials);
  return res.data;
}

export async function signupUser(userData) {
  const res = await api.post('/users/signup', userData);
  return res.data;
}

export async function getProfileData() {
  const res = await api.get('/users/profile-data');
  return res.data;
}

export async function changePassword(payload) {
  const res = await api.patch('/users/change-password', payload);
  return res.data;
}

export async function uploadProfilePhoto(file, privacy = 'public') {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('privacy', privacy);
  const res = await api.put('/users/upload-photo', formData);
  return res.data;
}

export async function uploadCoverPhoto(file, privacy = 'public') {
  const formData = new FormData();
  formData.append('cover', file);
  formData.append('privacy', privacy);
  const res = await api.put('/users/upload-cover', formData);
  return res.data;
}

export async function getSuggestions(page = 1, limit = 20) {
  const res = await api.get('/users/suggestions', {
    params: { page, limit },
  });
  return res.data;
}

export async function searchUsers(query, page = 1, limit = 20) {
  const res = await api.get('/users/search', {
    params: { q: query, page, limit },
  });
  return res.data;
}

export async function toggleFollowUser(userId) {
  const res = await api.put(`/users/${userId}/follow`);
  return res.data;
}

export async function getBookmarks(page = 1, limit = 10) {
  const res = await api.get('/users/bookmarks', {
    params: { page, limit },
  });
  return res.data;
}

/* Posts */
export async function getFeedPosts(only = '', page = 1, limit = 10) {
  const params = { page, limit };
  if (only) params.only = only;
  const res = await api.get('/posts/feed', { params });
  return res.data;
}

export async function getPostById(postId) {
  const res = await api.get(`/posts/${postId}`);
  return res.data;
}

export async function createPost({ body, image, privacy = 'public' }) {
  const formData = new FormData();
  if (body) formData.append('body', body);
  if (image) formData.append('image', image);
  if (privacy) formData.append('privacy', privacy);
  const res = await api.post('/posts', formData);
  return res.data;
}

export async function updatePost(postId, { body, image }) {
  const formData = new FormData();
  if (body !== undefined) formData.append('body', body);
  if (image) formData.append('image', image);
  const res = await api.put(`/posts/${postId}`, formData);
  return res.data;
}

export async function deletePost(postId) {
  const res = await api.delete(`/posts/${postId}`);
  return res.data;
}

export async function toggleLikePost(postId) {
  const res = await api.put(`/posts/${postId}/like`);
  return res.data;
}

export async function toggleBookmarkPost(postId) {
  const res = await api.put(`/posts/${postId}/bookmark`);
  return res.data;
}

export async function sharePost(postId, body = '') {
  const res = await api.post(`/posts/${postId}/share`, { body });
  return res.data;
}

/* Comments */
export async function getPostComments(postId, page = 1, limit = 10) {
  const res = await api.get(`/posts/${postId}/comments`, {
    params: { page, limit },
  });
  return res.data;
}

export async function createComment(postId, { content, image }) {
  const formData = new FormData();
  if (content) formData.append('content', content);
  if (image) formData.append('image', image);
  const res = await api.post(`/posts/${postId}/comments`, formData);
  return res.data;
}

export async function updateComment(postId, commentId, { content }) {
  const formData = new FormData();
  formData.append('content', content);
  const res = await api.put(`/posts/${postId}/comments/${commentId}`, formData);
  return res.data;
}

export async function deleteComment(postId, commentId) {
  const res = await api.delete(`/posts/${postId}/comments/${commentId}`);
  return res.data;
}

export async function toggleLikeComment(postId, commentId) {
  const res = await api.put(`/posts/${postId}/comments/${commentId}/like`);
  return res.data;
}

/* Notifications */
export async function getNotifications(unread = false, page = 1, limit = 20) {
  const res = await api.get('/notifications', {
    params: { unread, page, limit },
  });
  return res.data;
}

export async function getUnreadNotificationsCount() {
  const res = await api.get('/notifications/unread-count');
  return res.data;
}

export async function markNotificationAsRead(notificationId) {
  const res = await api.patch(`/notifications/${notificationId}/read`);
  return res.data;
}

export async function markAllNotificationsAsRead() {
  const res = await api.patch('/notifications/read-all');
  return res.data;
}

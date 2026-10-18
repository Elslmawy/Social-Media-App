import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  toggleLikePost,
  toggleBookmarkPost,
  sharePost,
  deletePost,
  updatePost,
  getPostComments,
  getErrorMessage,
} from '../api';
import Avatar from './Avatar';
import Modal from './Modal';
import toast from 'react-hot-toast';
import {
  MoreHorizontal,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  Edit3,
  Trash2,
  Globe,
  Users,
  Lock,
  Loader2,
  Image as ImageIcon,
  X,
} from 'lucide-react';

function formatTimeAgo(dateString) {
  if (!dateString) return 'just now';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return `${Math.max(0, diffInSeconds)}s`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PostCard({ post, onPostUpdated, onPostDeleted }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isOwner = user?._id && (post.user?._id === user._id || post.user === user._id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiked, setIsLiked] = useState(() => {
    if (post.isLiked !== undefined) return Boolean(post.isLiked);
    if (Array.isArray(post.likes) && user?._id) {
      return post.likes.some((like) => (like._id || like) === user._id);
    }
    return false;
  });
  const [isBookmarked, setIsBookmarked] = useState(Boolean(post.bookmarked || post.isBookmarked));
  const [sharesCount, setSharesCount] = useState(post.sharesCount || 0);

  const commentsCount = post.commentsCount ?? (Array.isArray(post.comments) ? post.comments.length : 0);
  const [previewComment, setPreviewComment] = useState(() => {
    return post.topComment || (Array.isArray(post.comments) && post.comments[0]) || null;
  });
  const [loadingComment, setLoadingComment] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editBody, setEditBody] = useState(post.body || '');
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(post.image || null);
  const [actionLoading, setActionLoading] = useState(false);

  const menuRef = useRef(null);
  const editFileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch first comment preview if comments exist but preview comment is missing
  useEffect(() => {
    if (!previewComment && commentsCount > 0) {
      let isMounted = true;
      setLoadingComment(true);
      getPostComments(post._id, 1, 1)
        .then((res) => {
          if (isMounted) {
            const first = res.data?.comments?.[0] || null;
            setPreviewComment(first);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setLoadingComment(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [post._id, commentsCount, previewComment]);

  const handleLike = async () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    try {
      await toggleLikePost(post._id);
    } catch (err) {
      setIsLiked(!nextLiked);
      setLikesCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
      toast.error(getErrorMessage(err));
    }
  };

  const handleBookmark = async () => {
    setMenuOpen(false);
    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);
    try {
      await toggleBookmarkPost(post._id);
      toast.success(nextBookmarked ? 'Post saved to bookmarks' : 'Post removed from bookmarks');
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      setIsBookmarked(!nextBookmarked);
      toast.error(getErrorMessage(err));
    }
  };

  const handleShare = async () => {
    try {
      await sharePost(post._id, 'Shared post');
      setSharesCount((prev) => prev + 1);
      toast.success('Post shared to your feed!');
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deletePost(post._id);
      toast.success('Post deleted successfully');
      setShowDeleteModal(false);
      if (onPostDeleted) {
        onPostDeleted(post._id);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await updatePost(post._id, {
        body: editBody,
        image: editImageFile,
      });
      toast.success('Post updated successfully');
      setShowEditModal(false);
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const author = post.user || {};
  const authorName = author.name || 'Anonymous User';
  const authorUsername = author.username || 'user';
  const timeAgo = formatTimeAgo(post.createdAt);

  return (
    <>
      <article className="bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5 shadow-2xs transition">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Avatar src={author.photo} alt={authorName} size="md" />
            <div>
              <h4 className="text-sm font-bold text-slate-800 leading-tight hover:text-blue-600 transition">
                {authorName}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <span>@{authorUsername}</span>
                <span>&bull;</span>
                <span>{timeAgo}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-0.5 capitalize">
                  {post.privacy === 'followers' ? (
                    <Users className="w-3 h-3" />
                  ) : post.privacy === 'only_me' ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    <Globe className="w-3 h-3" />
                  )}
                  <span className="text-[11px]">{post.privacy || 'Public'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
                {isOwner ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setEditBody(post.body || '');
                        setEditImagePreview(post.image || null);
                        setShowEditModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                      Edit Post
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setShowDeleteModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      Delete Post
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleBookmark}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${isBookmarked ? 'text-blue-600 fill-blue-600' : 'text-slate-400'}`}
                    />
                    {isBookmarked ? 'Remove Bookmark' : 'Save Post'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {post.body && (
          <p className="text-sm text-slate-800 leading-relaxed mb-3 whitespace-pre-line break-words">
            {post.body}
          </p>
        )}

        {post.image && (
          <div className="mb-3 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
            <img
              src={post.image}
              alt="Post attachment"
              className="w-full h-auto max-h-[480px] object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500 py-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-2xs">
              <ThumbsUp className="w-2.5 h-2.5 fill-white" />
            </span>
            <span className="font-semibold">{likesCount} likes</span>
          </div>

          <div className="flex items-center gap-3">
            <span>{sharesCount} shares</span>
            <span>{commentsCount} comments</span>
            <Link
              to={`/post/${post._id}`}
              className="text-blue-600 font-semibold hover:underline"
            >
              View details
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 pt-1.5">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition ${
              isLiked
                ? 'text-blue-600 bg-blue-50/60'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-blue-600' : ''}`} />
            <span>Like</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/post/${post._id}`)}
            className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comment</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

        {loadingComment && (
          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
            <span>Loading comment...</span>
          </div>
        )}

        {!loadingComment && previewComment && (
          <div className="pt-3 mt-2 border-t border-slate-100">
            <div className="flex items-start gap-2.5">
              <Avatar
                src={previewComment.commentCreator?.photo || previewComment.user?.photo}
                alt={previewComment.commentCreator?.name || previewComment.user?.name || 'User'}
                size="xs"
              />
              <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-3.5 py-2 max-w-full">
                <h5 className="text-xs font-bold text-slate-800 leading-tight">
                  {previewComment.commentCreator?.name || previewComment.user?.name || 'User'}
                </h5>
                <p className="text-xs text-slate-700 mt-0.5 leading-snug whitespace-pre-wrap break-words">
                  {previewComment.content}
                </p>
              </div>
            </div>

            {commentsCount > 1 && (
              <button
                type="button"
                onClick={() => navigate(`/post/${post._id}`)}
                className="mt-2 text-xs font-semibold text-slate-500 hover:text-blue-600 hover:underline block text-left transition"
              >
                View more comments
              </button>
            )}
          </div>
        )}
      </article>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Post">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Post Content
            </label>
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={4}
              className="w-full resize-none border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="What would you like to update?"
            />
          </div>

          {editImagePreview && (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-60">
              <img src={editImagePreview} alt="Post preview" className="w-full h-auto object-cover max-h-60" />
              <button
                type="button"
                onClick={() => {
                  setEditImageFile(null);
                  setEditImagePreview(null);
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => editFileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Change Photo</span>
            </button>
            <input
              type="file"
              ref={editFileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setEditImageFile(f);
                  setEditImagePreview(URL.createObjectURL(f));
                }
              }}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Post">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this post? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Delete Post</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toggleLikeComment, updateComment, deleteComment, getErrorMessage } from '../api';
import Avatar from './Avatar';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { Loader2, Check, X } from 'lucide-react';

function formatTimeAgo(dateString) {
  if (!dateString) return 'just now';
  const diffInSeconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (diffInSeconds < 60) return `${Math.max(0, diffInSeconds)}s`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d`;
}

export default function CommentItem({ comment, postId, onCommentUpdated, onCommentDeleted }) {
  const { user } = useAuth();

  const author = comment.commentCreator || comment.user || {};
  const isOwner = user?._id && (author._id === user._id || author === user._id);

  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [isLiked, setIsLiked] = useState(() => {
    if (comment.isLiked !== undefined) return Boolean(comment.isLiked);
    if (Array.isArray(comment.likes) && user?._id) {
      return comment.likes.some((l) => (l._id || l) === user._id);
    }
    return false;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const handleLike = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    try {
      await toggleLikeComment(postId, comment._id);
    } catch (err) {
      setIsLiked(!nextState);
      setLikesCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
      toast.error(getErrorMessage(err));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    setLoadingAction(true);
    try {
      await updateComment(postId, comment._id, { content: editContent.trim() });
      toast.success('Comment updated');
      setIsEditing(false);
      if (onCommentUpdated) onCommentUpdated();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async () => {
    setLoadingAction(true);
    try {
      await deleteComment(postId, comment._id);
      toast.success('Comment deleted');
      setShowDeleteModal(false);
      if (onCommentDeleted) onCommentDeleted(comment._id);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <>
      <div className="flex items-start gap-3 py-3 group">
        <Avatar src={author.photo} alt={author.name} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 inline-block max-w-full">
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="text-xs font-bold text-slate-800 truncate">
                {author.name || 'User'}
              </span>
              <span className="text-[10px] text-slate-400">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="mt-1 space-y-2">
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}

            {comment.image && (
              <img
                src={comment.image}
                alt="Attachment"
                className="mt-2 rounded-lg max-h-48 object-cover border border-slate-200"
              />
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 ml-2 text-[11px] text-slate-500">
            <button
              type="button"
              onClick={handleLike}
              className={`font-semibold transition hover:underline ${
                isLiked ? 'text-blue-600 font-bold' : 'hover:text-slate-800'
              }`}
            >
              Like {likesCount > 0 && `(${likesCount})`}
            </button>

            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="hover:text-slate-800 transition"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="hover:text-rose-600 transition"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Comment"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this comment?
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
              disabled={loadingAction}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {loadingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Delete</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

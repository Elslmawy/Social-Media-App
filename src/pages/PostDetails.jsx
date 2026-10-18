import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getPostById,
  getPostComments,
  createComment,
  getErrorMessage,
} from '../api';
import PostCard from '../components/PostCard';
import CommentItem from '../components/CommentItem';
import Avatar from '../components/Avatar';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState(null);
  const [commentImagePreview, setCommentImagePreview] = useState(null);
  const [postingComment, setPostingComment] = useState(false);
  const fileInputRef = useRef(null);

  const fetchPost = useCallback(async () => {
    try {
      const res = await getPostById(id);
      setPost(res.data?.post || null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingPost(false);
    }
  }, [id]);

  const fetchComments = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoadingComments(true);
    else setLoadingMore(true);

    try {
      const res = await getPostComments(id, pageNum, 10);
      const list = res.data?.comments || [];
      setComments(append ? (prev) => [...prev, ...list] : list);
      setHasMore(Boolean(res.meta?.pagination?.nextPage));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingComments(false);
      setLoadingMore(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
    fetchComments(1, false);
  }, [fetchPost, fetchComments]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCommentImage(file);
      setCommentImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setCommentImage(null);
    if (commentImagePreview) {
      URL.revokeObjectURL(commentImagePreview);
      setCommentImagePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() && !commentImage) return;

    setPostingComment(true);
    try {
      await createComment(id, {
        content: commentText.trim(),
        image: commentImage,
      });
      toast.success('Comment added');
      setCommentText('');
      removeImage();
      fetchComments(1, false);
      fetchPost();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPostingComment(false);
    }
  };

  const handleCommentDeleted = (commentId) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    fetchPost();
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 mb-4 transition group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" />
        <span>Back</span>
      </button>

      {loadingPost ? (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center shadow-2xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">Loading post...</p>
        </div>
      ) : post ? (
        <div className="space-y-4">
          <PostCard
            post={post}
            onPostUpdated={fetchPost}
            onPostDeleted={() => navigate('/feed')}
          />

          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              Comments ({comments.length})
            </h3>

            <form onSubmit={handleAddComment} className="mb-5">
              <div className="flex items-start gap-3">
                <Avatar src={user?.photo} alt={user?.name || 'User'} size="sm" />
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full pl-3 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-100 transition"
                    />

                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1 text-slate-400 hover:text-emerald-600 transition"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>

                      <button
                        type="submit"
                        disabled={postingComment || (!commentText.trim() && !commentImage)}
                        className="p-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-lg transition shadow-2xs"
                      >
                        {postingComment ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {commentImagePreview && (
                    <div className="relative mt-2 inline-block rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={commentImagePreview}
                        alt="Preview"
                        className="h-20 w-auto object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 p-0.5 bg-slate-900/70 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              </div>
            </form>

            {loadingComments ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500 inline mr-2" />
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No comments yet. Be the first to comment.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    postId={id}
                    onCommentUpdated={() => fetchComments(page, false)}
                    onCommentDeleted={handleCommentDeleted}
                  />
                ))}

                {hasMore && (
                  <div className="pt-3 text-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      {loadingMore ? 'Loading more comments...' : 'Load more comments'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-sm text-slate-500">Post not found.</p>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import SuggestedFriends from '../components/SuggestedFriends';
import { getFeedPosts, getBookmarks, getErrorMessage } from '../api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function Feed() {
  const [activeTab, setActiveTab] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');

  const fetchPosts = async (tab = activeTab, pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
      setError('');
    } else {
      setLoadingMore(true);
    }

    try {
      let res;
      if (tab === 'saved') {
        res = await getBookmarks(pageNum, 10);
        const list = res.data?.bookmarks || [];
        setPosts(append ? (prev) => [...prev, ...list] : list);
        setHasMore(Boolean(res.meta?.pagination?.nextPage));
      } else {
        const onlyParam = tab === 'all' ? '' : tab;
        res = await getFeedPosts(onlyParam, pageNum, 10);
        const list = res.data?.posts || [];
        setPosts(append ? (prev) => [...prev, ...list] : list);
        setHasMore(Boolean(res.meta?.pagination?.nextPage));
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchPosts(activeTab, 1, false);
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(activeTab, nextPage, true);
  };

  const handlePostCreated = () => {
    setPage(1);
    fetchPosts(activeTab, 1, false);
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  const handlePostUpdated = () => {
    fetchPosts(activeTab, page, false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6">
        <div className="hidden md:block md:col-span-1 lg:col-span-3 sticky top-20 self-start">
          <Sidebar activeTab={activeTab} onSelectTab={handleTabChange} />
        </div>

        <main className="col-span-1 md:col-span-3 lg:col-span-6 space-y-5">
          {activeTab !== 'saved' && (
            <CreatePost onPostCreated={handlePostCreated} />
          )}

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center shadow-2xs flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-sm font-medium text-slate-500">Loading posts...</p>
            </div>
          ) : error && posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-2xs">
              <p className="text-sm text-rose-600 font-semibold mb-2">{error}</p>
              <button
                type="button"
                onClick={() => fetchPosts(activeTab, 1, false)}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center shadow-2xs">
              <p className="text-sm text-slate-500 font-medium">
                {activeTab === 'saved'
                  ? 'No saved posts yet.'
                  : 'No posts yet. Be the first one to publish.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onPostUpdated={handlePostUpdated}
                  onPostDeleted={handlePostDeleted}
                />
              ))}

              {hasMore && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition inline-flex items-center gap-2"
                  >
                    {loadingMore && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />}
                    <span>{loadingMore ? 'Loading...' : 'Load more'}</span>
                  </button>
                </div>
              )}

              {!hasMore && (
                <p className="text-center text-xs text-slate-400 py-6 font-medium">
                  You reached the end
                </p>
              )}
            </div>
          )}
        </main>

        <div className="hidden lg:block lg:col-span-3 sticky top-20 self-start">
          <SuggestedFriends />
        </div>
      </div>
    </div>
  );
}

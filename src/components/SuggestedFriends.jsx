import { useState, useEffect } from 'react';
import { getSuggestions, searchUsers, toggleFollowUser, getErrorMessage } from '../api';
import Avatar from './Avatar';
import toast from 'react-hot-toast';
import { Users, Search, UserPlus, UserCheck, Loader2 } from 'lucide-react';

export default function SuggestedFriends() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [followingMap, setFollowingMap] = useState({});
  const [loadingActionId, setLoadingActionId] = useState(null);

  const fetchUsers = async (pageNum = 1, isSearch = false, query = '') => {
    setLoading(true);
    try {
      if (isSearch && query.trim()) {
        const res = await searchUsers(query.trim(), pageNum, 5);
        const searchList = res.data?.users || [];
        setUsers(pageNum === 1 ? searchList : (prev) => [...prev, ...searchList]);
        setHasMore(Boolean(res.meta?.pagination?.nextPage));
      } else {
        const res = await getSuggestions(pageNum, 5);
        const list = res.data?.suggestions || [];
        setUsers(pageNum === 1 ? list : (prev) => [...prev, ...list]);
        setHasMore(Boolean(res.meta?.pagination?.nextPage));
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers(1, Boolean(searchQuery), searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFollowToggle = async (userId) => {
    setLoadingActionId(userId);
    const wasFollowing = followingMap[userId];
    setFollowingMap((prev) => ({ ...prev, [userId]: !wasFollowing }));

    try {
      await toggleFollowUser(userId);
      toast.success(wasFollowing ? 'Unfollowed user' : 'User followed');
    } catch (err) {
      setFollowingMap((prev) => ({ ...prev, [userId]: wasFollowing }));
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleViewMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, Boolean(searchQuery), searchQuery);
  };

  return (
    <aside className="w-full bg-white rounded-2xl border border-slate-200/70 p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">Suggested Friends</h3>
        </div>
        <span className="w-5 h-5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full flex items-center justify-center">
          {users.length}
        </span>
      </div>

      <div className="relative mb-3.5">
        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search friends..."
          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition"
        />
      </div>

      {loading && users.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-xs">Loading suggestions...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          No suggested friends found.
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((item) => {
            const isFollowing = followingMap[item._id] ?? item.isFollowing;
            const isLoadingThis = loadingActionId === item._id;

            return (
              <div
                key={item._id}
                className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar src={item.photo} alt={item.name} size="sm" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        @{item.username || 'user'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFollowToggle(item._id)}
                    disabled={isLoadingThis}
                    className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      isFollowing
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    {isLoadingThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>

                {item.followersCount !== undefined && (
                  <span className="inline-block px-2 py-0.5 text-[10px] font-medium text-slate-500 bg-white rounded-md border border-slate-200/60 shadow-2xs">
                    {item.followersCount} followers
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {hasMore && !loading && users.length > 0 && (
        <button
          type="button"
          onClick={handleViewMore}
          className="w-full mt-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition text-center"
        >
          View more
        </button>
      )}
    </aside>
  );
}

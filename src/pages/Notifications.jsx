import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getErrorMessage,
} from '../api';
import Avatar from '../components/Avatar';
import toast from 'react-hot-toast';
import {
  Bell,
  CheckCheck,
  Heart,
  MessageSquare,
  Share2,
  UserPlus,
  Loader2,
} from 'lucide-react';

function formatTimeAgo(dateString) {
  if (!dateString) return 'just now';
  const diffInSeconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (diffInSeconds < 60) return `${Math.max(0, diffInSeconds)}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { decrementUnreadCount, clearUnreadCount, refreshUnreadCount } = useAuth();

  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotificationsList = async (unreadOnly = false) => {
    setLoading(true);
    try {
      const res = await getNotifications(unreadOnly, 1, 30);
      setNotifications(res.data?.notifications || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationsList(filter === 'unread');
    refreshUnreadCount();
  }, [filter, refreshUnreadCount]);

  const handleMarkOne = async (item) => {
    const isUnread = !item.read && !item.isRead;
    if (isUnread) {
      decrementUnreadCount(1);
      setNotifications((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, read: true, isRead: true } : n))
      );
      try {
        await markNotificationAsRead(item._id);
        refreshUnreadCount();
      } catch {
        refreshUnreadCount();
      }
    }

    const postId = item.post?._id || item.post || item.entityId;
    if (postId && typeof postId === 'string') {
      navigate(`/post/${postId}`);
    }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    clearUnreadCount();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));

    try {
      await markAllNotificationsAsRead();
      toast.success('All notifications marked as read');
      refreshUnreadCount();
    } catch (err) {
      toast.error(getErrorMessage(err));
      refreshUnreadCount();
    } finally {
      setMarkingAll(false);
    }
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-500" />;
      case 'share':
        return <Share2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-indigo-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-2xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Notifications
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Realtime updates for likes, comments, shares, and follows.
            </p>
          </div>

          <button
            type="button"
            onClick={handleMarkAll}
            disabled={markingAll || notifications.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition"
          >
            {markingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCheck className="w-3.5 h-3.5" />
            )}
            <span>Mark all as read</span>
          </button>
        </div>

        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filter === 'unread'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
            <span className="text-xs font-medium">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-500">No notifications yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              You will be notified when people interact with your profile or posts.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((item) => {
              const actor = item.actor || item.sender || {};
              const isRead = item.read ?? item.isRead ?? false;

              return (
                <div
                  key={item._id}
                  onClick={() => handleMarkOne(item)}
                  className={`p-4 flex items-start gap-3.5 hover:bg-slate-50 cursor-pointer transition ${
                    !isRead ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar src={actor.photo} alt={actor.name} size="md" />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-2xs">
                      {renderIcon(item.type)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-800 leading-snug">
                      <span className="font-bold text-slate-900 mr-1">
                        {actor.name || 'Someone'}
                      </span>
                      {item.message ||
                        (item.type === 'like'
                          ? 'liked your post'
                          : item.type === 'comment'
                          ? 'commented on your post'
                          : item.type === 'share'
                          ? 'shared your post'
                          : item.type === 'follow'
                          ? 'started following you'
                          : 'interacted with your content')}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </div>

                  {!isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

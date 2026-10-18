import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getProfileData,
  getFeedPosts,
  getBookmarks,
  uploadProfilePhoto,
  uploadCoverPhoto,
  getErrorMessage,
} from '../api';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';
import {
  Users,
  Mail,
  CheckCircle,
  Camera,
  Loader2,
  Bookmark,
  Sparkles,
} from 'lucide-react';

export default function Profile() {
  const { user: authUser, updateUser, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(authUser || null);
  const [loading, setLoading] = useState(!authUser);

  const [activeTab, setActiveTab] = useState('my_posts');
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const photoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const [profileRes, myPostsRes, savedRes] = await Promise.all([
        getProfileData(),
        getFeedPosts('me', 1, 20),
        getBookmarks(1, 20),
      ]);

      if (profileRes.data?.user) {
        setProfile(profileRes.data.user);
        updateUser(profileRes.data.user);
      }
      setMyPosts(myPostsRes.data?.posts || []);
      setSavedPosts(savedRes.data?.bookmarks || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
      setLoadingPosts(false);
    }
  }, [updateUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      await uploadProfilePhoto(file);
      toast.success('Profile photo updated successfully!');
      await refreshProfile();
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      await uploadCoverPhoto(file);
      toast.success('Cover photo updated successfully!');
      await refreshProfile();
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingCover(false);
    }
  };

  const currentPosts = activeTab === 'my_posts' ? myPosts : savedPosts;

  if (loading && !profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Loading profile...</p>
      </div>
    );
  }

  const followersCount = profile?.followersCount ?? profile?.followers?.length ?? 0;
  const followingCount = profile?.followingCount ?? profile?.following?.length ?? 0;
  const bookmarksCount = profile?.bookmarksCount ?? profile?.bookmarks?.length ?? savedPosts.length ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="rounded-3xl overflow-hidden bg-transparent">
        <div
          className="h-56 sm:h-72 w-full rounded-t-3xl relative overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: profile?.cover
              ? `url(${profile.cover})`
              : 'linear-gradient(135deg, #0b2545 0%, #134074 50%, #1d4ed8 100%)',
          }}
        >
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute top-4 right-4 px-3 py-1.5 bg-slate-900/60 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition shadow-sm"
          >
            {uploadingCover ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
            <span>{uploadingCover ? 'Uploading...' : 'Change Cover'}</span>
          </button>
          <input
            type="file"
            ref={coverInputRef}
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />
        </div>

        <div className="bg-white rounded-b-3xl -mt-16 sm:-mt-20 pt-0 px-6 sm:px-10 pb-8 shadow-sm border border-slate-200/70 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              <div className="relative group shrink-0">
                <Avatar
                  src={profile?.photo}
                  alt={profile?.name || 'User'}
                  size="2xl"
                  className="w-28 h-28 sm:w-36 sm:h-36 border-4 border-white shadow-lg"
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-1 right-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition"
                  title="Upload profile photo"
                >
                  {uploadingPhoto ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="file"
                  ref={photoInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <div className="text-center sm:text-left pb-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {profile?.name}
                </h2>
                <p className="text-sm text-slate-400 font-medium">@{profile?.username}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full mt-2.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Route Posts member</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 self-center lg:self-end w-full lg:w-auto">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center min-w-[100px]">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Followers
                </span>
                <span className="text-2xl font-extrabold text-slate-900">{followersCount}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center min-w-[100px]">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Following
                </span>
                <span className="text-2xl font-extrabold text-slate-900">{followingCount}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center min-w-[100px]">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Bookmarks
                </span>
                <span className="text-2xl font-extrabold text-slate-900">{bookmarksCount}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100">
            <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">About</h4>
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{profile?.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Active on Route Posts</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-5 flex flex-col justify-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  My Posts
                </span>
                <span className="text-2xl font-extrabold text-slate-900 mt-2">
                  {myPosts.length}
                </span>
              </div>
              <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-5 flex flex-col justify-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Saved Posts
                </span>
                <span className="text-2xl font-extrabold text-slate-900 mt-2">
                  {savedPosts.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('my_posts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === 'my_posts'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>My Posts ({myPosts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === 'saved'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved ({savedPosts.length})</span>
          </button>
        </div>

        {loadingPosts ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
            <span className="text-xs">Loading posts...</span>
          </div>
        ) : currentPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center shadow-2xs">
            <p className="text-sm font-medium text-slate-400">
              {activeTab === 'my_posts' ? 'No posts yet.' : 'No saved posts yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {currentPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostUpdated={loadData}
                onPostDeleted={loadData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

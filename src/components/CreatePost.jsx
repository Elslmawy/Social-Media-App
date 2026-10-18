import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createPost, getErrorMessage } from '../api';
import Avatar from './Avatar';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';
import { Image as ImageIcon, Smile, Send, X, Loader2 } from 'lucide-react';

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const pickerRef = useRef(null);

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  // Close emoji picker on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showEmojiPicker]);

  // Insert emoji at cursor position and maintain focus
  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    if (!textareaRef.current) {
      setBody((prev) => prev + emoji);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart ?? body.length;
    const end = textarea.selectionEnd ?? body.length;
    const newBody = body.substring(0, start) + emoji + body.substring(end);
    setBody(newBody);

    requestAnimationFrame(() => {
      textarea.focus();
      const newCursor = start + emoji.length;
      textarea.setSelectionRange(newCursor, newCursor);
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim() && !imageFile) return;

    setLoading(true);
    setShowEmojiPicker(false);

    try {
      await createPost({
        body: body.trim(),
        image: imageFile,
        privacy,
      });
      toast.success('Post published successfully!');
      setBody('');
      removeImage();
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-2xs transition">
      <div className="flex items-center gap-3 mb-3">
        <Avatar src={user?.photo} alt={user?.name || 'User'} size="md" />
        <div>
          <h4 className="text-sm font-bold text-slate-800 leading-snug">{user?.name}</h4>
          <div className="relative inline-block mt-0.5">
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200/80 rounded-lg px-2 py-0.5 border-none focus:ring-1 focus:ring-blue-400 outline-none cursor-pointer pr-5 appearance-none"
            >
              <option value="public">Public</option>
              <option value="followers">Followers</option>
              <option value="only_me">Only me</option>
            </select>
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
              ▼
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`What's on your mind, ${firstName}?`}
          rows={3}
          className="w-full resize-none border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
        />
      </div>

      {imagePreview && (
        <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-200 group max-h-72">
          <img src={imagePreview} alt="Upload preview" className="w-full h-auto object-cover max-h-72" />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 w-7 h-7 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full flex items-center justify-center transition shadow-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition"
          >
            <ImageIcon className="w-4 h-4 text-emerald-500" />
            <span>Photo/video</span>
          </button>

          <div className="relative" ref={pickerRef}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition ${
                showEmojiPicker
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-amber-600 hover:bg-amber-50'
              }`}
            >
              <Smile className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Feeling/activity</span>
            </button>

            {showEmojiPicker && (
              <div className="absolute left-0 top-full mt-2 z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-200 bg-white animate-in fade-in zoom-in-95 duration-150">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  autoFocusSearch={false}
                  width={320}
                  height={400}
                  searchPlaceHolder="Search emojis..."
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || (!body.trim() && !imageFile)}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition shadow-xs"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            <>
              <span>Post</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

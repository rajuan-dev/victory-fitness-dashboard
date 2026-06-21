import React, { useEffect, useMemo, useState } from 'react';
import { FaPhotoVideo, FaPlus, FaTrash } from 'react-icons/fa';
import { BiBroadcast } from 'react-icons/bi';
import { adminApiRequest } from '../../../services/auth.service';
import { uploadAdminCommunityVideo } from '../../../services/admin-workouts.service';

const TIER_OPTIONS = [
  { label: 'All Users (Global)', value: 'ALL' },
  { label: 'Silver Only', value: 'SILVER' },
  { label: 'Gold Only', value: 'GOLD' },
  { label: 'Platinum Only', value: 'PLATINUM' },
  { label: 'Inner Circle Only', value: 'INNER_CIRCLE' },
];

const EMPTY_FORM = {
  tier: 'ALL',
  message: '',
};

const formatPostDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString();
};

const getVideoRenderMode = (url) => {
  const normalizedUrl = String(url || '').trim();
  if (!normalizedUrl) {
    return 'none';
  }
  if (
    normalizedUrl.startsWith('https://player.vimeo.com/video/') ||
    normalizedUrl.startsWith('https://www.youtube.com/embed/') ||
    normalizedUrl.startsWith('https://www.youtube-nocookie.com/embed/')
  ) {
    return 'embed';
  }
  if (/\.(mp4|mov|m4v|webm|mp3|m4a|wav|ogg)(\?|$)/i.test(normalizedUrl)) {
    return 'direct';
  }
  return 'direct';
};

const normalizeExternalVideoUrl = (url) => {
  const normalizedUrl = String(url || '').trim();
  if (!normalizedUrl) {
    return '';
  }
  try {
    const parsed = new URL(normalizedUrl);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname || '';

    if (host === 'youtu.be') {
      const videoId = path.replace(/^\/+/, '').split('/')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0` : '';
    }
    if (host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com') {
      const videoId = path.startsWith('/embed/')
        ? path.split('/embed/')[1]?.split('/')[0]
        : path.startsWith('/shorts/')
          ? path.split('/shorts/')[1]?.split('/')[0]
          : parsed.searchParams.get('v') || '';
      return videoId ? `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0` : '';
    }
    if (host === 'player.vimeo.com' && path.startsWith('/video/')) {
      const videoId = path.split('/video/')[1]?.split('/')[0] || '';
      return videoId ? `https://player.vimeo.com/video/${videoId}?playsinline=1&title=0&byline=0&portrait=0&dnt=1` : '';
    }
    if (host === 'vimeo.com' || host === 'www.vimeo.com') {
      const match = path.match(/\/(\d+)(?:$|[/?#])/);
      return match?.[1]
        ? `https://player.vimeo.com/video/${match[1]}?playsinline=1&title=0&byline=0&portrait=0&dnt=1`
        : '';
    }
  } catch {
    return '';
  }
  return '';
};

const getExternalVideoLinkError = (message) => {
  const normalized = String(message || '').trim();
  if (
    normalized === 'Only YouTube and Vimeo links are supported' ||
    normalized === 'Only valid YouTube and Vimeo links are supported' ||
    normalized === 'That YouTube link is not valid' ||
    normalized === 'That Vimeo link is not valid' ||
    normalized === 'Video link is empty' ||
    normalized === 'Use a direct media file URL if you want the file stored in S3' ||
    normalized === 'Only direct media file URLs can be stored in S3'
  ) {
    return 'Use a valid video link. Supported: YouTube, Vimeo, or a direct MP4/MOV/WEBM file URL.';
  }
  return normalized || 'Failed to save community post';
};

const Community = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [externalVideoUrl, setExternalVideoUrl] = useState('');
  const [clearMedia, setClearMedia] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentSubmitting, setCommentSubmitting] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submitLabel = useMemo(() => (editingPostId ? 'Save Changes' : 'Send Broadcast to Tier'), [editingPostId]);

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApiRequest('/admin/community/posts');
      setPosts(Array.isArray(response?.posts) ? response.posts : []);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingPostId('');
    setSelectedMedia(null);
    setMediaPreview('');
    setExternalVideoUrl('');
    setClearMedia(false);
  };

  const handleMediaChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.includes(',') ? result.split(',')[1] : '';
      const isVideo = (file.type || '').startsWith('video/');
      setSelectedMedia({
        image_base64: isVideo ? undefined : base64,
        file: isVideo ? file : undefined,
        mime_type: file.type || 'image/jpeg',
        file_name: file.name || (isVideo ? 'community-video.mp4' : 'community-image.jpg'),
        media_kind: isVideo ? 'video' : 'image',
      });
      setMediaPreview(result);
      setExternalVideoUrl('');
      setClearMedia(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const content = form.message.trim();
    const normalizedExternalVideoUrl = normalizeExternalVideoUrl(externalVideoUrl) || externalVideoUrl.trim();
    if (!content) {
      setError('Message content is required');
      return;
    }
    if (selectedMedia && normalizedExternalVideoUrl) {
      setError('Choose an upload or paste a video link, not both');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const uploadedCommunityVideoUrl =
        selectedMedia?.media_kind === 'video' && selectedMedia?.file
          ? await uploadAdminCommunityVideo(selectedMedia.file)
          : '';
      const mediaPayload = selectedMedia
        ? {
            image_base64: selectedMedia.image_base64,
            mime_type: selectedMedia.mime_type,
            file_name: selectedMedia.file_name,
          }
        : {};
      if (editingPostId) {
        await adminApiRequest(`/admin/community/posts/${editingPostId}`, {
          method: 'PATCH',
          body: {
            content,
            audience: form.tier,
            clear_image: clearMedia,
            clear_media: clearMedia,
            external_video_url: uploadedCommunityVideoUrl || normalizedExternalVideoUrl || undefined,
            ...mediaPayload,
          },
        });
        setSuccess('Community post updated');
      } else {
        await adminApiRequest('/admin/community/posts', {
          method: 'POST',
          body: {
            content,
            audience: form.tier,
            external_video_url: uploadedCommunityVideoUrl || normalizedExternalVideoUrl || undefined,
            ...mediaPayload,
          },
        });
        setSuccess('Community post published');
      }

      resetForm();
      await loadPosts();
    } catch (saveError) {
      setError(getExternalVideoLinkError(saveError.message));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPostId(post.id);
    setForm({
      tier: post.audience || 'ALL',
      message: post.content || '',
    });
    setSelectedMedia(null);
    setMediaPreview(post.video_url || post.image_url || '');
    setExternalVideoUrl(getVideoRenderMode(post.video_url) === 'embed' ? post.video_url : '');
    setClearMedia(false);
    setSuccess('');
    setError('');
  };

  const handleDelete = async (postId) => {
    setDeletingPostId(postId);
    setError('');
    setSuccess('');
    try {
      await adminApiRequest(`/admin/community/posts/${postId}`, {
        method: 'DELETE',
      });
      if (editingPostId === postId) {
        resetForm();
      }
      setSuccess('Community post deleted');
      await loadPosts();
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete community post');
    } finally {
      setDeletingPostId('');
    }
  };

  const handleSubmitComment = async (postId) => {
    const content = (commentDrafts[postId] || '').trim();
    if (!content || commentSubmitting[postId]) {
      return;
    }

    setCommentSubmitting((current) => ({ ...current, [postId]: true }));
    setError('');
    setSuccess('');
    try {
      const response = await adminApiRequest(`/community/posts/${postId}/comments`, {
        method: 'POST',
        body: { content },
      });

      setCommentDrafts((current) => ({ ...current, [postId]: '' }));
      setExpandedComments((current) => ({ ...current, [postId]: true }));
      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                comment_count: (post.comment_count || 0) + 1,
                comments: [...(post.comments || []), response].slice(-6),
              }
            : post
        )
      );
      setSuccess('Comment added');
    } catch (commentError) {
      setError(commentError.message || 'Failed to add comment');
    } finally {
      setCommentSubmitting((current) => ({ ...current, [postId]: false }));
    }
  };

  return (
    <div className="flex flex-col space-y-8 pt-2 h-full text-slate-100 w-full pb-10">
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <BiBroadcast className="text-teal-400 text-2xl" />
          <h2 className="text-lg font-bold text-teal-400">
            {editingPostId ? 'Edit Community Post' : 'Send Tier Broadcast'}
          </h2>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-tight mb-2">Target Tier</label>
            <select
              value={form.tier}
              onChange={(e) => setForm((current) => ({ ...current, tier: e.target.value }))}
              className="w-full bg-[#0f172a] border border-[#334155] text-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 cursor-pointer"
              style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%2394a3b8" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              {TIER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="block">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-2">Media</span>
              <span className="flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-[#151e32] border border-[#334155] transition-colors rounded-lg px-4 py-2.5 text-sm text-slate-300 w-full md:w-auto h-[46px] cursor-pointer">
                <FaPhotoVideo className="text-slate-400" />
                <span>{selectedMedia || mediaPreview ? 'Change' : 'Add'}</span>
              </span>
              <input type="file" accept="image/*,video/mp4,video/quicktime,video/webm" className="hidden" onChange={handleMediaChange} />
            </label>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-2">Post Type</label>
              <div className="flex items-center justify-center gap-2 bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-slate-300 w-full md:w-auto h-[46px]">
                <FaPlus className="text-slate-400 text-xs" />
                <span>{editingPostId ? 'Update' : 'Broadcast'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-tight mb-2">Message Content</label>
          <textarea
            rows={4}
            placeholder="Share tips, notes, or announcements with this tier..."
            className="w-full bg-[#0f172a] border border-[#334155] text-slate-200 rounded-lg p-4 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 resize-y placeholder:text-slate-500"
            value={form.message}
            onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))}
          />
        </div>

        <div className="mb-4">
          <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-tight mb-2">Video Link</label>
          <input
            type="url"
            value={externalVideoUrl}
            placeholder="Paste a YouTube, Vimeo, or direct video file URL"
            onChange={(e) => {
              const value = e.target.value;
              setExternalVideoUrl(value);
              if (value.trim()) {
                setSelectedMedia(null);
                setMediaPreview('');
              }
            }}
            className="w-full bg-[#0f172a] border border-[#334155] text-slate-200 rounded-lg px-4 py-3 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 placeholder:text-slate-500"
          />
          <p className="mt-2 text-[11px] leading-4 text-slate-500">
            Supported: YouTube watch/share/shorts, Vimeo links, and direct MP4/MOV/WEBM file URLs.
          </p>
        </div>

        {mediaPreview ? (
          <div className="mb-6 rounded-xl border border-[#334155] bg-[#0f172a] p-3">
            {selectedMedia?.media_kind === 'video' || (!selectedMedia && /\.(mp4|mov|webm)(\?|$)/i.test(mediaPreview)) ? (
              <video src={mediaPreview} controls className="w-full max-h-64 rounded-lg bg-black" />
            ) : (
              <img src={mediaPreview} alt="Community upload preview" className="w-full max-h-64 object-cover rounded-lg" />
            )}
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedMedia(null);
                  setMediaPreview('');
                  setClearMedia(true);
                }}
                className="text-xs text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                Remove media
              </button>
            </div>
          </div>
        ) : null}

        {!mediaPreview && externalVideoUrl ? (
          <div className="mb-6 rounded-xl border border-[#334155] bg-[#0f172a] p-3">
            {getVideoRenderMode(normalizeExternalVideoUrl(externalVideoUrl) || externalVideoUrl) === 'embed' ? (
              <iframe
                src={normalizeExternalVideoUrl(externalVideoUrl) || externalVideoUrl}
                title="External community video preview"
                className="w-full h-64 rounded-lg bg-black"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <video
                src={externalVideoUrl}
                controls
                className="w-full max-h-64 rounded-lg bg-black"
              />
            )}
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setExternalVideoUrl('');
                  setClearMedia(true);
                }}
                className="text-xs text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                Remove link
              </button>
            </div>
          </div>
        ) : null}

        {error ? <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
        {success ? <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div> : null}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-[#283648] hover:bg-[#33445a] text-[#c7d7ed] font-semibold py-3 rounded-lg transition-colors border border-[#324357] disabled:opacity-60"
          >
            {saving ? 'Saving...' : submitLabel}
          </button>
          {editingPostId ? (
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="bg-transparent border border-[#334155] text-slate-300 px-5 py-3 rounded-lg hover:bg-[#111827] transition-colors"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-white tracking-wide">Recent Community Activity</h2>
          <span className="bg-[#243142] border border-[#334155] text-slate-400 text-[11px] font-semibold px-3 py-1 rounded-full">
            {posts.length} Posts
          </span>
        </div>

        {loading ? <div className="text-sm text-slate-400">Loading community posts...</div> : null}

        {!loading && posts.length === 0 ? (
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 text-sm text-slate-300">
            No community posts yet.
          </div>
        ) : null}

        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 flex flex-col hover:border-slate-500 transition-colors relative group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    {post.author_profile_image ? (
                      <img
                        src={post.author_profile_image}
                        alt={post.author_name || "Author"}
                        className="w-8 h-8 rounded-full object-cover border border-[#334155] shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#0cd7d3] flex items-center justify-center font-bold text-[#0f172a] text-sm shrink-0">
                        {(post.author_name || 'A').slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold text-white text-sm">{post.author_name}</span>
                    <span className="text-[11px] text-slate-400">{formatPostDate(post.created_at)}</span>
                    <span className="bg-[#2a374a] text-[#9baec2] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {post.audience}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">{post.author_role}</span>
                  </div>
                  <p className="text-[13px] text-slate-300 pl-11 whitespace-pre-wrap">{post.content}</p>
                  {post.image_url ? (
                    <div className="pl-11">
                      <img src={post.image_url} alt="Community post" className="mt-1 max-h-64 rounded-lg border border-[#334155] object-cover" />
                    </div>
                  ) : post.video_url ? (
                    <div className="pl-11">
                      {getVideoRenderMode(post.video_url) === 'embed' ? (
                        <iframe
                          src={post.video_url}
                          title={`Community video ${post.id}`}
                          className="mt-1 h-64 w-full rounded-lg border border-[#334155] bg-black"
                          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                        />
                      ) : (
                        <video src={post.video_url} controls className="mt-1 max-h-64 rounded-lg border border-[#334155] bg-black" />
                      )}
                    </div>
                  ) : null}

                  <div className="pl-11 pt-2">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>{post.like_count || 0} reactions</span>
                      <span>{post.comment_count || 0} comments</span>
                    </div>

                    {(post.reactions?.length ?? 0) > 0 ? (
                      <div className="mt-3 rounded-xl border border-[#334155] bg-[#0f172a] px-3 py-3">
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Reacted By
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {post.reactions.map((reaction) => (
                            <div
                              key={`${post.id}-${reaction.user_id}-${reaction.created_at}`}
                              className="flex items-center gap-2 rounded-full border border-[#334155] bg-[#111827] px-2.5 py-1.5"
                            >
                              {reaction.user_profile_image ? (
                                <img
                                  src={reaction.user_profile_image}
                                  alt={reaction.user_name}
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-[#334155] flex items-center justify-center text-[10px] font-bold text-white">
                                  {(reaction.user_name || "U").slice(0, 1).toUpperCase()}
                                </div>
                              )}
                              <span className="text-[11px] text-slate-200">{reaction.user_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedComments((current) => ({
                          ...current,
                          [post.id]: !current[post.id],
                        }))
                      }
                      className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {expandedComments[post.id] ? 'Hide comments' : `Comments (${post.comment_count || 0})`}
                    </button>

                    {(expandedComments[post.id] || (post.comments?.length ?? 0) > 0) ? (
                      <div className="mt-3 space-y-3">
                        {(post.comments || []).map((comment) => (
                          <div key={comment.id} className="flex items-start gap-3">
                            {comment.author_profile_image ? (
                              <img
                                src={comment.author_profile_image}
                                alt={comment.author_name}
                                className="w-7 h-7 rounded-full object-cover border border-[#334155]"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[#334155] flex items-center justify-center text-[11px] font-bold text-white">
                                {(comment.author_name || 'A').slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 rounded-xl bg-[#0f172a] border border-[#334155] px-3 py-2">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-white">{comment.author_name}</span>
                                <span className="text-[11px] text-slate-400">{formatPostDate(comment.created_at)}</span>
                              </div>
                              <p className="text-xs text-slate-300 whitespace-pre-wrap">{comment.content}</p>
                            </div>
                          </div>
                        ))}

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={commentDrafts[post.id] || ''}
                            onChange={(e) =>
                              setCommentDrafts((current) => ({
                                ...current,
                                [post.id]: e.target.value,
                              }))
                            }
                            placeholder="Write an admin comment..."
                            className="flex-1 bg-[#0f172a] border border-[#334155] text-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 placeholder:text-slate-500 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => handleSubmitComment(post.id)}
                            disabled={commentSubmitting[post.id]}
                            className="bg-teal-400 text-slate-950 font-semibold px-4 py-2.5 rounded-lg disabled:opacity-60"
                          >
                            {commentSubmitting[post.id] ? '...' : 'Send'}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(post)}
                    className="text-xs text-slate-300 border border-[#334155] px-3 py-1.5 rounded-lg hover:bg-[#111827] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingPostId === post.id}
                    className="text-slate-500 hover:text-red-300 p-2 transition-colors"
                    aria-label="Delete post"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;

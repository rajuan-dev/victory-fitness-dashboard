import { useEffect, useMemo, useRef, useState } from 'react';
import { 
  FaFileAudio, 
  FaMicrophone, 
  FaPhotoVideo, 
  FaStop, 
  FaTrash, 
  FaChevronRight, 
  FaHeart, 
  FaRegHeart, 
  FaComment, 
  FaRegComment, 
  FaShare, 
  FaTrophy, 
  FaHashtag, 
  FaShieldAlt, 
  FaPlus, 
  FaTimes, 
  FaRegImage, 
  FaVideo 
} from 'react-icons/fa';
import { BiBroadcast } from 'react-icons/bi';
import { FiRefreshCw } from 'react-icons/fi';
import { IoSendOutline } from 'react-icons/io5';
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
  postType: 'text',
};

const DEMO_SEED_POSTS = [
  {
    id: 'demo-post-1',
    author_id: 'author-1',
    author_name: 'Marcus Thorne',
    author_role: 'GOLD',
    author_profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    author_handle: '@m_thorne_fit',
    content: 'Hit a new PR on deadlifts today! 455lbs for a triple. The morning stack of oats and the new pre-workout really made the difference. Shoutout to Coach Alex for the form corrections last week. #DeadliftDay #Gainz #FitAdminPro',
    image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop',
    like_count: 124,
    comment_count: 18,
    share_count: 5,
    viewer_has_liked: false,
    can_delete: false,
    audience: 'GOLD',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    comments: [
      {
        id: 'demo-comment-1-1',
        author_name: 'Coach Alex',
        author_profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
        content: 'Solid form Marcus! Keep pushing hard.',
        created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'demo-post-2',
    author_id: 'author-2',
    author_name: 'Sarah Jenkins',
    author_role: 'SILVER',
    author_profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
    author_handle: '@s_jenkins_yoga',
    content: '"The only bad workout is the one that didn\'t happen." Really feeling that today after pushing through a 6 AM mobility session when I just wanted to hit snooze. Consistency > Intensity.',
    like_count: 82,
    comment_count: 12,
    share_count: 0,
    viewer_has_liked: false,
    can_delete: false,
    audience: 'SILVER',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    comments: []
  },
  {
    id: 'demo-post-3',
    author_id: 'author-3',
    author_name: 'Alex River',
    author_role: 'GOLD',
    author_profile_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop',
    author_handle: '@alex_river',
    author_member_no: '#842',
    content: 'Finally hit my PR on deadlifts today! This studio has the best energy early in the morning. Thanks for the tips @CoachSarah!',
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
    like_count: 45,
    comment_count: 5,
    share_count: 2,
    viewer_has_liked: false,
    can_delete: false,
    audience: 'GOLD',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    comments: []
  }
];

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
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef(null);
  const recordingStreamRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const [clearMedia, setClearMedia] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentSubmitting, setCommentSubmitting] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering states
  const [tierFilter, setTierFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [periodFilter, setPeriodFilter] = useState('ALL');
  const [hashtagFilter, setHashtagFilter] = useState(null);

  // Flagging system states
  const [flaggedPostIds, setFlaggedPostIds] = useState([]);
  const [baseFlaggedCount, setBaseFlaggedCount] = useState(0);
  const [topContributors, setTopContributors] = useState([]);
  const [trendingHashtags, setTrendingHashtags] = useState([]);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'guidelines' or 'announcements' or null

  // Broadcast Creator card visibility
  const [showBroadcastCreator, setShowBroadcastCreator] = useState(true);

  const submitLabel = useMemo(() => (editingPostId ? 'Save Changes' : 'Send Broadcast to Tier'), [editingPostId]);

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const [response, contributorsResponse, trendingResponse, shortcutsResponse] = await Promise.all([
        adminApiRequest('/admin/community/feed'),
        adminApiRequest('/admin/community/top-contributors').catch(() => ({ contributors: [] })),
        adminApiRequest('/admin/community/trending').catch(() => ({ hashtags: [] })),
        adminApiRequest('/admin/community/shortcuts').catch(() => ({ items: [] })),
      ]);
      const apiPosts = Array.isArray(response?.posts) ? response.posts : [];
      
      // Combine API posts with the seed posts
      setPosts([...apiPosts, ...DEMO_SEED_POSTS]);
      setFlaggedPostIds(apiPosts.filter((post) => post.flagged).map((post) => post.id));
      setTopContributors(Array.isArray(contributorsResponse?.contributors) ? contributorsResponse.contributors : []);
      setTrendingHashtags(Array.isArray(trendingResponse?.hashtags) ? trendingResponse.hashtags : []);
      const flaggedShortcut = Array.isArray(shortcutsResponse?.items) ? shortcutsResponse.items.find((item) => item.key === 'flagged_posts') : null;
      setBaseFlaggedCount(Number(flaggedShortcut?.count || 0));
    } catch (loadError) {
      setError(loadError.message || 'Failed to load community posts');
      setPosts(DEMO_SEED_POSTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const resetForm = () => {
    if (recording) {
      recorderRef.current?.stop();
    }
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    setRecording(false);
    setForm(EMPTY_FORM);
    setEditingPostId('');
    setSelectedMedia(null);
    setMediaPreview('');
    setExternalVideoUrl('');
    setClearMedia(false);
    setShowBroadcastCreator(false);
  };

  const handlePostTypeChange = (postType) => {
    if (recording) {
      recorderRef.current?.stop();
      recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
      setRecording(false);
    }
    setForm((current) => ({ ...current, postType }));
    setSelectedMedia(null);
    setMediaPreview('');
    setExternalVideoUrl('');
    setClearMedia(false);
  };

  const toggleVoiceRecording = async () => {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Voice recording is not supported in this browser. Upload an audio file instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm' });
      recordingStreamRef.current = stream;
      recordingChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordingChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const result = typeof reader.result === 'string' ? reader.result : '';
          setSelectedMedia({ audio_base64: result.split(',')[1] || '', mime_type: blob.type || 'audio/webm', file_name: 'community-voice.webm', media_kind: 'audio' });
          setMediaPreview(URL.createObjectURL(blob));
          setExternalVideoUrl('');
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((track) => track.stop());
        recordingStreamRef.current = null;
        setRecording(false);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setError('');
    } catch (recordError) {
      setError(recordError.message || 'Microphone permission was not granted.');
    }
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
      const isAudio = (file.type || '').startsWith('audio/');
      setSelectedMedia({
        image_base64: isVideo || isAudio ? undefined : base64,
        file: isVideo ? file : undefined,
        mime_type: file.type || 'image/jpeg',
        file_name: file.name || (isVideo ? 'community-video.mp4' : isAudio ? 'community-audio.mp3' : 'community-image.jpg'),
        media_kind: isVideo ? 'video' : isAudio ? 'audio' : 'image',
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
            audio_base64: selectedMedia.audio_base64,
          }
        : {};
      if (editingPostId) {
        const isDemo = String(editingPostId).startsWith('demo-');
        if (isDemo) {
          // Simulate locally
          setPosts(prev => prev.map(p => {
            if (p.id === editingPostId) {
              return {
                ...p,
                content,
                audience: form.tier,
                image_url: form.postType === 'image' && mediaPreview ? mediaPreview : p.image_url,
                video_url: form.postType === 'video' && (uploadedCommunityVideoUrl || normalizedExternalVideoUrl) ? (uploadedCommunityVideoUrl || normalizedExternalVideoUrl) : p.video_url,
                audio_url: form.postType === 'audio' && mediaPreview ? mediaPreview : p.audio_url,
              };
            }
            return p;
          }));
        } else {
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
        }
        setSuccess('Community post updated');
      } else {
        // Create new post
        const res = await adminApiRequest('/admin/community/broadcast', {
          method: 'POST',
          body: {
            content,
            audience: form.tier,
            external_video_url: uploadedCommunityVideoUrl || normalizedExternalVideoUrl || undefined,
            ...mediaPayload,
          },
        });
        setPosts(prev => [res, ...prev]);
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
      postType: post.video_url ? 'video' : post.image_url ? 'image' : post.audio_url ? 'audio' : 'text',
    });
    setSelectedMedia(null);
    setMediaPreview(post.video_url || post.image_url || '');
    setExternalVideoUrl(getVideoRenderMode(post.video_url) === 'embed' ? post.video_url : '');
    setClearMedia(false);
    setSuccess('');
    setError('');
    setShowBroadcastCreator(true);
  };

  const handleDelete = async (postId) => {
    setDeletingPostId(postId);
    setError('');
    setSuccess('');
    try {
      const isDemo = String(postId).startsWith('demo-');
      if (isDemo) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        await adminApiRequest(`/admin/community/posts/${postId}`, {
          method: 'DELETE',
        });
        if (editingPostId === postId) {
          resetForm();
        }
      }
      setSuccess('Community post deleted');
      await loadPosts();
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete community post');
    } finally {
      setDeletingPostId('');
    }
  };

  const handleToggleLike = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isDemo = String(postId).startsWith('demo-');
    if (isDemo) {
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const nextLiked = !p.viewer_has_liked;
          return {
            ...p,
            viewer_has_liked: nextLiked,
            like_count: nextLiked ? p.like_count + 1 : p.like_count - 1
          };
        }
        return p;
      }));
    } else {
      try {
        const res = await adminApiRequest(`/community/posts/${postId}/reactions/toggle`, {
          method: 'POST'
        });
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              viewer_has_liked: res.viewer_has_liked,
              like_count: res.like_count
            };
          }
          return p;
        }));
      } catch (err) {
        setError(err.message || 'Failed to toggle like');
      }
    }
  };

  const handleToggleFlag = async (postId) => {
    const isFlagged = flaggedPostIds.includes(postId);
    if (!String(postId).startsWith('demo-')) {
      try {
        await adminApiRequest(`/admin/community/posts/${postId}`, {
          method: 'PATCH',
          body: { flagged: !isFlagged, flag_reason: !isFlagged ? 'Admin review' : '' },
        });
      } catch (flagError) {
        setError(flagError.message || 'Failed to update post flag');
        return;
      }
    }
    if (isFlagged) {
      setFlaggedPostIds(prev => prev.filter(id => id !== postId));
      setSuccess('Post unflagged');
    } else {
      setFlaggedPostIds(prev => [...prev, postId]);
      setSuccess('Post flagged for review');
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
      const isDemo = String(postId).startsWith('demo-');
      let response;
      if (isDemo) {
        response = {
          id: `demo-comment-${Date.now()}`,
          author_name: 'Admin',
          author_profile_image: '/userimg.png',
          content,
          created_at: new Date().toISOString()
        };
      } else {
        response = await adminApiRequest(`/community/posts/${postId}/comments`, {
          method: 'POST',
          body: { content },
        });
      }

      setCommentDrafts((current) => ({ ...current, [postId]: '' }));
      setExpandedComments((current) => ({ ...current, [postId]: true }));
      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                comment_count: (post.comment_count || 0) + 1,
                comments: [...(post.comments || []), response],
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

  // Filter feed logic
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // 1. Tier Filter
      if (tierFilter !== 'ALL') {
        if (post.audience !== tierFilter) return false;
      }

      // 2. Type Filter
      if (typeFilter === 'FLAGGED') {
        if (!flaggedPostIds.includes(post.id)) return false;
      } else if (typeFilter === 'TEXT') {
        if (post.image_url || post.video_url || post.audio_url) return false;
      } else if (typeFilter === 'IMAGE') {
        if (!post.image_url) return false;
      } else if (typeFilter === 'VIDEO') {
        if (!post.video_url) return false;
      }

      // 3. Period Filter
      if (periodFilter !== 'ALL') {
        const postDate = new Date(post.created_at).getTime();
        const now = Date.now();
        if (periodFilter === '24h') {
          if (now - postDate > 24 * 60 * 60 * 1000) return false;
        } else if (periodFilter === '7d') {
          if (now - postDate > 7 * 24 * 60 * 60 * 1000) return false;
        } else if (periodFilter === '30d') {
          if (now - postDate > 30 * 24 * 60 * 60 * 1000) return false;
        }
      }

      // 4. Hashtag filter
      if (hashtagFilter) {
        const tag = hashtagFilter.toLowerCase();
        const contentStr = String(post.content || '').toLowerCase();
        if (!contentStr.includes(tag)) return false;
      }

      return true;
    });
  }, [posts, tierFilter, typeFilter, periodFilter, flaggedPostIds, hashtagFilter]);

  return (
    <div className="-m-3 flex min-h-full w-[calc(100%+1.5rem)] flex-col space-y-6 bg-[#0b1428] p-3 pt-2 text-slate-100 pb-10 sm:-m-4 sm:w-[calc(100%+2rem)] sm:p-4 lg:-m-6 lg:w-[calc(100%+3rem)] lg:p-6">
      
      {/* Top Filter Bar */}
      <div className="bg-[#111c2e] border border-[#334155] rounded-xl p-4 flex flex-wrap items-center gap-6 justify-between shadow-lg animate-fadeIn">
        <div className="flex flex-wrap items-center gap-6">
          {/* Tier Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tier:</span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-[#0f172a] border border-[#334155] text-slate-200 text-xs rounded-lg px-3 py-2 outline-none cursor-pointer focus:border-teal-500/50"
            >
              <option value="ALL">All Tiers</option>
              <option value="SILVER">Silver</option>
              <option value="GOLD">Gold</option>
              <option value="PLATINUM">Platinum</option>
              <option value="INNER_CIRCLE">Inner Circle</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#0f172a] border border-[#334155] text-slate-200 text-xs rounded-lg px-3 py-2 outline-none cursor-pointer focus:border-teal-500/50"
            >
              <option value="ALL">All Posts</option>
              <option value="FLAGGED">Flagged for Review</option>
              <option value="TEXT">Text Only</option>
              <option value="IMAGE">Images Only</option>
              <option value="VIDEO">Videos Only</option>
            </select>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Period:</span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="bg-[#0f172a] border border-[#334155] text-slate-200 text-xs rounded-lg px-3 py-2 outline-none cursor-pointer focus:border-teal-500/50"
            >
              <option value="ALL">All Time</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            loadPosts();
            setSuccess('Feed refreshed');
          }}
          className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <FiRefreshCw className={`text-teal-400 ${loading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      {/* Active Hashtag Filter Notification */}
      {hashtagFilter && (
        <div className="bg-[#111c2e] border border-teal-500/30 rounded-xl p-3 flex items-center justify-between text-sm animate-fadeIn">
          <span>
            Filtering by tag: <span className="font-semibold text-teal-400">{hashtagFilter}</span>
          </span>
          <button
            onClick={() => setHashtagFilter(null)}
            className="text-xs text-rose-400 hover:underline font-bold"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
        
        {/* Left Column: Creator and Feed */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Send Tier Broadcast Card (Toggled FAB) */}
          {showBroadcastCreator && (
            <div className="bg-[#111c2e] border border-[#334155] rounded-xl p-5 md:p-6 shadow-xl relative overflow-hidden transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <IoMegaphoneOutline className="text-teal-400 text-2xl" />
                  <h2 className="text-lg font-bold text-teal-400">
                    {editingPostId ? 'Edit Community Post' : 'Send Tier Broadcast'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Tier</label>
                  <select
                    value={form.tier}
                    onChange={(e) => setForm((current) => ({ ...current, tier: e.target.value }))}
                    className="w-full bg-[#0f172a] border border-[#334155] text-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-teal-500/50 cursor-pointer"
                  >
                    {TIER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-[280px]">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Post Type</label>
                  
                  {/* Styled Post Type Selector Cards */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'text', label: 'Text', renderIcon: () => <span className="text-sm font-bold font-serif leading-none mt-1 select-none">Tt</span> },
                      { value: 'image', label: 'Image', renderIcon: () => <FaRegImage size={14} /> },
                      { value: 'video', label: 'Video', renderIcon: () => <FaVideo size={14} /> },
                      { value: 'audio', label: 'Audio', renderIcon: () => <FaMicrophone size={14} /> },
                    ].map((type) => {
                      const isSelected = form.postType === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handlePostTypeChange(type.value)}
                          className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer h-14 ${
                            isSelected
                              ? 'bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-teal-400 text-teal-300 shadow-md shadow-teal-500/10'
                              : 'bg-[#0f172a] border-[#334155] text-slate-400 hover:text-slate-200 hover:border-slate-500'
                          }`}
                        >
                          {type.renderIcon()}
                          <span className="text-[10px] font-semibold mt-1">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dynamic Uploader Row */}
              {form.postType !== 'text' && (
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <label className="block cursor-pointer">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      {form.postType === 'audio' ? 'Audio File' : form.postType === 'video' ? 'Video File' : 'Image File'}
                    </span>
                    <span className="flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-[#151e32] border border-[#334155] transition-colors rounded-lg px-4 py-2 text-sm text-slate-300 h-[46px] cursor-pointer">
                      {form.postType === 'audio' ? <FaFileAudio className="text-slate-400" /> : <FaPhotoVideo className="text-slate-400" />}
                      <span>{selectedMedia || mediaPreview ? 'Change Media' : 'Add Media File'}</span>
                    </span>
                    <input 
                      type="file" 
                      accept={form.postType === 'audio' ? 'audio/*' : form.postType === 'video' ? 'video/mp4,video/quicktime,video/webm' : 'image/*'} 
                      className="hidden" 
                      onChange={handleMediaChange} 
                    />
                  </label>

                  {form.postType === 'audio' && (
                    <button 
                      type="button" 
                      onClick={() => void toggleVoiceRecording()} 
                      className={`h-[46px] self-end inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                        recording 
                          ? 'border-rose-500 bg-rose-500/10 text-rose-200' 
                          : 'border-teal-500/40 bg-teal-500/10 text-teal-200'
                      }`}
                    >
                      {recording ? <FaStop /> : <FaMicrophone />} {recording ? 'Stop recording' : 'Record voice'}
                    </button>
                  )}
                </div>
              )}

              {/* Message Input */}
              <div className="mb-4">
                <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Message Content</label>
                <textarea
                  rows={4}
                  placeholder="Share tips, notes, or announcements with this tier..."
                  className="w-full bg-[#0f172a] border border-[#334155] text-slate-200 rounded-lg p-4 outline-none focus:border-teal-500/50 resize-y placeholder:text-slate-500"
                  value={form.message}
                  onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))}
                />
              </div>

              {/* Video URL Input */}
              {form.postType === 'video' && (
                <div className="mb-4">
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Video Link</label>
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
                    className="w-full bg-[#0f172a] border border-[#334155] text-slate-200 rounded-lg px-4 py-3 outline-none focus:border-teal-500/50 placeholder:text-slate-500"
                  />
                  <p className="mt-2 text-[10px] text-slate-500">
                    Supported: YouTube watch/share/shorts, Vimeo links, and direct MP4/MOV/WEBM file URLs.
                  </p>
                </div>
              )}

              {/* Media Preview Box */}
              {mediaPreview && (
                <div className="mb-6 rounded-xl border border-[#334155] bg-[#0f172a] p-3 animate-fadeIn">
                  {selectedMedia?.media_kind === 'audio' ? (
                    <audio src={mediaPreview} controls className="w-full" />
                  ) : selectedMedia?.media_kind === 'video' || (!selectedMedia && /\.(mp4|mov|webm)(\?|$)/i.test(mediaPreview)) ? (
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
                      className="text-xs text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      Remove media
                    </button>
                  </div>
                </div>
              )}

              {!mediaPreview && externalVideoUrl && (
                <div className="mb-6 rounded-xl border border-[#334155] bg-[#0f172a] p-3 animate-fadeIn">
                  {getVideoRenderMode(normalizeExternalVideoUrl(externalVideoUrl) || externalVideoUrl) === 'embed' ? (
                    <iframe
                      src={normalizeExternalVideoUrl(externalVideoUrl) || externalVideoUrl}
                      title="External video preview"
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
                      className="text-xs text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      Remove link
                    </button>
                  </div>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 bg-[#5d5fef] hover:bg-[#4d4fd9] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
                >
                  <IoSendOutline />
                  {saving ? 'Sending...' : submitLabel}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="bg-transparent border border-[#334155] text-slate-300 px-5 py-3 rounded-lg hover:bg-[#0f172a] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Feed Title and Counter */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-wide">
              Community Activity
            </h2>
            <span className="bg-[#111c2e] border border-[#334155] text-slate-400 text-xs font-semibold px-3 py-1 rounded-full">
              {filteredPosts.length} Posts
            </span>
          </div>

          {/* Loader or Empty Feed Message */}
          {loading ? (
            <div className="text-sm text-slate-400 flex items-center gap-2">
              <FiRefreshCw className="animate-spin text-teal-400" />
              Loading posts...
            </div>
          ) : null}

          {!loading && filteredPosts.length === 0 ? (
            <div className="bg-[#111c2e] border border-[#334155] rounded-xl p-6 text-center text-sm text-slate-400 shadow-md">
              No matching community posts found. Try clearing your filters or hashtag query.
            </div>
          ) : null}

          {/* List of Posts */}
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const isFlagged = flaggedPostIds.includes(post.id);
              const isQuote = String(post.content || '').startsWith('"') && String(post.content || '').endsWith('.');
              
              // Dynamic Badge Class
              let badgeColorClass = 'bg-slate-500/10 text-slate-300 border-slate-500/30';
              if (post.author_role === 'GOLD') {
                badgeColorClass = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
              } else if (post.author_role === 'SILVER') {
                badgeColorClass = 'bg-slate-300/10 text-slate-200 border-slate-300/30';
              } else if (post.author_role === 'PLATINUM') {
                badgeColorClass = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
              } else if (post.author_role?.toLowerCase() === 'admin' || post.author_role?.toLowerCase() === 'coach') {
                badgeColorClass = 'bg-teal-500/10 text-teal-300 border-teal-500/30';
              }

              return (
                <div 
                  key={post.id} 
                  className={`bg-[#111c2e] border transition-all rounded-xl p-5 shadow-lg flex flex-col hover:border-slate-500/50 ${
                    isFlagged ? 'border-rose-500/50 shadow-rose-950/10' : 'border-[#334155]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Post Header */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {post.author_profile_image ? (
                          <img
                            src={post.author_profile_image}
                            alt={post.author_name}
                            className="w-10 h-10 rounded-full object-cover border border-[#334155]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-teal-400 flex items-center justify-center font-black text-slate-900 text-sm">
                            {(post.author_name || 'A').slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm hover:underline cursor-pointer">{post.author_name}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${badgeColorClass}`}>
                              {post.author_role}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span>{post.author_handle || `@${(post.author_name || '').toLowerCase().replace(' ', '_')}`}</span>
                            <span>•</span>
                            <span>{formatPostDate(post.created_at)}</span>
                            {post.author_member_no && (
                              <>
                                <span>•</span>
                                <span className="text-[10px] text-teal-400/80 font-mono">{post.author_member_no}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content Body */}
                      <p className={`text-sm text-slate-300 mt-4 leading-relaxed whitespace-pre-wrap pl-1 ${isQuote ? 'italic text-slate-100 font-serif border-l-2 border-teal-400 pl-4 py-1' : ''}`}>
                        {post.content}
                      </p>

                      {/* Media Attachments */}
                      {post.image_url && (
                        <div className="mt-4 rounded-lg overflow-hidden border border-[#334155]/60 bg-black/20 max-h-96">
                          <img src={post.image_url} alt="Post attachment" className="w-full object-contain max-h-96" />
                        </div>
                      )}

                      {post.video_url && (
                        <div className="mt-4 rounded-lg overflow-hidden border border-[#334155]/60 bg-black/40">
                          {getVideoRenderMode(post.video_url) === 'embed' ? (
                            <iframe
                              src={post.video_url}
                              title={`Video-${post.id}`}
                              className="h-64 w-full bg-black"
                              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                              allowFullScreen
                              referrerPolicy="strict-origin-when-cross-origin"
                            />
                          ) : (
                            <video src={post.video_url} controls className="w-full max-h-80 bg-black" />
                          )}
                        </div>
                      )}

                      {post.audio_url && (
                        <div className="mt-4 p-2 bg-[#0f172a] rounded-lg border border-[#334155]/60">
                          <audio src={post.audio_url} controls className="w-full" />
                        </div>
                      )}

                      {/* Post Actions & Stats Footer */}
                      <div className="mt-5 pt-4 border-t border-[#334155]/60 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-5 text-slate-400 text-xs">
                          {/* Heart/Like Button */}
                          <button
                            onClick={() => handleToggleLike(post.id)}
                            className={`flex items-center gap-1.5 transition-colors cursor-pointer group ${
                              post.viewer_has_liked ? 'text-rose-400' : 'hover:text-rose-400'
                            }`}
                          >
                            {post.viewer_has_liked ? <FaHeart /> : <FaRegHeart className="group-hover:scale-110 transition-transform animate-pulse" />}
                            <span className="font-bold">{post.like_count || 0}</span>
                          </button>

                          {/* Comments Toggle */}
                          <button
                            onClick={() =>
                              setExpandedComments((current) => ({
                                ...current,
                                [post.id]: !current[post.id],
                              }))
                            }
                            className="flex items-center gap-1.5 hover:text-teal-400 transition-colors cursor-pointer"
                          >
                            <FaRegComment />
                            <span className="font-bold">{post.comment_count || 0}</span>
                          </button>

                          {/* Share Button */}
                          <button
                            onClick={() => {
                              setSuccess('Link copied to clipboard!');
                              navigator.clipboard.writeText(window.location.href);
                            }}
                            className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors cursor-pointer"
                          >
                            <FaShare />
                            <span className="font-bold">{post.share_count || 0}</span>
                          </button>
                        </div>

                        {/* Right: Flags and Edit/Delete */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleFlag(post.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              isFlagged
                                ? 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600'
                                : 'border-rose-500/30 text-rose-300 hover:bg-rose-500/10'
                            }`}
                          >
                            {isFlagged ? 'Flagged' : 'Flag for Review'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(post)}
                            className="text-xs text-slate-300 border border-[#334155] px-3 py-1.5 rounded-lg hover:bg-[#0f172a] hover:border-slate-400 transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(post.id)}
                            disabled={deletingPostId === post.id}
                            className="text-slate-400 hover:text-rose-400 p-2 transition-colors cursor-pointer"
                            aria-label="Delete post"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>

                      {/* Comments Collapsible Panel */}
                      {expandedComments[post.id] && (
                        <div className="mt-5 pt-4 border-t border-[#334155]/40 space-y-4 animate-fadeIn">
                          <div className="space-y-3">
                            {(post.comments || []).map((comment) => (
                              <div key={comment.id} className="flex items-start gap-3 text-xs">
                                {comment.author_profile_image ? (
                                  <img
                                    src={comment.author_profile_image}
                                    alt={comment.author_name}
                                    className="w-7 h-7 rounded-full object-cover border border-[#334155]"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center font-bold text-white">
                                    {(comment.author_name || 'A').slice(0, 1).toUpperCase()}
                                  </div>
                                )}
                                <div className="flex-1 rounded-xl bg-[#0f172a] border border-[#334155] px-3 py-2">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-white">{comment.author_name}</span>
                                    <span className="text-[10px] text-slate-500">{formatPostDate(comment.created_at)}</span>
                                  </div>
                                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Write Comment Box */}
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
                              placeholder="Write a comment..."
                              className="flex-1 bg-[#0f172a] border border-[#334155] text-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal-500/50 placeholder:text-slate-500 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleSubmitComment(post.id)}
                              disabled={commentSubmitting[post.id]}
                              className="bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs cursor-pointer disabled:opacity-60 transition-colors"
                            >
                              {commentSubmitting[post.id] ? '...' : 'Send'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Sidebar Panels */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Growth Matrix */}
          <div className="bg-[#111c2e] border border-[#334155] rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-wide">Growth Matrix</h3>
              <span className="text-teal-400 text-sm">📈</span>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-3xl font-black text-teal-400 tracking-tight leading-none">+12.4%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-1">Daily Engagement</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span>Highest activity recorded at 18:00 PM.</span>
              </div>
              <div className="w-full bg-[#0f172a] h-2 rounded-full overflow-hidden border border-[#334155]/60">
                <div className="bg-gradient-to-r from-teal-400 to-indigo-500 h-full w-[70%]" />
              </div>
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-[#111c2e] border border-[#334155] rounded-xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-teal-400">🏆</span>
              <h3 className="text-base font-bold text-white tracking-wide">Top Contributors</h3>
            </div>
            <div className="space-y-3">
              {topContributors.length > 0 && topContributors.slice(0, 3).map((contributor, index) => (
                <div key={contributor.userId || contributor.name || index} className="flex items-center justify-between group p-2 rounded-lg transition-all duration-200 hover:bg-[#0f172a]/40">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {contributor.profileImage ? <img src={contributor.profileImage} className="w-9 h-9 rounded-full object-cover border border-[#334155]" alt={contributor.name} /> : <div className="w-9 h-9 rounded-full bg-[#26334d] border border-[#334155] flex items-center justify-center text-xs font-bold text-teal-300">{String(contributor.name || '?').charAt(0).toUpperCase()}</div>}
                      <span className="absolute -top-1 -right-1 bg-teal-400 text-slate-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#111c2e]">{index + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">{contributor.name || 'Community member'}</p>
                      <p className="text-[10px] text-slate-400">{contributor.postCount || 0} posts • {contributor.likeCount || 0} likes</p>
                    </div>
                  </div>
                  <FaChevronRight className="text-slate-500 text-[10px]" />
                </div>
              ))}
              {topContributors.length === 0 && (
              <>
              <div className="flex items-center justify-between group cursor-pointer hover:bg-[#0f172a]/40 p-2 rounded-lg transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop" 
                      className="w-9 h-9 rounded-full object-cover border border-[#334155]" 
                      alt="Jason Miller" 
                    />
                    <span className="absolute -top-1 -right-1 bg-teal-400 text-slate-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#111c2e]">1</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">Jason "Tank" Miller</p>
                    <p className="text-[10px] text-slate-400">42 posts • 8.2k likes</p>
                  </div>
                </div>
                <FaChevronRight className="text-slate-500 text-[10px] group-hover:translate-x-0.5 transition-transform" />
              </div>
              {/* Elena Rodriguez */}
              <div className="flex items-center justify-between group cursor-pointer hover:bg-[#0f172a]/40 p-2 rounded-lg transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" 
                      className="w-9 h-9 rounded-full object-cover border border-[#334155]" 
                      alt="Elena Rodriguez" 
                    />
                    <span className="absolute -top-1 -right-1 bg-indigo-400 text-slate-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#111c2e]">2</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">Elena Rodriguez</p>
                    <p className="text-[10px] text-slate-400">38 posts • 6.5k likes</p>
                  </div>
                </div>
                <FaChevronRight className="text-slate-500 text-[10px] group-hover:translate-x-0.5 transition-transform" />
              </div>
              {/* Mike Chen */}
              <div className="flex items-center justify-between group cursor-pointer hover:bg-[#0f172a]/40 p-2 rounded-lg transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop" 
                      className="w-9 h-9 rounded-full object-cover border border-[#334155]" 
                      alt="Mike Chen" 
                    />
                    <span className="absolute -top-1 -right-1 bg-purple-400 text-slate-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#111c2e]">3</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">Mike Chen</p>
                    <p className="text-[10px] text-slate-400">25 posts • 4.1k likes</p>
                  </div>
                </div>
                <FaChevronRight className="text-slate-500 text-[10px] group-hover:translate-x-0.5 transition-transform" />
              </div>
              </>
              )}
            </div>
            <button 
              onClick={() => alert("Leaderboards are updated dynamically based on weekly activity.")}
              className="w-full mt-4 bg-transparent border border-[#334155] hover:bg-[#1e293b]/40 text-slate-300 hover:text-white text-[10px] font-bold py-2 rounded-lg transition-all tracking-widest uppercase cursor-pointer"
            >
              View Full Leaderboard
            </button>
          </div>

          {/* Trending Now */}
          <div className="bg-[#111c2e] border border-[#334155] rounded-xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-teal-400"><FaHashtag size={14} /></span>
              <h3 className="text-base font-bold text-white tracking-wide">Trending Now</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(trendingHashtags.length ? trendingHashtags.map(({ tag }) => tag) : ['#FitAdminPro', '#DeadliftDay', '#MorningMobility', '#MealPrep', '#Hypertrophy', '#YogaFlow']).map(tag => (
                <button
                  key={tag}
                  onClick={() => setHashtagFilter(hashtagFilter === tag ? null : tag)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    hashtagFilter === tag 
                      ? 'bg-teal-400 text-slate-950 border-teal-400 font-bold' 
                      : 'bg-[#0f172a] text-slate-300 border-[#334155] hover:border-slate-500'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Admin Shortcuts */}
          <div className="bg-[#111c2e] border border-[#334155] rounded-xl p-5 shadow-xl">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Admin Shortcuts</h3>
            <div className="space-y-3 text-sm">
              <button
                onClick={() => {
                  setTypeFilter(typeFilter === 'FLAGGED' ? 'ALL' : 'FLAGGED');
                  setHashtagFilter(null);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all cursor-pointer border ${
                  typeFilter === 'FLAGGED' 
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-200' 
                    : 'text-slate-300 border-transparent hover:bg-[#0f172a]/50 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">🚩 Review Flagged Posts</span>
                <span className="bg-rose-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full leading-none">
                  {baseFlaggedCount + flaggedPostIds.length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveModal('announcements')}
                className="w-full flex items-center p-2.5 rounded-lg text-slate-300 hover:bg-[#0f172a]/50 hover:text-white transition-all text-left cursor-pointer border border-transparent"
              >
                <span>📌 Pinned Announcements</span>
              </button>

              <button
                onClick={() => setActiveModal('guidelines')}
                className="w-full flex items-center p-2.5 rounded-lg text-slate-300 hover:bg-[#0f172a]/50 hover:text-white transition-all text-left cursor-pointer border border-transparent"
              >
                <span>🛡️ Community Guidelines</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Action Button (FAB) for Announcement creation */}
      <button
        onClick={() => {
          setShowBroadcastCreator(prev => !prev);
          if(!showBroadcastCreator) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#5d5fef] to-teal-400 hover:from-teal-400 hover:to-[#5d5fef] text-white hover:scale-105 active:scale-95 transition-all rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/35 cursor-pointer z-50 group"
        aria-label="Create Announcement"
      >
        {showBroadcastCreator ? (
          <FaTimes className="text-xl" />
        ) : (
          <FaPlus className="text-xl group-hover:rotate-90 transition-transform duration-300" />
        )}
      </button>

      {/* MODALS */}

      {/* Guidelines Modal */}
      {activeModal === 'guidelines' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111c2e] border border-[#334155] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <FaTimes size={18} />
            </button>
            <h3 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">
              <FaShieldAlt /> Community Guidelines
            </h3>
            <div className="space-y-4 text-slate-300 text-sm overflow-y-auto max-h-[60vh] pr-2">
              <div>
                <p className="font-bold text-white">1. Respect & Encouragement</p>
                <p className="pl-4 mt-0.5 text-slate-400">Treat all community members with respect. Encourage others in their fitness journeys and celebrate their PR achievements!</p>
              </div>
              <div>
                <p className="font-bold text-white">2. No Spam or Business Promotion</p>
                <p className="pl-4 mt-0.5 text-slate-400">Self-promotion, external links to services, or advertisements will be automatically flagged and deleted.</p>
              </div>
              <div>
                <p className="font-bold text-white">3. Professional Advice Only</p>
                <p className="pl-4 mt-0.5 text-slate-400">Do not prescribe medical advise, diets, or complex workout revisions. Always refer to certified staff.</p>
              </div>
              <div>
                <p className="font-bold text-white">4. Keep it Fitness-focused</p>
                <p className="pl-4 mt-0.5 text-slate-400">Ensure posts are relevant to workouts, wellness, hypertrophy, yoga, and nutrition tips within Victory Fitness.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setActiveModal(null)} className="bg-teal-400 hover:bg-teal-300 text-slate-900 font-bold px-5 py-2.5 rounded-lg transition-colors cursor-pointer">
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pinned Announcements Modal */}
      {activeModal === 'announcements' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111c2e] border border-[#334155] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <FaTimes size={18} />
            </button>
            <h3 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">
              <BiBroadcast /> Pinned Announcements
            </h3>
            <div className="space-y-4 text-slate-300 text-sm overflow-y-auto max-h-[60vh] pr-2">
              <div className="border-b border-[#334155]/60 pb-3">
                <p className="font-bold text-white flex items-center gap-2">
                  📢 Summer Fitness Challenge starts next Monday!
                </p>
                <p className="text-slate-400 text-xs mt-1">Pinned by Admin • July 10, 2026</p>
                <p className="mt-2 pl-4 text-slate-300">Prepare for the 30-day Hypertrophy streak. Sign up under the Challenges tab in your app.</p>
              </div>
              <div>
                <p className="font-bold text-white flex items-center gap-2">
                  ⚙️ Scheduled Server Maintenance
                </p>
                <p className="text-slate-400 text-xs mt-1">Pinned by Admin • July 05, 2026</p>
                <p className="mt-2 pl-4 text-slate-300">The app will undergo updates on Saturday at 2:00 AM EST for 1 hour. Active workouts will save offline.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setActiveModal(null)} className="bg-teal-400 hover:bg-teal-300 text-slate-900 font-bold px-5 py-2.5 rounded-lg transition-colors cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Community;

import { useEffect, useMemo, useState } from "react";
import { Modal, Form, Input, Select, message, Popconfirm, Button } from "antd";
import { FiEdit, FiTrash2, FiPlus, FiRefreshCw, FiSearch } from "react-icons/fi";
import { FaPlayCircle } from "react-icons/fa";
import {
  createAdminWorkout,
  deleteAdminWorkout,
  listAdminWorkouts,
  syncAdminWorkouts,
  uploadAdminWorkoutVideo,
  updateAdminWorkout,
} from "../../../services/admin-workouts.service";
import ThumbnailUploadField from "../../components/dashboard/ThumbnailUploadField";
import { toBase64Payload } from "../../utils/imageUpload";

const DEFAULT_THUMBNAIL =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=300&auto=format&fit=crop";

const WORKOUT_VIDEO_OPTIONS = [
  { label: "Smartphone Upload", value: "UPLOAD" },
  { label: "YouTube", value: "YOUTUBE" },
  { label: "Vimeo", value: "VIMEO" },
];

const isDirectWorkoutVideoUrl = (videoUrl) =>
  /^https?:\/\/.+\.(mp4|mov|m4v|webm)(\?.*)?$/i.test(String(videoUrl || "").trim()) ||
  String(videoUrl || "").includes("/workout-videos/");

const normalizeWorkoutVideoPreviewUrl = (source, rawVideoUrl, rawVimeoId) => {
  const videoSource = String(source || "VIMEO").trim().toUpperCase();
  const videoUrl = String(rawVideoUrl || "").trim();
  const vimeoId = String(rawVimeoId || "").trim();

  try {
    if (isDirectWorkoutVideoUrl(videoUrl)) {
      return videoUrl;
    }

    if (videoSource === "UPLOAD") {
      return videoUrl;
    }

    if (videoSource === "YOUTUBE") {
      const parsed = new URL(videoUrl);
      const host = parsed.hostname.toLowerCase();
      const path = parsed.pathname || "";
      if (host === "youtu.be") {
        const videoId = path.replace(/^\/+/, "").split("/")[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0` : "";
      }
      if (host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com") {
        const videoId = path.startsWith("/embed/")
          ? path.split("/embed/")[1]?.split("/")[0]
          : path.startsWith("/shorts/")
            ? path.split("/shorts/")[1]?.split("/")[0]
            : parsed.searchParams.get("v") || "";
        return videoId ? `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0` : "";
      }
      return "";
    }

    if (vimeoId) {
      return `https://player.vimeo.com/video/${encodeURIComponent(vimeoId)}?autoplay=0&title=0&byline=0&portrait=0&playsinline=1&dnt=1`;
    }

    if (!videoUrl) {
      return "";
    }

    const parsed = new URL(videoUrl);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname || "";
    if (host === "player.vimeo.com" && path.startsWith("/video/")) {
      const videoId = path.split("/video/")[1]?.split("/")[0];
      return videoId
        ? `https://player.vimeo.com/video/${encodeURIComponent(videoId)}?autoplay=0&title=0&byline=0&portrait=0&playsinline=1&dnt=1`
        : "";
    }
    if (host === "vimeo.com" || host === "www.vimeo.com") {
      const match = path.match(/\/(\d+)(?:$|[/?#])/);
      return match?.[1]
        ? `https://player.vimeo.com/video/${encodeURIComponent(match[1])}?autoplay=0&title=0&byline=0&portrait=0&playsinline=1&dnt=1`
        : "";
    }
  } catch {
    return "";
  }

  return "";
};

function WorkoutCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-800/80 p-3 animate-pulse">
      <div className="h-16 w-24 shrink-0 rounded-md bg-slate-700" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-slate-700" />
        <div className="h-3 w-1/2 rounded bg-slate-700" />
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded bg-slate-700" />
          <div className="h-5 w-20 rounded bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [previewWorkout, setPreviewWorkout] = useState(null);
  const [error, setError] = useState("");
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [thumbnailFileList, setThumbnailFileList] = useState([]);
  const [videoFileList, setVideoFileList] = useState([]);
  const [thumbnailCleared, setThumbnailCleared] = useState(false);
  const [form] = Form.useForm();
  const watchedVideoSource = Form.useWatch("videoSource", form) || "VIMEO";
  const watchedVideoUrl = Form.useWatch("videoUrl", form) || "";
  const watchedVimeoId = Form.useWatch("vimeoId", form) || "";
  const watchedTitle = Form.useWatch("title", form) || "";
  const modalPreviewUrl = useMemo(
    () =>
      selectedVideo?.preview ||
      normalizeWorkoutVideoPreviewUrl(watchedVideoSource, watchedVideoUrl, watchedVimeoId),
    [selectedVideo, watchedVideoSource, watchedVideoUrl, watchedVimeoId],
  );

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const loadWorkouts = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await listAdminWorkouts({
          query: searchQuery,
          signal: controller.signal,
        });
        if (!isMounted) {
          return;
        }
        setWorkouts(data.workouts || []);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }
        setError(requestError instanceof Error ? requestError.message : "Failed to load workouts");
        setWorkouts([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadWorkouts();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [searchQuery]);

  const reloadWorkouts = async () => {
    const data = await listAdminWorkouts({ query: searchQuery });
    setWorkouts(data.workouts || []);
    return data;
  };

  const handleAdd = () => {
    setEditingWorkout(null);
    form.resetFields();
    form.setFieldsValue({
      visibility: "Published",
      videoSource: "VIMEO",
    });
    setSelectedThumbnail(null);
    setSelectedVideo(null);
    setThumbnailPreview("");
    setThumbnailFileList([]);
    setVideoFileList([]);
    setThumbnailCleared(false);
    setIsModalVisible(true);
  };

  const handleEdit = (workout) => {
    setEditingWorkout(workout);
    form.setFieldsValue({
      ...workout,
    });
    setSelectedThumbnail(null);
    setSelectedVideo(null);
    setThumbnailPreview(workout.thumbnail || "");
    setThumbnailFileList([]);
    setVideoFileList([]);
    setThumbnailCleared(false);
    setIsModalVisible(true);
  };

  const handleThumbnailChange = async ({ fileList }) => {
    setThumbnailFileList(fileList.slice(-1));
    const file = fileList[fileList.length - 1]?.originFileObj;
    if (!file) {
      setSelectedThumbnail(null);
      return;
    }

    try {
      const payload = await toBase64Payload(file, "workout-thumbnail.jpg");
      setSelectedThumbnail(payload);
      setThumbnailPreview(payload.preview);
      setThumbnailCleared(false);
    } catch {
      message.error("Failed to read thumbnail image");
    }
  };

  const handleThumbnailRemove = () => {
    setSelectedThumbnail(null);
    setThumbnailFileList([]);
    setThumbnailPreview("");
    setThumbnailCleared(true);
  };

  const handleVideoChange = async ({ fileList }) => {
    setVideoFileList(fileList.slice(-1));
    const file = fileList[fileList.length - 1]?.originFileObj;
    if (!file) {
      setSelectedVideo(null);
      return;
    }

    try {
      const payload = {
        file,
        video_mime_type: file.type || "video/mp4",
        video_file_name: file.name || "workout-video.mp4",
        preview: URL.createObjectURL(file),
      };
      setSelectedVideo(payload);
      form.setFieldsValue({
        videoSource: "UPLOAD",
        videoUrl: payload.preview,
        vimeoId: "",
      });
    } catch {
      message.error("Failed to read workout video");
    }
  };

  const handleVideoRemove = () => {
    if (selectedVideo?.preview?.startsWith?.("blob:")) {
      URL.revokeObjectURL(selectedVideo.preview);
    }
    setSelectedVideo(null);
    setVideoFileList([]);
    form.setFieldValue("videoUrl", "");
  };

  const closeWorkoutModal = () => {
    if (selectedVideo?.preview?.startsWith?.("blob:")) {
      URL.revokeObjectURL(selectedVideo.preview);
    }
    setIsModalVisible(false);
    setEditingWorkout(null);
    setSelectedThumbnail(null);
    setSelectedVideo(null);
    setThumbnailPreview("");
    setThumbnailFileList([]);
    setVideoFileList([]);
    setThumbnailCleared(false);
    form.resetFields();
  };

  const handlePreview = (workout) => {
    setPreviewWorkout(workout);
    setIsPreviewVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAdminWorkout(id);
      await reloadWorkouts();
      message.success("Workout deleted successfully");
    } catch (requestError) {
      message.error(requestError instanceof Error ? requestError.message : "Failed to delete workout");
    }
  };

  const handleSubmit = async (values) => {
    let uploadedVideoUrl = values.videoUrl || "";
    if (selectedVideo?.file) {
      uploadedVideoUrl = await uploadAdminWorkoutVideo(selectedVideo.file);
    }

    const nextThumbnail = selectedThumbnail
      ? (editingWorkout?.thumbnail || "")
      : (thumbnailCleared ? "" : (thumbnailPreview || editingWorkout?.thumbnail || DEFAULT_THUMBNAIL));
    const payload = {
      title: values.title,
      vimeoId: values.vimeoId,
      videoUrl: uploadedVideoUrl,
      videoSource: values.videoSource || "VIMEO",
      tag: values.tag,
      visibility: values.visibility,
      thumbnail: nextThumbnail,
      video_base64: null,
      video_mime_type: selectedVideo?.video_mime_type || "video/mp4",
      video_file_name: selectedVideo?.video_file_name || null,
      image_base64: selectedThumbnail?.image_base64 || null,
      mime_type: selectedThumbnail?.mime_type || "image/jpeg",
      file_name: selectedThumbnail?.file_name || null,
    };

    try {
      setIsSaving(true);
      if (editingWorkout) {
        await updateAdminWorkout(editingWorkout.id, payload);
        message.success("Workout updated successfully");
      } else {
        await createAdminWorkout(payload);
        message.success("Workout added successfully");
      }
      closeWorkoutModal();
      await reloadWorkouts();
    } catch (requestError) {
      message.error(requestError instanceof Error ? requestError.message : "Failed to save workout");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const result = await syncAdminWorkouts();
      await reloadWorkouts();
      message.success(result.message || "Workout library synced");
    } catch (requestError) {
      message.error(requestError instanceof Error ? requestError.message : "Failed to sync workouts");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-6 pt-2 text-slate-100">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
            Workout Library ({workouts.length})
          </h1>
          <p className="mt-1 text-sm text-slate-500">Manage the admin workout library from the backend.</p>
        </div>
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <div className="relative min-w-[16rem]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search workouts..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-800 shadow-sm outline-none transition-all focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-teal-500/30 bg-slate-800 px-4 py-2.5 font-semibold text-teal-400 transition-all hover:bg-slate-700 disabled:opacity-50 md:flex-none"
          >
            <FiRefreshCw className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing..." : "Sync Vimeo"}
          </button>
          <button
            onClick={handleAdd}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-blue-500 md:flex-none"
          >
            <FiPlus />
            Add Workout
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-700/50 p-4 shadow-xl md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          [...Array(8)].map((_, index) => <WorkoutCardSkeleton key={index} />)
        ) : workouts.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-slate-700">No workouts found</h2>
            <p className="mt-2 text-sm text-slate-500">
              Add a workout or adjust your search to see results here.
            </p>
          </div>
        ) : (
          workouts.map((workout) => (
            <div
              key={workout.id}
              className="group relative flex cursor-pointer items-center gap-4 rounded-xl border border-[#334155] bg-[#1e293b] p-3 transition-all hover:border-slate-500 hover:bg-[#253245]"
              onClick={() => handlePreview(workout)}
            >
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-slate-700">
                <img src={workout.thumbnail || DEFAULT_THUMBNAIL} alt={workout.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <FaPlayCircle className="text-2xl text-white drop-shadow-md" />
                </div>
              </div>

              <div className="min-w-0 flex-1 pr-6">
                <h3 className="mb-1 truncate text-sm font-semibold text-slate-100" title={workout.title}>
                  {workout.title}
                </h3>
                <p className="mb-2 mt-0.5 truncate text-xs text-slate-400">
                  {workout.videoSource || "VIMEO"}{workout.vimeoId ? ` · Vimeo ID: ${workout.vimeoId}` : ""}
                </p>
                <div className="mt-auto flex items-center gap-2">
                  <span className="rounded bg-teal-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-300">
                    {workout.tag}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      workout.visibility === "Published"
                        ? "bg-blue-400/10 text-blue-300"
                        : "bg-slate-400/10 text-slate-300"
                    }`}
                  >
                    {workout.visibility}
                  </span>
                </div>
              </div>

              <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-100 transition-opacity sm:opacity-50 group-hover:opacity-100">
                <button
                  title="Edit"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleEdit(workout);
                  }}
                  className="text-slate-400 transition-colors hover:text-blue-400"
                >
                  <FiEdit size={15} />
                </button>
                <Popconfirm
                  title="Delete the workout"
                  description="Are you sure to delete this workout?"
                  onConfirm={() => handleDelete(workout.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <button
                    title="Delete"
                    onClick={(event) => event.stopPropagation()}
                    className="text-slate-400 transition-colors hover:text-red-400"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </Popconfirm>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        title={null}
        open={isPreviewVisible}
        onCancel={() => {
          setIsPreviewVisible(false);
          setPreviewWorkout(null);
        }}
        footer={null}
        width={980}
        destroyOnClose
        className="workout-preview-modal"
      >
        {previewWorkout && (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-2xl">
              <div className="aspect-video w-full">
                {String(previewWorkout.videoSource || "VIMEO").toUpperCase() === "UPLOAD" ? (
                  <video
                    src={previewWorkout.videoUrl}
                    title={previewWorkout.title}
                    className="h-full w-full bg-black object-contain"
                    controls
                  />
                ) : (
                  <iframe
                    src={previewWorkout.videoUrl || normalizeWorkoutVideoPreviewUrl("VIMEO", "", previewWorkout.vimeoId)}
                    title={previewWorkout.title}
                    className="h-full w-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">
                    {previewWorkout.tag}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${
                      previewWorkout.visibility === "Published"
                        ? "bg-blue-500/10 text-blue-600"
                        : "bg-slate-500/10 text-slate-500"
                    }`}
                  >
                    {previewWorkout.visibility}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{previewWorkout.title}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Source: {previewWorkout.videoSource || "VIMEO"}
                  {previewWorkout.vimeoId ? ` · Vimeo ID: ${previewWorkout.vimeoId}` : ""}
                </p>
              </div>

              {previewWorkout.videoSource === "UPLOAD" ? null : (
                <a
                  href={previewWorkout.videoUrl || `https://vimeo.com/${encodeURIComponent(previewWorkout.vimeoId)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Open source video
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={<span className="text-slate-800">{editingWorkout ? "Edit Workout" : "Add New Workout"}</span>}
        open={isModalVisible}
        onCancel={closeWorkoutModal}
        footer={null}
        destroyOnClose
        className="workout-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Form.Item
            name="title"
            label={<span className="font-medium text-slate-700">Workout Title</span>}
            rules={[{ required: true, message: "Please input the title!" }]}
          >
            <Input placeholder="e.g. Full Body Strength" className="py-2" />
          </Form.Item>

          <Form.Item
            name="videoSource"
            label={<span className="font-medium text-slate-700">Video Source</span>}
            rules={[{ required: true, message: "Please select the video source!" }]}
          >
            <Select options={WORKOUT_VIDEO_OPTIONS} size="large" />
          </Form.Item>

          <Form.Item
            name="videoUrl"
            label={<span className="font-medium text-slate-700">Video URL</span>}
            rules={
              watchedVideoSource === "UPLOAD"
                ? []
                : [{ required: !watchedVimeoId, message: watchedVideoSource === "YOUTUBE" ? "Please input the video URL!" : "Please input the video URL!" }]
            }
            hidden={watchedVideoSource === "UPLOAD"}
          >
            <Input placeholder="YouTube, Vimeo, or direct MP4/MOV/WEBM URL" className="py-2" />
          </Form.Item>

          <Form.Item
            name="vimeoId"
            label={<span className="font-medium text-slate-700">Vimeo Video ID</span>}
            rules={[{ required: watchedVideoSource === "VIMEO" && !watchedVideoUrl, message: "Please input the Vimeo ID or Vimeo URL!" }]}
            hidden={watchedVideoSource !== "VIMEO"}
          >
            <Input placeholder="e.g. 740239410" className="py-2" />
          </Form.Item>

          {watchedVideoSource === "UPLOAD" ? (
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 text-sm font-semibold text-slate-700">Direct video upload</div>
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={(event) => handleVideoChange({ fileList: [{ originFileObj: event.target.files?.[0] }].filter((item) => item.originFileObj) })}
                className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-500"
              />
              <p className="mt-2 text-xs text-slate-500">Upload MP4, MOV, or WEBM directly from your device. You can also paste a direct video file URL in the URL field above and it will be downloaded to S3.</p>
              {selectedVideo?.video_file_name ? (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                  <span className="truncate">{selectedVideo.video_file_name}</span>
                  <button type="button" onClick={handleVideoRemove} className="rounded-md border border-rose-200 px-2 py-1 text-rose-600 hover:bg-rose-50">
                    Remove video
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {modalPreviewUrl ? (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">Preview before publish</div>
                  <div className="text-xs text-slate-500">Check the stream here before saving.</div>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
                <div className="aspect-video w-full">
                  {watchedVideoSource === "UPLOAD" ? (
                    <video src={modalPreviewUrl} title={watchedTitle || "Workout preview"} className="h-full w-full bg-black object-contain" controls />
                  ) : (
                    <iframe
                      src={modalPreviewUrl}
                      title={watchedTitle || "Workout preview"}
                      className="h-full w-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <Form.Item
            name="tag"
            label={<span className="font-medium text-slate-700">Category Tag</span>}
            rules={[{ required: true, message: "Please select a tag!" }]}
          >
            <Select placeholder="Select a category" size="large">
              <Select.Option value="Strength">Strength</Select.Option>
              <Select.Option value="Cardio">Cardio</Select.Option>
              <Select.Option value="Core">Core</Select.Option>
              <Select.Option value="Yoga">Yoga</Select.Option>
              <Select.Option value="Mobility">Mobility</Select.Option>
              <Select.Option value="Calisthenics">Calisthenics</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="visibility"
            label={<span className="font-medium text-slate-700">Visibility</span>}
            rules={[{ required: true, message: "Please select visibility!" }]}
          >
            <Select placeholder="Select visibility" size="large">
              <Select.Option value="Published">Published</Select.Option>
              <Select.Option value="Draft">Draft</Select.Option>
            </Select>
          </Form.Item>

          <ThumbnailUploadField
            eyebrow="Thumbnail"
            title="Upload the workout cover image"
            fileList={thumbnailFileList}
            onChange={handleThumbnailChange}
            onRemove={handleThumbnailRemove}
            previewSrc={thumbnailPreview}
            fallbackPreviewSrc={editingWorkout?.thumbnail && !thumbnailCleared ? editingWorkout.thumbnail : ""}
            previewAlt="Workout thumbnail preview"
            className="mt-6"
          />

          <div className="mt-8 flex justify-end gap-3">
            <Button size="large" onClick={closeWorkoutModal}>
              Cancel
            </Button>
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              loading={isSaving}
              className="bg-blue-600 hover:bg-blue-500"
            >
              {editingWorkout ? "Update Workout" : "Add Workout"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Workouts;

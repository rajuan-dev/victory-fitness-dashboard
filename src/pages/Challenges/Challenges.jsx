import React, { useEffect, useRef, useState } from 'react';
import { Modal, Drawer, Form, Input, InputNumber, Select, message, Popconfirm, Button, Spin, Upload } from 'antd';
import { FiChevronDown, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { FaBolt, FaComments, FaFire, FaUsers, FaTrophy } from 'react-icons/fa';
import { InboxOutlined } from '@ant-design/icons';
import { adminApiRequest } from '../../../services/auth.service';

const challengeCategories = ['Strength', 'Cardio', 'Mindfulness', 'Nutrition', 'Family'];
const { Dragger } = Upload;
const challengeStatusFilters = ['ALL', 'ACTIVE', 'UPCOMING', 'DRAFT', 'ARCHIVED'];
const PLAN_GENERATION_DEFAULTS = {
  title: 'Strength & Consistency Challenge',
  description: 'A guided challenge designed to build consistency, movement quality, recovery, and overall fitness with realistic daily actions.',
  category: 'Strength',
  durationDays: 7,
  points: 500,
  difficulty: 'INTERMEDIATE',
  status: 'ACTIVE',
};

const toBase64Payload = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const result = typeof reader.result === 'string' ? reader.result : '';
    const imageBase64 = result.includes(',') ? result.split(',')[1] : '';
    resolve({
      image_base64: imageBase64,
      mime_type: file.type || 'image/jpeg',
      file_name: file.name || 'challenge-thumbnail.jpg',
      preview: result,
    });
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const createId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const createEmptyExercise = () => ({
  id: createId('exercise'),
  name: '',
  details: '',
  notes: '',
  workout_id: '',
  workout_title: '',
  workout_vimeo_id: '',
  workout_thumbnail: '',
});

const createEmptySection = () => ({
  id: createId('section'),
  title: '',
  description: '',
  estimated_minutes: 15,
  exercises: [createEmptyExercise(), createEmptyExercise()],
});

const createEmptyDay = (dayNumber) => ({
  day_number: dayNumber,
  title: `Day ${dayNumber}`,
  focus: '',
  notes: '',
  sections: [createEmptySection(), createEmptySection()],
});

const normalizePlanDays = (days = []) =>
  days.map((day, dayIndex) => ({
    day_number: Number(day?.day_number || dayIndex + 1),
    title: day?.title || `Day ${dayIndex + 1}`,
    focus: day?.focus || '',
    notes: day?.notes || '',
    sections: Array.isArray(day?.sections) && day.sections.length > 0
      ? day.sections.map((section, sectionIndex) => ({
          id: section?.id || createId(`section-${dayIndex + 1}-${sectionIndex + 1}`),
          title: section?.title || '',
          description: section?.description || '',
          estimated_minutes: Number(section?.estimated_minutes || 15),
          exercises: Array.isArray(section?.exercises) && section.exercises.length > 0
            ? section.exercises.map((exercise, exerciseIndex) => ({
                id: exercise?.id || createId(`exercise-${dayIndex + 1}-${sectionIndex + 1}-${exerciseIndex + 1}`),
                name: exercise?.name || '',
                details: exercise?.details || '',
                notes: exercise?.notes || '',
                workout_id: exercise?.workout_id || '',
                workout_title: exercise?.workout_title || '',
                workout_vimeo_id: exercise?.workout_vimeo_id || '',
                workout_thumbnail: exercise?.workout_thumbnail || '',
              }))
            : [createEmptyExercise()],
        }))
      : [createEmptySection()],
  }));

const sanitizePlanDaysForSubmit = (days = []) =>
  normalizePlanDays(days)
    .map((day, dayIndex) => {
      const sections = (day.sections || [])
        .map((section, sectionIndex) => {
          const exercises = (section.exercises || [])
            .filter((exercise) => String(exercise?.name || '').trim() || String(exercise?.details || '').trim() || String(exercise?.notes || '').trim())
            .map((exercise, exerciseIndex) => ({
              id: exercise.id || createId(`exercise-${dayIndex + 1}-${sectionIndex + 1}-${exerciseIndex + 1}`),
              name: String(exercise.name || '').trim() || `Exercise ${exerciseIndex + 1}`,
              details: String(exercise.details || '').trim() || 'Complete as assigned.',
              notes: String(exercise.notes || '').trim(),
              workout_id: String(exercise.workout_id || '').trim(),
              workout_title: String(exercise.workout_title || '').trim(),
              workout_vimeo_id: String(exercise.workout_vimeo_id || '').trim(),
              workout_thumbnail: String(exercise.workout_thumbnail || '').trim(),
            }));

          const hasSectionContent =
            String(section?.title || '').trim() ||
            String(section?.description || '').trim() ||
            exercises.length > 0;

          if (!hasSectionContent) {
            return null;
          }

          return {
            id: section.id || createId(`section-${dayIndex + 1}-${sectionIndex + 1}`),
            title: String(section.title || '').trim() || `Section ${sectionIndex + 1}`,
            description: String(section.description || '').trim(),
            estimated_minutes: Number(section.estimated_minutes || 15),
            exercises,
          };
        })
        .filter(Boolean);

      const hasDayContent =
        String(day?.title || '').trim() ||
        String(day?.focus || '').trim() ||
        String(day?.notes || '').trim() ||
        sections.length > 0;

      if (!hasDayContent) {
        return null;
      }

      return {
        day_number: dayIndex + 1,
        title: String(day.title || '').trim() || `Day ${dayIndex + 1}`,
        focus: String(day.focus || '').trim() || 'Challenge work',
        notes: String(day.notes || '').trim(),
        sections,
      };
    })
    .filter(Boolean);

const categoryThemeByName = {
  Strength: { noun: 'Reset', focus: 'strength, movement quality, and consistency' },
  Cardio: { noun: 'Builder', focus: 'endurance, pacing, and cardio consistency' },
  Mindfulness: { noun: 'Flow', focus: 'mobility, recovery, and mindful daily practice' },
  Nutrition: { noun: 'Nutrition Reset', focus: 'meal consistency, energy, and nutrition habits' },
  Family: { noun: 'Family Fitness Plan', focus: 'shared movement, accountability, and family-friendly activity' },
};

const suggestChallengeTitle = ({ durationDays, category }) => {
  const safeDuration = Math.max(Number(durationDays || PLAN_GENERATION_DEFAULTS.durationDays), 1);
  const theme = categoryThemeByName[category] || categoryThemeByName.Strength;
  return `${safeDuration}-Day ${category} ${theme.noun}`;
};

const suggestChallengeDescription = ({ durationDays, category, difficulty }) => {
  const safeDuration = Math.max(Number(durationDays || PLAN_GENERATION_DEFAULTS.durationDays), 1);
  const theme = categoryThemeByName[category] || categoryThemeByName.Strength;
  return `A ${safeDuration}-day ${difficulty.toLowerCase()} ${category.toLowerCase()} challenge designed to improve ${theme.focus} with realistic day-by-day actions.`;
};

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [thumbnailFileList, setThumbnailFileList] = useState([]);
  const [planDays, setPlanDays] = useState([]);
  const [activeDayIndex, setActiveDayIndex] = useState(null);
  const [planGenerating, setPlanGenerating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [workoutLibrary, setWorkoutLibrary] = useState([]);
  const [workoutLibraryLoading, setWorkoutLibraryLoading] = useState(false);
  const [moderationChallenge, setModerationChallenge] = useState(null);
  const [moderationMessages, setModerationMessages] = useState([]);
  const [moderationLoading, setModerationLoading] = useState(false);
  const [moderationDeletingId, setModerationDeletingId] = useState('');
  const lastSuggestedTitleRef = useRef('');
  const lastSuggestedDescriptionRef = useRef('');
  const [form] = Form.useForm();

  const loadChallenges = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApiRequest('/admin/challenges');
      setChallenges(Array.isArray(response?.challenges) ? response.challenges : []);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkoutLibrary = async () => {
    setWorkoutLibraryLoading(true);
    try {
      const response = await adminApiRequest('/admin/workouts');
      setWorkoutLibrary(Array.isArray(response?.workouts) ? response.workouts : []);
    } catch (loadError) {
      message.error(loadError.message || 'Failed to load workout library');
    } finally {
      setWorkoutLibraryLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const applyLiveChallengeSuggestions = (allValues) => {
    const selectedCategory = allValues.category || PLAN_GENERATION_DEFAULTS.category;
    const selectedDifficulty = allValues.difficulty || PLAN_GENERATION_DEFAULTS.difficulty;
    const requestedDuration = Math.max(Number(allValues.durationDays || PLAN_GENERATION_DEFAULTS.durationDays), 1);
    const nextSuggestedTitle = suggestChallengeTitle({
      durationDays: requestedDuration,
      category: selectedCategory,
    });
    const nextSuggestedDescription = suggestChallengeDescription({
      durationDays: requestedDuration,
      category: selectedCategory,
      difficulty: selectedDifficulty,
    });

    const currentTitle = String(allValues.title || '');
    const currentDescription = String(allValues.description || '');
    const nextFields = {};

    if (!currentTitle.trim() || currentTitle === lastSuggestedTitleRef.current) {
      nextFields.title = nextSuggestedTitle;
    }

    if (!currentDescription.trim() || currentDescription === lastSuggestedDescriptionRef.current) {
      nextFields.description = nextSuggestedDescription;
    }

    lastSuggestedTitleRef.current = nextSuggestedTitle;
    lastSuggestedDescriptionRef.current = nextSuggestedDescription;

    if (Object.keys(nextFields).length > 0) {
      form.setFieldsValue(nextFields);
    }
  };

  const handleAdd = () => {
    setEditingChallenge(null);
    form.resetFields();
    setSelectedThumbnail(null);
    setThumbnailPreview('');
    setThumbnailFileList([]);
    setPlanDays([]);
    setActiveDayIndex(null);
    const initialValues = {
      category: PLAN_GENERATION_DEFAULTS.category,
      durationDays: PLAN_GENERATION_DEFAULTS.durationDays,
      points: 100,
      difficulty: 'BEGINNER',
      status: PLAN_GENERATION_DEFAULTS.status,
    };
    form.setFieldsValue(initialValues);
    applyLiveChallengeSuggestions(initialValues);
    void loadWorkoutLibrary();
    setIsModalVisible(true);
  };

  const handleEdit = (challenge) => {
    setEditingChallenge(challenge);
    const editValues = {
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      durationDays: challenge.durationDays,
      points: challenge.points,
      difficulty: challenge.difficulty,
      status: challenge.status,
    };
    form.setFieldsValue(editValues);
    lastSuggestedTitleRef.current = suggestChallengeTitle({
      durationDays: challenge.durationDays,
      category: challenge.category,
    });
    lastSuggestedDescriptionRef.current = suggestChallengeDescription({
      durationDays: challenge.durationDays,
      category: challenge.category,
      difficulty: challenge.difficulty,
    });
    setPlanDays(normalizePlanDays(challenge.planDays || []));
    setActiveDayIndex(null);
    setSelectedThumbnail(null);
    setThumbnailPreview(challenge.thumbnail || '');
    setThumbnailFileList([]);
    void loadWorkoutLibrary();
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
      const payload = await toBase64Payload(file);
      setSelectedThumbnail(payload);
      setThumbnailPreview(payload.preview);
    } catch {
      message.error('Failed to read thumbnail image');
    }
  };

  const handleThumbnailRemove = () => {
    setSelectedThumbnail(null);
    setThumbnailFileList([]);
    setThumbnailPreview(editingChallenge?.thumbnail || '');
  };

  const updatePlanDay = (dayIndex, updater) => {
    setPlanDays((current) => current.map((day, index) => (index === dayIndex ? updater(day) : day)));
  };

  const addPlanDay = () => {
    setPlanDays((current) => {
      const nextDays = [...current, createEmptyDay(current.length + 1)];
      form.setFieldsValue({ durationDays: nextDays.length });
      setActiveDayIndex(nextDays.length - 1);
      return nextDays;
    });
  };

  const removePlanDay = (dayIndex) => {
    setPlanDays((current) =>
      current
        .filter((_, index) => index !== dayIndex)
        .map((day, index) => ({ ...day, day_number: index + 1, title: day.title || `Day ${index + 1}` }))
    );
    setActiveDayIndex((current) => {
      if (current === null) {
        return null;
      }
      if (current === dayIndex) {
        return null;
      }
      return current > dayIndex ? current - 1 : current;
    });
  };

  const openDayEditor = (dayIndex) => {
    setActiveDayIndex(dayIndex);
  };

  const addSection = (dayIndex) => {
    updatePlanDay(dayIndex, (day) => ({
      ...day,
      sections: [...day.sections, createEmptySection()],
    }));
  };

  const removeSection = (dayIndex, sectionIndex) => {
    updatePlanDay(dayIndex, (day) => ({
      ...day,
      sections: day.sections.filter((_, index) => index !== sectionIndex),
    }));
  };

  const updateSection = (dayIndex, sectionIndex, field, value) => {
    updatePlanDay(dayIndex, (day) => ({
      ...day,
      sections: day.sections.map((section, index) => (
        index === sectionIndex
          ? { ...section, [field]: field === 'estimated_minutes' ? Number(value || 0) : value }
          : section
      )),
    }));
  };

  const addExercise = (dayIndex, sectionIndex) => {
    updatePlanDay(dayIndex, (day) => ({
      ...day,
      sections: day.sections.map((section, index) => (
        index === sectionIndex
          ? { ...section, exercises: [...section.exercises, createEmptyExercise()] }
          : section
      )),
    }));
  };

  const removeExercise = (dayIndex, sectionIndex, exerciseIndex) => {
    updatePlanDay(dayIndex, (day) => ({
      ...day,
      sections: day.sections.map((section, index) => (
        index === sectionIndex
          ? { ...section, exercises: section.exercises.filter((_, itemIndex) => itemIndex !== exerciseIndex) }
          : section
      )),
    }));
  };

  const updateExercise = (dayIndex, sectionIndex, exerciseIndex, field, value) => {
    updatePlanDay(dayIndex, (day) => ({
      ...day,
      sections: day.sections.map((section, index) => (
        index === sectionIndex
          ? {
              ...section,
              exercises: section.exercises.map((exercise, itemIndex) => (
                itemIndex === exerciseIndex ? { ...exercise, [field]: value } : exercise
              )),
            }
          : section
      )),
    }));
  };

  const linkExerciseWorkout = (dayIndex, sectionIndex, exerciseIndex, workoutId) => {
    const selectedWorkout = workoutLibrary.find((workout) => workout.id === workoutId);
    updatePlanDay(dayIndex, (day) => ({
      ...day,
      sections: day.sections.map((section, index) => (
        index === sectionIndex
          ? {
              ...section,
              exercises: section.exercises.map((exercise, itemIndex) => {
                if (itemIndex !== exerciseIndex) {
                  return exercise;
                }
                if (!selectedWorkout) {
                  return {
                    ...exercise,
                    workout_id: '',
                    workout_title: '',
                    workout_vimeo_id: '',
                    workout_thumbnail: '',
                  };
                }
                return {
                  ...exercise,
                  workout_id: selectedWorkout.id,
                  workout_title: selectedWorkout.title,
                  workout_vimeo_id: selectedWorkout.vimeoId,
                  workout_thumbnail: selectedWorkout.thumbnail || '',
                };
              }),
            }
          : section
      )),
    }));
  };

  const loadThirtyDayPreset = async () => {
    const values = form.getFieldsValue();
    const requestedDuration = Math.max(Number(values.durationDays || PLAN_GENERATION_DEFAULTS.durationDays), 1);
    const selectedCategory = values.category || PLAN_GENERATION_DEFAULTS.category;
    const selectedDifficulty = values.difficulty || PLAN_GENERATION_DEFAULTS.difficulty;
    const generatedTitle = suggestChallengeTitle({
      durationDays: requestedDuration,
      category: selectedCategory,
    });
    const generatedDescription = suggestChallengeDescription({
      durationDays: requestedDuration,
      category: selectedCategory,
      difficulty: selectedDifficulty,
    });
    const payload = {
      title: values.title || generatedTitle,
      description: values.description || generatedDescription,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      durationDays: requestedDuration,
    };

    setPlanGenerating(true);
    try {
      const response = await adminApiRequest('/admin/challenges/generate-plan', {
        method: 'POST',
        body: payload,
      });
      const generatedPlanDays = normalizePlanDays(response?.planDays || []);
      setPlanDays(generatedPlanDays);
      setActiveDayIndex(generatedPlanDays.length > 0 ? 0 : null);
      form.setFieldsValue({
        title: response?.title || payload.title,
        description: response?.description || payload.description,
        durationDays: response?.durationDays || generatedPlanDays.length || payload.durationDays,
        category: selectedCategory,
        difficulty: selectedDifficulty,
      });
      message.success(`${response?.durationDays || generatedPlanDays.length || requestedDuration}-day plan generated`);
    } catch (loadError) {
      message.error(loadError.message || 'Failed to generate challenge plan');
    } finally {
      setPlanGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await adminApiRequest(`/admin/challenges/${id}`, { method: 'DELETE' });
      setChallenges((prev) => prev.filter((challenge) => challenge.id !== id));
      message.success('Challenge deleted successfully');
    } catch (deleteError) {
      message.error(deleteError.message || 'Failed to delete challenge');
    } finally {
      setDeletingId('');
    }
  };

  const openModeration = async (challenge) => {
    setModerationChallenge(challenge);
    setModerationMessages([]);
    setModerationLoading(true);
    try {
      const response = await adminApiRequest(`/admin/challenges/${challenge.id}/chat`);
      setModerationMessages(Array.isArray(response?.messages) ? response.messages : []);
    } catch (loadError) {
      message.error(loadError.message || 'Failed to load challenge chat');
    } finally {
      setModerationLoading(false);
    }
  };

  const handleModerationDelete = async (messageId) => {
    if (!moderationChallenge) {
      return;
    }
    setModerationDeletingId(messageId);
    try {
      await adminApiRequest(`/admin/challenges/${moderationChallenge.id}/chat/messages/${messageId}`, {
        method: 'DELETE',
      });
      setModerationMessages((current) =>
        current.map((item) =>
          item.id === messageId
            ? {
                ...item,
                content: '',
                image_url: '',
                is_deleted: true,
              }
            : item
        )
      );
      message.success('Chat message removed');
    } catch (deleteError) {
      message.error(deleteError.message || 'Failed to remove message');
    } finally {
      setModerationDeletingId('');
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const normalizedPlanDays = sanitizePlanDaysForSubmit(planDays);
      const nextThumbnail = selectedThumbnail
        ? (editingChallenge?.thumbnail || '')
        : (thumbnailPreview || editingChallenge?.thumbnail || '');
      const payload = {
        ...values,
        durationDays: normalizedPlanDays.length > 0 ? normalizedPlanDays.length : values.durationDays,
        planDays: normalizedPlanDays,
        planText: normalizedPlanDays.length > 0 ? '' : (editingChallenge?.planText || values.planText || ''),
        thumbnail: nextThumbnail,
        image_base64: selectedThumbnail?.image_base64 || null,
        mime_type: selectedThumbnail?.mime_type || 'image/jpeg',
        file_name: selectedThumbnail?.file_name || null,
      };
      if (editingChallenge) {
        const updated = await adminApiRequest(`/admin/challenges/${editingChallenge.id}`, {
          method: 'PATCH',
          body: payload,
        });
        setChallenges((prev) => prev.map((challenge) => (challenge.id === editingChallenge.id ? updated : challenge)));
        message.success('Challenge updated successfully');
      } else {
        const created = await adminApiRequest('/admin/challenges', {
          method: 'POST',
          body: payload,
        });
        setChallenges((prev) => [created, ...prev]);
        message.success('Challenge added successfully');
      }
      setIsModalVisible(false);
    } catch (saveError) {
      message.error(saveError.message || 'Failed to save challenge');
    } finally {
      setSaving(false);
    }
  };

  const activeDay = activeDayIndex !== null ? planDays[activeDayIndex] : null;
  const workoutSelectOptions = workoutLibrary.map((workout) => ({
    label: `${workout.title} · Vimeo ${workout.vimeoId}`,
    value: workout.id,
  }));

  const filteredChallenges = challenges.filter((challenge) => statusFilter === 'ALL' || challenge.status === statusFilter);

  const statusToneMap = {
    ACTIVE: {
      card: 'border-l-cyan-400 shadow-cyan-500/10',
      badge: 'text-cyan-300 bg-cyan-400/10 ring-1 ring-cyan-400/20',
    },
    UPCOMING: {
      card: 'border-l-amber-400 shadow-amber-500/10',
      badge: 'text-amber-300 bg-amber-400/10 ring-1 ring-amber-400/20',
    },
    DRAFT: {
      card: 'border-l-violet-400 shadow-violet-500/10',
      badge: 'text-violet-300 bg-violet-400/10 ring-1 ring-violet-400/20',
    },
    ARCHIVED: {
      card: 'border-l-slate-400 shadow-slate-500/10',
      badge: 'text-slate-300 bg-slate-400/10 ring-1 ring-slate-400/20',
    },
  };

  return (
    <div className="flex flex-col space-y-6 pt-2 h-full text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Challenges ({filteredChallenges.length})
          </h1>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </div>
        <div className="flex w-full flex-col gap-3 md:w-auto md:items-end">
          <div className="flex flex-wrap gap-2">
            {challengeStatusFilters.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {status === 'ALL' ? 'All' : status}
              </button>
            ))}
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-md"
          >
            <FiPlus />
            Add Challenge
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 rounded-2xl shadow-xl border border-slate-700/50">
          {filteredChallenges.map((challenge) => {
            const statusTone = statusToneMap[challenge.status] || statusToneMap.DRAFT;
            return (
            <div key={challenge.id} className={`bg-[#1e293b] border border-[#334155] border-l-4 ${statusTone.card} rounded-xl p-3 flex items-center gap-4 group hover:bg-[#253245] hover:border-slate-500 transition-all relative`}>
              <div className="relative w-24 h-16 shrink-0 rounded-md overflow-hidden bg-slate-700">
                {challenge.thumbnail ? (
                  <img src={challenge.thumbnail} alt={challenge.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-800 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    No Image
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-orange-500">
                  <FaFire className="text-2xl drop-shadow-md" />
                </div>
              </div>

              <div className="flex flex-col flex-1 min-w-0 pr-6">
                <h3 className="text-sm font-semibold text-slate-100 truncate mb-1" title={challenge.title}>{challenge.title}</h3>
                <p className="text-xs text-slate-400 truncate mb-2 mt-0.5">{challenge.category} · {challenge.durationDays} days</p>
                <div className="flex items-center gap-2 mt-auto flex-wrap">
                  <span className="text-[10px] uppercase tracking-wider text-teal-300 font-semibold bg-teal-400/10 px-2 py-0.5 rounded">{challenge.difficulty}</span>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${statusTone.badge}`}>
                    {challenge.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="inline-flex items-center gap-1"><FaUsers /> {challenge.participantCount}</span>
                  <span className="inline-flex items-center gap-1"><FaTrophy /> {challenge.completionCount}</span>
                  <span className="font-semibold text-amber-300">+{challenge.points}</span>
                </div>
              </div>

              <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button title="Moderate Chat" onClick={() => openModeration(challenge)} className="text-slate-400 hover:text-cyan-400 transition-colors">
                  <FaComments size={15} />
                </button>
                <button title="Edit" onClick={() => handleEdit(challenge)} className="text-slate-400 hover:text-blue-400 transition-colors">
                  <FiEdit size={15} />
                </button>
                <Popconfirm
                  title="Delete the challenge"
                  description="Are you sure to delete this challenge?"
                  onConfirm={() => handleDelete(challenge.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <button title="Delete" disabled={deletingId === challenge.id} className="text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50">
                    <FiTrash2 size={15} />
                  </button>
                </Popconfirm>
              </div>
            </div>
          )})}
          {filteredChallenges.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-600 bg-slate-900/40 px-4 py-12 text-center text-sm text-slate-400">
              No challenges found for the selected status.
            </div>
          ) : null}
        </div>
      )}

      <Drawer
        title={<span className="text-slate-800">{editingChallenge ? 'Edit Challenge' : 'Add New Challenge'}</span>}
        open={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        destroyOnHidden
        placement="right"
        width={920}
        className="workout-modal"
        styles={{
          body: {
            paddingTop: 12,
            paddingBottom: 24,
            background: '#f8fafc',
          },
          header: {
            borderBottom: '1px solid #e2e8f0',
            paddingInline: 24,
            paddingBlock: 18,
            background: '#ffffff',
          },
          content: {
            background: '#f8fafc',
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={(changedValues, allValues) => {
            if (changedValues.category !== undefined || changedValues.durationDays !== undefined || changedValues.difficulty !== undefined) {
              applyLiveChallengeSuggestions(allValues);
            }
          }}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label={<span className="font-medium text-slate-700">Challenge Title</span>}
            rules={[{ required: true, message: 'Please input the title' }]}
          >
            <Input placeholder="e.g. Summer Strength Reset" className="py-2" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="font-medium text-slate-700">Description</span>}
            rules={[{ required: true, message: 'Please input the description' }]}
          >
            <Input.TextArea rows={4} placeholder="Describe what members should do in this challenge" />
          </Form.Item>

          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={loadThirtyDayPreset}
              disabled={planGenerating}
              title="Generate plan"
              className="flex h-10 items-center justify-center px-1 text-sky-400 transition-all hover:text-sky-300 hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.7)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {planGenerating ? <Spin size="small" /> : <FaBolt size={20} className="drop-shadow-[0_0_8px_rgba(56,189,248,0.55)]" />}
            </button>
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Day-by-Day Plan</h3>
                <p className="text-xs text-slate-500">Each day can contain multiple sections, and each section can contain multiple exercises.</p>
              </div>
              <Button onClick={addPlanDay} type="dashed">
                Add Day
              </Button>
            </div>

            {planDays.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                No plan days yet. Generate a plan for the selected duration or add days manually.
              </div>
            ) : (
              <div className="space-y-4">
                {planDays.map((day, dayIndex) => (
                  <button
                    key={`day-${day.day_number}-${dayIndex}`}
                    type="button"
                    onClick={() => openDayEditor(dayIndex)}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-cyan-300 hover:bg-cyan-50/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">Day {day.day_number}</p>
                        <h4 className="mt-1 text-sm font-semibold text-slate-800">{day.title || `Day ${day.day_number}`}</h4>
                        <p className="mt-1 text-xs text-slate-500">
                          {day.focus || 'Click to open and edit this day.'}
                        </p>
                      </div>
                      <FiEdit size={16} className="mt-1 shrink-0 text-slate-400" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1">{day.sections.length} sections</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1">
                        {day.sections.reduce((total, section) => total + section.exercises.length, 0)} exercises
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Form.Item
            name="category"
            label={<span className="font-medium text-slate-700">Category</span>}
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select category" size="large">
              {challengeCategories.map((category) => (
                <Select.Option key={category} value={category}>
                  {category}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="durationDays"
              label={<span className="font-medium text-slate-700">Duration Days</span>}
              rules={[{ required: true, message: 'Please input the duration' }]}
            >
              <InputNumber min={1} max={365} className="w-full" />
            </Form.Item>

            <Form.Item
              name="points"
              label={<span className="font-medium text-slate-700">Points</span>}
              rules={[{ required: true, message: 'Please input the points' }]}
            >
              <InputNumber min={0} max={100000} className="w-full" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="difficulty"
              label={<span className="font-medium text-slate-700">Difficulty Level</span>}
              rules={[{ required: true, message: 'Please select a difficulty' }]}
            >
              <Select placeholder="Select difficulty" size="large">
                <Select.Option value="BEGINNER">BEGINNER</Select.Option>
                <Select.Option value="INTERMEDIATE">INTERMEDIATE</Select.Option>
                <Select.Option value="ADVANCED">ADVANCED</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label={<span className="font-medium text-slate-700">Status</span>}
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select placeholder="Select status" size="large">
                <Select.Option value="ACTIVE">ACTIVE</Select.Option>
                <Select.Option value="UPCOMING">UPCOMING</Select.Option>
                <Select.Option value="DRAFT">DRAFT</Select.Option>
                <Select.Option value="ARCHIVED">ARCHIVED</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item label={<span className="font-medium text-slate-700">Thumbnail Upload</span>}>
            <Dragger
              accept="image/png,image/jpeg,image/webp"
              beforeUpload={() => false}
              multiple={false}
              fileList={thumbnailFileList}
              onChange={handleThumbnailChange}
              onRemove={handleThumbnailRemove}
              className="bg-slate-50"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag thumbnail image here</p>
              <p className="ant-upload-hint">Supports PNG, JPG, and WEBP. Adding a new image replaces the current one.</p>
            </Dragger>
            {thumbnailPreview ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <img src={thumbnailPreview} alt="Challenge thumbnail preview" className="h-40 w-full object-cover" />
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500">No thumbnail selected yet.</p>
            )}
          </Form.Item>

          <div className="flex justify-end gap-3 mt-8">
            <Button size="large" onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>
            <Button size="large" type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-500" loading={saving}>
              {editingChallenge ? 'Update Challenge' : 'Add Challenge'}
            </Button>
          </div>
        </Form>
      </Drawer>

      <Modal
        title={<span className="text-slate-800">{activeDay ? `Edit Day ${activeDay.day_number}` : 'Edit Day'}</span>}
        open={activeDayIndex !== null && Boolean(activeDay)}
        onCancel={() => setActiveDayIndex(null)}
        footer={null}
        width={980}
        destroyOnHidden
      >
        {activeDay ? (
          <div className="mt-3 max-h-[75vh] overflow-y-auto pr-1">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">Day {activeDay.day_number}</p>
                <p className="text-xs text-slate-500">Update the title, sections, exercises, and linked Vimeo workouts for this day.</p>
              </div>
              <Button danger type="text" onClick={() => removePlanDay(activeDayIndex)}>
                Remove Day
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Input
                value={activeDay.title}
                onChange={(event) => updatePlanDay(activeDayIndex, (currentDay) => ({ ...currentDay, title: event.target.value }))}
                placeholder="Day title"
              />
              <Input
                value={activeDay.focus}
                onChange={(event) => updatePlanDay(activeDayIndex, (currentDay) => ({ ...currentDay, focus: event.target.value }))}
                placeholder="Focus"
              />
            </div>

            <Input.TextArea
              className="mt-3"
              rows={3}
              value={activeDay.notes}
              onChange={(event) => updatePlanDay(activeDayIndex, (currentDay) => ({ ...currentDay, notes: event.target.value }))}
              placeholder="Coaching notes for the day"
            />

            <div className="mt-4 space-y-3">
              {activeDay.sections.map((section, sectionIndex) => (
                <div key={section.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-slate-800">Section {sectionIndex + 1}</h4>
                    <Button danger type="text" onClick={() => removeSection(activeDayIndex, sectionIndex)}>
                      Remove Section
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_140px]">
                    <Input
                      value={section.title}
                      onChange={(event) => updateSection(activeDayIndex, sectionIndex, 'title', event.target.value)}
                      placeholder="Section title"
                    />
                    <InputNumber
                      min={0}
                      max={240}
                      className="w-full"
                      value={section.estimated_minutes}
                      onChange={(value) => updateSection(activeDayIndex, sectionIndex, 'estimated_minutes', value)}
                      placeholder="Minutes"
                    />
                  </div>

                  <Input.TextArea
                    className="mt-3"
                    rows={2}
                    value={section.description}
                    onChange={(event) => updateSection(activeDayIndex, sectionIndex, 'description', event.target.value)}
                    placeholder="Section description"
                  />

                  <div className="mt-3 space-y-3">
                    {section.exercises.map((exercise, exerciseIndex) => (
                      <div key={exercise.id} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exercise {exerciseIndex + 1}</p>
                          <Button danger type="text" onClick={() => removeExercise(activeDayIndex, sectionIndex, exerciseIndex)}>
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <Input
                            value={exercise.name}
                            onChange={(event) => updateExercise(activeDayIndex, sectionIndex, exerciseIndex, 'name', event.target.value)}
                            placeholder="Exercise name"
                          />
                          <Input
                            value={exercise.details}
                            onChange={(event) => updateExercise(activeDayIndex, sectionIndex, exerciseIndex, 'details', event.target.value)}
                            placeholder="Sets / reps / time"
                          />
                        </div>
                        <Input.TextArea
                          className="mt-3"
                          rows={2}
                          value={exercise.notes}
                          onChange={(event) => updateExercise(activeDayIndex, sectionIndex, exerciseIndex, 'notes', event.target.value)}
                          placeholder="Exercise notes"
                        />
                        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                          <Select
                            showSearch
                            allowClear
                            placeholder={workoutLibraryLoading ? 'Loading Vimeo library...' : 'Attach a Vimeo workout from library'}
                            loading={workoutLibraryLoading}
                            value={exercise.workout_id || undefined}
                            options={workoutSelectOptions}
                            optionFilterProp="label"
                            onChange={(value) => linkExerciseWorkout(activeDayIndex, sectionIndex, exerciseIndex, value || '')}
                          />
                          {exercise.workout_vimeo_id ? (
                            <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700">
                              Linked: Vimeo {exercise.workout_vimeo_id}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button onClick={() => addExercise(activeDayIndex, sectionIndex)} type="dashed">
                      Add Exercise
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between gap-3">
              <Button onClick={() => addSection(activeDayIndex)} type="dashed">
                Add Section
              </Button>
              <Button type="primary" onClick={() => setActiveDayIndex(null)} className="bg-blue-600 hover:bg-blue-500">
                Done
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        title={<span className="text-slate-800">Challenge Chat Moderation</span>}
        open={Boolean(moderationChallenge)}
        onCancel={() => setModerationChallenge(null)}
        footer={null}
        width={860}
        destroyOnHidden
      >
        <div className="mt-2">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-800">{moderationChallenge?.title}</h3>
            <p className="text-sm text-slate-500">{moderationChallenge?.category} · {moderationChallenge?.durationDays} days</p>
          </div>

          {moderationLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spin size="large" />
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
              {moderationMessages.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{item.author_name}</span>
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">{item.message_type}</span>
                        {item.is_deleted ? <span className="text-[10px] font-semibold uppercase tracking-wide text-red-500">Deleted</span> : null}
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                        {item.is_deleted ? 'Message deleted' : item.content || (item.image_url ? 'Image attachment' : '')}
                      </p>
                      {item.image_url && !item.is_deleted ? (
                        <img src={item.image_url} alt="Challenge chat" className="mt-3 max-h-56 rounded-lg border border-slate-200 object-cover" />
                      ) : null}
                    </div>
                    {!item.is_deleted ? (
                      <Popconfirm
                        title="Remove this message?"
                        description="This will hide the message from the challenge chat."
                        onConfirm={() => handleModerationDelete(item.id)}
                        okText="Remove"
                        cancelText="Cancel"
                      >
                        <button
                          title="Delete Message"
                          disabled={moderationDeletingId === item.id}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </Popconfirm>
                    ) : null}
                  </div>
                </div>
              ))}
              {moderationMessages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No chat messages yet.
                </div>
              ) : null}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Challenges;

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, message, Popconfirm, Button, Spin, Upload } from 'antd';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { FaComments, FaFire, FaUsers, FaTrophy } from 'react-icons/fa';
import { InboxOutlined } from '@ant-design/icons';
import { adminApiRequest } from '../../../services/auth.service';

const defaultThumbnail = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=300&auto=format&fit=crop';
const challengeCategories = ['Strength', 'Cardio', 'Mindfulness', 'Nutrition', 'Family'];
const { Dragger } = Upload;
const challengeStatusFilters = ['ALL', 'ACTIVE', 'UPCOMING', 'DRAFT', 'ARCHIVED'];
const THIRTY_DAY_PLAN_PRESET = {
  title: '30-Day Strength & Consistency Reset',
  description: 'A guided 30-day challenge designed to improve consistency, movement quality, recovery, and overall strength with realistic daily actions.',
  planText: `WEEK 1 - FOUNDATION
Day 1: Full-body bodyweight session. Focus on form, tempo, and breathing.
Day 2: 30-minute brisk walk and 10 minutes of mobility.
Day 3: Lower-body strength focus with squats, glute bridges, and lunges.
Day 4: Recovery day. Stretching, hydration target, and sleep focus.
Day 5: Upper-body strength focus with push-ups, rows, and planks.
Day 6: Low-impact cardio for 25-35 minutes.
Day 7: Weekly reset. Progress check-in, meal prep, and light movement.

WEEK 2 - CONSISTENCY
Day 8: Full-body strength circuit with controlled reps.
Day 9: Core and posture session plus 8,000+ steps.
Day 10: Lower-body progression. Add reps or time under tension.
Day 11: Recovery walk and mobility flow.
Day 12: Upper-body progression. Add one extra round.
Day 13: Cardio endurance session for 30 minutes.
Day 14: Weekly reset. Reflect on wins, friction points, and energy.

WEEK 3 - PROGRESSION
Day 15: Full-body strength with shorter rest periods.
Day 16: Active recovery and deep stretching.
Day 17: Lower-body challenge with unilateral work and core finisher.
Day 18: Cardio intervals. Short bursts with controlled recovery.
Day 19: Upper-body strength and stability work.
Day 20: Long walk or easy cardio session. Stay in a sustainable zone.
Day 21: Weekly reset. Review progress, update goals, prepare next week.

WEEK 4 - FINISH STRONG
Day 22: Full-body power and control session.
Day 23: Recovery mobility, hydration, and sleep optimization day.
Day 24: Lower-body strength challenge. Match or beat prior output.
Day 25: Cardio intervals or tempo session.
Day 26: Upper-body challenge. Focus on clean reps and consistency.
Day 27: Active recovery plus mindset reset.
Day 28: Full-body finisher workout with moderate intensity.
Day 29: Light movement, stretch, and personal reflection.
Day 30: Final challenge day. Complete a full-body test session and share your 30-day results.

COACHING NOTES
- Aim for consistency over perfection.
- Prioritize sleep, hydration, and protein intake.
- If soreness is high, reduce intensity but keep the habit alive.
- Encourage users to share progress daily in challenge chat and use @Coach for support.`,
  category: 'Strength',
  durationDays: 30,
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
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [moderationChallenge, setModerationChallenge] = useState(null);
  const [moderationMessages, setModerationMessages] = useState([]);
  const [moderationLoading, setModerationLoading] = useState(false);
  const [moderationDeletingId, setModerationDeletingId] = useState('');
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

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleAdd = () => {
    setEditingChallenge(null);
    form.resetFields();
    setSelectedThumbnail(null);
    setThumbnailPreview('');
    setThumbnailFileList([]);
    form.setFieldsValue({
      category: 'Strength',
      durationDays: 7,
      points: 100,
      difficulty: 'BEGINNER',
      status: 'ACTIVE',
    });
    setIsModalVisible(true);
  };

  const handleEdit = (challenge) => {
    setEditingChallenge(challenge);
    form.setFieldsValue({
      title: challenge.title,
      description: challenge.description,
      planText: challenge.planText,
      category: challenge.category,
      durationDays: challenge.durationDays,
      points: challenge.points,
      difficulty: challenge.difficulty,
      status: challenge.status,
    });
    setSelectedThumbnail(null);
    setThumbnailPreview(challenge.thumbnail || '');
    setThumbnailFileList([]);
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

  const loadThirtyDayPreset = () => {
    form.setFieldsValue(THIRTY_DAY_PLAN_PRESET);
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
      const payload = {
        ...values,
        thumbnail: thumbnailPreview || editingChallenge?.thumbnail || '',
        ...(selectedThumbnail || {}),
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
                <img src={challenge.thumbnail || defaultThumbnail} alt={challenge.title} className="w-full h-full object-cover" />
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

      <Modal
        title={<span className="text-slate-800">{editingChallenge ? 'Edit Challenge' : 'Add New Challenge'}</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
        className="workout-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label={<span className="font-medium text-slate-700">Challenge Title</span>}
            rules={[{ required: true, message: 'Please input the title' }]}
          >
            <Input placeholder="e.g. 30-Day Shred" className="py-2" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="font-medium text-slate-700">Description</span>}
            rules={[{ required: true, message: 'Please input the description' }]}
          >
            <Input.TextArea rows={4} placeholder="Describe what members should do in this challenge" />
          </Form.Item>

          <div className="mb-4 flex justify-end">
            <Button onClick={loadThirtyDayPreset} type="default">
              Load 30-Day Preset
            </Button>
          </div>

          <Form.Item
            name="planText"
            label={<span className="font-medium text-slate-700">Plan Details</span>}
          >
            <Input.TextArea rows={14} placeholder="Add the day-by-day challenge plan here" />
          </Form.Item>

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
              maxCount={1}
              fileList={thumbnailFileList}
              onChange={handleThumbnailChange}
              onRemove={handleThumbnailRemove}
              className="bg-slate-50"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag thumbnail image here</p>
              <p className="ant-upload-hint">Supports PNG, JPG, and WEBP.</p>
            </Dragger>
            {thumbnailPreview ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <img src={thumbnailPreview} alt="Challenge thumbnail preview" className="h-40 w-full object-cover" />
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500">No thumbnail selected. A default image will be used if you save without uploading one.</p>
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
      </Modal>

      <Modal
        title={<span className="text-slate-800">Challenge Chat Moderation</span>}
        open={Boolean(moderationChallenge)}
        onCancel={() => setModerationChallenge(null)}
        footer={null}
        width={860}
        destroyOnClose
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

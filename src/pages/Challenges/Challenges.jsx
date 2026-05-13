import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, message, Popconfirm, Button, Spin } from 'antd';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { FaFire, FaUsers, FaTrophy } from 'react-icons/fa';
import { adminApiRequest } from '../../../services/auth.service';

const defaultThumbnail = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=300&auto=format&fit=crop';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
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
    form.setFieldsValue({
      category: 'Strength',
      durationDays: 7,
      points: 100,
      difficulty: 'BEGINNER',
      status: 'ACTIVE',
      thumbnail: defaultThumbnail,
    });
    setIsModalVisible(true);
  };

  const handleEdit = (challenge) => {
    setEditingChallenge(challenge);
    form.setFieldsValue({
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      durationDays: challenge.durationDays,
      points: challenge.points,
      difficulty: challenge.difficulty,
      status: challenge.status,
      thumbnail: challenge.thumbnail || defaultThumbnail,
    });
    setIsModalVisible(true);
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

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editingChallenge) {
        const updated = await adminApiRequest(`/admin/challenges/${editingChallenge.id}`, {
          method: 'PATCH',
          body: values,
        });
        setChallenges((prev) => prev.map((challenge) => (challenge.id === editingChallenge.id ? updated : challenge)));
        message.success('Challenge updated successfully');
      } else {
        const created = await adminApiRequest('/admin/challenges', {
          method: 'POST',
          body: values,
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

  return (
    <div className="flex flex-col space-y-6 pt-2 h-full text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Challenges ({challenges.length})
          </h1>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </div>
        <div className="flex w-full md:w-auto">
          <button
            onClick={handleAdd}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-md"
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
          {challenges.map((challenge) => (
            <div key={challenge.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-3 flex items-center gap-4 group hover:bg-[#253245] hover:border-slate-500 transition-all relative">
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
                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                    challenge.status === 'ACTIVE'
                      ? 'text-blue-300 bg-blue-400/10'
                      : challenge.status === 'UPCOMING'
                        ? 'text-orange-300 bg-orange-400/10'
                        : challenge.status === 'ARCHIVED'
                          ? 'text-slate-300 bg-slate-400/10'
                          : 'text-violet-300 bg-violet-400/10'
                  }`}>
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
          ))}
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

          <Form.Item
            name="category"
            label={<span className="font-medium text-slate-700">Category</span>}
            rules={[{ required: true, message: 'Please input the category' }]}
          >
            <Input placeholder="e.g. Strength" className="py-2" />
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

          <Form.Item
            name="thumbnail"
            label={<span className="font-medium text-slate-700">Thumbnail URL</span>}
          >
            <Input placeholder="https://..." className="py-2" />
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
    </div>
  );
};

export default Challenges;

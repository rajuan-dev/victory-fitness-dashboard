import React, { useState } from 'react';
import { Modal, Form, Input, Select, message, Popconfirm, Button } from 'antd';
import { globalDemoData } from '../../utils/demoData';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';

const Challenges = () => {
  const [challenges, setChallenges] = useState(globalDemoData.challenges || []);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingChallenge(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (challenge) => {
    setEditingChallenge(challenge);
    form.setFieldsValue(challenge);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    setChallenges(prev => prev.filter(c => c.id !== id));
    message.success('Challenge deleted successfully (Demo)');
  };

  const handleSubmit = (values) => {
    if (editingChallenge) {
      setChallenges(prev => prev.map(c => c.id === editingChallenge.id ? { ...c, ...values } : c));
      message.success('Challenge updated successfully (Demo)');
    } else {
      const newChallenge = {
        id: Date.now().toString(),
        ...values,
        thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=300&auto=format&fit=crop"
      };
      setChallenges([newChallenge, ...challenges]);
      message.success('Challenge added successfully (Demo)');
    }
    setIsModalVisible(false);
  };

  return (
    <div className="flex flex-col space-y-6 pt-2 h-full text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Challenges ({challenges.length})
          </h1>
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 rounded-2xl shadow-xl border border-slate-700/50">
        {challenges.map(challenge => (
          <div key={challenge.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-3 flex items-center gap-4 group hover:bg-[#253245] hover:border-slate-500 transition-all relative">
            {/* Thumbnail */}
            <div className="relative w-24 h-16 shrink-0 rounded-md overflow-hidden bg-slate-700">
              <img src={challenge.thumbnail} alt={challenge.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-orange-500">
                <FaFire className="text-2xl drop-shadow-md" />
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1 min-w-0 pr-6">
              <h3 className="text-sm font-semibold text-slate-100 truncate mb-1" title={challenge.title}>{challenge.title}</h3>
              <p className="text-xs text-slate-400 truncate mb-2 mt-0.5">Duration: {challenge.duration}</p>
              <div className="flex items-center gap-2 mt-auto">
                <span className="text-[10px] uppercase tracking-wider text-teal-300 font-semibold bg-teal-400/10 px-2 py-0.5 rounded">{challenge.difficulty}</span>
                <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded 
                  ${challenge.status === 'Active' ? 'text-blue-300 bg-blue-400/10' :
                    challenge.status === 'Upcoming' ? 'text-orange-300 bg-orange-400/10' : 'text-slate-300 bg-slate-400/10'}`}>
                  {challenge.status}
                </span>
              </div>
            </div>

            {/* Actions */}
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
                <button title="Delete" className="text-slate-400 hover:text-red-400 transition-colors">
                  <FiTrash2 size={15} />
                </button>
              </Popconfirm>
            </div>
          </div>
        ))}
      </div>

      <Modal
        title={<span className="text-slate-800">{editingChallenge ? "Edit Challenge" : "Add New Challenge"}</span>}
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
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input placeholder="e.g. 30-Day Shred" className="py-2" />
          </Form.Item>

          <Form.Item
            name="duration"
            label={<span className="font-medium text-slate-700">Duration</span>}
            rules={[{ required: true, message: 'Please input the duration!' }]}
          >
            <Input placeholder="e.g. 4 Weeks" className="py-2" />
          </Form.Item>

          <Form.Item
            name="difficulty"
            label={<span className="font-medium text-slate-700">Difficulty Level</span>}
            rules={[{ required: true, message: 'Please select a difficulty!' }]}
          >
            <Select placeholder="Select difficulty" size="large">
              <Select.Option value="Beginner">Beginner</Select.Option>
              <Select.Option value="Intermediate">Intermediate</Select.Option>
              <Select.Option value="Advanced">Advanced</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label={<span className="font-medium text-slate-700">Status</span>}
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select placeholder="Select status" size="large">
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Upcoming">Upcoming</Select.Option>
              <Select.Option value="Draft">Draft</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-3 mt-8">
            <Button size="large" onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>
            <Button size="large" type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-500">
              {editingChallenge ? 'Update Challenge' : 'Add Challenge'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Challenges;

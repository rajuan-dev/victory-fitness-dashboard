import React, { useState } from 'react';
import { Modal, Form, Input, Select, message, Popconfirm, Button } from 'antd';
import { globalDemoData } from '../../utils/demoData';
import { FiEdit, FiTrash2, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { FaPlayCircle } from 'react-icons/fa';

const Workouts = () => {
  const [workouts, setWorkouts] = useState(globalDemoData.workouts || []);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingWorkout(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (workout) => {
    setEditingWorkout(workout);
    form.setFieldsValue(workout);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
    message.success('Workout deleted successfully (Demo)');
  };

  const handleSubmit = (values) => {
    if (editingWorkout) {
      setWorkouts(prev => prev.map(w => w.id === editingWorkout.id ? { ...w, ...values } : w));
      message.success('Workout updated successfully (Demo)');
    } else {
      const newWorkout = {
        id: Date.now().toString(),
        ...values,
        thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=300&auto=format&fit=crop"
      };
      setWorkouts([newWorkout, ...workouts]);
      message.success('Workout added successfully (Demo)');
    }
    setIsModalVisible(false);
  };

  const handleSync = () => {
    const hide = message.loading('Syncing Vimeo Videos...', 0);
    setTimeout(() => {
      hide();
      message.success('Vimeo videos synced successfully! (Demo)');
    }, 1500);
  };

  return (
    <div className="flex flex-col space-y-6 pt-2 h-full text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Workout Library ({workouts.length})
          </h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={handleSync}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-teal-400 font-semibold py-2.5 px-4 rounded-lg border border-teal-500/30 transition-all"
          >
            <FiRefreshCw />
            Sync Vimeo
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-md"
          >
            <FiPlus />
            Add Workout
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 rounded-2xl shadow-xl border border-slate-700/50">
        {workouts.map(workout => (
          <div key={workout.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-3 flex items-center gap-4 group hover:bg-[#253245] hover:border-slate-500 transition-all relative">
            {/* Thumbnail */}
            <div className="relative w-24 h-16 shrink-0 rounded-md overflow-hidden bg-slate-700">
              <img src={workout.thumbnail} alt={workout.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <FaPlayCircle className="text-white text-2xl drop-shadow-md" />
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1 min-w-0 pr-6">
              <h3 className="text-sm font-semibold text-slate-100 truncate mb-1" title={workout.title}>{workout.title}</h3>
              <p className="text-xs text-slate-400 truncate mb-2 mt-0.5">Vimeo ID: {workout.vimeoId}</p>
              <div className="flex items-center gap-2 mt-auto">
                <span className="text-[10px] uppercase tracking-wider text-teal-300 font-semibold bg-teal-400/10 px-2 py-0.5 rounded">{workout.tag}</span>
                <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${workout.visibility === 'Published' ? 'text-blue-300 bg-blue-400/10' : 'text-slate-300 bg-slate-400/10'}`}>
                  {workout.visibility}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
              <button title="Edit" onClick={() => handleEdit(workout)} className="text-slate-400 hover:text-blue-400 transition-colors">
                <FiEdit size={15} />
              </button>
              <Popconfirm
                title="Delete the workout"
                description="Are you sure to delete this workout?"
                onConfirm={() => handleDelete(workout.id)}
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
        title={<span className="text-slate-800">{editingWorkout ? "Edit Workout" : "Add New Workout"}</span>}
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
            label={<span className="font-medium text-slate-700">Workout Title</span>}
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input placeholder="e.g. Full Body Strength" className="py-2" />
          </Form.Item>

          <Form.Item
            name="vimeoId"
            label={<span className="font-medium text-slate-700">Vimeo Video ID</span>}
            rules={[{ required: true, message: 'Please input the Vimeo ID!' }]}
          >
            <Input placeholder="e.g. 740239410" className="py-2" />
          </Form.Item>

          <Form.Item
            name="tag"
            label={<span className="font-medium text-slate-700">Category Tag</span>}
            rules={[{ required: true, message: 'Please select a tag!' }]}
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
            rules={[{ required: true, message: 'Please select visibility!' }]}
          >
            <Select placeholder="Select visibility" size="large">
              <Select.Option value="Published">Published</Select.Option>
              <Select.Option value="Draft">Draft</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-3 mt-8">
            <Button size="large" onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>
            <Button size="large" type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-500">
              {editingWorkout ? 'Update Workout' : 'Add Workout'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Workouts;

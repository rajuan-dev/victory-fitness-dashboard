import React, { useState } from 'react';
import { Modal, Form, Input, Select, message, Popconfirm, Button } from 'antd';
import { globalDemoData } from '../../utils/demoData';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';

const Masterclasses = () => {
  const [masterclasses, setMasterclasses] = useState(globalDemoData.masterclasses || []);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMasterclass, setEditingMasterclass] = useState(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingMasterclass(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (mcs) => {
    setEditingMasterclass(mcs);
    form.setFieldsValue(mcs);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    setMasterclasses(prev => prev.filter(c => c.id !== id));
    message.success('Masterclass deleted successfully (Demo)');
  };

  const handleSubmit = (values) => {
    if (editingMasterclass) {
      setMasterclasses(prev => prev.map(c => c.id === editingMasterclass.id ? { ...c, ...values } : c));
      message.success('Masterclass updated successfully (Demo)');
    } else {
      const newMasterclass = {
        id: Date.now().toString(),
        ...values,
        thumbnailUrl: values.thumbnailUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=300&auto=format&fit=crop"
      };
      setMasterclasses([newMasterclass, ...masterclasses]);
      message.success('Masterclass added successfully (Demo)');
    }
    setIsModalVisible(false);
  };

  return (
    <div className="flex flex-col space-y-6 pt-2 h-full text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            Longevity Masterclasses ({masterclasses.length})
          </h1>
        </div>
        <div className="flex w-full md:w-auto">
          <button 
            onClick={handleAdd}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#00e5ff] hover:bg-[#33ebfc] text-[#0f172a] text-sm font-bold tracking-wide py-2 px-4 rounded transition-all shadow-md"
          >
            <FiPlus strokeWidth={3} />
            Add Masterclass
          </button>
        </div>
      </div>

      {masterclasses.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <p className="text-slate-500 font-medium text-sm">No masterclasses found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 rounded-2xl shadow-xl border border-slate-700/50">
          {masterclasses.map(mcs => (
            <div key={mcs.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-3 flex items-center gap-4 group hover:bg-[#253245] hover:border-slate-500 transition-all relative">
              {/* Thumbnail */}
              <div className="relative w-24 h-16 shrink-0 rounded-md overflow-hidden bg-slate-700">
                <img src={mcs.thumbnailUrl} alt={mcs.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[#00e5ff]">
                   <FaGraduationCap className="text-2xl drop-shadow-md" />
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col flex-1 min-w-0 pr-6">
                <h3 className="text-sm font-semibold text-slate-100 truncate mb-1" title={mcs.title}>{mcs.title}</h3>
                <p className="text-xs text-slate-400 truncate mb-2 mt-0.5">Duration: {mcs.duration}</p>
                <div className="flex items-center gap-2 mt-auto">
                  <span className="text-[10px] uppercase tracking-wider text-teal-300 font-semibold bg-teal-400/10 px-2 py-0.5 rounded">{mcs.category}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button title="Edit" onClick={() => handleEdit(mcs)} className="text-slate-400 hover:text-blue-400 transition-colors">
                  <FiEdit size={15} />
                </button>
                <Popconfirm
                  title="Delete Masterclass"
                  description="Are you sure to delete this masterclass?"
                  onConfirm={() => handleDelete(mcs.id)}
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
      )}

      {/* Editor Modal designed to match screenshot #2 exactly */}
      <Modal
        title={<span className="text-slate-100 font-bold text-lg select-none">{editingMasterclass ? "Edit Masterclass" : "Add Masterclass"}</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
        width={750}
        closeIcon={<span className="text-slate-400 hover:text-white text-xl">×</span>}
        className="dark-modal-override"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-6 font-sans"
        >
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-2">
            <Form.Item
              name="title"
              label={<span className="font-black text-[11px] uppercase tracking-widest text-slate-300">TITLE</span>}
              rules={[{ required: true, message: 'Please input the title!' }]}
              className="mb-4"
            >
              <Input className="bg-[#1e293b] border-[#334155] text-slate-100 hover:border-slate-400 focus:border-[#00e5ff] rounded-md h-10" />
            </Form.Item>
            
            <Form.Item
              name="category"
              label={<span className="font-black text-[11px] uppercase tracking-widest text-slate-300">CATEGORY</span>}
              rules={[{ required: true, message: 'Please select a category!' }]}
              className="mb-4 text-white"
            >
              <Select 
                popupClassName="dark-select-popup"
                className="bg-[#1e293b] border-[#334155] text-white rounded-md h-10"
              >
                <Select.Option value="Science">Science</Select.Option>
                <Select.Option value="Nutrition">Nutrition</Select.Option>
                <Select.Option value="Biomechanics">Biomechanics</Select.Option>
                <Select.Option value="Psychology">Psychology</Select.Option>
              </Select>
            </Form.Item>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-2">
            <Form.Item
              name="duration"
              label={<span className="font-black text-[11px] uppercase tracking-widest text-slate-300">DURATION (E.G. 15:00)</span>}
              rules={[{ required: true, message: 'Please input duration!' }]}
              className="mb-4"
            >
              <Input placeholder="10:00" className="bg-[#1e293b] border-[#334155] text-slate-100 hover:border-slate-400 focus:border-[#00e5ff] rounded-md h-10" />
            </Form.Item>

            <Form.Item
              name="thumbnailUrl"
              label={<span className="font-black text-[11px] uppercase tracking-widest text-slate-300">THUMBNAIL URL</span>}
              className="mb-4"
              initialValue="https://picsum.photos/seed/longevi/300/200"
            >
              <Input className="bg-[#1e293b] border-[#334155] text-slate-100 hover:border-slate-400 focus:border-[#00e5ff] rounded-md h-10" />
            </Form.Item>
          </div>

          {/* Row 3 */}
          <Form.Item
            name="description"
            label={<span className="font-black text-[11px] uppercase tracking-widest text-slate-300">DESCRIPTION</span>}
            className="mb-6"
            rules={[{ required: true, message: 'Please input a description!' }]}
          >
            <Input.TextArea rows={3} className="bg-[#1e293b] border-[#334155] text-slate-100 hover:border-slate-400 focus:border-[#00e5ff] rounded-md resize-none" />
          </Form.Item>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-2">
            <Form.Item
              name="videoUrl"
              label={<span className="font-black text-[11px] uppercase tracking-widest text-slate-300">VIDEO URL (YOUTUBE/VIMEO)</span>}
              className="mb-4"
              rules={[{ required: true, message: 'Please enter a video URL!' }]}
            >
              <Input className="bg-[#1e293b] border-[#334155] text-slate-100 hover:border-slate-400 focus:border-[#00e5ff] rounded-md h-10" />
            </Form.Item>

            <Form.Item
              name="audioUrl"
              label={<span className="font-black text-[11px] uppercase tracking-widest text-slate-300">AUDIO URL (OPTIONAL)</span>}
              className="mb-4"
            >
              <Input className="bg-[#1e293b] border-[#334155] text-slate-100 hover:border-slate-400 focus:border-[#00e5ff] rounded-md h-10" />
            </Form.Item>
          </div>

          {/* Row 5 */}
          <Form.Item
            name="educationalContent"
            label={<span className="font-black text-[11px] uppercase tracking-widest text-slate-300">EDUCATIONAL CONTENT (TEXT/MARKDOWN)</span>}
            className="mb-8"
          >
            <Input.TextArea placeholder="Add detailed text education here..." rows={4} className="bg-[#1e293b] border-[#334155] text-slate-400 hover:border-slate-400 focus:border-[#00e5ff] rounded-md resize-none pt-3" />
          </Form.Item>

          <div className="flex justify-between gap-4">
            <Button 
              size="large" 
              onClick={() => setIsModalVisible(false)}
              className="flex-1 bg-[#1e293b] border-transparent text-slate-100 font-bold hover:bg-slate-700 hover:text-white h-12"
            >
              Cancel
            </Button>
            <Button 
              size="large" 
              type="primary" 
              htmlType="submit" 
              className="flex-1 bg-[#00e5ff] hover:bg-[#33ebfc] text-[#0f172a] font-bold border-none h-12"
            >
              {editingMasterclass ? 'Update Masterclass' : 'Save Masterclass'}
            </Button>
          </div>
        </Form>
      </Modal>

      <style dangerouslySetInnerHTML={{__html: `
        .dark-modal-override .ant-modal-content {
          background-color: #0f172a !important;
          border: 1px solid #1e293b;
        }
        .dark-modal-override .ant-modal-header {
          background-color: #0f172a !important;
          border-bottom: 1px solid #1e293b;
          padding-bottom: 16px;
        }
        .dark-select-popup .ant-select-item {
          color: #f1f5f9;
        }
        .dark-select-popup {
          background-color: #1e293b !important;
        }
        .dark-select-popup .ant-select-item-option-active {
           background-color: #334155 !important;
        }
      `}} />
    </div>
  );
};

export default Masterclasses;

import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Switch, Button, message, Popconfirm, InputNumber } from 'antd';
import { FiEdit, FiTrash2, FiPlus, FiCheck } from 'react-icons/fi';
import { FaMedal, FaRegCircle } from 'react-icons/fa';
import { IoDiamond } from "react-icons/io5";
import {
  createAdminSubscriptionPlan,
  deleteAdminSubscriptionPlan,
  listAdminSubscriptionPlans,
  updateAdminSubscriptionPlan,
} from '../../../services/admin-content.service';

const Subscriptions = () => {
  const [plans, setPlans] = useState([]);
  const [isYearly, setIsYearly] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    let isMounted = true;

    const loadPlans = async () => {
      try {
        const response = await listAdminSubscriptionPlans();
        if (isMounted) {
          setPlans(Array.isArray(response?.items) ? response.items : []);
        }
      } catch (error) {
        message.error(error.message || 'Failed to load subscription plans');
      }
    };

    loadPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAdd = () => {
    setEditingPlan(null);
    form.resetFields();
    // Provide a default empty feature slot
    form.setFieldsValue({ features: [""] });
    setIsModalVisible(true);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    form.setFieldsValue(plan);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAdminSubscriptionPlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
      message.success('Plan deleted successfully');
    } catch (error) {
      message.error(error.message || 'Failed to delete plan');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingPlan) {
        const updated = await updateAdminSubscriptionPlan(editingPlan.id, values);
        setPlans(prev => prev.map(p => p.id === editingPlan.id ? updated : p));
        message.success('Plan updated successfully');
      } else {
        const created = await createAdminSubscriptionPlan(values);
        setPlans(prev => [...prev, created]);
        message.success('Plan added successfully');
      }
      setIsModalVisible(false);
    } catch (error) {
      message.error(error.message || 'Failed to save plan');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'silver_medal': return <span className="bg-[#b4b4bb] p-2 rounded-full inline-flex"><FaMedal size={20} className="text-white" /></span>;
      case 'gold_medal': return <span className="bg-[#fbbf24] p-2 rounded-full inline-flex"><FaMedal size={20} className="text-white" /></span>;
      case 'diamond': return <span className="text-[#38bdf8]"><IoDiamond size={32} /></span>;
      case 'circle': return <FaRegCircle strokeWidth={3} size={30} className="text-[#fb7185] mb-1" />;
      default: return <FaMedal size={24} className="text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col space-y-6 pt-2 pb-10 min-h-screen text-slate-100 font-sans tracking-wide">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Manage Subscriptions
          </h1>
        </div>
        <div>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-md"
          >
            <FiPlus />
            Add New Plan
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center mt-6 mb-12">
        <h2 className="text-3xl md:text-5xl font-black text-slate-800 uppercase tracking-tight mb-4">
          CHANGE YOUR <span className="text-[#00e5ff]">STRUCTURE</span>
        </h2>
        <p className="text-slate-500 text-sm md:text-base font-medium max-w-2xl mx-auto mb-10">
          No more guesswork. Only results. Choose the plan that fits your goal.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 text-sm font-semibold text-slate-400">
          <span className={!isYearly ? "text-slate-800" : ""}>MONTHLY</span>
          <div
            onClick={() => setIsYearly(!isYearly)}
            className="w-14 h-7 bg-[#1e293b] rounded-full p-1 cursor-pointer flex items-center relative transition-colors duration-300"
          >
            <div className={`w-5 h-5 rounded-full bg-[#00e5ff] shadow-sm transform transition-transform duration-300 ${isYearly ? "translate-x-7" : "translate-x-0"}`}></div>
          </div>
          <span className={isYearly ? "text-slate-800" : ""}>YEARLY</span>
          <span className="bg-[#00e5ff] text-[#0f172a] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ml-2">Save up to 33%</span>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="flex flex-wrap justify-center items-stretch gap-6 w-full mx-auto px-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`group relative flex flex-col w-full md:w-[320px] lg:w-[280px] xl:w-[300px] p-8 rounded-2xl transition-all duration-300 
              ${plan.isMostPopular ? "bg-[#0b1322] border-2 border-[#00e5ff] shadow-[0_0_25px_rgba(0,229,255,0.15)] shadow-[#00e5ff]/20" : "bg-[#0f172a] border border-[#1e293b]"}
            `}
          >
            {/* Most Popular Badge */}
            {plan.isMostPopular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00e5ff] text-[#0f172a] text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full z-10 whitespace-nowrap">
                Most Popular
              </div>
            )}

            {/* Admin Hover Actions */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <button
                onClick={() => handleEdit(plan)}
                className="bg-slate-800 hover:bg-blue-600 border border-slate-700 text-slate-300 hover:text-white p-2 rounded-full transition-colors shadow-lg"
                title="Edit Plan"
              >
                <FiEdit size={14} />
              </button>
              <Popconfirm
                title="Delete Plan"
                description="Are you sure you want to delete this subscription plan?"
                onConfirm={() => handleDelete(plan.id)}
                okText="Yes"
                cancelText="No"
              >
                <button
                  className="bg-slate-800 hover:bg-red-600 border border-slate-700 text-slate-300 hover:text-white p-2 rounded-full transition-colors shadow-lg"
                  title="Delete Plan"
                >
                  <FiTrash2 size={14} />
                </button>
              </Popconfirm>
            </div>

            {/* Icon */}
            <div className="mb-6 relative">
              {getIcon(plan.iconType, plan.isMostPopular)}
              {(plan.iconType === 'silver_medal' || plan.iconType === 'gold_medal') && (
                <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-[#1e293b] w-4 h-4 rounded-full flex items-center justify-center text-white shadow-sm border border-slate-800">
                  {plan.iconType === 'gold_medal' ? '1' : '2'}
                </span>
              )}
            </div>

            {/* Tier Name */}
            <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{plan.tier}</h3>

            {/* Description */}
            <p className="text-slate-400 text-sm leading-relaxed mb-6 min-h-[40px] opacity-80">{plan.description}</p>

            {/* Price */}
            <div className="mb-6">
              {plan.isApplicationOnly ? (
                <div>
                  <h4 className="text-[28px] font-bold text-white leading-tight break-words">Application Only</h4>
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-[32px] font-bold text-white">€{isYearly ? plan.priceYearly : plan.priceMonthly}</span>
                  <span className="text-slate-400 text-sm font-medium">per {isYearly ? 'year' : 'month'}</span>
                </div>
              )}
              {(!plan.isApplicationOnly && isYearly && plan.priceMonthly) && (
                <p className="text-[10px] text-[#00e5ff] font-bold uppercase tracking-wider mt-2">Best Value</p>
              )}
            </div>

            {/* Features List */}
            <div className="flex-1 flex flex-col gap-4 mb-8">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 bg-[#00e5ff] rounded-full p-0.5 flex items-center justify-center">
                    <FiCheck size={10} className="text-[#0f172a] stroke-[4]" />
                  </div>
                  <span className="text-sm text-slate-300 font-medium leading-snug">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button (Mock) */}
            <button className={`w-full py-4 rounded-xl text-sm font-bold tracking-wider transition-all
              ${plan.isMostPopular
                ? "bg-[#00e5ff] hover:bg-[#33ebfc] text-[#0f172a] shadow-lg shadow-[#00e5ff]/20"
                : "bg-white hover:bg-slate-100 text-[#0f172a]"}
            `}>
              {plan.isApplicationOnly ? "APPLY NOW" : "CHOOSE PLAN"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-slate-200/60 max-w-7xl mx-auto w-full text-center">
        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
          Secure encryption. Cancel anytime. Payment simulation.
        </p>
      </div>

      {/* Admin Modal */}
      <Modal
        title={<span className="text-slate-800 font-bold">{editingPlan ? "Edit Subscription Plan" : "Add Subscription Plan"}</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
        className="workout-modal"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="tier"
              label={<span className="font-medium text-slate-700">Tier Name</span>}
              rules={[{ required: true, message: 'Please input the tier name!' }]}
              className="col-span-2 md:col-span-1"
            >
              <Input placeholder="e.g. VICTORY BRONZE" className="py-2" />
            </Form.Item>

            <Form.Item
              name="iconType"
              label={<span className="font-medium text-slate-700">Icon</span>}
              rules={[{ required: true, message: 'Please select an icon!' }]}
              className="col-span-2 md:col-span-1"
            >
              <Select placeholder="Select icon" size="large">
                <Select.Option value="silver_medal">Silver Medal</Select.Option>
                <Select.Option value="gold_medal">Gold Medal</Select.Option>
                <Select.Option value="diamond">Diamond</Select.Option>
                <Select.Option value="circle">Pink Circle</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label={<span className="font-medium text-slate-700">Description</span>}
            rules={[{ required: true, message: 'Please input description!' }]}
          >
            <Input.TextArea placeholder="A short catchphrase for this plan..." rows={2} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 mt-2">
            <Form.Item
              name="isApplicationOnly"
              valuePropName="checked"
              className="col-span-2 mb-2"
            >
              <Switch checkedChildren="Application Only" unCheckedChildren="Has Pricing" />
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.isApplicationOnly !== currentValues.isApplicationOnly}
            >
              {({ getFieldValue }) =>
                !getFieldValue('isApplicationOnly') ? (
                  <>
                    <Form.Item
                      name="priceMonthly"
                      label={<span className="font-medium text-slate-700">Monthly Price (€)</span>}
                      rules={[{ required: true, message: 'Monthly price is required!' }]}
                      className="mb-0 col-span-2 md:col-span-1"
                    >
                      <InputNumber min={0} className="w-full" size="large" />
                    </Form.Item>
                    <Form.Item
                      name="priceYearly"
                      label={<span className="font-medium text-slate-700">Yearly Price (€)</span>}
                      rules={[{ required: true, message: 'Yearly price is required!' }]}
                      className="mb-0 col-span-2 md:col-span-1"
                    >
                      <InputNumber min={0} className="w-full" size="large" />
                    </Form.Item>
                  </>
                ) : null
              }
            </Form.Item>
          </div>

          <Form.Item
            name="isMostPopular"
            valuePropName="checked"
            className="mb-6"
          >
            <Switch checkedChildren="Mark as Most Popular" unCheckedChildren="Standard Plan" />
          </Form.Item>

          <div className="mb-2">
            <span className="font-medium text-slate-700 block mb-2">Features List</span>
            <Form.List name="features">
              {(fields, { add, remove }) => (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.key} className="flex items-center gap-2">
                      <Form.Item
                        {...field}
                        rules={[{ required: true, message: 'Feature cannot be empty!' }]}
                        className="mb-0 flex-1"
                      >
                        <Input placeholder={`Feature ${index + 1}`} className="py-2" />
                      </Form.Item>
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<FiTrash2 />}
                          onClick={() => remove(field.name)}
                          className="flex-shrink-0"
                        />
                      )}
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<FiPlus />}
                    className="mt-2 h-10 border-slate-300 text-slate-600 hover:text-blue-600 hover:border-blue-400"
                  >
                    Add Feature
                  </Button>
                </div>
              )}
            </Form.List>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
            <Button size="large" onClick={() => setIsModalVisible(false)} className="hover:bg-slate-50">
              Cancel
            </Button>
            <Button size="large" type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-500 font-semibold px-6">
              {editingPlan ? 'Update Plan' : 'Save Plan'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Subscriptions;

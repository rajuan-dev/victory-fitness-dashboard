import { useEffect, useState } from 'react';
import { IoChevronBack, IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Modal, Spin, message } from 'antd';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import {
    createAdminFaq,
    deleteAdminFaq,
    listAdminFaqs,
    updateAdminFaq,
} from '../../../services/admin-content.service';

const FAQ = () => {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFAQ, setSelectedFAQ] = useState(null);
    const [newFAQ, setNewFAQ] = useState({ question: '', answer: '' });
    const [editFAQ, setEditFAQ] = useState({ question: '', answer: '' });
    const [faqs, setFaqs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadFaqs = async () => {
            setIsLoading(true);
            try {
                const response = await listAdminFaqs();
                if (isMounted) {
                    setFaqs(Array.isArray(response?.items) ? response.items : []);
                }
            } catch (err) {
                console.error('Failed to load FAQs:', err);
                if (isMounted) {
                    message.error(err.message || 'Failed to load FAQs');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadFaqs();
        return () => {
            isMounted = false;
        };
    }, []);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Add FAQ
    const showAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleAddModalClose = () => {
        setIsAddModalOpen(false);
        setNewFAQ({ question: '', answer: '' });
    };

    const handleAddInputChange = (e) => {
        const { name, value } = e.target;
        setNewFAQ(prev => ({ ...prev, [name]: value }));
    };

    const handleAddFAQ = async () => {
        try {
            setIsCreating(true);
            const created = await createAdminFaq(newFAQ);
            setFaqs((prev) => [created, ...prev]);
            message.success('FAQ added successfully');
            handleAddModalClose();
        } catch (err) {
            console.error('Failed to add FAQ:', err);
            message.error(err.message || 'Failed to add FAQ');
        } finally {
            setIsCreating(false);
        }
    };

    // Edit FAQ
    const showEditModal = (faq) => {
        setSelectedFAQ(faq);
        setEditFAQ({ question: faq.question, answer: faq.answer });
        setIsEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setSelectedFAQ(null);
        setEditFAQ({ question: '', answer: '' });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFAQ(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateFAQ = async () => {
        try {
            setIsUpdating(true);
            const updated = await updateAdminFaq(selectedFAQ.id, editFAQ);
            setFaqs((prev) => prev.map((faq) => faq.id === selectedFAQ.id ? updated : faq));
            message.success('FAQ updated successfully');
            handleEditModalClose();
        } catch (err) {
            console.error('Failed to update FAQ:', err);
            message.error(err.message || 'Failed to update FAQ');
        } finally {
            setIsUpdating(false);
        }
    };

    // Delete FAQ
    const showDeleteModal = (faq) => {
        setSelectedFAQ(faq);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteModalClose = () => {
        setIsDeleteModalOpen(false);
        setSelectedFAQ(null);
    };

    const handleDeleteFAQ = async () => {
        try {
            setIsDeleting(true);
            await deleteAdminFaq(selectedFAQ.id);
            setFaqs((prev) => prev.filter((faq) => faq.id !== selectedFAQ.id));
            message.success('FAQ deleted successfully');
            handleDeleteModalClose();
        } catch (err) {
            console.error('Failed to delete FAQ:', err);
            message.error(err.message || 'Failed to delete FAQ');
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 md:px-6 py-4 md:py-5 rounded-2xl mb-5 shadow-lg">
                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
                        aria-label="Go back"
                    >
                        <IoChevronBack className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-white text-2xl sm:text-3xl font-bold">Frequently Asked Questions</h1>
                        </div>
                    </div>

                    {/* Add FAQ Button */}
                    <button
                        onClick={showAddModal}
                        className="hidden md:flex ml-auto items-center gap-2 px-4 py-2.5 bg-white/90 hover:bg-white text-blue-600 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <FaPlus className="w-4 h-4" />
                        Add FAQ
                    </button>
                </div>

                {/* Mobile Add Button */}
                <div className="md:hidden mt-3">
                    <button
                        onClick={showAddModal}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/90 hover:bg-white text-blue-600 rounded-xl font-semibold transition-all duration-200"
                    >
                        <FaPlus className="w-4 h-4" />
                        Add FAQ
                    </button>
                </div>
            </div>

            {/* FAQ Content */}
            <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={faq.id}
                            className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md"
                        >
                            <div className="flex items-center justify-between p-4 bg-slate-50">
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="flex-1 flex items-center gap-3 text-left"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <h3 className="text-base font-semibold text-slate-800">
                                        {faq.question}
                                    </h3>
                                    {openIndex === index ? (
                                        <IoChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0 ml-auto" />
                                    ) : (
                                        <IoChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 ml-auto" />
                                    )}
                                </button>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 ml-3">
                                    <button
                                        className="p-2 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                        onClick={() => showEditModal(faq)}
                                        title="Edit FAQ"
                                    >
                                        <FiEdit className="text-green-600 w-5 h-5" />
                                    </button>
                                    <button
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                        onClick={() => showDeleteModal(faq)}
                                        title="Delete FAQ"
                                    >
                                        <FiTrash2 className="text-red-600 w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {openIndex === index && (
                                <div className="p-4 bg-white border-t border-slate-200">
                                    <p className="text-slate-600 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}

                    {faqs.length === 0 && (
                        <div className="text-center text-gray-500 py-10">
                            No FAQs found
                        </div>
                    )}
                </div>
            </div>

            {/* Add FAQ Modal */}
            <Modal
                title={<span className="text-lg font-semibold">Add New FAQ</span>}
                open={isAddModalOpen}
                onCancel={handleAddModalClose}
                footer={[
                    <button
                        key="cancel"
                        onClick={handleAddModalClose}
                        className="px-4 py-2 mr-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all duration-200"
                    >
                        Cancel
                    </button>,
                    <button
                        key="submit"
                        onClick={handleAddFAQ}
                        disabled={isCreating}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
                    >
                        {isCreating ? 'Adding...' : 'Add FAQ'}
                    </button>,
                ]}
                width={600}
            >
                <div className="space-y-4 py-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Question</label>
                        <input
                            type="text"
                            name="question"
                            value={newFAQ.question}
                            onChange={handleAddInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your question here..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Answer</label>
                        <textarea
                            name="answer"
                            value={newFAQ.answer}
                            onChange={handleAddInputChange}
                            rows={6}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Enter the answer here..."
                        />
                    </div>
                </div>
            </Modal>

            {/* Edit FAQ Modal */}
            <Modal
                title={<span className="text-lg font-semibold">Edit FAQ</span>}
                open={isEditModalOpen}
                onCancel={handleEditModalClose}
                footer={[
                    <button
                        key="cancel"
                        onClick={handleEditModalClose}
                        className="px-4 py-2 mr-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all duration-200"
                    >
                        Cancel
                    </button>,
                    <button
                        key="submit"
                        onClick={handleUpdateFAQ}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
                    >
                        {isUpdating ? 'Updating...' : 'Update FAQ'}
                    </button>,
                ]}
                width={600}
            >
                <div className="space-y-4 py-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Question</label>
                        <input
                            type="text"
                            name="question"
                            value={editFAQ.question}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter your question here..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Answer</label>
                        <textarea
                            name="answer"
                            value={editFAQ.answer}
                            onChange={handleEditInputChange}
                            rows={6}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                            placeholder="Enter the answer here..."
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title={<span className="text-lg font-semibold text-red-600">Delete FAQ</span>}
                open={isDeleteModalOpen}
                onCancel={handleDeleteModalClose}
                footer={[
                    <button
                        key="cancel"
                        onClick={handleDeleteModalClose}
                        className="px-4 py-2 mr-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all duration-200"
                    >
                        Cancel
                    </button>,
                    <button
                        key="delete"
                        onClick={handleDeleteFAQ}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all duration-200 disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete FAQ'}
                    </button>,
                ]}
                width={500}
            >
                {selectedFAQ && (
                    <div className="py-4">
                        <p className="text-slate-700 mb-4">
                            Are you sure you want to delete this FAQ?
                        </p>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm font-semibold text-slate-800 mb-2">
                                <span className="text-red-600">Question:</span> {selectedFAQ.question}
                            </p>
                            <p className="text-sm text-slate-600">
                                <span className="font-medium">Answer:</span> {selectedFAQ.answer?.substring(0, 100)}...
                            </p>
                        </div>
                        <p className="text-sm text-red-600 mt-4 font-medium">
                            Warning: This action cannot be undone.
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default FAQ;

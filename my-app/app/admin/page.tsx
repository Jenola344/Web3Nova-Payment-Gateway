'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Student, Task, Submission } from '@/types';


export default function AdminDashboard() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [creatingTask, setCreatingTask] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const router = useRouter();

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [taskPage, setTaskPage] = useState(1);
    const [totalTaskPages, setTotalTaskPages] = useState(1);

    // Tab State
    const [activeTab, setActiveTab] = useState('students');

    // Task State
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        deadline: '',
        assignedStudents: [] as string[],
        assignedSkills: [] as string[]
    });
    const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
    const [selectedTaskSubmissions, setSelectedTaskSubmissions] = useState<Submission[]>([]);
    const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
    const [gradeInput, setGradeInput] = useState('');
    const [feedbackInput, setFeedbackInput] = useState('');

    // Stats State
    const [dashboardStats, setDashboardStats] = useState({
        totalStudents: 0,
        fullyPaid: 0,
        partiallyPaid: 0,
        notPaid: 0
    });

    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchAllStudents(currentPage, searchTerm);
        fetchTasks(taskPage); // Fixed function name
    }, []); // Initial load only? Or separate...

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchAllStudents(1, searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        if (currentPage !== 1) {
            fetchAllStudents(currentPage, searchTerm);
        }
    }, [currentPage]);

    // Handle Tab Changes
    useEffect(() => {
        if (activeTab === 'students') {
            // fetchAllStudents handled by other effects mostly, but maybe refresh?
            // Actually existing logic had it. Let's simplify:
            // fetchAllStudents(currentPage, searchTerm);
        } else if (activeTab === 'tasks') {
            fetchTasks(taskPage);
        }
    }, [activeTab, taskPage]);

    const fetchStats = async () => {
        try {
            setLoadingStats(true); // reset loading state if refreshing?
            const response = await api.getDashboardStats();
            if (response.success) {
                setDashboardStats(response.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchAllStudents = async (page: number, search: string) => {
        setLoading(true);
        try {
            const response = await api.getAllStudents(page, 10, search);
            if (response.success) {
                setStudents(response.students);
                if (response.pagination) {
                    setTotalPages(response.pagination.totalPages);
                }
            } else {
                router.push('/login');
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async (page = 1) => {
        try {
            const response = await api.getAllTasks(page);
            if (response.success) {
                setTasks(response.tasks);
                if (response.pagination) {
                    setTotalTaskPages(response.pagination.totalPages);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleGradeSubmission = async (submissionId: string) => {
        try {
            const response = await api.gradeTask(submissionId, gradeInput, feedbackInput);
            if (response.success) {
                alert('Graded successfully');
                setGradingSubmissionId(null);
                setGradeInput('');
                setFeedbackInput('');
                // Refresh submissions
                if (selectedTaskSubmissions.length > 0) {
                    setSelectedTaskSubmissions(prev => prev.map(sub =>
                        sub._id === submissionId ? response.submission : sub
                    ));
                }
            } else {
                alert(response.message || 'Failed to grade');
            }
        } catch (error) {
            alert('Error grading submission');
        }
    };

    const startGrading = (sub: Submission) => {
        setGradingSubmissionId(sub._id);
        setGradeInput(sub.grade || '');
        setFeedbackInput(sub.feedback || '');
    };


    // ... existing handlers ...

    // Pagination Component
    const PaginationControls = ({ page, total, setPage }: { page: number, total: number, setPage: (p: number) => void }) => (
        <div className="flex justify-center items-center gap-4 mt-8">
            <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white/5 rounded-lg disabled:opacity-50 hover:bg-white/10 transition-all font-medium border border-white/10"
            >
                Previous
            </button>
            <span className="text-blue-200">
                Page <span className="font-bold text-white">{page}</span> of <span className="font-bold text-white">{total || 1}</span>
            </span>
            <button
                onClick={() => setPage(Math.min(total, page + 1))}
                disabled={page === total}
                className="px-4 py-2 bg-white/5 rounded-lg disabled:opacity-50 hover:bg-white/10 transition-all font-medium border border-white/10"
            >
                Next
            </button>
        </div>
    );

    // Filter logic needs to be server-side ideally or acknowledge client-side limitations
    // For now, client side filtering on current page is weird.
    // Ideally search should trigger API call. 
    // Let's keep simpler approach: Search filters CURRENT PAGE data for now or update search to hit API.
    // Given the task is just pagination, I'll stick to pagination controls.

    // ... existing return ...

    /* 
       Note: The original render logic needs update to include PaginationControls. 
       I will replace the whole return block in a subsequent edit or try to be surgical.
       The current replacement chunk is too big/ambiguous.
       Let's replace `fetchAllStudents` first and add state.
    */


    const handleUpdatePayment = async () => {
        if (!selectedStudent || !paymentAmount) {
            alert('Please enter a valid amount');
            return;
        }

        try {
            const response = await api.updateStudentPayment(
                selectedStudent._id,
                parseFloat(paymentAmount)
            );

            if (response.success) {
                alert('Payment updated successfully!');
                setSelectedStudent(null);
                setPaymentAmount('');
                fetchAllStudents(currentPage, searchTerm);
            } else {
                alert(response.message || 'Failed to update payment');
            }
        } catch (error) {
            alert('An error occurred');
        }
    };

    const handleLogout = async () => {
        await api.logout();
        router.push('/login');
    };

    const filteredStudents = students.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.skill.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (student: Student) => {
        if (student.remainingBalance === 0) return 'bg-white text-blue-900 border border-white';
        if (student.amountPaid > 0) return 'bg-blue-600/20 text-blue-100 border border-blue-500/50';
        return 'bg-transparent text-blue-200 border border-blue-500/30';
    };

    const getStatus = (student: Student) => {
        if (student.remainingBalance === 0) return 'Fully Paid';
        if (student.amountPaid > 0) return 'Partially Paid';
        return 'Not Paid';
    };

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        skill: '',
        location: '',
        scholarshipType: 'Full Payment',
        password: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.registerStudent(formData);
            if (response.success) {
                alert('Student registered successfully');
                setShowAddModal(false);
                fetchAllStudents(currentPage, searchTerm);
                setFormData({
                    fullName: '',
                    email: '',
                    phoneNumber: '',
                    skill: '',
                    location: '',
                    scholarshipType: 'Full Payment',
                    password: ''
                });
            } else {
                alert(response.message || 'Failed to register student');
            }
        } catch (error) {
            alert('Error registering student');
        }
    };

    const handleEditStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        try {
            // Only send changed fields or all (password optional)
            const response = await api.updateStudentDetails(selectedStudent._id, formData);
            if (response.success) {
                alert('Student updated successfully');
                setShowEditModal(false);
                setSelectedStudent(null);
                fetchAllStudents(currentPage, searchTerm);
            } else {
                alert(response.message || 'Failed to update student');
            }
        } catch (error) {
            alert('Error updating student');
        }
    };

    const openEditModal = (student: Student) => {
        setSelectedStudent(student);
        setFormData({
            fullName: student.fullName,
            email: student.email,
            phoneNumber: student.phoneNumber,
            skill: student.skill,
            location: student.location,
            scholarshipType: student.scholarshipType,
            password: '' // Don't fill password
        });
        setShowEditModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-blue-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingTask(true);
        try {
            const response = await api.createTask({
                ...taskData,
                assignedStudents: taskData.assignedStudents
            });
            if (response.success) {
                alert('Task created successfully');
                setShowTaskModal(false);
                setTaskData({ title: '', description: '', deadline: '', assignedStudents: [], assignedSkills: [] });
                fetchTasks(taskPage);
            } else {
                alert(response.message || 'Failed to create task');
            }
        } catch (error) {
            alert('Error creating task');
        } finally {
            setCreatingTask(false);
        }
    };

    const handleViewSubmissions = async (taskId: string) => {
        try {
            const response = await api.getTaskSubmissions(taskId);
            if (response.success) {
                setSelectedTaskSubmissions(response.submissions);
                setShowSubmissionsModal(true);
            }
        } catch (error) {
            console.error(error);
            alert('Error fetching submissions');
        }
    };

    return (
        <div className="min-h-screen bg-blue-950 py-8 font-sans text-white">
            {/* Ambient Background Glow */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[128px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
                        <p className="text-blue-200 mt-1">Manage student payments and records</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`px-4 py-2 ${activeTab === 'students' ? 'bg-blue-600' : 'bg-white/5'} text-white rounded-xl transition-all`}
                        >
                            Students
                        </button>
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`px-4 py-2 ${activeTab === 'tasks' ? 'bg-blue-600' : 'bg-white/5'} text-white rounded-xl transition-all`}
                        >
                            Tasks
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Content based on activeTab */}
                {activeTab === 'students' ? (
                    <>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-medium shadow-lg"
                            >
                                Add Student
                            </button>
                        </div>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
                                <p className="text-sm text-blue-200 font-medium mb-1">Total Students</p>
                                <p className="text-3xl font-bold text-white">{dashboardStats.totalStudents}</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
                                <p className="text-sm text-white font-medium mb-1">Fully Paid</p>
                                <p className="text-3xl font-bold text-white">
                                    {dashboardStats.fullyPaid}
                                </p>
                            </div>

                            <div className="bg-blue-600/10 backdrop-blur-md p-6 rounded-2xl border border-blue-500/20 shadow-lg">
                                <p className="text-sm text-blue-100 font-medium mb-1">Partially Paid</p>
                                <p className="text-3xl font-bold text-white">
                                    {dashboardStats.partiallyPaid}
                                </p>
                            </div>
                            <div className="bg-transparent p-6 rounded-2xl border border-white/10 shadow-lg">
                                <p className="text-sm text-blue-300 font-medium mb-1">Not Paid</p>
                                <p className="text-3xl font-bold text-white">
                                    {dashboardStats.notPaid}
                                </p>
                            </div>
                        </div>


                        {/* Search */}
                        <div className="mb-8">
                            <div className="relative group max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all"
                                />
                            </div>
                        </div>

                        {/* Students Table */}
                        <div className="bg-white/5 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/10 mb-8">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-white/10">
                                    <thead className="bg-blue-900/50">
                                        <tr>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Phone</th>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Skill</th>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Total Fees</th>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Balance</th>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {students.map((student) => (
                                            <tr key={student._id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{student.fullName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">{student.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">{student.phoneNumber}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">{student.skill}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">₦{student.totalFees.toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">₦{student.remainingBalance.toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(student)}`}>
                                                        {getStatus(student)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-3">
                                                    <button
                                                        onClick={() => openEditModal(student)}
                                                        className="text-blue-300 hover:text-white transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <span className="text-white/20">|</span>
                                                    <button
                                                        onClick={() => setSelectedStudent(student)}
                                                        className="text-white hover:text-blue-300 font-medium underline decoration-blue-500/30 underline-offset-4 hover:decoration-blue-300 transition-all"
                                                    >
                                                        Pay
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination for Students */}
                        <PaginationControls
                            page={currentPage}
                            total={totalPages}
                            setPage={setCurrentPage}
                        />
                    </>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between">
                            <h2 className="text-2xl font-bold">Tasks</h2>
                            <button
                                onClick={() => setShowTaskModal(true)}
                                className="px-6 py-2 bg-blue-600 rounded-xl"
                            >
                                Create Task
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {tasks.map(task => (
                                <div key={task._id} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{task.title}</h3>
                                            <p className="text-blue-200 mt-2">{task.description}</p>
                                            <p className="text-sm text-blue-300 mt-2">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                                        </div>
                                        <button
                                            onClick={() => handleViewSubmissions(task._id)}
                                            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
                                        >
                                            View Submissions
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination for Tasks */}
                        <PaginationControls
                            page={taskPage}
                            total={totalTaskPages}
                            setPage={setTaskPage}
                        />
                    </div>
                )}
            </div>

            {/* Add/Edit Student Modal */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-blue-950/80 backdrop-blur-md overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-blue-900 border border-white/10 rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 relative overflow-hidden">
                        <h3 className="text-xl font-bold text-white mb-6 relative z-10">
                            {showAddModal ? 'Register New Student' : 'Edit Student Details'}
                        </h3>
                        <form onSubmit={showAddModal ? handleAddStudent : handleEditStudent} className="space-y-4 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-blue-200 mb-1">Full Name</label>
                                    <input
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-blue-200 mb-1">Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-blue-200 mb-1">Phone Number</label>
                                    <input
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-blue-200 mb-1">Skill/Course</label>
                                    <input
                                        name="skill"
                                        value={formData.skill}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-blue-200 mb-1">Location</label>
                                    <input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-blue-200 mb-1">Scholarship Type</label>
                                    <select
                                        name="scholarshipType"
                                        value={formData.scholarshipType}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    >
                                        <option value="Full Payment" className="bg-blue-900">Full Payment</option>
                                        <option value="Half Funded" className="bg-blue-900">Half Funded</option>
                                        <option value="Fully Funded" className="bg-blue-900">Fully Funded</option>
                                    </select>
                                </div>
                                {showAddModal && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-blue-200 mb-1">Password</label>
                                        <input
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all"
                                >
                                    {showAddModal ? 'Register' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setShowEditModal(false);
                                    }}
                                    className="flex-1 px-4 py-2 bg-transparent border border-white/10 text-white font-medium rounded-xl hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Update Payment Modal - Only show if not adding/editing student */}
            {selectedStudent && !showEditModal && (
                <div className="fixed inset-0 bg-blue-950/80 backdrop-blur-md overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-blue-900 border border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden">
                        {/* Modal ambient glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>

                        <h3 className="text-xl font-bold text-white mb-6 relative z-10">
                            Update Payment for {selectedStudent.fullName}
                        </h3>
                        <div className="bg-blue-950/50 rounded-xl p-4 mb-6 border border-white/5 relative z-10">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-blue-300">Current Balance</span>
                                <span className="text-sm font-mono text-white">₦{selectedStudent.remainingBalance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-blue-300">Amount Paid</span>
                                <span className="text-sm font-mono text-white">₦{selectedStudent.amountPaid.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="mb-6 relative z-10">
                            <label className="block text-sm font-medium text-blue-200 mb-2">
                                Add Payment Amount
                            </label>
                            <input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter amount (e.g. 5000)"
                            />
                        </div>
                        <div className="flex space-x-4 relative z-10">
                            <button
                                onClick={handleUpdatePayment}
                                className="flex-1 px-4 py-3 bg-white text-blue-950 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Update
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedStudent(null);
                                    setPaymentAmount('');
                                }}
                                className="flex-1 px-4 py-3 bg-transparent border border-white/10 text-white font-medium rounded-xl hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Task Creation Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-blue-900 p-8 rounded-2xl max-w-2xl w-full border border-white/10 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Create New Task</h3>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <input
                                placeholder="Task Title"
                                value={taskData.title}
                                onChange={e => setTaskData({ ...taskData, title: e.target.value })}
                                className="w-full p-3 bg-white/5 rounded-xl border border-white/10 text-white"
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={taskData.description}
                                onChange={e => setTaskData({ ...taskData, description: e.target.value })}
                                className="w-full p-3 bg-white/5 rounded-xl border border-white/10 text-white h-24"
                                required
                            />
                            <input
                                type="date"
                                value={taskData.deadline}
                                onChange={e => setTaskData({ ...taskData, deadline: e.target.value })}
                                className="w-full p-3 bg-white/5 rounded-xl border border-white/10 text-white"
                                required
                            />

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-blue-200">Assign by Course/Skill</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {['Web Development', 'Smart Contract', 'UI/UX Design'].map((skill) => (
                                        <div key={skill} className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                            <input
                                                type="checkbox"
                                                id={`skill-${skill}`}
                                                value={skill}
                                                checked={taskData.assignedSkills.includes(skill)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setTaskData(prev => {
                                                        const newSkills = checked
                                                            ? [...prev.assignedSkills, skill]
                                                            : prev.assignedSkills.filter(s => s !== skill);
                                                        return { ...prev, assignedSkills: newSkills };
                                                    });
                                                }}
                                                className="w-5 h-5 rounded border-white/20 bg-black/40 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                                            />
                                            <label htmlFor={`skill-${skill}`} className="text-white cursor-pointer select-none flex-1">
                                                {skill}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-blue-300">Select one or more courses to assign this task to all enrolled students.</p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={creatingTask}
                                    className="flex-1 bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                >
                                    {creatingTask ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Task'
                                    )}
                                </button>
                                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 bg-white/10 py-3 rounded-xl hover:bg-white/20 transition-colors">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Submissions Modal */}
            {showSubmissionsModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-blue-900 p-8 rounded-2xl max-w-2xl w-full border border-white/10 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Submissions</h3>
                        <div className="space-y-4">
                            {selectedTaskSubmissions.length === 0 ? (
                                <p className="text-blue-300">No submissions yet.</p>
                            ) : (
                                selectedTaskSubmissions.map(sub => (
                                    <div key={sub._id} className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold">{sub.student.fullName}</p>
                                                <p className="text-sm text-blue-300">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                                            </div>
                                            {gradingSubmissionId !== sub._id && (
                                                <div className="text-right">
                                                    {sub.grade ? (
                                                        <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm border border-green-500/30">
                                                            Grade: {sub.grade}
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-sm border border-yellow-500/30">
                                                            Pending Grade
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-black/20 p-3 rounded-lg font-mono text-sm break-all mb-3 text-gray-300">
                                            {sub.content}
                                        </div>

                                        {sub.feedback && gradingSubmissionId !== sub._id && (
                                            <div className="mb-3 pl-3 border-l-2 border-blue-500/30">
                                                <p className="text-xs text-blue-400 uppercase font-bold mb-1">Feedback</p>
                                                <p className="text-sm text-blue-200">{sub.feedback}</p>
                                            </div>
                                        )}

                                        {gradingSubmissionId === sub._id ? (
                                            <div className="mt-4 bg-white/5 p-4 rounded-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
                                                <label className="block text-sm mb-1">Grade (e.g. A, 90/100)</label>
                                                <input
                                                    value={gradeInput}
                                                    onChange={(e) => setGradeInput(e.target.value)}
                                                    className="w-full p-2 bg-black/40 border border-white/20 rounded-lg mb-3 text-white"
                                                    placeholder="Enter grade..."
                                                />
                                                <label className="block text-sm mb-1">Feedback</label>
                                                <textarea
                                                    value={feedbackInput}
                                                    onChange={(e) => setFeedbackInput(e.target.value)}
                                                    className="w-full p-2 bg-black/40 border border-white/20 rounded-lg mb-3 text-white h-20"
                                                    placeholder="Enter feedback..."
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleGradeSubmission(sub._id)}
                                                        className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-bold"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setGradingSubmissionId(null)}
                                                        className="px-4 py-2 bg-white/10 rounded-lg text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => startGrading(sub)}
                                                className="mt-2 text-sm text-blue-400 hover:text-white"
                                            >
                                                {sub.grade ? 'Edit Grade' : 'Grade Submission'}
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        <button onClick={() => setShowSubmissionsModal(false)} className="mt-6 w-full bg-white/10 py-3 rounded-xl">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
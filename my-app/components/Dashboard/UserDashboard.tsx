'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Student } from '@/types/index';

export default function UserDashboard() {
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState<any>(null);
    const [paymentLoading, setPaymentLoading] = useState(false); // Added missing state
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // Task Management State
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks'>('overview');
    const [tasks, setTasks] = useState<any[]>([]);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [submissionContent, setSubmissionContent] = useState('');

    const searchParams = useSearchParams();
    const paymentReference = searchParams.get('paymentReference');
    const router = useRouter();

    useEffect(() => {
        fetchProfile();
        // Check pending payment status
        if (paymentReference) {
            startPaymentStatusPolling(paymentReference);
        }
    }, []);

    // Fetch tasks when tab changes
    useEffect(() => {
        if (activeTab === 'tasks') {
            fetchTasks();
        }
    }, [activeTab]);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const deadline = new Date('2026-01-12T23:59:59').getTime();
            const distance = deadline - now;

            if (distance < 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(timer);
            } else {
                setCountdown({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.getStudentProfile();
            if (response.success) {
                setStudent(response.student);
            } else {
                router.push('/login');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await api.getStudentTasks();
            if (response.success) {
                setTasks(response.tasks);
            }
        } catch (error) {
            console.error('Error fetching tasks');
        }
    };

    const handleInitiatePayment = async (amount: number) => {
        setPaymentLoading(true);
        try {
            const response = await api.initiatePayment(amount);
            if (response.success) {
                setPaymentData(response.paymentData);
                setPaymentAmount(amount);
                setShowPaymentModal(true);
            } else {
                alert(response.message || 'Failed to initiate payment');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setPaymentLoading(false);
        }
    };

    const handlePayNow = () => {
        if (paymentData?.checkoutUrl) {
            window.open(paymentData.checkoutUrl, '_blank');
            startPaymentStatusPolling(paymentData.paymentReference);
        }
    };

    const startPaymentStatusPolling = async (paymentReference: string) => {
        const pollInterval = setInterval(async () => {
            try {
                const response = await api.checkPaymentStatus(paymentReference);
                if (response.success && response.payment.status === 'verified') {
                    clearInterval(pollInterval);
                    setShowPaymentModal(false);
                    alert('Payment successful!');
                    fetchProfile();
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 30000);

        setTimeout(() => clearInterval(pollInterval), 600000);
    };

    const handleCancelPayment = async (ref: string) => {
        if (confirm('Are you sure you want to cancel this pending transaction?')) {
            try {
                const response = await api.cancelPayment(ref);
                if (response.success) {
                    fetchProfile();
                    alert('Transaction cancelled successfully');
                } else {
                    alert(response.message || 'Failed to cancel transaction');
                }
            } catch (error) {
                alert('Error cancelling transaction');
            }
        }
    };

    const handleSubmitTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.submitTask(selectedTask._id, submissionContent);
            if (response.success) {
                alert('Task submitted successfully');
                setShowSubmitModal(false);
                setSelectedTask(null);
                setSubmissionContent('');
                fetchTasks();
            } else {
                alert(response.message || 'Failed to submit task');
            }
        } catch (error) {
            alert('Error submitting task');
        }
    };

    const handleOpenSubmitModal = (task: any) => {
        setSelectedTask(task);
        setShowSubmitModal(true);
    };

    const handleLogout = async () => {
        await api.logout();
        router.push('/login');
    };

    const getPaymentOptions = () => {
        if (!student) return [];
        if (student.scholarshipType === 'Fully Funded') {
            return [{ label: 'Full Payment', amount: 20000 }];
        } else if (student.scholarshipType === 'Half Funded') {
            return [
                { label: 'Initial Payment', amount: 20000 },
                { label: 'Second Payment', amount: 30000 },
                { label: 'Full Payment', amount: 50000 }
            ];
        } else {
            return [{ label: 'Full Payment', amount: student.remainingBalance }];
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-blue-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    if (!student) return null;

    const needsDeadlinePayment = student.amountPaid < 20000;

    return (
        <div className="min-h-screen bg-blue-950 text-white font-sans selection:bg-blue-500 selection:text-white pb-12">
            {/* Ambient Background Glow */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[128px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">Student Dashboard</h1>
                        <p className="text-blue-200 text-sm md:text-base">Welcome, {student.fullName.split(' ')[0]}</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 ${activeTab === 'overview' ? 'bg-blue-600' : 'bg-white/5'} text-white rounded-xl transition-all font-medium border border-white/10`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`px-4 py-2 ${activeTab === 'tasks' ? 'bg-blue-600' : 'bg-white/5'} text-white rounded-xl transition-all font-medium border border-white/10`}
                        >
                            Tasks
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm group"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {activeTab === 'overview' ? (
                    <>
                        {/* Countdown Timer */}
                        {needsDeadlinePayment && (
                            <div className="flex justify-center mb-8">
                                <div className="bg-blue-900/40 backdrop-blur-md rounded-xl p-4 border border-blue-700/30 flex items-center gap-4">
                                    {Object.entries(countdown).map(([unit, value], idx) => (
                                        <div key={unit} className="flex items-center">
                                            <div className="text-center">
                                                <div className="text-xl md:text-2xl font-mono font-bold text-white leading-none">
                                                    {value.toString().padStart(2, '0')}
                                                </div>
                                                <div className="text-[10px] text-blue-300 uppercase tracking-wider mt-1">{unit}</div>
                                            </div>
                                            {idx < 3 && <div className="text-blue-500/50 text-xl font-bold mx-2 md:mx-3 -mt-3">:</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Payment Options */}
                        {student.remainingBalance > 0 && (
                            <div className="mb-8">
                                <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Make a Payment</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {getPaymentOptions().map((option, index) => (
                                        <div key={index} className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-row items-center justify-between">
                                            <div>
                                                <p className="text-sm text-blue-200 font-medium mb-1">{option.label}</p>
                                                <p className="text-lg font-bold text-white">₦{option.amount.toLocaleString()}</p>
                                            </div>
                                            <button
                                                onClick={() => handleInitiatePayment(option.amount)}
                                                disabled={student.remainingBalance < option.amount || paymentLoading}
                                                className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                                            >
                                                {paymentLoading ? 'Processing...' : 'Pay'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stats Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Summary Cards would go here, omitting for brevity/redundancy if Payment Options cover it, but let's keep the detailed card */}
                            <div className="bg-white/5 backdrop-blur-xl shadow-xl rounded-2xl p-6 md:p-8 col-span-full border border-white/10">
                                <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Account Summary</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                                    <div>
                                        <p className="text-xs md:text-sm text-blue-300 mb-1">Scholarship</p>
                                        <p className="text-base md:text-lg font-medium text-white">{student.scholarshipType}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-blue-300 mb-1">Total Fees</p>
                                        <p className="text-base md:text-lg font-medium text-white">₦{student.totalFees.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-blue-300 mb-1">Amount Paid</p>
                                        <p className="text-base md:text-lg font-medium text-white">₦{student.amountPaid.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment History */}
                        <div className="bg-white/5 backdrop-blur-xl shadow-xl rounded-2xl p-6 md:p-8 border border-white/10">
                            <h2 className="text-lg md:text-xl font-semibold text-white mb-6">Payment History</h2>
                            {student.paymentHistory && student.paymentHistory.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-blue-200">Date</th>
                                                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-blue-200">Amount</th>
                                                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-blue-200">Status</th>
                                                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-blue-200">Reference</th>
                                                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-blue-200">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...student.paymentHistory].reverse().map((payment, index) => (
                                                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 text-white text-xs md:text-base">
                                                        {new Date(payment.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-white font-semibold text-xs md:text-base">
                                                        ₦{payment.amount.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 inline-flex text-[10px] md:text-xs leading-5 font-bold rounded-full ${payment.status === 'verified'
                                                            ? 'bg-white text-blue-900'
                                                            : payment.status === 'pending'
                                                                ? 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
                                                                : 'bg-red-500/20 text-red-200 border border-red-500/30'
                                                            }`}>
                                                            {payment.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-blue-300 text-xs md:text-sm font-mono">
                                                        {payment.transactionReference || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {payment.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleCancelPayment(payment.transactionReference!)}
                                                                className="text-red-400 hover:text-red-300 text-xs font-bold underline decoration-red-500/30 hover:decoration-red-300 transition-all"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-blue-200 text-center py-8 text-sm">No payment history yet.</p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">My Assigned Tasks</h2>

                        {tasks.length === 0 ? (
                            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-blue-200">No tasks assigned yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {tasks.map(task => (
                                    <div key={task._id} className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex flex-col min-h-[250px] relative overflow-hidden group">
                                        {/* Task Glow */}
                                        {task.isSubmitted && <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>}

                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${task.isSubmitted
                                                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                                : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                                }`}>
                                                {task.isSubmitted ? 'SUBMITTED' : 'PENDING'}
                                            </span>
                                            <span className="text-xs text-blue-300">Due: {new Date(task.deadline).toLocaleDateString()}</span>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 relative z-10">{task.title}</h3>
                                        <p className="text-blue-200 text-sm flex-grow mb-6 relative z-10">{task.description}</p>

                                        {task.isSubmitted ? (
                                            <div className="relative z-10 bg-white/5 p-3 rounded-xl border border-white/5">
                                                <p className="text-xs text-green-300 mb-1">Submitted on {new Date(task.submissionDate).toLocaleDateString()}</p>
                                                <p className="text-sm font-bold text-white">Grade: {task.grade || 'Pending Review'}</p>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleOpenSubmitModal(task)}
                                                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all relative z-10 shadow-lg hover:shadow-blue-500/20"
                                            >
                                                Submit Task
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && paymentData && (
                <div className="fixed inset-0 bg-blue-950/80 backdrop-blur-md overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-blue-900 border border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
                        <h3 className="text-2xl font-bold text-white mb-6">Complete Payment</h3>
                        <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
                            <p className="text-sm text-blue-200 mb-2">Amount to Pay</p>
                            <p className="text-4xl font-bold text-white mb-4">₦{paymentAmount.toLocaleString()}</p>
                            <p className="text-sm text-blue-200 mb-2">Payment Reference</p>
                            <p className="text-sm text-white font-mono bg-black/20 p-3 rounded-lg border border-white/5">{paymentData.paymentReference}</p>
                        </div>
                        <div className="space-y-4">
                            <button
                                onClick={handlePayNow}
                                className="w-full px-6 py-4 bg-white text-blue-950 rounded-2xl hover:bg-blue-50 font-bold text-lg shadow-lg transform hover:-translate-y-1 transition-all"
                            >
                                Pay with Monnify
                            </button>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="w-full px-6 py-4 bg-transparent text-white rounded-2xl hover:bg-white/5 font-semibold border border-white/10 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                        <p className="text-xs text-blue-300 mt-6 text-center">
                            You'll be redirected to Monnify's secure payment page
                        </p>
                    </div>
                </div>
            )}

            {/* Submit Task Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-blue-900 p-8 rounded-2xl max-w-lg w-full border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                        <h3 className="text-xl font-bold mb-2 text-white relative z-10">Submit Task</h3>
                        <p className="text-blue-300 text-sm mb-6 relative z-10">Submit your solution for: <span className="text-white font-medium">{selectedTask?.title}</span></p>

                        <form onSubmit={handleSubmitTask} className="relative z-10">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-blue-200 mb-2">Submission Content (Link or Text)</label>
                                <textarea
                                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[150px]"
                                    placeholder="Paste your Github link, Google Doc link, or type your answer here..."
                                    value={submissionContent}
                                    onChange={(e) => setSubmissionContent(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex gap-4">
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-blue-500/25">Submit</button>
                                <button type="button" onClick={() => setShowSubmitModal(false)} className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-medium text-white transition-all">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
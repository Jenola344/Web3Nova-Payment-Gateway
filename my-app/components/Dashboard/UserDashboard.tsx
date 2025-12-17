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
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const searchParams = useSearchParams();
    const paymentReference = searchParams.get('paymentReference');
    const router = useRouter();

    useEffect(() => {
        fetchProfile();
        //if exisiting pending trasactions that are not verified yet, poll to check status and verify
        if (paymentReference) {
            api.checkPaymentStatus(paymentReference).then((response) => {
                if (response.success) {
                    fetchProfile();
                }
            });
        }
    }, []);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const deadline = new Date('2025-12-31T23:59:59').getTime();
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

    const handleInitiatePayment = async (amount: number) => {
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
        }
    };

    const handlePayNow = () => {
        if (paymentData?.checkoutUrl) {
            // Open Monnify checkout in new window
            window.open(paymentData.checkoutUrl, '_blank');
            // Start polling for payment status
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
        }, 30000); // Poll every 30 seconds

        // Stop polling after 10 minutes
        setTimeout(() => clearInterval(pollInterval), 600000);
    };

    const handleLogout = async () => {
        await api.logout();
        router.push('/login');
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

    const getPaymentStatus = () => {
        if (student.remainingBalance === 0) return 'Fully Paid';
        if (student.amountPaid > 0) return 'Partially Paid';
        return 'Not Paid';
    };

    const getPaymentOptions = () => {
        if (student.scholarshipType === 'Fully Funded') {
            return [
                { label: 'Full Payment - ₦20000', amount: 20000 }
            ];
        } else if (student.scholarshipType === 'Half Funded') {
            return [
                { label: 'First Payment - ₦20000', amount: 20000 },
                { label: 'Second Payment - ₦20000', amount: 20000 },
                { label: 'Final Payment - ₦10000', amount: 10000 }
            ];
        } else {
            return [
                { label: 'Full Payment - ₦100000', amount: 100000 }
            ];
        }
    };

    const needsDeadlinePayment = student.amountPaid < 20000;

    return (
        <div className="min-h-screen bg-blue-950 text-white font-sans selection:bg-blue-500 selection:text-white pb-12">
            {/* Ambient Background Glow */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[128px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Student Dashboard</h1>
                        <p className="text-blue-200 text-lg">Welcome back, {student.fullName}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all backdrop-blur-sm font-medium"
                    >
                        Logout
                    </button>
                </div>

                {/* Countdown Timer - Only show if haven't paid 20k */}
                {needsDeadlinePayment && (
                    <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl shadow-xl p-8 mb-8 border border-blue-700/50">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-2">Payment Deadline</h2>
                            <p className="mb-6 text-blue-100">Time remaining to pay ₦20,000 (December 31, 2025)</p>
                            <div className="flex justify-center flex-wrap gap-4">
                                {Object.entries(countdown).map(([unit, value]) => (
                                    <div key={unit} className="bg-blue-950/50 backdrop-blur rounded-xl p-4 min-w-[100px] border border-blue-500/20">
                                        <div className="text-4xl font-bold text-white">{value}</div>
                                        <div className="text-sm text-blue-200 capitalize">{unit}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Student Info Card */}
                <div className="bg-white/5 backdrop-blur-xl shadow-xl rounded-2xl p-8 mb-8 border border-white/10">
                    <h2 className="text-2xl font-semibold text-white mb-6">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div>
                            <p className="text-sm text-blue-300 mb-1">Full Name</p>
                            <p className="text-xl font-medium text-white">{student.fullName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-300 mb-1">Email</p>
                            <p className="text-xl font-medium text-white">{student.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-300 mb-1">Phone Number</p>
                            <p className="text-xl font-medium text-white">{student.phoneNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-300 mb-1">Course</p>
                            <p className="text-xl font-medium text-white">{student.skill}</p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-300 mb-1">Class Location</p>
                            <p className="text-xl font-medium text-white">{student.location}</p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-300 mb-1">Scholarship Type</p>
                            <p className="text-xl font-medium text-white bg-blue-600/20 inline-block px-3 py-1 rounded-lg border border-blue-500/30">
                                {student.scholarshipType}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Summary Card */}
                <div className="bg-white/5 backdrop-blur-xl shadow-xl rounded-2xl p-8 mb-8 border border-white/10">
                    <h2 className="text-2xl font-semibold text-white mb-6">Payment Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-blue-600/10 backdrop-blur p-6 rounded-2xl border border-blue-500/20">
                            <p className="text-sm text-blue-200 font-medium mb-2">Total Fees</p>
                            <p className="text-3xl font-bold text-white">₦{student.totalFees.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10">
                            <p className="text-sm text-blue-200 font-medium mb-2">Amount Paid</p>
                            <p className="text-3xl font-bold text-white">₦{student.amountPaid.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10">
                            <p className="text-sm text-blue-200 font-medium mb-2">Remaining Balance</p>
                            <p className="text-3xl font-bold text-white">₦{student.remainingBalance.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10">
                            <p className="text-sm text-blue-200 font-medium mb-2">Payment Status</p>
                            <p className="text-3xl font-bold text-white">{getPaymentStatus()}</p>
                        </div>
                    </div>
                </div>

                {/* Payment Options */}
                {student.remainingBalance > 0 && (
                    <div className="bg-white/5 backdrop-blur-xl shadow-xl rounded-2xl p-8 mb-8 border border-white/10">
                        <h2 className="text-2xl font-semibold text-white mb-6">Make a Payment</h2>
                        <p className="text-sm text-blue-200 font-medium mb-2">Select an amount to pay:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {getPaymentOptions().map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleInitiatePayment(option.amount)}
                                    disabled={student.remainingBalance < option.amount}
                                    className="group p-6 bg-white cursor-pointer text-blue-950 rounded-2xl hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                >
                                    <p className="text-xl font-bold mb-2 group-disabled:text-opacity-50">{option.label}</p>
                                    <p className="text-sm font-semibold opacity-80">₦{option.amount.toLocaleString()}</p>
                                </button>
                            ))}
                            <button
                                onClick={() => handleInitiatePayment(student.remainingBalance)}
                                className="group p-6 bg-blue-600 cursor-pointer text-white rounded-2xl hover:bg-blue-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                <p className="text-xl font-bold mb-2">Pay Full Balance</p>
                                <p className="text-sm font-semibold opacity-90">₦{student.remainingBalance.toLocaleString()}</p>
                            </button>
                        </div>
                    </div>
                )}

                {/* Payment History */}
                <div className="bg-white/5 backdrop-blur-xl shadow-xl rounded-2xl p-8 border border-white/10">
                    <h2 className="text-2xl font-semibold text-white mb-6">Payment History</h2>
                    {student.paymentHistory && student.paymentHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="px-6 py-4 text-left text-sm font-medium text-blue-200">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-blue-200">Amount</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-blue-200">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-blue-200">Reference</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {student.paymentHistory.map((payment, index) => (
                                        <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-white">
                                                {new Date(payment.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-white font-semibold">
                                                ₦{payment.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-4 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full ${payment.status === 'verified'
                                                        ? 'bg-white text-blue-900'
                                                        : payment.status === 'pending'
                                                            ? 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
                                                            : 'bg-red-500/20 text-red-200 border border-red-500/30'
                                                    }`}>
                                                    {payment.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-blue-300 text-sm font-mono">
                                                {payment.transactionReference || 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-blue-200 text-center py-8">No payment history yet.</p>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && paymentData && (
                <div className="fixed inset-0 bg-blue-950/80 backdrop-blur-md overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-blue-950 border border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
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
        </div>
    );
}
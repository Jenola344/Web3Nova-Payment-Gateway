'use client';

import { useState, useEffect } from 'react';
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
    const router = useRouter();

    useEffect(() => {
        fetchProfile();
        //if exisiting pending trasactions that are not verified yet, poll to check status and verify
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
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
            { label: 'Full Payment - ₦20,000', amount: 20000 }
        ];
        } else if (student.scholarshipType === 'Half Funded') {
        return [
            { label: 'First Payment - ₦20,000', amount: 20000 },
            { label: 'Second Payment - ₦20,000', amount: 20000 },
            { label: 'Final Payment - ₦10,000', amount: 10000 }
        ];
        } else {
        return [
            { label: 'Full Payment - ₦100,000', amount: 100000 }
        ];
        }
    };

    const needsDeadlinePayment = student.amountPaid < 20000;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
                <p className="text-purple-200">Welcome back, {student.fullName}!</p>
            </div>
            <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-lg"
            >
                Logout
            </button>
            </div>

            {/* Countdown Timer - Only show if haven't paid 20k */}
            {needsDeadlinePayment && (
            <div className="bg-gradient-to-r from-red-300 to-pink-400 rounded-xl shadow-2xl p-6 mb-6 text-white">
                <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">⏰ Payment Deadline</h2>
                <p className="mb-4">Time remaining to pay ₦20,000 (December 31, 2025)</p>
                <div className="flex justify-center gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg p-4 min-w-[80px]">
                    <div className="text-4xl font-bold">{countdown.days}</div>
                    <div className="text-sm">Days</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg p-4 min-w-[80px]">
                    <div className="text-4xl font-bold">{countdown.hours}</div>
                    <div className="text-sm">Hours</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg p-4 min-w-[80px]">
                    <div className="text-4xl font-bold">{countdown.minutes}</div>
                    <div className="text-sm">Minutes</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg p-4 min-w-[80px]">
                    <div className="text-4xl font-bold">{countdown.seconds}</div>
                    <div className="text-sm">Seconds</div>
                    </div>
                </div>
                </div>
            </div>
            )}

            {/* Student Info Card */}
            <div className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-xl p-6 mb-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <p className="text-sm text-purple-200">Full Name</p>
                <p className="text-lg font-medium text-white">{student.fullName}</p>
                </div>
                <div>
                <p className="text-sm text-purple-200">Email</p>
                <p className="text-lg font-medium text-white">{student.email}</p>
                </div>
                <div>
                <p className="text-sm text-purple-200">Phone Number</p>
                <p className="text-lg font-medium text-white">{student.phoneNumber}</p>
                </div>
                <div>
                <p className="text-sm text-purple-200">Course</p>
                <p className="text-lg font-medium text-white">{student.skill}</p>
                </div>
                <div>
                <p className="text-sm text-purple-200">Class Location</p>
                <p className="text-lg font-medium text-white">{student.location}</p>
                </div>
                <div>
                <p className="text-sm text-purple-200">Scholarship Type</p>
                <p className="text-lg font-medium text-white">{student.scholarshipType}</p>
                </div>
            </div>
            </div>

            {/* Payment Summary Card */}
            <div className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-xl p-6 mb-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">Payment Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-600/30 backdrop-blur p-4 rounded-lg border border-blue-400/50">
                <p className="text-sm text-blue-200 font-medium">Total Fees</p>
                <p className="text-3xl font-bold text-white">₦{student.totalFees.toLocaleString()}</p>
                </div>
                <div className="bg-green-600/30 backdrop-blur p-4 rounded-lg border border-green-400/50">
                <p className="text-sm text-green-200 font-medium">Amount Paid</p>
                <p className="text-3xl font-bold text-white">₦{student.amountPaid.toLocaleString()}</p>
                </div>
                <div className="bg-red-600/30 backdrop-blur p-4 rounded-lg border border-red-400/50">
                <p className="text-sm text-red-200 font-medium">Remaining Balance</p>
                <p className="text-3xl font-bold text-white">₦{student.remainingBalance.toLocaleString()}</p>
                </div>
                <div className="bg-purple-600/30 backdrop-blur p-4 rounded-lg border border-purple-400/50">
                <p className="text-sm text-purple-200 font-medium">Payment Status</p>
                <p className="text-3xl font-bold text-white">{getPaymentStatus()}</p>
                </div>
            </div>
            </div>

            {/* Payment Options */}
            {student.remainingBalance > 0 && (
            <div className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-xl p-6 mb-6 border border-white/20">
                <h2 className="text-2xl font-semibold text-white mb-4">Make a Payment</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getPaymentOptions().map((option, index) => (
                    <button
                    key={index}
                    onClick={() => handleInitiatePayment(option.amount)}
                    disabled={student.remainingBalance < option.amount}
                    className="p-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105"
                    >
                    <p className="text-lg font-semibold text-white mb-2">{option.label}</p>
                    <p className="text-3xl font-bold text-white">₦{option.amount.toLocaleString()}</p>
                    </button>
                ))}
                <button
                    onClick={() => handleInitiatePayment(student.remainingBalance)}
                    className="p-6 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                    <p className="text-lg font-semibold text-white mb-2">Pay Full Balance</p>
                    <p className="text-3xl font-bold text-white">₦{student.remainingBalance.toLocaleString()}</p>
                </button>
                </div>
            </div>
            )}

            {/* Payment History */}
            <div className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">Payment History</h2>
            {student.paymentHistory && student.paymentHistory.length > 0 ? (
                <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                    <tr className="border-b border-white/20">
                        <th className="px-6 py-3 text-left text-sm font-medium text-purple-200">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-purple-200">Amount</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-purple-200">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-purple-200">Reference</th>
                    </tr>
                    </thead>
                    <tbody>
                    {student.paymentHistory.map((payment, index) => (
                        <tr key={index} className="border-b border-white/10">
                        <td className="px-6 py-4 text-white">
                            {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-white font-semibold">
                            ₦{payment.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === 'verified' ? 'bg-green-500 text-white' :
                            payment.status === 'pending' ? 'bg-yellow-500 text-white' :
                            'bg-red-500 text-white'
                            }`}>
                            {payment.status.toUpperCase()}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-purple-200 text-sm">
                            {payment.transactionReference || 'N/A'}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            ) : (
                <p className="text-purple-200">No payment history yet.</p>
            )}
            </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && paymentData && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-purple-500">
                <h3 className="text-2xl font-bold text-white mb-6">Complete Payment</h3>
                <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-6 border border-white/20">
                <p className="text-sm text-purple-200 mb-2">Amount to Pay:</p>
                <p className="text-4xl font-bold text-white mb-4">₦{paymentAmount.toLocaleString()}</p>
                <p className="text-sm text-purple-200 mb-1">Payment Reference:</p>
                <p className="text-xs text-white font-mono bg-black/30 p-2 rounded">{paymentData.paymentReference}</p>
                </div>
                <div className="space-y-4">
                <button
                    onClick={handlePayNow}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold text-lg shadow-xl transform hover:scale-105 transition-all"
                >
                    Pay with Monnify
                </button>
                <button
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full px-6 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 font-semibold border border-white/30 transition-all"
                >
                    Cancel
                </button>
                </div>
                <p className="text-xs text-purple-200 mt-4 text-center">
                You'll be redirected to Monnify's secure payment page
                </p>
            </div>
            </div>
        )}
        </div>
    );
}
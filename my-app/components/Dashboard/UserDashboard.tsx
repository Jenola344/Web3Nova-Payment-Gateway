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
                { label: 'Full Payment', amount: 20000 }
            ];
        } else if (student.scholarshipType === 'Half Funded') {
            return [
                { label: 'First Payment', amount: 20000 },
                { label: 'Second Payment', amount: 20000 },
                { label: 'Final Payment', amount: 10000 }
            ];
        } else {
            return [
                { label: 'Full Payment', amount: 100000 }
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

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">Student Dashboard</h1>
                        <p className="text-blue-200 text-sm md:text-base">Welcome, {student.fullName.split(' ')[0]}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm group"
                        aria-label="Logout"
                    >
                        <svg className="w-5 h-5 text-white group-hover:text-blue-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>

                {/* Countdown Timer - Minimalist Digital Clock */}
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

                {/* Payment Options - Reordered for Mobile */}
                {student.remainingBalance > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Make a Payment</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {getPaymentOptions().map((option, index) => (
                                <div
                                    key={index}
                                    className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-row items-center justify-between"
                                >
                                    <div>
                                        <p className="text-sm text-blue-200 font-medium mb-1">{option.label}</p>
                                        <p className="text-lg font-bold text-white">₦{option.amount.toLocaleString()}</p>
                                    </div>
                                    <button
                                        onClick={() => handleInitiatePayment(option.amount)}
                                        disabled={student.remainingBalance < option.amount}
                                        className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                                    >
                                        Pay
                                    </button>
                                </div>
                            ))}
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-row items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-200 font-medium mb-1">Full Balance</p>
                                    <p className="text-lg font-bold text-white">₦{student.remainingBalance.toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => handleInitiatePayment(student.remainingBalance)}
                                    className="px-6 py-2 bg-white text-blue-950 text-sm font-bold rounded-xl hover:bg-blue-50 shadow-lg transition-all"
                                >
                                    Pay
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Student Info Card */}
                <div className="bg-white/5 backdrop-blur-xl shadow-xl rounded-2xl p-6 md:p-8 mb-6 border border-white/10">
                    <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        <div>
                            <p className="text-xs md:text-sm text-blue-300 mb-1">Full Name</p>
                            <p className="text-base md:text-lg font-medium text-white">{student.fullName}</p>
                        </div>
                        <div>
                            <p className="text-xs md:text-sm text-blue-300 mb-1">Email</p>
                            <p className="text-base md:text-lg font-medium text-white break-all">{student.email}</p>
                        </div>
                        <div>
                            <p className="text-xs md:text-sm text-blue-300 mb-1">Phone Number</p>
                            <p className="text-base md:text-lg font-medium text-white">{student.phoneNumber}</p>
                        </div>
                        <div>
                            <p className="text-xs md:text-sm text-blue-300 mb-1">Course</p>
                            <p className="text-base md:text-lg font-medium text-white">{student.skill}</p>
                        </div>
                        <div>
                            <p className="text-xs md:text-sm text-blue-300 mb-1">Class Location</p>
                            <p className="text-base md:text-lg font-medium text-white">{student.location}</p>
                        </div>
                        <div>
                            <p className="text-xs md:text-sm text-blue-300 mb-1">Scholarship Type</p>
                            <p className="text-sm md:text-base font-medium text-white bg-blue-600/20 inline-block px-3 py-1 rounded-lg border border-blue-500/30">
                                {student.scholarshipType}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Summary Card */}
                <div className="bg-white/5 backdrop-blur-xl shadow-xl rounded-2xl p-6 md:p-8 mb-8 border border-white/10">
                    <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Payment Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                        <div className="bg-blue-600/10 backdrop-blur p-4 md:p-6 rounded-2xl border border-blue-500/20">
                            <p className="text-xs md:text-sm text-blue-200 font-medium mb-1 md:mb-2">Total Fees</p>
                            <p className="text-2xl md:text-3xl font-bold text-white">₦{student.totalFees.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur p-4 md:p-6 rounded-2xl border border-white/10">
                            <p className="text-xs md:text-sm text-blue-200 font-medium mb-1 md:mb-2">Amount Paid</p>
                            <p className="text-2xl md:text-3xl font-bold text-white">₦{student.amountPaid.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur p-4 md:p-6 rounded-2xl border border-white/10">
                            <p className="text-xs md:text-sm text-blue-200 font-medium mb-1 md:mb-2">Remaining Balance</p>
                            <p className="text-2xl md:text-3xl font-bold text-white">₦{student.remainingBalance.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur p-4 md:p-6 rounded-2xl border border-white/10">
                            <p className="text-xs md:text-sm text-blue-200 font-medium mb-1 md:mb-2">Payment Status</p>
                            <p className="text-2xl md:text-3xl font-bold text-white">{getPaymentStatus()}</p>
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {student.paymentHistory.map((payment, index) => (
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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-blue-200 text-center py-8 text-sm">No payment history yet.</p>
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
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Student } from '@/types/index';

export default function UserDashboard() {
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [showPayment, setShowPayment] = useState(false);
    const [transactionRef, setTransactionRef] = useState('');
    const [bankDetails, setBankDetails] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        fetchProfile();
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
            setBankDetails(response.bankDetails);
            setPaymentAmount(amount);
            setShowPayment(true);
        } else {
            alert(response.message || 'Failed to initiate payment');
        }
        } catch (error) {
        alert('An error occurred');
        }
    };

    const handleConfirmPayment = async () => {
        if (!transactionRef.trim()) {
        alert('Please enter transaction reference');
        return;
        }

        try {
        const response = await api.confirmPayment(transactionRef);
        if (response.success) {
            alert('Payment confirmed! Verification in progress.');
            setShowPayment(false);
            setTransactionRef('');
            fetchProfile();
        } else {
            alert(response.message || 'Payment confirmation failed');
        }
        } catch (error) {
        alert('An error occurred');
        }
    };

    const handleLogout = async () => {
        await api.logout();
        router.push('/login');
    };

    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-600">Loading...</p>
        </div>
        );
    }

    if (!student) {
        return null;
    }

    const getPaymentStatus = () => {
        if (student.remainingBalance === 0) return 'Fully Paid';
        if (student.amountPaid > 0) return 'Partially Paid';
        return 'Not Paid';
    };

    const stagedPaymentOptions = [
        { label: 'First Payment - ₦20,000', amount: 20000 },
        { label: 'Second Payment - ₦20,000', amount: 20000 },
        { label: 'Final Payment - ₦10,000', amount: 10000 },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
                Logout
            </button>
            </div>

            {/* Student Info Card */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-lg font-medium text-gray-900">{student.fullName}</p>
                </div>
                <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-medium text-gray-900">{student.email}</p>
                </div>
                <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-lg font-medium text-gray-900">{student.phoneNumber}</p>
                </div>
                <div>
                <p className="text-sm text-gray-500">Course</p>
                <p className="text-lg font-medium text-gray-900">{student.skill}</p>
                </div>
                <div>
                <p className="text-sm text-gray-500">Class Location</p>
                <p className="text-lg font-medium text-gray-900">{student.location}</p>
                </div>
                <div>
                <p className="text-sm text-gray-500">Scholarship Type</p>
                <p className="text-lg font-medium text-gray-900">{student.scholarshipType}</p>
                </div>
            </div>
            </div>

            {/* Payment Summary Card */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Fees</p>
                <p className="text-2xl font-bold text-blue-900">₦{student.totalFees.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Amount Paid</p>
                <p className="text-2xl font-bold text-green-900">₦{student.amountPaid.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Remaining Balance</p>
                <p className="text-2xl font-bold text-red-900">₦{student.remainingBalance.toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Payment Status</p>
                <p className="text-2xl font-bold text-purple-900">{getPaymentStatus()}</p>
                </div>
            </div>
            </div>

            {/* Payment Options */}
            {student.remainingBalance > 0 && !showPayment && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Make a Payment</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => handleInitiatePayment(student.remainingBalance)}
                    className="p-4 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                >
                    <p className="text-lg font-semibold text-indigo-600">Pay Full Balance</p>
                    <p className="text-2xl font-bold text-indigo-900">₦{student.remainingBalance.toLocaleString()}</p>
                </button>
                {student.scholarshipType === 'Half Funded' && (
                    <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Staged Payment Options:</p>
                    {stagedPaymentOptions.map((option, index) => (
                        <button
                        key={index}
                        onClick={() => handleInitiatePayment(option.amount)}
                        disabled={student.remainingBalance < option.amount}
                        className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                        <p className="text-sm font-medium text-gray-700">{option.label}</p>
                        </button>
                    ))}
                    </div>
                )}
                </div>
            </div>
            )}

            {/* Payment Confirmation Modal */}
            {showPayment && bankDetails && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Complete Your Payment</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800 font-medium mb-2">Transfer ₦{paymentAmount.toLocaleString()} to:</p>
                <div className="space-y-2">
                    <p className="text-gray-900"><span className="font-semibold">Bank Name:</span> {bankDetails.bankName}</p>
                    <p className="text-gray-900"><span className="font-semibold">Account Number:</span> {bankDetails.accountNumber}</p>
                    <p className="text-gray-900"><span className="font-semibold">Account Name:</span> {bankDetails.accountName}</p>
                </div>
                </div>
                <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Reference (from your bank)
                    </label>
                    <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter transaction reference"
                    />
                </div>
                <div className="flex space-x-4">
                    <button
                    onClick={handleConfirmPayment}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                    I Have Paid - Confirm
                    </button>
                    <button
                    onClick={() => setShowPayment(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                    Cancel
                    </button>
                </div>
                </div>
            </div>
            )}

            {/* Payment History */}
            <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment History</h2>
            {student.paymentHistory && student.paymentHistory.length > 0 ? (
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {student.paymentHistory.map((payment, index) => (
                        <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₦{payment.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === 'verified' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                            }`}>
                            {payment.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.transactionReference || 'N/A'}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            ) : (
                <p className="text-gray-500">No payment history yet.</p>
            )}
            </div>
        </div>
        </div>
    );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Student } from '@/types';

export default function AdminDashboard() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchAllStudents();
    }, []);

    const fetchAllStudents = async () => {
        try {
        const response = await api.getAllStudents();
        if (response.success) {
            setStudents(response.students);
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
            fetchAllStudents();
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
        if (student.remainingBalance === 0) return 'bg-green-100 text-green-800';
        if (student.amountPaid > 0) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const getStatus = (student: Student) => {
        if (student.remainingBalance === 0) return 'Fully Paid';
        if (student.amountPaid > 0) return 'Partially Paid';
        return 'Not Paid';
    };

    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-600">Loading...</p>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
                Logout
            </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow">
                <p className="text-sm text-green-600">Fully Paid</p>
                <p className="text-2xl font-bold text-green-900">
                {students.filter(s => s.remainingBalance === 0).length}
                </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
                <p className="text-sm text-yellow-600">Partially Paid</p>
                <p className="text-2xl font-bold text-yellow-900">
                {students.filter(s => s.amountPaid > 0 && s.remainingBalance > 0).length}
                </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow">
                <p className="text-sm text-red-600">Not Paid</p>
                <p className="text-2xl font-bold text-red-900">
                {students.filter(s => s.amountPaid === 0).length}
                </p>
            </div>
            </div>

            {/* Search */}
            <div className="mb-6">
            <input
                type="text"
                placeholder="Search by name, email, or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            </div>

            {/* Students Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Skill
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Scholarship
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Fees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                    </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.skill}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.scholarshipType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₦{student.totalFees.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₦{student.amountPaid.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₦{student.remainingBalance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(student)}`}>
                            {getStatus(student)}
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                            onClick={() => setSelectedStudent(student)}
                            className="text-indigo-600 hover:text-indigo-900"
                        >
                            Update Payment
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>

            {/* Update Payment Modal */}
            {selectedStudent && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Update Payment for {selectedStudent.fullName}
                </h3>
                <div className="mb-4">
                    <p className="text-sm text-gray-600">Current Balance: ₦{selectedStudent.remainingBalance.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Amount Paid: ₦{selectedStudent.amountPaid.toLocaleString()}</p>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount
                    </label>
                    <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter amount"
                    />
                </div>
                <div className="flex space-x-4">
                    <button
                    onClick={handleUpdatePayment}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                    Update
                    </button>
                    <button
                    onClick={() => {
                        setSelectedStudent(null);
                        setPaymentAmount('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                    Cancel
                    </button>
                </div>
                </div>
            </div>
            )}
        </div>
        </div>
    );
}
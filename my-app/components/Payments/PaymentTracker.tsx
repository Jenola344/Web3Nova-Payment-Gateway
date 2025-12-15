'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PaymentStatus } from '@/types';

export default function PaymentTracker() {
    const [students, setStudents] = useState<PaymentStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPaymentTracker();
    }, []);

    const fetchPaymentTracker = async () => {
        try {
        const response = await api.getPaymentTracker();
        if (response.success) {
            setStudents(response.students);
        }
        } catch (error) {
        console.error('Error fetching payment tracker:', error);
        } finally {
        setLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.skill.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
        case 'Fully Paid':
            return 'bg-green-100 text-green-800';
        case 'Partially Paid':
            return 'bg-yellow-100 text-yellow-800';
        case 'Not Paid':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-600">Loading payment tracker...</p>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Tracker</h1>
            <p className="text-gray-600">View payment status of all students</p>
            </div>

            {/* Search */}
            <div className="mb-6">
            <input
                type="text"
                placeholder="Search by name, email, or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
                {students.filter(s => s.status === 'Fully Paid').length}
                </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
                <p className="text-sm text-yellow-600">Partially Paid</p>
                <p className="text-2xl font-bold text-yellow-900">
                {students.filter(s => s.status === 'Partially Paid').length}
                </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow">
                <p className="text-sm text-red-600">Not Paid</p>
                <p className="text-2xl font-bold text-red-900">
                {students.filter(s => s.status === 'Not Paid').length}
                </p>
            </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
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
                        Amount Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                    </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.email}
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
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(student.status)}`}>
                            {student.status}
                        </span>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>

            {filteredStudents.length === 0 && (
            <p className="text-center text-gray-500 mt-8">No students found.</p>
            )}
        </div>
        </div>
    );
}
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
                return 'bg-white text-blue-900 border border-white';
            case 'Partially Paid':
                return 'bg-blue-600 text-white border border-blue-500';
            case 'Not Paid':
                return 'bg-transparent text-blue-200 border border-blue-500/30';
            default:
                return 'bg-white/5 text-blue-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-blue-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading payment tracker...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-blue-950 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            {/* Ambient Background Glow */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[128px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-white mb-3">Payment Tracker</h1>
                    <p className="text-blue-200 text-lg">Real-time payment status of all students</p>
                </div>

                {/* Search */}
                <div className="mb-8 max-w-2xl mx-auto">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, email, or skill..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all shadow-lg"
                        />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
                        <p className="text-sm text-blue-200 font-medium mb-1">Total Students</p>
                        <p className="text-3xl font-bold text-white">{students.length}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-lg">
                        <p className="text-sm text-white font-medium mb-1">Fully Paid</p>
                        <p className="text-3xl font-bold text-white">
                            {students.filter(s => s.status === 'Fully Paid').length}
                        </p>
                    </div>
                    <div className="bg-blue-600/20 backdrop-blur-md p-6 rounded-2xl border border-blue-500/30 shadow-lg">
                        <p className="text-sm text-blue-100 font-medium mb-1">Partially Paid</p>
                        <p className="text-3xl font-bold text-white">
                            {students.filter(s => s.status === 'Partially Paid').length}
                        </p>
                    </div>
                    <div className="bg-transparent p-6 rounded-2xl border border-white/10 shadow-lg">
                        <p className="text-sm text-blue-300 font-medium mb-1">Not Paid</p>
                        <p className="text-3xl font-bold text-white">
                            {students.filter(s => s.status === 'Not Paid').length}
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white/5 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/10">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-blue-900/50">
                                <tr>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                                        Student Name
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                                        Skill
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                                        Scholarship
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                                        Total Fees
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                                        Amount Paid
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                                        Balance
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredStudents.map((student, index) => (
                                    <tr key={index} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                            {student.studentName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">
                                            {student.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">
                                            {student.skill}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">
                                            {student.scholarshipType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">
                                            ₦{student.totalFees.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">
                                            ₦{student.amountPaid.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">
                                            ₦{student.remainingBalance.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(student.status)}`}>
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
                    <div className="text-center py-12">
                        <p className="text-blue-200 text-lg">No students found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
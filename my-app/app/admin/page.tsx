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
        if (student.remainingBalance === 0) return 'bg-white text-blue-900 border border-white';
        if (student.amountPaid > 0) return 'bg-blue-600/20 text-blue-100 border border-blue-500/50';
        return 'bg-transparent text-blue-200 border border-blue-500/30';
    };

    const getStatus = (student: Student) => {
        if (student.remainingBalance === 0) return 'Fully Paid';
        if (student.amountPaid > 0) return 'Partially Paid';
        return 'Not Paid';
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
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm font-medium"
                    >
                        Logout
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
                        <p className="text-sm text-blue-200 font-medium mb-1">Total Students</p>
                        <p className="text-3xl font-bold text-white">{students.length}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
                        <p className="text-sm text-white font-medium mb-1">Fully Paid</p>
                        <p className="text-3xl font-bold text-white">
                            {students.filter(s => s.remainingBalance === 0).length}
                        </p>
                    </div>
                    <div className="bg-blue-600/10 backdrop-blur-md p-6 rounded-2xl border border-blue-500/20 shadow-lg">
                        <p className="text-sm text-blue-100 font-medium mb-1">Partially Paid</p>
                        <p className="text-3xl font-bold text-white">
                            {students.filter(s => s.amountPaid > 0 && s.remainingBalance > 0).length}
                        </p>
                    </div>
                    <div className="bg-transparent p-6 rounded-2xl border border-white/10 shadow-lg">
                        <p className="text-sm text-blue-300 font-medium mb-1">Not Paid</p>
                        <p className="text-3xl font-bold text-white">
                            {students.filter(s => s.amountPaid === 0).length}
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
                                    <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Scholarship</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Total Fees</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Paid</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Balance</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{student.fullName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">{student.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">{student.phoneNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">{student.skill}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">{student.scholarshipType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">₦{student.totalFees.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">₦{student.amountPaid.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">₦{student.remainingBalance.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(student)}`}>
                                                {getStatus(student)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => setSelectedStudent(student)}
                                                className="text-white hover:text-blue-300 font-medium underline decoration-blue-500/30 underline-offset-4 hover:decoration-blue-300 transition-all"
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
            </div>
        </div>
    );
}
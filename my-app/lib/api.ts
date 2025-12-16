const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {
    // Auth
    async login(email: string, password: string, role: 'student' | 'admin') {
        const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, role }),
        });
        return res.json();
    },

    async logout() {
        const res = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        });
        return res.json();
    },

    // Student
    async getStudentProfile() {
        const res = await fetch(`${API_URL}/user/profile`, {
        credentials: 'include',
        });
        return res.json();
    },

    async initiatePayment(amount: number) {
        const res = await fetch(`${API_URL}/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount }),
        });
        return res.json();
    },

    async checkPaymentStatus(paymentReference: string) {
        const res = await fetch(`${API_URL}/payments/status/${paymentReference}`, {
        credentials: 'include',
        });
        return res.json();
    },

    // Public
    async getPaymentTracker() {
        const res = await fetch(`${API_URL}/payments/tracker`);
        return res.json();
    },

    // Admin
    async getAllStudents() {
        const res = await fetch(`${API_URL}/user/all`, {
        credentials: 'include',
        });
        return res.json();
    },

    async updateStudentPayment(studentId: string, amount: number) {
        const res = await fetch(`${API_URL}/payments/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ studentId, amount }),
        });
        return res.json();
    },
    
    async verifyPayment(transactionReference: string, studentId: string) {
        const res = await fetch(`${API_URL}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ transactionReference, studentId }),
        });
        return res.json();
    },
};
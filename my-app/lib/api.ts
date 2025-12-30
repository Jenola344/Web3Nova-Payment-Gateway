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

    async cancelPayment(paymentReference: string) {
        const res = await fetch(`${API_URL}/payments/${paymentReference}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        return res.json();
    },

    // Public
    async getPaymentTracker(page = 1, limit = 10, search = '') {
        const res = await fetch(`${API_URL}/payments/tracker?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
        return res.json();
    },

    // Admin
    async getAllStudents(page = 1, limit = 10, search = '') {
        const res = await fetch(`${API_URL}/user/all?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, {
            credentials: 'include',
        });
        return res.json();
    },

    async getDashboardStats() {
        const res = await fetch(`${API_URL}/user/stats/dashboard`, {
            credentials: 'include', // or omit if public, but safer to include or handle as needed
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

    // Admin methods


    async registerStudent(data: any) {
        const response = await fetch(`${API_URL}/user/register`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        return response.json();
    },

    async updateStudentDetails(id: string, data: any) {
        const response = await fetch(`${API_URL}/user/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        return response.json();
    },


    // Task Management
    async getAllTasks(page = 1, limit = 10) {
        const response = await fetch(`${API_URL}/tasks/all?page=${page}&limit=${limit}`, {
            credentials: 'include',
        });
        return response.json();
    },


    async createTask(data: any) {
        const res = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },


    async getStudentTasks() {
        const res = await fetch(`${API_URL}/tasks/student`, {
            credentials: 'include',
        });
        return res.json();
    },

    async submitTask(taskId: string, content: string) {
        const res = await fetch(`${API_URL}/tasks/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ taskId, content }),
        });
        return res.json();
    },

    async getTaskSubmissions(taskId: string) {
        const res = await fetch(`${API_URL}/tasks/${taskId}/submissions`, {
            credentials: 'include',
        });
        return res.json();
    },

    async gradeTask(submissionId: string, grade: string, feedback: string) {
        const res = await fetch(`${API_URL}/tasks/submissions/${submissionId}/grade`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ grade, feedback }),
        });
        return res.json();
    },
};
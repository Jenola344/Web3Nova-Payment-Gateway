import { Suspense } from 'react';
import UserDashboard from '@/components/Dashboard/UserDashboard';

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white">Loading...</div>
            </div>
        }>
            <UserDashboard />
        </Suspense>
    );
}
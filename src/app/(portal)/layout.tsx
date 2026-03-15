export const dynamic = 'force-dynamic'

import PortalLayout from '@/components/layout/PortalLayout'
import { AuthProvider } from '@/contexts/AuthContext'
import { DashboardProvider } from '@/contexts/DashboardContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <DashboardProvider>
                <PortalLayout>{children}</PortalLayout>
            </DashboardProvider>
        </AuthProvider>
    )
}

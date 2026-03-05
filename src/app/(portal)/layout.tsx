export const dynamic = 'force-dynamic'

import PortalLayout from '@/components/layout/PortalLayout'
import { DashboardProvider } from '@/contexts/DashboardContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardProvider>
            <PortalLayout>{children}</PortalLayout>
        </DashboardProvider>
    )
}

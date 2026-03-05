export const dynamic = 'force-dynamic'

import PortalLayout from '@/components/layout/PortalLayout'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <PortalLayout>{children}</PortalLayout>
}

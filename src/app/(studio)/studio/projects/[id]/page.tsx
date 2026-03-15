'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { 
    ProjectWithDetails,
    ProjectStatus,
    TimelineStage,
    GalleryImage
} from '@/types/database'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'

// Sub-components
import { ProjectHeader } from './_components/ProjectHeader'
import { EditProjectDetails } from './_components/EditProjectDetails'
import { ProjectTabs } from './_components/ProjectTabs'
import { OverviewTab } from './_components/OverviewTab'
import { TimelineTab } from './_components/TimelineTab'
import { GalleryTab } from './_components/GalleryTab'
import { DocumentsTab } from './_components/DocumentsTab'

export default function StudioProjectDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [project, setProject] = useState<ProjectWithDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [isEditingInfo, setIsEditingInfo] = useState(false)

    useEffect(() => {
        if (id) fetchProject()
    }, [id])

    const fetchProject = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*, timeline_stages(*), documents(*), gallery(*)')
                .eq('id', id as string)
                .single()

            if (error) throw error
            setProject(data as ProjectWithDetails)
        } catch (error) {
            logger.error('Studio', 'Error fetching project', error)
            toast.error('Failed to load project details')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProject = async (formData: any) => {
        try {
            const { error } = await supabase
                .from('projects')
                .update(formData)
                .eq('id', id as string)

            if (error) throw error
            
            toast.success('Project updated')
            setProject(prev => prev ? { ...prev, ...formData } : null)
            setIsEditingInfo(false)
        } catch (error) {
            logger.error('Studio', 'Update error', error)
            toast.error('Failed to update project')
        }
    }

    const handleDeleteProject = async () => {
        if (!window.confirm('Are you sure you want to delete this project? This cannot be undone.')) return
        
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', id as string)

            if (error) throw error
            toast.success('Project deleted')
            router.push('/studio/projects')
        } catch (error) {
            logger.error('Studio', 'Delete error', error)
            toast.error('Failed to delete project')
        }
    }

    // Placeholder handlers for other features (to be implemented)
    const handleAddStage = () => toast('Add stage feature coming soon')
    const handleEditStage = (stage: TimelineStage) => toast('Edit stage feature coming soon')
    const handleDeleteStage = (stageId: string) => toast('Delete stage feature coming soon')
    
    const handleUploadPhoto = () => toast('Upload photo feature coming soon')
    const handleEditPhoto = (image: GalleryImage) => toast('Edit photo feature coming soon')
    const handleDeletePhoto = (imageId: string) => toast('Delete photo feature coming soon')
    
    const handleAddDocument = () => toast('Add document feature coming soon')
    const handleDeleteDocument = (docId: string) => toast('Delete document feature coming soon')

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin opacity-40" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="text-center py-20">
                <p className="text-text-secondary">Project not found</p>
                <button onClick={() => router.push('/studio/projects')} className="btn-ghost mt-4">
                    Back to Projects
                </button>
            </div>
        )
    }

    return (
        <div className="pb-20">
            <ProjectHeader 
                project={project} 
                onEdit={() => setIsEditingInfo(!isEditingInfo)} 
                onDelete={handleDeleteProject} 
            />

            <EditProjectDetails 
                isOpen={isEditingInfo}
                onClose={() => setIsEditingInfo(false)}
                onSave={handleUpdateProject}
                initialData={{
                    title: project.title,
                    location: project.location || '',
                    status: project.status,
                    description: project.description || ''
                }}
            />

            <ProjectTabs 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
            />

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {activeTab === 'overview' && <OverviewTab project={project} />}
                {activeTab === 'timeline' && (
                    <TimelineTab 
                        stages={project.timeline_stages || []} 
                        onAddStage={handleAddStage}
                        onEditStage={handleEditStage}
                        onDeleteStage={handleDeleteStage}
                    />
                )}
                {activeTab === 'gallery' && (
                    <GalleryTab 
                        images={project.gallery || []} 
                        onUpload={handleUploadPhoto}
                        onEdit={handleEditPhoto}
                        onDelete={handleDeletePhoto}
                    />
                )}
                {activeTab === 'documents' && (
                    <DocumentsTab 
                        documents={project.documents || []} 
                        onAdd={handleAddDocument}
                        onDelete={handleDeleteDocument}
                    />
                )}
            </motion.div>
        </div>
    )
}

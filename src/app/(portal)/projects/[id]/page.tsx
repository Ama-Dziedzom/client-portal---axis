'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { ProjectWithDetails } from '@/types/database'
import { formatDate, formatStatus, getStatusBadgeClass, calculateProgress, formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'
import {
    ArrowLeft,
    MapPin,
    Calendar,
    CheckCircle2,
    Circle,
    Clock,
    FileText,
    Download,
    MessageCircle,
    Send,
    Image as ImageIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function ProjectDetailPage() {
    const { id } = useParams()
    const { client } = useAuth()
    const [project, setProject] = useState<ProjectWithDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [newMessage, setNewMessage] = useState('')
    const [sendingMessage, setSendingMessage] = useState(false)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    useEffect(() => {
        if (client && id) fetchProject()
    }, [client, id])

    const fetchProject = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*, timeline_stages(*), documents(*), messages(*), invoices(*)')
                .eq('id', id as string)
                .single()

            if (error) throw error
            setProject(data as any)
        } catch (error) {
            console.error('Error fetching project:', error)
        } finally {
            setLoading(false)
        }
    }

    const sendMessage = async () => {
        if (!newMessage.trim() || !client || !project) return

        setSendingMessage(true)
        try {
            const { error } = await supabase.from('messages').insert({
                project_id: project.id,
                sender_type: 'client',
                sender_name: client.name,
                body: newMessage.trim(),
            })

            if (error) throw error
            setNewMessage('')
            toast.success('Message sent')
            fetchProject()
        } catch (error: any) {
            toast.error(error.message || 'Failed to send message')
        } finally {
            setSendingMessage(false)
        }
    }

    if (loading) {
        return (
            <div className="page-container">
                <div className="skeleton h-8 w-32 mb-6" />
                <div className="skeleton h-64 rounded-2xl mb-6" />
                <div className="skeleton h-48 rounded-2xl" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="page-container">
                <div className="card-flat text-center py-16">
                    <h2 className="font-heading text-xl font-semibold text-text-primary mb-2">Project not found</h2>
                    <p className="text-text-secondary mb-6">This project may not exist or you may not have access.</p>
                    <Link href="/projects" className="btn-primary">
                        <ArrowLeft className="w-4 h-4" /> Back to Projects
                    </Link>
                </div>
            </div>
        )
    }

    const stages = (project.timeline_stages || []).sort((a, b) => a.display_order - b.display_order)
    const documents = project.documents || []
    const messages = (project.messages || []).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    const progress = calculateProgress(stages)

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'timeline', label: 'Timeline', count: stages.length },
        { id: 'gallery', label: 'Gallery', count: project.gallery_urls?.length || 0 },
        { id: 'documents', label: 'Documents', count: documents.length },
        { id: 'messages', label: 'Messages', count: messages.length },
    ]

    return (
        <div className="page-container">
            <motion.div variants={container} initial="hidden" animate="show">
                {/* Back */}
                <motion.div variants={item}>
                    <Link href="/projects" className="btn-ghost inline-flex mb-6 -ml-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Projects
                    </Link>
                </motion.div>

                {/* Hero */}
                <motion.div variants={item} className="card-flat overflow-hidden mb-8">
                    {project.cover_image_url && (
                        <div className="h-64 -mx-6 -mt-6 mb-6 overflow-hidden">
                            <img
                                src={project.cover_image_url}
                                alt={project.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl lg:text-3xl font-heading font-semibold text-text-primary">
                                    {project.title}
                                </h1>
                                <span className={getStatusBadgeClass(project.status)}>
                                    {formatStatus(project.status)}
                                </span>
                            </div>

                            {project.location && (
                                <div className="flex items-center gap-1.5 text-sm text-text-secondary mb-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{project.location}</span>
                                </div>
                            )}

                            {project.description && (
                                <p className="text-text-secondary font-body max-w-2xl mt-2">
                                    {project.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-text-secondary flex-shrink-0">
                            {project.start_date && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    <span>Started {formatDate(project.start_date, { month: 'short', year: 'numeric' })}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress */}
                    {stages.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-border">
                            <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
                                <span className="font-medium">Overall Progress</span>
                                <span className="font-semibold text-primary">{progress}%</span>
                            </div>
                            <div className="h-2 bg-accent/15 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="h-full bg-primary rounded-full"
                                />
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Tabs */}
                <motion.div variants={item} className="flex items-center gap-1 mb-8 overflow-x-auto pb-2 border-b border-border">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative px-5 py-3 text-sm font-medium font-body whitespace-nowrap transition-colors ${activeTab === tab.id
                                ? 'text-primary'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="ml-1.5 text-xs opacity-60">{tab.count}</span>
                            )}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeProjectTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                                />
                            )}
                        </button>
                    ))}
                </motion.div>

                {/* Tab Content */}
                <motion.div variants={item}>
                    {/* Timeline Tab */}
                    {activeTab === 'timeline' && (
                        <div className="max-w-2xl">
                            {stages.length === 0 ? (
                                <div className="card-flat text-center py-12">
                                    <Clock className="w-8 h-8 text-accent mx-auto mb-3" />
                                    <p className="text-text-secondary">Timeline stages will appear here as your project progresses.</p>
                                </div>
                            ) : (
                                <div className="space-y-0">
                                    {stages.map((stage, index) => (
                                        <div key={stage.id} className="flex gap-4">
                                            {/* Connector */}
                                            <div className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${stage.status === 'complete'
                                                    ? 'bg-success text-white'
                                                    : stage.status === 'active'
                                                        ? 'bg-primary text-white'
                                                        : 'bg-accent/20 text-text-secondary'
                                                    }`}>
                                                    {stage.status === 'complete' ? (
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    ) : stage.status === 'active' ? (
                                                        <Clock className="w-4 h-4" />
                                                    ) : (
                                                        <Circle className="w-4 h-4" />
                                                    )}
                                                </div>
                                                {index < stages.length - 1 && (
                                                    <div className={`w-0.5 flex-1 min-h-[3rem] ${stage.status === 'complete' ? 'bg-success/30' : 'bg-border'
                                                        }`} />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="pb-8 pt-1">
                                                <h3 className={`font-heading text-base font-semibold ${stage.status === 'complete'
                                                    ? 'text-text-primary'
                                                    : stage.status === 'active'
                                                        ? 'text-primary'
                                                        : 'text-text-secondary'
                                                    }`}>
                                                    {stage.stage_name}
                                                </h3>
                                                {stage.notes && (
                                                    <p className="text-sm text-text-secondary mt-1">{stage.notes}</p>
                                                )}
                                                {stage.completed_at && (
                                                    <p className="text-xs text-text-secondary mt-1.5">
                                                        Completed {formatDate(stage.completed_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Quick Stats */}
                            <div className="card-flat">
                                <h3 className="font-heading text-lg font-semibold text-text-primary mb-4">Project Details</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Status</span>
                                        <span className={getStatusBadgeClass(project.status)}>{formatStatus(project.status)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Location</span>
                                        <span className="text-text-primary font-medium">{project.location || '—'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Start Date</span>
                                        <span className="text-text-primary font-medium">
                                            {project.start_date ? formatDate(project.start_date) : '—'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Est. Completion</span>
                                        <span className="text-text-primary font-medium">
                                            {project.estimated_completion ? formatDate(project.estimated_completion) : '—'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Current Stage */}
                            <div className="card-flat">
                                <h3 className="font-heading text-lg font-semibold text-text-primary mb-4">Current Stage</h3>
                                {stages.length > 0 ? (
                                    <div>
                                        {(() => {
                                            const activeStage = stages.find((s) => s.status === 'active')
                                            const nextStage = stages.find((s) => s.status === 'upcoming')
                                            const display = activeStage || nextStage

                                            return display ? (
                                                <div>
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-3 ${activeStage ? 'bg-primary/10 text-primary' : 'bg-accent/20 text-text-secondary'
                                                        }`}>
                                                        {activeStage ? <Clock className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                                                        {activeStage ? 'In Progress' : 'Up Next'}
                                                    </div>
                                                    <h4 className="font-heading text-xl font-semibold text-text-primary">
                                                        {display.stage_name}
                                                    </h4>
                                                    {display.notes && (
                                                        <p className="text-sm text-text-secondary mt-2">{display.notes}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-success">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    <span className="font-medium">All stages complete!</span>
                                                </div>
                                            )
                                        })()}
                                    </div>
                                ) : (
                                    <p className="text-text-secondary text-sm">No timeline stages set up yet.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Gallery Tab */}
                    {activeTab === 'gallery' && (
                        <div>
                            {(!project.gallery_urls || project.gallery_urls.length === 0) ? (
                                <div className="card-flat text-center py-12">
                                    <ImageIcon className="w-8 h-8 text-accent mx-auto mb-3" />
                                    <p className="text-text-secondary">Gallery images will appear here as your project progresses.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {project.gallery_urls.map((url, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedImage(url)}
                                                className="aspect-square rounded-2xl overflow-hidden bg-accent/10 group"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`${project.title} - Image ${idx + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Lightbox */}
                                    {selectedImage && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8"
                                            onClick={() => setSelectedImage(null)}
                                        >
                                            <img
                                                src={selectedImage}
                                                alt="Gallery preview"
                                                className="max-w-full max-h-full object-contain rounded-lg"
                                            />
                                        </motion.div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                        <div>
                            {documents.length === 0 ? (
                                <div className="card-flat text-center py-12">
                                    <FileText className="w-8 h-8 text-accent mx-auto mb-3" />
                                    <p className="text-text-secondary">Documents will be shared here by your design team.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {documents.map((doc) => (
                                        <a
                                            key={doc.id}
                                            href={doc.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="card-flat flex items-center gap-4 hover:shadow-elevated transition-shadow group"
                                        >
                                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                                                    {doc.name}
                                                </h4>
                                                <p className="text-xs text-text-secondary mt-0.5">
                                                    {doc.file_type || 'Document'} {doc.file_size && `· ${doc.file_size}`} · {formatDate(doc.uploaded_at, { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                            <Download className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors flex-shrink-0" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Messages Tab */}
                    {activeTab === 'messages' && (
                        <div className="max-w-2xl">
                            <div className="card-flat p-0 overflow-hidden">
                                {/* Messages list */}
                                <div className="max-h-[500px] overflow-y-auto p-6 space-y-4">
                                    {messages.length === 0 ? (
                                        <div className="text-center py-12">
                                            <MessageCircle className="w-8 h-8 text-accent mx-auto mb-3" />
                                            <p className="text-text-secondary text-sm">No messages yet. Start the conversation!</p>
                                        </div>
                                    ) : (
                                        messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender_type === 'client'
                                                    ? 'bg-primary text-white rounded-br-md'
                                                    : 'bg-accent/15 text-text-primary rounded-bl-md'
                                                    }`}>
                                                    <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender_name}</p>
                                                    <p className="text-sm leading-relaxed">{msg.body}</p>
                                                    <p className={`text-[10px] mt-2 ${msg.sender_type === 'client' ? 'text-white/50' : 'text-text-secondary'
                                                        }`}>
                                                        {formatRelativeTime(msg.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Message input */}
                                <div className="border-t border-border p-4">
                                    <div className="flex items-end gap-3">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            rows={1}
                                            className="input-field resize-none min-h-[44px] max-h-32"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault()
                                                    sendMessage()
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={!newMessage.trim() || sendingMessage}
                                            className="btn-primary px-4 py-3 flex-shrink-0"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    )
}

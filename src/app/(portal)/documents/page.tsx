'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Document as DocType } from '@/types/database'
import { formatDate } from '@/lib/utils'
import {
    FileText,
    Download,
    Image as ImageIcon,
    Table,
    File,
    Search,
    Sparkles,
} from 'lucide-react'

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function getIcon(fileType: string | null) {
    if (!fileType) return <File className="w-5 h-5" />
    if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('word'))
        return <FileText className="w-5 h-5" />
    if (fileType.includes('image')) return <ImageIcon className="w-5 h-5" />
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv'))
        return <Table className="w-5 h-5" />
    return <File className="w-5 h-5" />
}

export default function DocumentsPage() {
    const { client } = useAuth()
    const [documents, setDocuments] = useState<(DocType & { project_title?: string })[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (client) fetchDocuments()
    }, [client])

    const fetchDocuments = async () => {
        try {
            // Get client's projects first
            const { data: projects } = await supabase
                .from('projects')
                .select('id, title')
                .eq('client_id', client!.id)

            if (!projects || projects.length === 0) {
                setLoading(false)
                return
            }

            const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.title]))
            const projectIds = projects.map((p) => p.id)

            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .in('project_id', projectIds)
                .order('uploaded_at', { ascending: false })

            if (error) throw error

            setDocuments(
                (data || []).map((doc) => ({
                    ...doc,
                    project_title: projectMap[doc.project_id] || 'Unknown Project',
                }))
            )
        } catch (error) {
            console.error('Error fetching documents:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredDocs = searchQuery
        ? documents.filter(
            (d) =>
                d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.project_title?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : documents

    if (loading) {
        return (
            <div className="page-container">
                <div className="skeleton h-10 w-48 mb-8" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="skeleton h-20 rounded-2xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <motion.div variants={container} initial="hidden" animate="show">
                {/* Header */}
                <motion.div variants={item} className="mb-10">
                    <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-text-primary mb-2">
                        Documents
                    </h1>
                    <p className="text-text-secondary font-body text-lg">
                        All project files shared by your design team
                    </p>
                </motion.div>

                {/* Search */}
                {documents.length > 0 && (
                    <motion.div variants={item} className="mb-8">
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-field pl-11"
                            />
                        </div>
                    </motion.div>
                )}

                {/* Documents List */}
                {filteredDocs.length === 0 ? (
                    <motion.div variants={item} className="card-flat flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-accent/15 rounded-2xl flex items-center justify-center mb-4">
                            <Sparkles className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">
                            {searchQuery ? 'No matching documents' : 'No documents yet'}
                        </h3>
                        <p className="text-sm text-text-secondary max-w-sm">
                            {searchQuery
                                ? 'Try a different search term.'
                                : 'Documents will appear here when your design team shares them.'}
                        </p>
                    </motion.div>
                ) : (
                    <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                        {filteredDocs.map((doc) => (
                            <motion.div key={doc.id} variants={item}>
                                <a
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="card-flat group flex items-center gap-4 hover:shadow-elevated transition-all duration-300"
                                >
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 text-primary">
                                        {getIcon(doc.file_type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                                            {doc.name}
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-0.5">
                                            {doc.project_title} · {doc.file_type || 'Document'}
                                            {doc.file_size && ` · ${doc.file_size}`}
                                        </p>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs text-text-secondary">
                                            {formatDate(doc.uploaded_at, { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>

                                    <Download className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors flex-shrink-0" />
                                </a>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </motion.div>
        </div>
    )
}

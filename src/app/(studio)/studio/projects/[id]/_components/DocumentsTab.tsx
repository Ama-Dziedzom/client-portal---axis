'use client'

import { Plus, FileText, Globe, Trash2 } from 'lucide-react'
import { Document } from '@/types/database'
import { getFileIcon, formatFileSize, formatDate } from '@/lib/utils'

interface DocumentsTabProps {
    documents: Document[]
    onAdd: () => void
    onDelete: (id: string) => void
}

export function DocumentsTab({ documents, onAdd, onDelete }: DocumentsTabProps) {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-border">
                <div>
                    <h3 className="font-heading text-lg font-semibold">Project Shared Files</h3>
                    <p className="text-text-secondary text-sm">Upload drawings, contracts, and proposals</p>
                </div>
                <button className="btn-primary" onClick={onAdd}>
                    <Plus className="w-4 h-4" /> Add Document
                </button>
            </div>

            {(!documents || documents.length === 0) ? (
                <div className="card-flat flex flex-col items-center justify-center py-20 text-center border-dashed border-2">
                    <FileText className="w-12 h-12 text-accent/40 mb-4" />
                    <p className="text-text-secondary max-w-xs mx-auto">
                        No documents shared with client yet.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {documents.map((doc) => (
                        <div key={doc.id} className="card-flat group flex items-center gap-4 hover:border-primary/30 transition-all">
                            <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                                {getFileIcon(doc.file_type || '')}
                            </div>
                            <div className="flex-1 min-w-0 pr-4">
                                <h4 className="text-sm font-semibold text-text-primary truncate">{doc.name}</h4>
                                <p className="text-xs text-text-secondary mt-1">
                                    {formatFileSize(doc.size || 0)} · Uploaded {formatDate(doc.uploaded_at)}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a 
                                    href={doc.file_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-accent/10 rounded-lg text-text-secondary transition-colors" 
                                    title="Download"
                                >
                                    <Globe className="w-4 h-4" />
                                </a>
                                <button 
                                    onClick={() => onDelete(doc.id)}
                                    className="p-2 hover:bg-red-50 rounded-lg text-error transition-colors" 
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

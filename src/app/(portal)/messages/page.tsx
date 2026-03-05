'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Message, Project } from '@/types/database'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { MessageCircle, Send, Sparkles, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MessagesPage() {
    const { client } = useAuth()
    const [projects, setProjects] = useState<(Project & { messages: Message[]; unread_count: number })[]>([])
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)

    useEffect(() => {
        if (client) fetchProjects()
    }, [client])

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*, messages(*)')
                .eq('client_id', client!.id)
                .order('updated_at', { ascending: false })

            if (error) throw error

            const withUnread = (data || []).map((p: any) => ({
                ...p,
                messages: (p.messages || []).sort(
                    (a: Message, b: Message) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                ),
                unread_count: (p.messages || []).filter((m: Message) => !m.read && m.sender_type === 'studio').length,
            }))

            setProjects(withUnread)

            // Auto-select first project with messages or just first project
            if (withUnread.length > 0 && !selectedProjectId) {
                const withMessages = withUnread.find((p: any) => p.messages.length > 0)
                setSelectedProjectId(withMessages?.id || withUnread[0].id)
            }
        } catch (error) {
            console.error('Error fetching projects with messages:', error)
        } finally {
            setLoading(false)
        }
    }

    const selectedProject = projects.find((p) => p.id === selectedProjectId)
    const messages = selectedProject?.messages || []

    const sendMessage = async () => {
        if (!newMessage.trim() || !client || !selectedProjectId) return

        setSending(true)
        try {
            const { error } = await supabase.from('messages').insert({
                project_id: selectedProjectId,
                sender_type: 'client',
                sender_name: client.name,
                body: newMessage.trim(),
            })

            if (error) throw error
            setNewMessage('')
            toast.success('Message sent')
            fetchProjects()
        } catch (error: any) {
            toast.error(error.message || 'Failed to send message')
        } finally {
            setSending(false)
        }
    }

    if (loading) {
        return (
            <div className="page-container">
                <div className="skeleton h-10 w-48 mb-8" />
                <div className="skeleton h-[600px] rounded-2xl" />
            </div>
        )
    }

    return (
        <div className="page-container">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-text-primary mb-2">
                        Messages
                    </h1>
                    <p className="text-text-secondary font-body text-lg">
                        Chat with your design team
                    </p>
                </div>

                {projects.length === 0 ? (
                    <div className="card-flat flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-accent/15 rounded-2xl flex items-center justify-center mb-4">
                            <Sparkles className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">
                            No conversations yet
                        </h3>
                        <p className="text-sm text-text-secondary max-w-sm">
                            Messages will appear here once you have active projects.
                        </p>
                    </div>
                ) : (
                    <div className="card-flat p-0 overflow-hidden flex flex-col lg:flex-row h-[650px]">
                        {/* Project list sidebar */}
                        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border overflow-y-auto flex-shrink-0">
                            <div className="p-4 border-b border-border">
                                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                    Projects
                                </p>
                            </div>
                            {projects.map((project) => {
                                const lastMsg = project.messages[project.messages.length - 1]
                                const isSelected = project.id === selectedProjectId

                                return (
                                    <button
                                        key={project.id}
                                        onClick={() => setSelectedProjectId(project.id)}
                                        className={`w-full text-left p-4 border-b border-border/50 transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-accent/5'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h4 className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-text-primary'
                                                    }`}>
                                                    {project.title}
                                                </h4>
                                                {lastMsg && (
                                                    <p className="text-xs text-text-secondary truncate mt-1">
                                                        {lastMsg.sender_type === 'client' ? 'You: ' : ''}{lastMsg.body}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                {lastMsg && (
                                                    <span className="text-[10px] text-text-secondary">
                                                        {formatRelativeTime(lastMsg.created_at)}
                                                    </span>
                                                )}
                                                {project.unread_count > 0 && (
                                                    <span className="w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                        {project.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Chat area */}
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Chat header */}
                            {selectedProject && (
                                <div className="p-4 border-b border-border flex-shrink-0">
                                    <h3 className="font-heading text-lg font-semibold text-text-primary">
                                        {selectedProject.title}
                                    </h3>
                                    <p className="text-xs text-text-secondary">{selectedProject.location || 'Direct message'}</p>
                                </div>
                            )}

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <MessageCircle className="w-10 h-10 text-accent/40 mb-3" />
                                        <p className="text-sm text-text-secondary">
                                            No messages yet. Start the conversation.
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {msg.sender_type === 'studio' && (
                                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                                                    <span className="text-white text-xs font-bold">A</span>
                                                </div>
                                            )}
                                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.sender_type === 'client'
                                                ? 'bg-primary text-white rounded-br-md'
                                                : 'bg-accent/15 text-text-primary rounded-bl-md'
                                                }`}>
                                                <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender_name}</p>
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                                                <p className={`text-[10px] mt-2 ${msg.sender_type === 'client' ? 'text-white/50' : 'text-text-secondary'
                                                    }`}>
                                                    {formatRelativeTime(msg.created_at)}
                                                </p>
                                            </div>
                                            {msg.sender_type === 'client' && (
                                                <div className="w-8 h-8 bg-accent/30 border border-accent rounded-lg flex items-center justify-center flex-shrink-0 ml-3 mt-1">
                                                    <span className="text-xs font-bold text-primary">
                                                        {client ? getInitials(client.name) : '?'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Input */}
                            <div className="border-t border-border p-4 flex-shrink-0">
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
                                        disabled={!newMessage.trim() || sending}
                                        className="btn-primary px-4 py-3 flex-shrink-0"
                                    >
                                        {sending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

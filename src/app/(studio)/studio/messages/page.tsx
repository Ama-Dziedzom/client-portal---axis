'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { studioSupabase as supabase } from '@/lib/supabase'
import { Project, Message, Client } from '@/types/database'
import { useStudio } from '@/contexts/StudioContext'
import { 
    Search, 
    Send, 
    MessageSquare, 
    User, 
    Loader2, 
    Plus,
    Clock,
    CheckCheck,
    FolderKanban,
    ChevronRight,
    Search as SearchIcon,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatRelativeTime, cn, getInitials } from '@/lib/utils'

interface ChatProject extends Project {
    client_name: string
    messages: Message[]
    unread_count: number
}

export default function StudioMessagesPage() {
    const { studioUser } = useStudio()
    const [projects, setProjects] = useState<ChatProject[]>([])
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const selectedProject = projects.find(p => p.id === selectedProjectId)

    useEffect(() => {
        fetchProjectsWithMessages()
    }, [])

    useEffect(() => {
        if (selectedProjectId) {
            markMessagesAsRead(selectedProjectId)
        }
        scrollToBottom()
    }, [selectedProjectId, projects])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const fetchProjectsWithMessages = async () => {
        try {
            setLoading(true)

            // 1. Fetch Projects
            const { data: projectsData, error: projectsError } = await supabase
                .from('projects')
                .select('*')
                .order('updated_at', { ascending: false })

            if (projectsError) throw projectsError

            if (!projectsData || projectsData.length === 0) {
                setProjects([])
                return
            }

            // 2. Fetch all messages for these projects
            const projectIds = projectsData.map(p => p.id)
            const { data: messagesData, error: messagesError } = await supabase
                .from('messages')
                .select('*')
                .in('project_id', projectIds)
                .order('created_at', { ascending: true })

            if (messagesError) throw messagesError

            // 3. Fetch client names
            const { data: clientsData } = await supabase.from('clients').select('id, name')
            const clientMap = Object.fromEntries(clientsData?.map(c => [c.id, c.name]) || [])

            // 4. Format data
            const formatted: ChatProject[] = projectsData.map((p: Project) => {
                const projectMessages = (messagesData || []).filter(m => m.project_id === p.id)
                return {
                    ...p,
                    client_name: clientMap[p.client_id] || 'Unknown Client',
                    messages: projectMessages,
                    unread_count: projectMessages.filter((m: Message) => !m.read && m.sender_type === 'client').length
                }
            })

            // 5. Final sort by most recent message
            const sorted = [...formatted].sort((a, b) => {
                const lastA = a.messages[a.messages.length - 1]?.created_at || a.updated_at
                const lastB = b.messages[b.messages.length - 1]?.created_at || b.updated_at
                return new Date(lastB).getTime() - new Date(lastA).getTime()
            })

            setProjects(sorted)
            
            if (sorted.length > 0 && !selectedProjectId) {
                setSelectedProjectId(sorted[0].id)
            }
        } catch (error) {
            console.error('Error fetching chat data:', error)
            toast.error('Failed to load conversations')
        } finally {
            setLoading(false)
        }
    }

    const markMessagesAsRead = async (projectId: string) => {
        try {
            const unreadIds = projects
                .find(p => p.id === projectId)
                ?.messages.filter(m => !m.read && m.sender_type === 'client')
                .map(m => m.id) || []

            if (unreadIds.length === 0) return

            const { error } = await supabase
                .from('messages')
                .update({ read: true })
                .in('id', unreadIds)

            if (error) throw error

            // Update local state
            setProjects(prev => prev.map(p => {
                if (p.id === projectId) {
                    return {
                        ...p,
                        unread_count: 0,
                        messages: p.messages.map(m => 
                            unreadIds.includes(m.id) ? { ...m, read: true } : m
                        )
                    }
                }
                return p
            }))
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedProjectId || !studioUser) return

        setSending(true)
        const optimisticId = Math.random().toString()
        const messageBody = newMessage // Store for retry if needed

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    project_id: selectedProjectId,
                    sender_id: studioUser.id,
                    sender_name: studioUser.name,
                    sender_type: 'studio',
                    body: messageBody,
                    read: false
                })
                .select()
                .single()

            if (error) throw error

            // Update local projects state with new message
            setProjects(prev => prev.map(p => {
                if (p.id === selectedProjectId) {
                    return {
                        ...p,
                        messages: [...p.messages, data]
                    }
                }
                return p
            }))
            
            setNewMessage('')
            toast.success('Message sent')
        } catch (error) {
            console.error('Send error:', error)
            toast.error('Failed to send message')
        } finally {
            setSending(false)
        }
    }

    const filteredProjects = projects.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.client_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin opacity-40" />
            </div>
        )
    }

    return (
        <div className="h-[calc(100vh-140px)] min-h-[600px] flex flex-col md:flex-row gap-6">
            {/* Sidebar / Conversation List */}
            <div className="w-full md:w-[350px] flex flex-col bg-white rounded-2xl border border-border overflow-hidden">
                <div className="p-5 border-b border-border">
                    <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">Messages</h2>
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-accent/5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-border">
                    {filteredProjects.length === 0 ? (
                        <div className="p-10 text-center opacity-40">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">No conversations found</p>
                        </div>
                    ) : (
                        filteredProjects.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedProjectId(p.id)}
                                className={cn(
                                    "w-full flex items-start gap-3 p-4 text-left transition-all hover:bg-accent/5",
                                    selectedProjectId === p.id ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                                )}
                            >
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                                    {getInitials(p.client_name)}
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                        <h4 className="text-sm font-semibold text-text-primary truncate">{p.client_name}</h4>
                                        {p.messages.length > 0 && (
                                            <span className="text-[10px] text-text-secondary whitespace-nowrap">
                                                {formatRelativeTime(p.messages[p.messages.length-1].created_at)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest truncate mb-1">
                                        {p.title}
                                    </p>
                                    <p className="text-xs text-text-secondary truncate italic">
                                        {p.messages.length > 0 ? p.messages[p.messages.length-1].body : 'Start a conversation...'}
                                    </p>
                                </div>
                                {p.unread_count > 0 && (
                                    <div className="w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {p.unread_count}
                                    </div>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-border overflow-hidden">
                {selectedProject ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-border bg-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {getInitials(selectedProject.client_name)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-heading font-semibold text-text-primary">{selectedProject.client_name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-xs text-text-secondary font-medium uppercase tracking-tight">Active Project Hub</span>
                                    </div>
                                </div>
                            </div>
                            <Link href={`/studio/projects/${selectedProject.id}`} className="btn-ghost p-2 rounded-full" title="View Project">
                                <Plus className="w-5 h-5" />
                            </Link>
                        </div>

                        {/* Messages Hub */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-accent/5">
                            {selectedProject.messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-40">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                        <MessageSquare className="w-7 h-7" />
                                    </div>
                                    <p className="text-sm text-text-secondary font-body">No internal messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                selectedProject.messages.map((msg, idx) => {
                                    const isStudio = msg.sender_type === 'studio'
                                    const showDate = idx === 0 || 
                                        new Date(msg.created_at).toDateString() !== 
                                        new Date(selectedProject.messages[idx-1].created_at).toDateString()

                                    return (
                                        <div key={msg.id} className="space-y-4">
                                            {showDate && (
                                                <div className="flex justify-center my-6">
                                                    <span className="px-3 py-1 bg-white border border-border rounded-full text-[10px] font-bold text-text-secondary uppercase">
                                                        {formatDate(msg.created_at, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <div className={cn(
                                                "flex flex-col max-w-[80%] gap-1",
                                                isStudio ? "ml-auto items-end" : "mr-auto items-start"
                                            )}>
                                                <div className={cn(
                                                    "px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm font-body",
                                                    isStudio 
                                                       ? "bg-primary text-white rounded-tr-none" 
                                                       : "bg-white text-text-primary rounded-tl-none border border-border"
                                                )}>
                                                    {msg.body}
                                                </div>
                                                <div className="flex items-center gap-2 px-1">
                                                    <span className="text-[10px] text-text-secondary font-medium">
                                                        {formatDate(msg.created_at, { hour: 'numeric', minute: '2-digit' })}
                                                    </span>
                                                    {isStudio && (
                                                        <CheckCheck className={cn("w-3 h-3", msg.read ? "text-blue-500" : "text-text-secondary opacity-50")} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleSendMessage} className="p-6 border-t border-border bg-white flex items-end gap-3">
                            <textarea
                                rows={1}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Write your message here..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSendMessage(e)
                                    }
                                }}
                                className="flex-1 bg-accent/5 border border-border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none max-h-40"
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                        <MessageSquare className="w-12 h-12 mb-4" />
                        <h3 className="text-xl font-heading font-semibold">Select a conversation</h3>
                        <p className="text-sm">Connect with your clients across projects</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
    return new Date(date).toLocaleDateString('en-US', options || {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    })
}

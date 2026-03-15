'use client'

import { Plus, Clock, Edit2, Trash2 } from 'lucide-react'
import { TimelineStage } from '@/types/database'

interface TimelineTabProps {
    stages: TimelineStage[]
    onAddStage: () => void
    onEditStage: (stage: TimelineStage) => void
    onDeleteStage: (id: string) => void
}

export function TimelineTab({ stages, onAddStage, onEditStage, onDeleteStage }: TimelineTabProps) {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-border">
                <div>
                    <h3 className="font-heading text-lg font-semibold">Project Roadmap</h3>
                    <p className="text-text-secondary text-sm">Define and track key project milestones</p>
                </div>
                <button className="btn-primary" onClick={onAddStage}>
                    <Plus className="w-4 h-4" /> Add Stage
                </button>
            </div>

            <div className="space-y-4 pl-4 border-l-2 border-border ml-1.5">
                {(!stages || stages.length === 0) ? (
                    <div className="card-flat text-center py-12">
                        <Clock className="w-8 h-8 text-accent mx-auto mb-3" />
                        <p className="text-text-secondary">No stages defined yet.</p>
                    </div>
                ) : (
                    stages
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((stage) => (
                            <div key={stage.id} className="relative group">
                                <div className={`
                                    absolute -left-[25px] top-4 w-4 h-4 rounded-full border-4 border-white shadow-sm ring-2 ring-transparent
                                    ${stage.status === 'complete' ? "bg-emerald-500 ring-emerald-100" :
                                    stage.status === 'active' ? "bg-amber-500 ring-amber-100 animate-pulse" : "bg-gray-300 ring-gray-100"}
                                `} />
                                
                                <div className="card-flat py-5 px-6 group flex items-start justify-between hover:border-primary/30 transition-colors">
                                    <div className="flex-1 min-w-0 pr-10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-heading font-semibold text-text-primary truncate">
                                                {stage.stage_name}
                                            </h4>
                                            <span className={`
                                                px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest
                                                ${stage.status === 'complete' ? "bg-emerald-50 text-emerald-700" : 
                                                stage.status === 'active' ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-500"}
                                            `}>
                                                {stage.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-secondary line-clamp-2 italic leading-relaxed">
                                            {stage.notes || 'No specific notes for this stage.'}
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => onEditStage(stage)}
                                            className="p-2 hover:bg-accent/10 rounded-lg text-text-secondary transition-colors" 
                                            title="Edit Stage"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => onDeleteStage(stage.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg text-error transition-colors" 
                                            title="Delete Stage"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                )}
            </div>
        </div>
    )
}

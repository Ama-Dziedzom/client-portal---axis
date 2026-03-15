'use client'

import { Upload, Image as ImageIcon, Edit2, Trash2 } from 'lucide-react'
import { GalleryImage } from '@/types/database'

interface GalleryTabProps {
    images: GalleryImage[]
    onUpload: () => void
    onEdit: (image: GalleryImage) => void
    onDelete: (id: string) => void
}

export function GalleryTab({ images, onUpload, onEdit, onDelete }: GalleryTabProps) {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-border">
                <div>
                    <h3 className="font-heading text-lg font-semibold">Visual Gallery</h3>
                    <p className="text-text-secondary text-sm">Upload and showcase project photos</p>
                </div>
                <button className="btn-primary" onClick={onUpload}>
                    <Upload className="w-4 h-4" /> Upload Photo
                </button>
            </div>

            {(!images || images.length === 0) ? (
                <div className="card-flat flex flex-col items-center justify-center py-20 text-center border-dashed border-2">
                    <ImageIcon className="w-12 h-12 text-accent/40 mb-4" />
                    <p className="text-text-secondary max-w-xs mx-auto">
                        No photos added to this project's gallery yet.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img) => (
                        <div key={img.id} className="group relative aspect-square bg-accent/10 rounded-2xl overflow-hidden border border-border">
                            <img 
                                src={img.image_url} 
                                alt={img.caption || ''} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button 
                                    onClick={() => onEdit(img)}
                                    className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => onDelete(img.id)}
                                    className="p-3 bg-red-500/20 backdrop-blur-md rounded-full text-white hover:bg-red-500/40 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            {img.caption && (
                                <div className="absolute bottom-3 left-3 right-3">
                                    <p className="text-[10px] text-white font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded w-fit truncate">
                                        {img.caption}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// Database types mirroring the Supabase schema

export interface Client {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    active: boolean;
    created_at: string;
}

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'complete';

export interface Project {
    id: string;
    client_id: string;
    title: string;
    location: string | null;
    description: string | null;
    status: ProjectStatus;
    start_date: string | null;
    estimated_completion: string | null;
    cover_image_url: string | null;
    gallery_urls: string[];
    created_at: string;
    updated_at: string;
}

export type TimelineStatus = 'upcoming' | 'active' | 'complete';

export interface TimelineStage {
    id: string;
    project_id: string;
    stage_name: string;
    status: TimelineStatus;
    display_order: number;
    completed_at: string | null;
    notes: string | null;
}

export interface Document {
    id: string;
    project_id: string;
    name: string;
    file_url: string;
    file_type: string | null;
    file_size: string | null;
    uploaded_at: string;
}

export type SenderType = 'studio' | 'client';

export interface Message {
    id: string;
    project_id: string;
    sender_type: SenderType;
    sender_name: string;
    body: string;
    read: boolean;
    created_at: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface LineItem {
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
}

export interface Invoice {
    id: string;
    project_id: string;
    client_id: string;
    invoice_number: string;
    title: string;
    line_items: LineItem[];
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
    currency: string;
    status: InvoiceStatus;
    due_date: string | null;
    paid_at: string | null;
    paystack_reference: string | null;
    notes: string | null;
    created_at: string;
}

// Extended types with relations
export interface ProjectWithDetails extends Project {
    timeline_stages?: TimelineStage[];
    documents?: Document[];
    messages?: Message[];
    invoices?: Invoice[];
}

export interface ImageRow {
    id: string;
    originalFilename: string;
    docType?: string;
    status?: 'new' | 'processing' | 'ready' | 'error' | 'reviewed';
    uploadedAt: string; // ISO
    hasErrors?: boolean;
    totalAmount?: number;
    previewUrl?: string;
}

export interface OcrResult { [k: string]: any; }

export interface NormalizedLine {
    description?: string;
    quantity?: number;
    unitPrice?: number;
    amount?: number;
}

export interface NormalizedDoc {
    vendor?: string;
    invoiceNumber?: string;
    invoiceDate?: string; // ISO
    total?: number;
    currency?: string;
    customer?: string;
    lines?: NormalizedLine[];
    // Some heuristic extractors may use `items` instead of `lines`.
    // Keep this optional alias to support existing data without migration.
    items?: NormalizedLine[];
    meta?: Record<string, any>;
}

export interface AuditEntry {
    at: string;
    actor: string;
    action: string;
    diff?: any;
}

export interface ImageBundle {
    image: ImageRow;
    normalized: NormalizedDoc | null;
    ocr: OcrResult | null;
    audit: AuditEntry[];
    export?: { lastJobId?: string; lastStatus?: string };
}

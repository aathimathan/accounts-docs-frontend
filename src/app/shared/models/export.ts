export type ExportStatus = 'new' | 'queued' | 'sent' | 'failed';

export interface ExportJob {
    id: string;
    imageId: string;
    target: 'qb' | 'xero' | 'netsuite';
    status: ExportStatus;
    error?: string | null;
    createdAt: string;
    updatedAt: string;
}

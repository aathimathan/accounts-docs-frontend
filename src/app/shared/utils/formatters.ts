import { NormalizedDoc } from "../models/image";

/** Supports multiple OCR payload shapes; extend mappings as tags change */
export function formatInvoiceData(data: any): NormalizedDoc {
    if (!data) return { lines: [] };

    // 1) If server already returns normalized
    if (data.normalized) return { lines: [], ...data.normalized };

    // 2) Azure FR legacy { OCR: { analyzeResult: { documents[0].fields } } }
    const doc = data?.OCR?.analyzeResult?.documents?.[0]?.fields;
    if (doc) {
        const items = (doc.Items?.valueArray ?? []).map((it: any) => {
            const o = it.valueObject ?? {};
            return {
                description: o.Description?.valueString ?? '',
                quantity: o.Quantity?.valueNumber ?? null,
                unitPrice: o.UnitPrice?.valueCurrency?.amount ?? null,
                amount: o.Amount?.valueCurrency?.amount ?? null
            };
        });
        return {
            vendor: doc.VendorName?.valueString ?? '',
            invoiceNumber: doc.InvoiceId?.valueString ?? '',
            invoiceDate: doc.InvoiceDate?.valueDate ?? '',
            total: doc.InvoiceTotal?.valueCurrency?.amount ?? null,
            currency: doc.InvoiceTotal?.valueCurrency?.currencyCode ?? '',
            lines: items
        };
    }

    // 3) Generic fallback (common keys)
    const g = data;
    const lines = Array.isArray(g.items) ? g.items.map((x: any) => ({
        description: x.description ?? x.desc ?? '',
        quantity: x.qty ?? x.quantity ?? null,
        unitPrice: x.unitPrice ?? x.price ?? null,
        amount: x.amount ?? x.lineTotal ?? null
    })) : [];
    return {
        vendor: g.vendor || g.supplier || '',
        invoiceNumber: g.invoiceNumber || g.invoice_no || '',
        invoiceDate: g.invoiceDate || g.date || '',
        total: g.total || g.totalAmount || null,
        currency: g.currency || '',
        lines
    };
}

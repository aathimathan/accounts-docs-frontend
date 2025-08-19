import { Injectable, signal } from '@angular/core';

// Simple FX service with hard-coded defaults that users can override at runtime.
// Rates are stored as: USD per 1 unit of the currency (toUSD).
// Convert to any selected base B by: amount_in_B = (amount * toUSD[from]) / toUSD[B].

export type FxRatesUSD = Record<string, number>; // e.g., { USD: 1, MYR: 0.22 }

@Injectable({ providedIn: 'root' })
export class FxService {
    // Reasonable starter defaults; users can override in the settings modal.
    private readonly defaultRates: FxRatesUSD = {
        USD: 1,
        MYR: 0.22, // 1 MYR ≈ 0.22 USD (placeholder)
        SGD: 0.74, // 1 SGD ≈ 0.74 USD
        EUR: 1.08, // 1 EUR ≈ 1.08 USD
        GBP: 1.27, // 1 GBP ≈ 1.27 USD
        CNY: 0.14, // 1 CNY ≈ 0.14 USD
    };

    // State
    baseCurrency = signal<string>('USD');
    ratesUSD = signal<FxRatesUSD>({ ...this.defaultRates });

    setBase(code: string) {
        if (!code) return;
        this.baseCurrency.set(code.toUpperCase());
    }

    setRatesUSD(next: FxRatesUSD) {
        // Merge, but keep only finite numbers
        const cur = { ...this.ratesUSD() };
        for (const [k, v] of Object.entries(next)) {
            const up = k.toUpperCase();
            const num = Number(v);
            if (Number.isFinite(num) && num > 0) cur[up] = num;
        }
        // Ensure base exists
        const base = this.baseCurrency();
        if (!cur[base]) cur[base] = cur[base] ?? 1;
        this.ratesUSD.set(cur);
    }

    setRateUSD(code: string, value: number) {
        const up = (code || '').toUpperCase();
        const num = Number(value);
        if (!up || !Number.isFinite(num) || num <= 0) return;
        const cur = { ...this.ratesUSD() };
        cur[up] = num;
        this.ratesUSD.set(cur);
    }

    // Convert amount FROM a currency code TO the current base currency using USD as pivot.
    convert(amount: number, fromCode?: string | null): number {
        const amt = Number(amount) || 0;
        if (!amt) return 0;
        const rates = this.ratesUSD();
        const from = (fromCode || this.baseCurrency()).toUpperCase();
        const base = this.baseCurrency().toUpperCase();
        const toUsdFrom = rates[from];
        const toUsdBase = rates[base] ?? 1;
        if (!toUsdFrom || !toUsdBase) return amt; // fallback: no conversion
        const inUsd = amt * toUsdFrom;
        const inBase = inUsd / toUsdBase;
        return inBase;
    }

    // Utility to list known currencies; optionally include dynamic ones found in data
    knownCurrencies(extra?: Iterable<string>): string[] {
        const set = new Set<string>(Object.keys(this.ratesUSD()).map((c) => c.toUpperCase()));
        if (extra) for (const c of extra) if (c) set.add(String(c).toUpperCase());
        return Array.from(set).sort();
    }
}

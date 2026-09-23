// src/mappers.ts

import {
	Chiqim,
	ChiqimKategoriya,
	Currency,
	Hodim,
	Kirim,
	KirimXizmatTuri,
	MaoshYozuvi,
	Mijoz,
	StatusHodim,
	StatusMaosh,
	StatusMijoz,
	StatusTranzaksiya,
} from './types.js';

// ============================================================
// YORDAMCHI XAVFSIZLIK FUNKSIYALARI (HELPERS)
// ============================================================

/** Matnni xavfsiz songa o'tkazadi. Agar bo'sh yoki noto'g'ri bo'lsa, 0 qaytaradi */
function parseNumber(val: unknown): number {
	if (typeof val === 'number') return isNaN(val) ? 0 : val;
	if (!val) return 0;
	const cleaned = String(val).replace(/\s+/g, '').replace(/,/g, '.');
	const num = parseFloat(cleaned);
	return isNaN(num) ? 0 : num;
}

/** Matnni tozalaydi */
function parseString(val: unknown): string {
	return val ? String(val).trim() : '';
}

/** Sanadan YYYY-MM formatidagi oyni xavfsiz ajratadi */
function parseDavr(val: unknown, sanaVal?: unknown): string {
	const dStr = parseString(val);
	if (/^\d{4}-\d{2}$/.test(dStr)) return dStr;
	const fallback = parseString(sanaVal);
	if (/^\d{4}-\d{2}/.test(fallback)) return fallback.slice(0, 7);
	return new Date().toISOString().slice(0, 7);
}

// ============================================================
// MAPPERS (MASSIV -> TS OBYEKT)
// ============================================================

export function mapRowToMijoz(row: string[]): Mijoz {
	return {
		id: parseString(row[0]),
		kompaniya: parseString(row[1]),
		kontakt: parseString(row[2]),
		telefon: parseString(row[3]),
		inn: parseString(row[4]),
		tarifSummasi: parseNumber(row[5]),
		tolovKuni: parseNumber(row[6]) || 5,
		status: (parseString(row[7]) || 'Faol') as StatusMijoz,
		izoh: parseString(row[8]),
		sana: parseString(row[9]) || new Date().toISOString().slice(0, 10),
	};
}

export function mapRowToHodim(row: string[]): Hodim {
	return {
		id: parseString(row[0]),
		ism: parseString(row[1]),
		lavozim: parseString(row[2]),
		bolim: parseString(row[3]),
		oylikMaosh: parseNumber(row[4]),
		telefon: parseString(row[5]),
		holat: (parseString(row[6]) || 'Faol') as StatusHodim,
		sana: parseString(row[7]),
		izoh: parseString(row[8]),
	};
}

export function mapRowToKirim(row: string[]): Kirim {
	const sana = parseString(row[6]) || new Date().toISOString().slice(0, 10);
	return {
		id: parseString(row[0]),
		mijozId: parseString(row[1]),
		kompaniya: parseString(row[2]),
		davr: parseDavr(row[3], sana),
		summa: parseNumber(row[4]),
		valyuta: (parseString(row[5]) || 'UZS') as Currency,
		sana,
		tur: (parseString(row[7]) || 'Buxgalteriya hisobi') as KirimXizmatTuri,
		holat: (parseString(row[8]) || 'Kutilmoqda') as StatusTranzaksiya,
		invoice: parseString(row[9]),
		izoh: parseString(row[10]),
	};
}

export function mapRowToChiqim(row: string[]): Chiqim {
	return {
		id: parseString(row[0]),
		kategoriya: (parseString(row[1]) || 'Boshqa') as ChiqimKategoriya,
		tavsif: parseString(row[2]),
		summa: parseNumber(row[3]),
		valyuta: (parseString(row[4]) || 'UZS') as Currency,
		sana: parseString(row[5]),
		masulIsm: parseString(row[6]),
		holat: (parseString(row[7]) || 'Tolangan') as StatusTranzaksiya,
		izoh: parseString(row[8]),
	};
}

export function mapRowToMaosh(row: string[]): MaoshYozuvi {
	const belgilangan = parseNumber(row[4]);
	const berilgan = parseNumber(row[5]);
	const qoldiq = Math.max(0, belgilangan - berilgan);

	return {
		id: parseString(row[0]),
		hodimId: parseString(row[1]),
		ism: parseString(row[2]),
		davr: parseString(row[3]),
		belgilangan,
		berilgan,
		qoldiq,
		holat: (qoldiq > 0 ? 'Qarzli' : 'Tolangan') as StatusMaosh,
		izoh: parseString(row[8]),
	};
}

// ============================================================
// MAPPERS (TS OBYEKT -> GOOGLE SHEETS QATORI)
// ============================================================

export function mapMijozToRow(m: Mijoz): any[] {
	return [
		m.id,
		m.kompaniya,
		m.kontakt || '',
		m.telefon || '',
		m.inn || '',
		Number(m.tarifSummasi) || 0,
		Number(m.tolovKuni) || 5,
		m.status,
		m.izoh || '',
		m.sana || '',
	];
}

export function mapHodimToRow(h: Hodim): any[] {
	return [
		h.id,
		h.ism,
		h.lavozim,
		h.bolim || '',
		Number(h.oylikMaosh) || 0,
		h.telefon || '',
		h.holat,
		h.sana || '',
		h.izoh || '',
	];
}

export function mapKirimToRow(k: Kirim): any[] {
	return [
		k.id,
		k.mijozId,
		k.kompaniya,
		k.davr || parseDavr(k.davr, k.sana),
		Number(k.summa) || 0,
		k.valyuta || 'UZS',
		k.sana,
		k.tur,
		k.holat,
		k.invoice || '',
		k.izoh || '',
	];
}

export function mapChiqimToRow(x: Chiqim): any[] {
	return [
		x.id,
		x.kategoriya,
		x.tavsif || '',
		Number(x.summa) || 0,
		x.valyuta || 'UZS',
		x.sana,
		x.masulIsm || '',
		x.holat,
		x.izoh || '',
	];
}

export function mapMaoshToRow(m: MaoshYozuvi): any[] {
	return [
		m.id,
		m.hodimId,
		m.ism,
		m.davr,
		Number(m.belgilangan) || 0,
		Number(m.berilgan) || 0,
		Number(m.qoldiq) || 0,
		m.holat,
		m.izoh || '',
	];
}

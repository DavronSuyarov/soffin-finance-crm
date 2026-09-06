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
		status: (parseString(row[5]) || 'Faol') as StatusMijoz,
		izoh: parseString(row[6]),
		sana: parseString(row[7]),
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
	};
}

export function mapRowToKirim(row: string[]): Kirim {
	return {
		id: parseString(row[0]),
		mijozId: parseString(row[1]),
		kompaniya: parseString(row[2]),
		summa: parseNumber(row[3]),
		valyuta: (parseString(row[4]) || 'UZS') as Currency,
		sana: parseString(row[5]),
		tur: (parseString(row[6]) || 'Boshqa') as KirimXizmatTuri,
		holat: (parseString(row[7]) || 'Kutilmoqda') as StatusTranzaksiya,
		invoice: parseString(row[8]),
		izoh: parseString(row[9]),
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
		holat: (parseString(row[7]) || 'Kutilmoqda') as StatusTranzaksiya,
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
// Ob'ektlarni Google Sheets qatoriga (massiv) o'girish
export function mapMijozToRow(m: Mijoz): any[] {
	return [
		m.id,
		m.kompaniya,
		m.kontakt,
		m.telefon,
		m.inn,
		m.status,
		m.izoh || '',
		m.sana,
	];
}

export function mapHodimToRow(h: Hodim): any[] {
	return [
		h.id,
		h.ism,
		h.lavozim,
		h.bolim,
		h.oylikMaosh,
		h.telefon,
		h.holat,
		h.sana,
		h.izoh || '',
	];
}

export function mapKirimToRow(k: Kirim): any[] {
	return [
		k.id,
		k.mijozId,
		k.kompaniya,
		k.summa,
		k.valyuta,
		k.sana,
		k.tur,
		k.holat,
		k.invoice,
		k.izoh || '',
	];
}

export function mapChiqimToRow(x: Chiqim): any[] {
	return [
		x.id,
		x.kategoriya,
		x.tavsif,
		x.summa,
		x.valyuta,
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
		m.belgilangan,
		m.berilgan,
		m.qoldiq,
		m.holat,
		m.izoh || '',
	];
}

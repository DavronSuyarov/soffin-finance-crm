// src/types.ts

// ============================================================
// 1. ASOSIY TIPLLAR
// ============================================================
export type Currency = 'UZS' | 'USD' | 'EUR';

export type StatusMijoz = 'Faol' | 'Kutilmoqda' | 'Nofaol';
export type StatusHodim = 'Faol' | "Ta'tilda" | 'Nofaol';
export type StatusTranzaksiya = 'Tolangan' | 'Kutilmoqda' | 'Bekor';
export type StatusMaosh = 'Tolangan' | 'Qarzli';

export type ChiqimKategoriya =
	| 'Ijara'
	| 'Ofis xarajat'
	| 'Kommunal'
	| 'Transport'
	| 'Marketing'
	| "Dasturiy ta'minot"
	| 'Boshqa';

export type KirimXizmatTuri =
	| 'Buxgalteriya hisobi'
	| 'Audit'
	| 'Konsultatsiya'
	| 'Qayta tiklash'
	| 'Boshqa';

// ============================================================
// 2. ASOSIY MODELLAR (ENTITIES)
// ============================================================
export interface Mijoz {
	id: string;
	kompaniya: string;
	kontakt: string;
	telefon: string;
	inn: string;
	status: StatusMijoz;
	izoh?: string;
	sana: string;
}

export interface Hodim {
	id: string;
	ism: string;
	lavozim: string;
	bolim: string;
	oylikMaosh: number;
	telefon: string;
	holat: StatusHodim;
	sana: string;
	izoh?: string; // <-- Izoh maydoni
}

export interface Kirim {
	id: string;
	mijozId: string;
	kompaniya: string;
	summa: number;
	valyuta: Currency;
	sana: string;
	tur: KirimXizmatTuri;
	holat: StatusTranzaksiya;
	invoice: string;
	izoh?: string;
}

export interface Chiqim {
	id: string;
	kategoriya: ChiqimKategoriya;
	tavsif: string;
	summa: number;
	valyuta: Currency;
	sana: string;
	masulHodimId?: string;
	masulIsm?: string;
	holat: StatusTranzaksiya;
	izoh?: string;
}

export interface MaoshYozuvi {
	id: string;
	hodimId: string;
	ism: string;
	davr: string; // "YYYY-MM"
	belgilangan: number;
	berilgan: number;
	qoldiq: number;
	holat: StatusMaosh;
	izoh?: string;
}

// ============================================================
// 3. TAHLIL VA DASHBOARD INTERFEYSLARI (Yetishmayotgan qism)
// ============================================================
export interface OylikKorsatkich {
	davr: string;
	kirim: number;
	operatsionChiqim: number;
	maoshChiqim: number;
	jamiChiqim: number;
	sofFoyda: number;
}

export interface ChiqimStatistika {
	kategoriya: ChiqimKategoriya;
	summa: number;
	ulushFoiz: number;
}

export interface DashboardXulosa {
	jamiMijozlar: number;
	faolMijozlar: number;
	jamiHodimlar: number;
	faolHodimlar: number;
	jamiKirim: number;
	operatsionChiqim: number;
	berilganMaosh: number;
	umumiyChiqim: number;
	sofFoyda: number;
	kutilayotganKirim: number;
	xodimlardanQarz: number;
	oylikTahlil: OylikKorsatkich[];
	chiqimKategoriyalari: ChiqimStatistika[];
}

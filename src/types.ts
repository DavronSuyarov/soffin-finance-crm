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

// O'zbekiston Soliq Kodeksi bo'yicha korxona soliq rejimlari
export type SoliqRejimi = 'AOS' | 'Umumbelgilangan' | 'Nodavlat/NHT';

// Hisobot davriyligi
export type SoliqHisobotiDavriyligi = 'Oylik' | 'Choraklik' | 'Yillik';

// Soliq monitoringi hisobot turlari
export type SoliqTuri =
	| 'JSHOD va Ijtimoiy soliq'
	| 'Aylanmadan olinadigan soliq (AOS)'
	| 'QQS'
	| 'Foyda solig‘i (Choraklik)'
	| 'Yillik Foyda solig‘i'
	| 'Yillik Moliyaviy hisobot (1-2 shakl)'
	| 'Mol-mulk va Yer solig‘i'
	| 'Suv resurslaridan foydalanish solig‘i'
	| 'Statistika hisoboti'
	| 'Boshqa hisobot';

export type StatusSoliqHisoboti = 'Topshirildi' | 'Kutilmoqda' | 'Kechikkan';

// Davomat va Intizom holatlari
export type DavomatHolati = 'Keldi' | 'Kechikdi' | 'Kelmadi' | 'Sababli';

// ============================================================
// 2. ASOSIY MODELLAR (ENTITIES)
// ============================================================
export interface Mijoz {
	id: string;
	kompaniya: string;
	kontakt: string;
	telefon: string;
	inn: string;
	tarifSummasi: number; // Har oylik abonent xizmat haqi
	tolovKuni: number; // Har oyning qaysi sanasigacha to'lanishi kerak (1-31)
	status: StatusMijoz;
	masulHodimId?: string; // Ushbu mijozga mas'ul buxgalter IDsi
	soliqRejimi?: SoliqRejimi; // <-- Yangi: Mijozning soliq rejimi (AOS / Umumbelgilangan / Nodavlat)
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
	izoh?: string;
}

export interface Kirim {
	id: string;
	mijozId: string;
	kompaniya: string;
	davr?: string; // Qaysi oy uchun to'lov ekanligi ("YYYY-MM")
	summa: number;
	valyuta: Currency;
	sana: string; // Faktik to'lov/kvitansiya sanasi ("YYYY-MM-DD")
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
	kpiBonus?: number; // Hisoblangan KPI bonus summasi
	jarimaChegirma?: number; // Intizom/kechikish bo'yicha kamaytirilgan summa
	izoh?: string;
}

// ============================================================
// 3. SOLIQ VA KPI MODELLARI
// ============================================================
export interface SoliqHisoboti {
	id: string;
	mijozId: string;
	kompaniya: string;
	soliqTuri: SoliqTuri;
	davriyligi?: SoliqHisobotiDavriyligi; // Oylik / Choraklik / Yillik
	davr: string; // "YYYY-MM", "YYYY-Q1" yoki "YYYY-Yillik"
	oxirgiMuddat: string; // "YYYY-MM-DD"
	topshirilganSana?: string; // "YYYY-MM-DD"
	holat: StatusSoliqHisoboti;
	masulHodimId?: string;
	masulHodimIsm?: string;
	izoh?: string;
}

export interface DavomatYozuvi {
	id: string;
	hodimId: string;
	sana: string; // "YYYY-MM-DD"
	kelganVaqt?: string; // "09:35"
	holat: DavomatHolati;
	kechikishDaqiqa: number;
	izoh?: string;
}

export interface HodimKPIHisob {
	hodimId: string;
	ism: string;
	davr: string; // "YYYY-MM"
	bazaviyMaosh: number;
	asosiyQism: number; // 85% kafolatlangan qism
	bonusFond: number; // 15% maksimal bonus fondi

	// Intizom ko'rsatkichlari
	kechikishlarSoni: number;
	sababsizKelmadiKun: number;
	intizomChegirmaFoiz: number;

	// Soliq hisobotlari ko'rsatkichlari
	jamiHisobotlar: number;
	kechiktirilganHisobotlar: number;
	soliqIntizomiChegirmaFoiz: number;

	// Yakuniy natija
	hisoblanganBonus: number;
	jamiHisoblanganMaosh: number;
}

// ============================================================
// 4. TAHLIL VA DASHBOARD INTERFEYSLARI
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

export interface MijozQarzdorlik {
	mijozId: string;
	kompaniya: string;
	telefon: string;
	jamiKutilgan: number;
	jamiTolangan: number;
	qarzSummasi: number;
	holat: 'QarziYoq' | 'Qarzdor';
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
	mijozlarQarzi: number;
	oylikTahlil: OylikKorsatkich[];
	chiqimKategoriyalari: ChiqimStatistika[];

	kutilayotganSoliqlar?: number;
	kechikkanSoliqlar?: number;
}

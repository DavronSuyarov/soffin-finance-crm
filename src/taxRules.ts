// src/taxRules.ts
import {
	Mijoz,
	SoliqHisoboti,
	SoliqHisobotiDavriyligi,
	SoliqRejimi,
	SoliqTuri,
} from './types.js';

export interface SoliqQoidasi {
	nomi: SoliqTuri;
	rejimlari: (SoliqRejimi | 'Barchasi')[];
	davriyligi: SoliqHisobotiDavriyligi;
	topshirishKuni: number; // 15, 20 yoki 1
	amalQiluvchiOylar?: number[]; // Qaysi oylarda topshiriladi (1-12)
	tavsif: string;
}

/**
 * Agar belgilangan sana dam olish kuniga (shanba/yakshanba) to'g'ri kelsa,
 * Soliq kodeksiga binoan eng yaqin keyingi ish kuniga (dushanba) ko'chiriladi.
 */
export function getHaqiqiyIshKuniMuddat(
	yil: number,
	oy: number,
	kun: number,
): string {
	const d = new Date(yil, oy - 1, kun);
	const haftaKuni = d.getDay(); // 0 = Yakshanba, 6 = Shanba

	if (haftaKuni === 6) {
		// Shanba bo'lsa +2 kun (Dushanba)
		d.setDate(d.getDate() + 2);
	} else if (haftaKuni === 0) {
		// Yakshanba bo'lsa +1 kun (Dushanba)
		d.setDate(d.getDate() + 1);
	}

	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

// O'zbekiston Soliq qonunchiligi bo'yicha hisobotlar ro'yxati va qoidalari
export const SOLIQ_QOIDALARI: SoliqQoidasi[] = [
	// 1. OYLIK HISOBOTLAR
	{
		nomi: 'JSHOD va Ijtimoiy soliq',
		rejimlari: ['Barchasi'],
		davriyligi: 'Oylik',
		topshirishKuni: 15, // Har oyning 15-sanasigacha
		tavsif: 'JSHOD va Ijtimoiy soliq hisoboti',
	},
	{
		nomi: 'Aylanmadan olinadigan soliq (AOS)',
		rejimlari: ['AOS'],
		davriyligi: 'Oylik',
		topshirishKuni: 15, // Keyingi oyning 15-sanasigacha
		tavsif: 'AOS oylik hisob-kitobi',
	},
	{
		nomi: 'QQS',
		rejimlari: ['Umumbelgilangan'],
		davriyligi: 'Oylik',
		topshirishKuni: 20, // Keyingi oyning 20-sanasigacha
		tavsif: 'QQS hisoboti',
	},

	// 2. CHORAKLIK HISOBOTLAR (Aprel, Iyul, Oktyabr)
	{
		nomi: 'Foyda solig‘i (Choraklik)',
		rejimlari: ['Umumbelgilangan'],
		davriyligi: 'Choraklik',
		topshirishKuni: 20,
		amalQiluvchiOylar: [4, 7, 10], // Aprel (1-ch), Iyul (2-ch), Oktyabr (3-ch)
		tavsif: 'Foyda solig‘i bo‘yicha choraklik hisob-kitob',
	},

	// 3. YILLIK HISOBOTLAR (Fevral va Mart)
	{
		nomi: 'Yillik Moliyaviy hisobot (1-2 shakl)',
		rejimlari: ['AOS', 'Umumbelgilangan'],
		davriyligi: 'Yillik',
		topshirishKuni: 15,
		amalQiluvchiOylar: [2], // Har yili Fevral oyida
		tavsif: '1-son Shakl Buxgalteriya balansi va 2-son Moliyaviy natijalar',
	},
	{
		nomi: 'Yillik Foyda solig‘i',
		rejimlari: ['Umumbelgilangan'],
		davriyligi: 'Yillik',
		topshirishKuni: 1,
		amalQiluvchiOylar: [3], // Har yili Mart oyining 1-sanasigacha
		tavsif: 'Yil yakunlari bo‘yicha to‘liq foyda solig‘i hisoboti',
	},
];

/**
 * joriyTopshirishOyi ("YYYY-MM") asosida haqiqiy hisobot DAVRIni hisoblaydi va soliqlarni shakllantiradi
 */
export function generatsiyaMijozSoliqlari(
	mijoz: Mijoz,
	joriyTopshirishOyi: string, // Masalan: "2026-09"
	mavjudSoliqlar: SoliqHisoboti[],
	hodimIsm: string = '',
): SoliqHisoboti[] {
	const natija: SoliqHisoboti[] = [];
	const [yilStr, oyStr] = joriyTopshirishOyi.split('-');
	const joriyYil = parseInt(yilStr, 10);
	const topshirishOyi = parseInt(oyStr, 10);
	const rejim: SoliqRejimi = mijoz.soliqRejimi || 'AOS';

	// 1. Oylik hisobotlar uchun DAVR: joriy oy 09 bo'lsa, davr 08 (o'tgan oy) bo'ladi
	let hisobotYili = joriyYil;
	let hisobotOyi = topshirishOyi - 1;
	if (hisobotOyi === 0) {
		hisobotOyi = 12;
		hisobotYili = joriyYil - 1;
	}
	const oylikHisobotDavri = `${hisobotYili}-${String(hisobotOyi).padStart(2, '0')}`;

	SOLIQ_QOIDALARI.forEach(qoida => {
		// Rejim mosligini tekshirish
		const rejimMos =
			qoida.rejimlari.includes('Barchasi') || qoida.rejimlari.includes(rejim);

		if (!rejimMos) return;

		let amalQiladi = false;
		let hisobotDavriStr = oylikHisobotDavri;

		if (qoida.davriyligi === 'Oylik') {
			amalQiladi = true;
			hisobotDavriStr = oylikHisobotDavri; // Masalan: "2026-08"
		} else if (
			qoida.davriyligi === 'Choraklik' &&
			qoida.amalQiluvchiOylar &&
			qoida.amalQiluvchiOylar.includes(topshirishOyi)
		) {
			amalQiladi = true;
			const chorakRaqam = topshirishOyi === 4 ? 1 : topshirishOyi === 7 ? 2 : 3;
			hisobotDavriStr = `${joriyYil}-Q${chorakRaqam}`;
		} else if (
			qoida.davriyligi === 'Yillik' &&
			qoida.amalQiluvchiOylar &&
			qoida.amalQiluvchiOylar.includes(topshirishOyi)
		) {
			amalQiladi = true;
			hisobotDavriStr = `${joriyYil - 1}-Yillik`;
		}

		if (amalQiladi) {
			// Ushbu mijozga aynan shu davr va soliq turi avval shakllantirilganmi tekshiramiz
			const alllaqachonMavjud = mavjudSoliqlar.some(
				s =>
					s.mijozId === mijoz.id &&
					s.soliqTuri === qoida.nomi &&
					s.davr === hisobotDavriStr,
			);

			if (!alllaqachonMavjud) {
				// Topshirish muddati joriy oyning 15 yoki 20-kuni (ish kuniga to'g'rilanadi)
				const oxirgiMuddat = getHaqiqiyIshKuniMuddat(
					joriyYil,
					topshirishOyi,
					qoida.topshirishKuni,
				);

				natija.push({
					id: `S_${mijoz.id}_${Date.now().toString().slice(-4)}_${Math.floor(Math.random() * 900 + 100)}`,
					mijozId: mijoz.id,
					kompaniya: mijoz.kompaniya,
					soliqTuri: qoida.nomi,
					davriyligi: qoida.davriyligi,
					davr: hisobotDavriStr, // Haqiqiy hisobot berilayotgan davr (2026-08)
					oxirgiMuddat, // Topshirish kerak bo'lgan sana (2026-09-15 yoki 2026-09-20)
					holat: 'Kutilmoqda',
					masulHodimId: mijoz.masulHodimId || '',
					masulHodimIsm: hodimIsm,
					izoh: `${hisobotDavriStr} ${qoida.tavsif} (${qoida.davriyligi})`,
				});
			}
		}
	});

	return natija;
}

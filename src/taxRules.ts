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
	amalQiluvchiOylar?: number[]; // Agar choraklik yoki yillik bo'lsa (1-12)
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
		tavsif: 'Jismoniy shaxslardan olinadigan daromad solig‘i va ijtimoiy soliq',
	},
	{
		nomi: 'Aylanmadan olinadigan soliq (AOS)',
		rejimlari: ['AOS'],
		davriyligi: 'Oylik',
		topshirishKuni: 15, // Keyingi oyning 15-sanasigacha
		tavsif: 'Aylanmadan olinadigan soliq oylik hisob-kitobi',
	},
	{
		nomi: 'QQS',
		rejimlari: ['Umumbelgilangan'],
		davriyligi: 'Oylik',
		topshirishKuni: 20, // Keyingi oyning 20-sanasigacha
		tavsif: 'Qo‘shilgan qiymat solig‘i hisoboti',
	},

	// 2. CHORAKLIK HISOBOTLAR (Aprel, Iyul, Oktyabr)
	{
		nomi: 'Foyda solig‘i (Choraklik)',
		rejimlari: ['Umumbelgilangan'],
		davriyligi: 'Choraklik',
		topshirishKuni: 20,
		amalQiluvchiOylar: [4, 7, 10], // 1, 2, 3-choraklar yakuni
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
 * Mijozning soliq rejimi va tanlangan oyga (YYYY-MM) asoslanib,
 * O'zbekiston qonunchiligiga mos barcha hisobotlarni shakllantiruvchi generator
 */
export function generatsiyaMijozSoliqlari(
	mijoz: Mijoz,
	davr: string, // "YYYY-MM"
	mavjudSoliqlar: SoliqHisoboti[],
	hodimIsm: string = '',
): SoliqHisoboti[] {
	const natija: SoliqHisoboti[] = [];
	const [yilStr, oyStr] = davr.split('-');
	const yil = parseInt(yilStr, 10);
	const oy = parseInt(oyStr, 10);
	const rejim: SoliqRejimi = mijoz.soliqRejimi || 'AOS';

	SOLIQ_QOIDALARI.forEach(qoida => {
		// Rejim mosligini tekshirish
		const rejimMos =
			qoida.rejimlari.includes('Barchasi') || qoida.rejimlari.includes(rejim);

		if (!rejimMos) return;

		// Davriylik mosligini tekshirish
		let amalQiladi = false;
		if (qoida.davriyligi === 'Oylik') {
			amalQiladi = true;
		} else if (
			qoida.amalQiluvchiOylar &&
			qoida.amalQiluvchiOylar.includes(oy)
		) {
			amalQiladi = true;
		}

		if (amalQiladi) {
			// Ushbu davrda bu mijozga aynan shu soliq turi avval kiritilganmi tekshiramiz
			const alllaqachonMavjud = mavjudSoliqlar.some(
				s =>
					s.mijozId === mijoz.id &&
					s.soliqTuri === qoida.nomi &&
					s.davr === davr,
			);

			if (!alllaqachonMavjud) {
				const oxirgiMuddat = getHaqiqiyIshKuniMuddat(
					yil,
					oy,
					qoida.topshirishKuni,
				);

				natija.push({
					id: `S_${mijoz.id}_${Date.now().toString().slice(-4)}_${Math.floor(Math.random() * 900 + 100)}`,
					mijozId: mijoz.id,
					kompaniya: mijoz.kompaniya,
					soliqTuri: qoida.nomi,
					davriyligi: qoida.davriyligi,
					davr,
					oxirgiMuddat,
					holat: 'Kutilmoqda',
					masulHodimId: mijoz.masulHodimId || '',
					masulHodimIsm: hodimIsm,
					izoh: `${qoida.tavsif} (${qoida.davriyligi})`,
				});
			}
		}
	});

	return natija;
}

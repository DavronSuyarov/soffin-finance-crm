// src/finance.ts
import {
	Chiqim,
	ChiqimKategoriya,
	DashboardXulosa,
	Hodim,
	Kirim,
	MaoshYozuvi,
	Mijoz,
} from './types.js';

export function calculateDashboardSummary(
	mijozlar: Mijoz[],
	hodimlar: Hodim[],
	kirimlar: Kirim[],
	chiqimlar: Chiqim[],
	maoshlar: MaoshYozuvi[],
): DashboardXulosa {
	// 1. Mijozlar statistikasi
	const jamiMijozlar = mijozlar.length;
	const faolMijozlar = mijozlar.filter(m => m.status === 'Faol').length;

	// 2. Kirimlar hisobi
	let jamiKirim = 0;
	let kutilayotganKirim = 0;

	kirimlar.forEach(k => {
		const summa = Number(k.summa) || 0;
		const holatStr = String(k.holat).toLowerCase();

		if (
			holatStr.includes('to') ||
			holatStr.includes('bajarildi') ||
			holatStr.includes('paid')
		) {
			jamiKirim += summa;
		} else if (holatStr.includes('kutil') || holatStr.includes('pending')) {
			kutilayotganKirim += summa;
		} else {
			jamiKirim += summa;
		}
	});

	// 3. Operatsion chiqimlar
	let operatsionChiqim = 0;
	const kategoriyaXarajatlar: Record<string, number> = {};

	chiqimlar.forEach(x => {
		const summa = Number(x.summa) || 0;
		operatsionChiqim += summa;
		const kat = String(x.kategoriya || 'Boshqa');
		kategoriyaXarajatlar[kat] = (kategoriyaXarajatlar[kat] || 0) + summa;
	});

	// 4. Maoshlar va qarzlar
	let jamiBelgilanganMaosh = 0;
	let berilganMaosh = 0;

	maoshlar.forEach(m => {
		jamiBelgilanganMaosh += Number(m.belgilangan) || 0;
		berilganMaosh += Number(m.berilgan) || 0;
	});

	const xodimlardanQarz = Math.max(0, jamiBelgilanganMaosh - berilganMaosh);
	const umumiyChiqim = operatsionChiqim + berilganMaosh;
	const sofFoyda = jamiKirim - umumiyChiqim;

	// 5. Chiqimlar strukturasi (Foizlarda)
	if (berilganMaosh > 0) {
		kategoriyaXarajatlar['Maosh'] =
			(kategoriyaXarajatlar['Maosh'] || 0) + berilganMaosh;
	}

	const chiqimKategoriyalari = Object.keys(kategoriyaXarajatlar).map(kat => {
		const summa = kategoriyaXarajatlar[kat];
		const ulushFoiz =
			umumiyChiqim > 0 ? Math.round((summa / umumiyChiqim) * 100) : 0;
		return {
			kategoriya: kat as unknown as ChiqimKategoriya,
			summa,
			ulushFoiz,
		};
	});

	// 6. Oylik tahlil (Dinamika grafigi uchun)
	const oylarMap: Record<string, { kirim: number; jamiChiqim: number }> = {};
	const joriyOy = new Date().toISOString().slice(0, 7);
	oylarMap[joriyOy] = { kirim: 0, jamiChiqim: 0 };

	kirimlar.forEach(k => {
		const oy = k.sana ? String(k.sana).slice(0, 7) : joriyOy;
		if (!oylarMap[oy]) {
			oylarMap[oy] = { kirim: 0, jamiChiqim: 0 };
		}
		oylarMap[oy].kirim += Number(k.summa) || 0;
	});

	chiqimlar.forEach(x => {
		const oy = x.sana ? String(x.sana).slice(0, 7) : joriyOy;
		if (!oylarMap[oy]) {
			oylarMap[oy] = { kirim: 0, jamiChiqim: 0 };
		}
		oylarMap[oy].jamiChiqim += Number(x.summa) || 0;
	});

	maoshlar.forEach(m => {
		const oy = m.davr ? String(m.davr).slice(0, 7) : joriyOy;
		if (!oylarMap[oy]) {
			oylarMap[oy] = { kirim: 0, jamiChiqim: 0 };
		}
		oylarMap[oy].jamiChiqim += Number(m.berilgan) || 0;
	});

	const oylikTahlil = Object.keys(oylarMap)
		.sort()
		.map(davr => ({
			davr,
			kirim: oylarMap[davr].kirim,
			jamiChiqim: oylarMap[davr].jamiChiqim,
			operatsionChiqim: 0,
			maoshChiqim: 0,
			sofFoyda: oylarMap[davr].kirim - oylarMap[davr].jamiChiqim,
		}));

	return {
		jamiKirim,
		kutilayotganKirim,
		umumiyChiqim,
		operatsionChiqim,
		berilganMaosh,
		sofFoyda,
		xodimlardanQarz,
		jamiHodimlar: hodimlar.length,
		faolHodimlar: hodimlar.filter(h => h.holat === 'Faol').length,
		jamiMijozlar,
		faolMijozlar,
		oylikTahlil,
		chiqimKategoriyalari,
	};
}

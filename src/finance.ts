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

// Sanadan toza "YYYY-MM" formatini ajratish
const parseOy = (dStr: any): string => {
	if (!dStr) return '';
	const str = String(dStr).trim();
	if (/^\d{4}-\d{2}$/.test(str)) return str;
	try {
		const d = new Date(str);
		if (isNaN(d.getTime())) return str.slice(0, 7);
		const yil = d.getFullYear();
		const oy = String(d.getMonth() + 1).padStart(2, '0');
		return `${yil}-${oy}`;
	} catch {
		return str.slice(0, 7);
	}
};

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
		const holatStr = String(k.holat || '').toLowerCase();

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

	// 4. Maoshlar va xodimlarga haqiqiy qarz hisobi
	let berilganMaosh = 0;
	const davrBerilganMap = new Map<string, number>();
	const davrBelgilanganMap = new Map<string, number>();

	maoshlar.forEach(m => {
		const ber = Number(m.berilgan) || 0;
		berilganMaosh += ber;

		const oy = parseOy(m.davr);
		const kalit = `${m.hodimId || m.ism}_${oy}`;

		const oldBerilgan = davrBerilganMap.get(kalit) || 0;
		davrBerilganMap.set(kalit, oldBerilgan + ber);

		// Bir oy uchun belgilangan shtat maoshini faqat 1 marta hisobga olamiz
		if (!davrBelgilanganMap.has(kalit)) {
			davrBelgilanganMap.set(kalit, Number(m.belgilangan) || 0);
		}
	});

	let xodimlardanQarz = 0;
	davrBelgilanganMap.forEach((belgilangan, kalit) => {
		const jamiBerilgan = davrBerilganMap.get(kalit) || 0;
		xodimlardanQarz += Math.max(0, belgilangan - jamiBerilgan);
	});

	const umumiyChiqim = operatsionChiqim + berilganMaosh;
	const sofFoyda = jamiKirim - umumiyChiqim;

	// 5. Chiqimlar strukturasi (Kassadan chiqqan pul asosida)
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

	// 6. Oylik dinamika grafigi
	const oylarMap: Record<string, { kirim: number; jamiChiqim: number }> = {};
	const joriyOy = parseOy(new Date().toISOString());
	oylarMap[joriyOy] = { kirim: 0, jamiChiqim: 0 };

	kirimlar.forEach(k => {
		const holatStr = String(k.holat || '').toLowerCase();
		// Faqat tushgan pullar grafikda kirim sifatida ko'rinadi
		if (!holatStr.includes('kutil') && !holatStr.includes('pending')) {
			const oy = parseOy(k.sana) || joriyOy;
			if (!oylarMap[oy]) {
				oylarMap[oy] = { kirim: 0, jamiChiqim: 0 };
			}
			oylarMap[oy].kirim += Number(k.summa) || 0;
		}
	});

	chiqimlar.forEach(x => {
		const oy = parseOy(x.sana) || joriyOy;
		if (!oylarMap[oy]) {
			oylarMap[oy] = { kirim: 0, jamiChiqim: 0 };
		}
		oylarMap[oy].jamiChiqim += Number(x.summa) || 0;
	});

	maoshlar.forEach(m => {
		const oy = parseOy(m.davr) || joriyOy;
		if (!oylarMap[oy]) {
			oylarMap[oy] = { kirim: 0, jamiChiqim: 0 };
		}
		// Chiqimga faqat amalda berilgan maosh qo'shiladi
		oylarMap[oy].jamiChiqim += Number(m.berilgan) || 0;
	});

	const oylikTahlil = Object.keys(oylarMap)
		.sort()
		.slice(-6)
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
		faolHodimlar: hodimlar.filter(
			h => h.holat === 'Faol' || (h as any).status === 'Faol',
		).length,
		jamiMijozlar,
		faolMijozlar,
		oylikTahlil,
		chiqimKategoriyalari,
	};
}

// src/finance.ts
import {
	Chiqim,
	ChiqimKategoriya,
	DashboardXulosa,
	DavomatYozuvi,
	Hodim,
	HodimKPIHisob,
	Kirim,
	MaoshYozuvi,
	Mijoz,
	MijozQarzdorlik,
	SoliqHisoboti,
	StatusMaosh,
} from './types.js';

// Sanadan toza "YYYY-MM" formatini ajratish
export const parseOy = (dStr: any): string => {
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

/**
 * Har bir mijoz bo'yicha haqiqiy debitorlik (qarz) hisobi
 */
export function hisoblaMijozlarQarzi(
	mijozlar: Mijoz[],
	kirimlar: Kirim[],
): MijozQarzdorlik[] {
	return mijozlar.map(m => {
		const mijozKirimlari = kirimlar.filter(
			k => k.mijozId === m.id || k.kompaniya === m.kompaniya,
		);

		// Jami chiqarilgan kvitansiyalar summasi
		const jamiKutilgan = mijozKirimlari.reduce(
			(sum, k) => sum + (Number(k.summa) || 0),
			0,
		);

		// Amalda to'langan summa
		const jamiTolangan = mijozKirimlari
			.filter(k => {
				const holatStr = String(k.holat || '').toLowerCase();
				return (
					holatStr.includes('to') ||
					holatStr.includes('bajarildi') ||
					holatStr.includes('paid')
				);
			})
			.reduce((sum, k) => sum + (Number(k.summa) || 0), 0);

		const qarzSummasi = Math.max(0, jamiKutilgan - jamiTolangan);

		return {
			mijozId: m.id,
			kompaniya: m.kompaniya,
			telefon: m.telefon,
			jamiKutilgan,
			jamiTolangan,
			qarzSummasi,
			holat: qarzSummasi > 0 ? 'Qarzdor' : 'QarziYoq',
		};
	});
}

/**
 * Xodimning oylik KPI va 15% lik Bonus fondini hisoblash
 * (Davomat va Soliq hisobotlari intizomini to'liq inobatga oladi)
 */
export function hisoblaHodimKPI(
	hodim: Hodim,
	davr: string, // "YYYY-MM"
	davomatlar: DavomatYozuvi[] = [],
	soliqlar: SoliqHisoboti[] = [],
): HodimKPIHisob {
	const bazaviyMaosh = Number(hodim.oylikMaosh) || 0;
	const asosiyQism = Math.round(bazaviyMaosh * 0.85); // 85% kafolatlangan asosiy qism
	const bonusFond = bazaviyMaosh - asosiyQism; // 15% maksimal bonus jamg'armasi

	// 1. Davomat ko'rsatkichlari (shu oy bo'yicha)
	const oyDavomat = davomatlar.filter(
		d =>
			(d.hodimId === hodim.id || (d as any).ism === hodim.ism) &&
			parseOy(d.sana) === davr,
	);

	const kechikishlarSoni = oyDavomat.filter(
		d => d.holat === 'Kechikdi' || (Number(d.kechikishDaqiqa) || 0) > 0,
	).length;

	const sababsizKelmadiKun = oyDavomat.filter(
		d => d.holat === 'Kelmadi',
	).length;

	// Intizom bo'yicha bonusdan chegirma foizi:
	let intizomChegirmaFoiz = 0;
	if (kechikishlarSoni >= 5) {
		intizomChegirmaFoiz += 50;
	} else if (kechikishlarSoni >= 3) {
		intizomChegirmaFoiz += 20;
	}

	intizomChegirmaFoiz += sababsizKelmadiKun * 25;
	intizomChegirmaFoiz = Math.min(100, intizomChegirmaFoiz);

	// 2. Soliq hisobotlari topshirish intizomi
	const masulSoliqlar = soliqlar.filter(
		s =>
			(s.masulHodimId === hodim.id || s.masulHodimIsm === hodim.ism) &&
			parseOy(s.davr || s.oxirgiMuddat) === davr,
	);

	const jamiHisobotlar = masulSoliqlar.length;
	const kechiktirilganHisobotlar = masulSoliqlar.filter(
		s => s.holat === 'Kechikkan',
	).length;

	let soliqIntizomiChegirmaFoiz = 0;
	if (jamiHisobotlar > 0 && kechiktirilganHisobotlar > 0) {
		soliqIntizomiChegirmaFoiz = Math.min(100, kechiktirilganHisobotlar * 30);
	}

	// 3. Jami chegirma foizi va qolgan haqiqiy bonus
	const jamiChegirmaFoiz = Math.min(
		100,
		intizomChegirmaFoiz + soliqIntizomiChegirmaFoiz,
	);
	const bonusKoeffitsiyent = Math.max(0, (100 - jamiChegirmaFoiz) / 100);
	const hisoblanganBonus = Math.round(bonusFond * bonusKoeffitsiyent);
	const jamiHisoblanganMaosh = asosiyQism + hisoblanganBonus;

	return {
		hodimId: hodim.id,
		ism: hodim.ism,
		davr,
		bazaviyMaosh,
		asosiyQism,
		bonusFond,
		kechikishlarSoni,
		sababsizKelmadiKun,
		intizomChegirmaFoiz,
		jamiHisobotlar,
		kechiktirilganHisobotlar,
		soliqIntizomiChegirmaFoiz,
		hisoblanganBonus,
		jamiHisoblanganMaosh,
	};
}

export interface HodimOyBalansi {
	kalit: string; // hodimId_YYYY-MM
	hodimId: string;
	ism: string;
	davr: string;
	boshlangichAvans: number; // O'tgan oydan o'tgan avans (+) yoki korxona qarzi (-)
	belgilangan: number; // Bazaviy shtat oyligi
	hisoblanganMaosh: number; // KPI va davomat natijalaridan keyingi yakuniy to'lanishi lozim bo'lgan maosh
	hisoblanganBonus: number; // Ushbu oy uchun hisoblangan bonus
	chegirmaFoiz: number; // Bonusdan chegirilgan umumiy foiz
	berilgan: number; // Shu oyda amalda to'langan jami summa (barcha avans va qisman to'lovlar yig'indisi)
	tolovlarSoni: number; // Shu oyda nechta to'lov tranzaksiyasi amalga oshirilgani
	qoldiqQarz: number; // Ushbu oy yakunidagi korxonaning xodimga sof qarzi
	yakuniyAvans: number; // Ushbu oy yakunidagi xodimga ortiqcha to'langan summa (keyingi oyga o'tadi)
	holat: StatusMaosh;
}

/**
 * Xodimlarning oylik maosh balansini kumulyativ (KPI, Davomat va avanslarni keyingi oyga o'tkazgan holda) hisoblash.
 * Bir oyda bir necha to'lov bo'lsa ham belgilangan summani takrorlamaydi.
 */
export function hisoblaHodimlarBalansi(
	hodimlar: Hodim[],
	maoshlar: MaoshYozuvi[],
	davomatlar: DavomatYozuvi[] = [],
	soliqlar: SoliqHisoboti[] = [],
): Map<string, HodimOyBalansi> {
	const natijaMap = new Map<string, HodimOyBalansi>();

	// 1. Maosh to'lovlari, davomat va soliqlarda qatnashgan barcha oylarni to'plash
	const oylarSet = new Set<string>();

	maoshlar.forEach(m => {
		const o = parseOy(m.davr);
		if (o) oylarSet.add(o);
	});
	davomatlar.forEach(d => {
		const o = parseOy(d.sana);
		if (o) oylarSet.add(o);
	});
	soliqlar.forEach(s => {
		const o = parseOy(s.davr || s.oxirgiMuddat);
		if (o) oylarSet.add(o);
	});

	// Agar hech qanday davr bo'lmasa, joriy oyni qo'shamiz
	if (oylarSet.size === 0) {
		oylarSet.add(parseOy(new Date().toISOString()));
	}

	const barchaOylar = Array.from(oylarSet).sort();

	// 2. Har bir xodim bo'yicha xronologik hisob-kitob
	hodimlar.forEach(h => {
		let kumulyativBalans = 0; // Musbat (+) bo'lsa xodimda avans bor, manfiy (-) bo'lsa korxona qarzdor

		barchaOylar.forEach(oy => {
			const shtat = Number(h.oylikMaosh) || 0;

			// Xodimning shu oydagi barcha to'lovlari (avans, qisman va h.k.)
			const oyTolovlar = maoshlar.filter(
				m => (m.hodimId === h.id || m.ism === h.ism) && parseOy(m.davr) === oy,
			);

			const oyBerilgan = oyTolovlar.reduce(
				(sum, m) => sum + (Number(m.berilgan) || 0),
				0,
			);

			// Agar bu oyda to'lov bo'lmasa, kumulyativ balans ham 0 bo'lsa va xodim nofaol bo'lsa o'tkazib yuboramiz
			const isFaol = h.holat === 'Faol' || (h as any).status === 'Faol';
			if (oyTolovlar.length === 0 && kumulyativBalans === 0 && !isFaol) {
				return;
			}

			// KPI va Davomat hisobi
			const kpiNatija = hisoblaHodimKPI(h, oy, davomatlar, soliqlar);
			const haqiqiyHisoblanganMaosh = kpiNatija.jamiHisoblanganMaosh;

			const boshlangichAvans = kumulyativBalans;

			// Sof balans formulasi:
			// O'tgan oydan o'tgan qoldiq/avans + Bu oy to'langanlar - Shu oyda hisoblangan haqiqiy maosh
			const sofOyBalansi =
				boshlangichAvans + oyBerilgan - haqiqiyHisoblanganMaosh;
			kumulyativBalans = sofOyBalansi;

			const qoldiqQarz = sofOyBalansi < 0 ? Math.abs(sofOyBalansi) : 0;
			const yakuniyAvans = sofOyBalansi > 0 ? sofOyBalansi : 0;

			let holat: StatusMaosh = 'Tolangan';
			if (qoldiqQarz > 0) {
				holat = 'Qarzli';
			}

			const kalit = `${h.id}_${oy}`;
			natijaMap.set(kalit, {
				kalit,
				hodimId: h.id,
				ism: h.ism,
				davr: oy,
				boshlangichAvans,
				belgilangan: shtat,
				hisoblanganMaosh: haqiqiyHisoblanganMaosh,
				hisoblanganBonus: kpiNatija.hisoblanganBonus,
				chegirmaFoiz:
					kpiNatija.intizomChegirmaFoiz + kpiNatija.soliqIntizomiChegirmaFoiz,
				berilgan: oyBerilgan,
				tolovlarSoni: oyTolovlar.length,
				qoldiqQarz,
				yakuniyAvans,
				holat,
			});
		});
	});

	return natijaMap;
}

/**
 * Dashboard uchun umumiy moliyaviy va kadrlar xulosasini hisoblash
 */
export function calculateDashboardSummary(
	mijozlar: Mijoz[],
	hodimlar: Hodim[],
	kirimlar: Kirim[],
	chiqimlar: Chiqim[],
	maoshlar: MaoshYozuvi[],
	soliqlar: SoliqHisoboti[] = [],
	davomatlar: DavomatYozuvi[] = [],
): DashboardXulosa {
	// 1. Mijozlar statistikasi va Debitorlik qarzi
	const jamiMijozlar = mijozlar.length;
	const faolMijozlar = mijozlar.filter(m => m.status === 'Faol').length;
	const debitorlikTahlili = hisoblaMijozlarQarzi(mijozlar, kirimlar);
	const mijozlarQarzi = debitorlikTahlili.reduce(
		(sum, item) => sum + item.qarzSummasi,
		0,
	);

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

	// 4. Maoshlar chiqimi va xodimlarga haqiqiy qarz hisobi (KPI va kumulyativ avans hisobga olingan holda)
	let berilganMaosh = 0;
	maoshlar.forEach(m => {
		berilganMaosh += Number(m.berilgan) || 0;
	});

	// Yangilangan hisoblaHodimlarBalansi ga davomatlar va soliqlar uzatiladi
	const xodimlarBalansi = hisoblaHodimlarBalansi(
		hodimlar,
		maoshlar,
		davomatlar,
		soliqlar,
	);
	let xodimlardanQarz = 0;

	// Har bir xodimning eng oxirgi oydagi kumulyativ qoldiq qarzini jamlash
	hodimlar.forEach(h => {
		const hodimOylari = Array.from(xodimlarBalansi.values())
			.filter(item => item.hodimId === h.id)
			.sort((a, b) => a.davr.localeCompare(b.davr));

		if (hodimOylari.length > 0) {
			const oxirgiOy = hodimOylari[hodimOylari.length - 1];
			xodimlardanQarz += oxirgiOy.qoldiqQarz;
		}
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
		if (
			!holatStr.includes('kutil') &&
			!holatStr.includes('pending') &&
			!holatStr.includes('bekor')
		) {
			const oy = parseOy(k.davr || k.sana) || joriyOy;
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

	// 7. Soliqlar monitoringi xulosasi
	const kutilayotganSoliqlar = soliqlar.filter(
		s => s.holat === 'Kutilmoqda',
	).length;
	const kechikkanSoliqlar = soliqlar.filter(
		s => s.holat === 'Kechikkan',
	).length;

	return {
		jamiKirim,
		kutilayotganKirim,
		umumiyChiqim,
		operatsionChiqim,
		berilganMaosh,
		sofFoyda,
		xodimlardanQarz,
		mijozlarQarzi,
		jamiHodimlar: hodimlar.length,
		faolHodimlar: hodimlar.filter(
			h => h.holat === 'Faol' || (h as any).status === 'Faol',
		).length,
		jamiMijozlar,
		faolMijozlar,
		oylikTahlil,
		chiqimKategoriyalari,
		kutilayotganSoliqlar,
		kechikkanSoliqlar,
	};
}

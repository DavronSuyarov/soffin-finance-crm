// src/index.ts

import {
	mapRowToChiqim,
	mapRowToHodim,
	mapRowToKirim,
	mapRowToMaosh,
	mapRowToMijoz,
} from './mappers.js';

import { calculateDashboardSummary } from './finance.js';

// ============================================================
// DEMO MA'LUMOTLAR (Google Sheets'dan keladigan xom satrlar)
// ============================================================

const rawMijozlar = [
	[
		'M001',
		'Toshmatov LLC',
		'Jasur Toshmatov',
		'998901234567',
		'123456789',
		'Faol',
		'VIP',
		'01.01.2026',
	],
	[
		'M002',
		'Karimova Co',
		'Nilufar Karimova',
		'998712345678',
		'987654321',
		'Faol',
		'',
		'01.02.2026',
	],
	[
		'M003',
		'Mirza Group',
		'Sardor Mirzayev',
		'998931234567',
		'456789123',
		'Kutilmoqda',
		'',
		'01.03.2026',
	],
];

const rawHodimlar = [
	[
		'H001',
		'Nodira Yusupova',
		'Bosh buxgalter',
		'Moliya',
		'10000000',
		'998901111111',
		'Faol',
		'01.01.2026',
	],
	[
		'H002',
		'Bobur Rahimov',
		'Buxgalter',
		'Moliya',
		'8000000',
		'998902222222',
		'Faol',
		'01.01.2026',
	],
	[
		'H003',
		'Malika Xasanova',
		'Menejer',
		'Sotuv',
		'6000000',
		'998903333333',
		'Faol',
		'01.02.2026',
	],
];

const rawKirimlar = [
	[
		'K001',
		'M001',
		'Toshmatov LLC',
		'5000000',
		'UZS',
		'15.01.2026',
		'Audit',
		'Tolangan',
		'INV-001',
		'',
	],
	[
		'K002',
		'M002',
		'Karimova Co',
		'3200000',
		'UZS',
		'20.02.2026',
		'Konsultatsiya',
		'Tolangan',
		'INV-002',
		'',
	],
	[
		'K003',
		'M001',
		'Toshmatov LLC',
		'4500000',
		'UZS',
		'10.03.2026',
		'Buxgalteriya hisobi',
		'Tolangan',
		'INV-003',
		'',
	],
	[
		'K004',
		'M003',
		'Mirza Group',
		'2800000',
		'UZS',
		'25.04.2026',
		'Audit',
		'Kutilmoqda',
		'INV-004',
		'',
	],
	[
		'K005',
		'M002',
		'Karimova Co',
		'6000000',
		'UZS',
		'05.05.2026',
		'Buxgalteriya hisobi',
		'Tolangan',
		'INV-005',
		'',
	],
	[
		'K006',
		'M001',
		'Toshmatov LLC',
		'3500000',
		'UZS',
		'18.06.2026',
		'Konsultatsiya',
		'Tolangan',
		'INV-006',
		'',
	],
];

// E'tibor bering: Chiqimlar ichida Maosh yo'q, faqat operatsion xarajatlar!
const rawChiqimlar = [
	[
		'X002',
		'Ijara',
		'Ofis ijarasi',
		'3000000',
		'UZS',
		'01.02.2026',
		'Bobur Rahimov',
		'Tolangan',
		'',
	],
	[
		'X003',
		'Kommunal',
		'Elektr, suv',
		'450000',
		'UZS',
		'05.02.2026',
		'Bobur Rahimov',
		'Tolangan',
		'',
	],
	[
		'X005',
		'Marketing',
		'Reklama',
		'1200000',
		'UZS',
		'15.03.2026',
		'Malika Xasanova',
		'Tolangan',
		'',
	],
];

const rawMaoshlar = [
	[
		'P001',
		'H001',
		'Nodira Yusupova',
		'2026-01',
		'10000000',
		'6000000',
		'4000000',
		'Qarzli',
		'',
	],
	[
		'P002',
		'H001',
		'Nodira Yusupova',
		'2026-02',
		'10000000',
		'6000000',
		'4000000',
		'Qarzli',
		'',
	],
	[
		'P003',
		'H001',
		'Nodira Yusupova',
		'2026-03',
		'10000000',
		'10000000',
		'0',
		'Tolangan',
		'',
	],
	[
		'P004',
		'H002',
		'Bobur Rahimov',
		'2026-01',
		'8000000',
		'8000000',
		'0',
		'Tolangan',
		'',
	],
	[
		'P005',
		'H002',
		'Bobur Rahimov',
		'2026-02',
		'8000000',
		'5000000',
		'3000000',
		'Qarzli',
		'',
	],
	[
		'P006',
		'H003',
		'Malika Xasanova',
		'2026-01',
		'6000000',
		'6000000',
		'0',
		'Tolangan',
		'',
	],
];

// ============================================================
// MAPPING: Xom massivlarni qat'iy tipli obyektlarga o'tkazamiz
// ============================================================

const mijozlar = rawMijozlar.map(mapRowToMijoz);
const hodimlar = rawHodimlar.map(mapRowToHodim);
const kirimlar = rawKirimlar.map(mapRowToKirim);
const chiqimlar = rawChiqimlar.map(mapRowToChiqim);
const maoshlar = rawMaoshlar.map(mapRowToMaosh);

// ============================================================
// HISOB-KITOB VA TAHLIL
// ============================================================

const summary = calculateDashboardSummary(
	mijozlar,
	hodimlar,
	kirimlar,
	chiqimlar,
	maoshlar,
);

// ============================================================
// TERMINALGA CHIQARISH (Hisobot)
// ============================================================

const fmt = (n: number) => n.toLocaleString('uz-UZ');

console.log('====================================================');
console.log('💼 SOFFIN_PAY — MOLIYAVIY BOSHQARUV HISOBOTI');
console.log('====================================================');
console.log(
	`Mijozlar:     Jami: ${summary.jamiMijozlar} ta | Faol: ${summary.faolMijozlar} ta`,
);
console.log(
	`Hodimlar:     Jami: ${summary.jamiHodimlar} ta | Faol: ${summary.faolHodimlar} ta`,
);
console.log('----------------------------------------------------');
console.log(`Tushgan Kirim:           ${fmt(summary.jamiKirim)} UZS`);
console.log(`Operatsion Chiqim:       ${fmt(summary.operatsionChiqim)} UZS`);
console.log(`Hodimlarga Maosh:        ${fmt(summary.berilganMaosh)} UZS`);
console.log(`UMUMIY CHIQIM:           ${fmt(summary.umumiyChiqim)} UZS`);
console.log('----------------------------------------------------');
console.log(
	`SOF FOYDA:               ${fmt(summary.sofFoyda)} UZS ${summary.sofFoyda >= 0 ? '📈' : '📉'}`,
);
console.log('----------------------------------------------------');
console.log(`Kutilayotgan pullar:     ${fmt(summary.kutilayotganKirim)} UZS`);
console.log(`Hodimlardan qarz:        ${fmt(summary.xodimlardanQarz)} UZS ⚠️`);
console.log('====================================================');
console.log('📊 CHIQIM KATEGORIYALARI:');
summary.chiqimKategoriyalari.forEach(c => {
	console.log(`  - ${c.kategoriya}: ${fmt(c.summa)} UZS (${c.ulushFoiz}%)`);
});
console.log('====================================================');
console.log('📈 OYLIK DINAMIKA:');
summary.oylikTahlil.forEach(m => {
	console.log(
		`  [${m.davr}] Kirim: ${fmt(m.kirim)} | Chiqim: ${fmt(m.jamiChiqim)} | Foyda: ${fmt(m.sofFoyda)}`,
	);
});
console.log('====================================================');

// src/App.tsx
import { useEffect, useState } from 'react';
import { ChiqimTab } from './components/ChiqimTab';
import { DashboardTab } from './components/DashboardTab';
import { HodimlarTab } from './components/HodimlarTab';
import { KirimTab } from './components/KirimTab';
import { MaoshTab } from './components/MaoshTab';
import { MijozlarTab } from './components/MijozlarTab';
import { calculateDashboardSummary } from './finance.js';
import { Language, translations } from './i18n.js';
import {
	mapRowToChiqim,
	mapRowToHodim,
	mapRowToKirim,
	mapRowToMaosh,
	mapRowToMijoz,
} from './mappers.js';
import { Chiqim, Hodim, Kirim, MaoshYozuvi, Mijoz } from './types.js';

const initialMijozlar = [
	[
		'M001',
		'Toshmatov LLC',
		'Jasur Toshmatov',
		'998901234567',
		'123456789',
		'Faol',
		'VIP mijoz',
		'01.01.2026',
	],
	[
		'M002',
		'Karimova Co',
		'Nilufar Karimova',
		'998712345678',
		'987654321',
		'Faol',
		'Shartnoma yangilandi',
		'01.02.2026',
	],
	[
		'M003',
		'Mirza Group',
		'Sardor Mirzayev',
		'998931234567',
		'456789123',
		'Kutilmoqda',
		'Hujjatlar tayyorlanmoqda',
		'01.03.2026',
	],
].map(mapRowToMijoz);

const initialHodimlar = [
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
].map(mapRowToHodim);

const initialKirimlar = [
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
		'Bank orqali o‘tdi',
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
		'Shartnoma to‘lovi',
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
		'Hisob-faktura yuborildi',
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
].map(mapRowToKirim);

const initialChiqimlar = [
	[
		'X002',
		'Ijara',
		'Ofis ijarasi',
		'3000000',
		'UZS',
		'01.02.2026',
		'Bobur Rahimov',
		'Tolangan',
		'Fevral oyi uchun',
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
		'Kvitansiya bor',
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
		'Target reklama',
	],
].map(mapRowToChiqim);

const initialMaoshlar = [
	[
		'P001',
		'H001',
		'Nodira Yusupova',
		'2026-01',
		'10000000',
		'6000000',
		'4000000',
		'Qarzli',
		'Avans berildi',
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
		'To‘liq yopildi',
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
		'Qoldiq keyingi oyga',
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
].map(mapRowToMaosh);

export default function App() {
	// Til holati
	const [lang, setLang] = useState<Language>('uz');
	const t = translations[lang];

	// Dark / Light rejimi
	const [isDark, setIsDark] = useState<boolean>(() => {
		return localStorage.getItem('theme') === 'dark';
	});

	useEffect(() => {
		if (isDark) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}, [isDark]);

	const [tab, setTab] = useState<
		'dashboard' | 'mijozlar' | 'hodimlar' | 'kirim' | 'chiqim' | 'maosh'
	>('dashboard');

	const [mijozlar, setMijozlar] = useState<Mijoz[]>(initialMijozlar);
	const [hodimlar, setHodimlar] = useState<Hodim[]>(initialHodimlar);
	const [kirimlar, setKirimlar] = useState<Kirim[]>(initialKirimlar);
	const [chiqimlar, setChiqimlar] = useState<Chiqim[]>(initialChiqimlar);
	const [maoshlar, setMaoshlar] = useState<MaoshYozuvi[]>(initialMaoshlar);

	const dashboardSummary = calculateDashboardSummary(
		mijozlar,
		hodimlar,
		kirimlar,
		chiqimlar,
		maoshlar,
	);

	// Amallar
	const handleAddMijoz = (yangi: Mijoz) =>
		setMijozlar(prev => [yangi, ...prev]);
	const handleUpdateMijoz = (tahrir: Mijoz) =>
		setMijozlar(prev => prev.map(m => (m.id === tahrir.id ? tahrir : m)));
	const handleDeleteMijoz = (id: string) =>
		setMijozlar(prev => prev.filter(m => m.id !== id));

	const handleAddHodim = (yangi: Hodim) =>
		setHodimlar(prev => [yangi, ...prev]);
	const handleUpdateHodim = (tahrir: Hodim) =>
		setHodimlar(prev => prev.map(h => (h.id === tahrir.id ? tahrir : h)));
	const handleDeleteHodim = (id: string) =>
		setHodimlar(prev => prev.filter(h => h.id !== id));

	const handleAddKirim = (yangi: Kirim) =>
		setKirimlar(prev => [yangi, ...prev]);
	const handleUpdateKirim = (tahrir: Kirim) =>
		setKirimlar(prev => prev.map(k => (k.id === tahrir.id ? tahrir : k)));
	const handleDeleteKirim = (id: string) =>
		setKirimlar(prev => prev.filter(k => k.id !== id));

	const handleAddChiqim = (yangi: Chiqim) =>
		setChiqimlar(prev => [yangi, ...prev]);
	const handleUpdateChiqim = (tahrir: Chiqim) =>
		setChiqimlar(prev => prev.map(x => (x.id === tahrir.id ? tahrir : x)));
	const handleDeleteChiqim = (id: string) =>
		setChiqimlar(prev => prev.filter(x => x.id !== id));

	const handleAddMaosh = (yangi: MaoshYozuvi) =>
		setMaoshlar(prev => [yangi, ...prev]);
	const handleUpdateMaosh = (tahrir: MaoshYozuvi) =>
		setMaoshlar(prev => prev.map(m => (m.id === tahrir.id ? tahrir : m)));
	const handleDeleteMaosh = (id: string) =>
		setMaoshlar(prev => prev.filter(m => m.id !== id));

	return (
		<div className='min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-12 transition-colors duration-200'>
			{/* Navigatsiya */}
			<nav className='bg-slate-900 dark:bg-slate-950 text-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-md border-b border-slate-800'>
				<div className='flex items-center gap-3'>
					<span className='text-sky-400 font-extrabold text-lg tracking-wider'>
						💼 SOFFIN_PAY
					</span>
					<span className='text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded'>
						Finance CRM
					</span>
				</div>

				{/* Menyu va Boshqaruv tugmalari */}
				<div className='flex items-center gap-4'>
					<div className='flex gap-1.5 overflow-x-auto'>
						{(
							[
								'dashboard',
								'mijozlar',
								'hodimlar',
								'kirim',
								'chiqim',
								'maosh',
							] as const
						).map(tKey => (
							<button
								key={tKey}
								onClick={() => setTab(tKey)}
								className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
									tab === tKey
										? 'bg-sky-700 text-white shadow-xs'
										: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
								}`}
							>
								{tKey === 'maosh' ? `💰 ${t[tKey]}` : t[tKey]}
							</button>
						))}
					</div>

					{/* Til almashtirgich (Language) */}
					<div className='flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs'>
						{(['uz', 'ru', 'en'] as const).map(langKey => (
							<button
								key={langKey}
								onClick={() => setLang(langKey)}
								className={`px-2 py-1 rounded uppercase font-semibold transition-all ${
									lang === langKey
										? 'bg-sky-600 text-white shadow-xs'
										: 'text-slate-400 hover:text-slate-200'
								}`}
							>
								{langKey}
							</button>
						))}
					</div>

					{/* Dark / Light Toggle tugmasi */}
					<button
						onClick={() => setIsDark(!isDark)}
						title={isDark ? "Yorug' rejim" : "Qorong'i rejim"}
						className='w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-sm transition-colors'
					>
						{isDark ? '☀️' : '🌙'}
					</button>
				</div>
			</nav>

			{/* Asosiy ekran */}
			<main className='max-w-7xl mx-auto p-6'>
				{tab === 'dashboard' && (
					<DashboardTab summary={dashboardSummary} t={t} />
				)}
				{tab === 'mijozlar' && (
					<MijozlarTab
						mijozlar={mijozlar}
						t={t}
						onAddMijoz={handleAddMijoz}
						onUpdateMijoz={handleUpdateMijoz}
						onDeleteMijoz={handleDeleteMijoz}
					/>
				)}
				{tab === 'hodimlar' && (
					<HodimlarTab
						hodimlar={hodimlar}
						t={t}
						onAddHodim={handleAddHodim}
						onUpdateHodim={handleUpdateHodim}
						onDeleteHodim={handleDeleteHodim}
					/>
				)}
				{tab === 'kirim' && (
					<KirimTab
						kirimlar={kirimlar}
						mijozlar={mijozlar}
						t={t}
						onAddKirim={handleAddKirim}
						onUpdateKirim={handleUpdateKirim}
						onDeleteKirim={handleDeleteKirim}
					/>
				)}
				{tab === 'chiqim' && (
					<ChiqimTab
						chiqimlar={chiqimlar}
						hodimlar={hodimlar}
						t={t}
						onAddChiqim={handleAddChiqim}
						onUpdateChiqim={handleUpdateChiqim}
						onDeleteChiqim={handleDeleteChiqim}
					/>
				)}
				{tab === 'maosh' && (
					<MaoshTab
						maoshlar={maoshlar}
						hodimlar={hodimlar}
						t={t}
						onAddMaosh={handleAddMaosh}
						onUpdateMaosh={handleUpdateMaosh}
						onDeleteMaosh={handleDeleteMaosh}
					/>
				)}
			</main>
		</div>
	);
}

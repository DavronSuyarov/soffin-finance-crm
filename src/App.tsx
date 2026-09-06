// src/App.tsx
import { useEffect, useState } from 'react';
import {
	addSheetRow,
	deleteSheetRow,
	fetchAllSheetData,
	updateSheetRow,
} from './api.js';
import { calculateDashboardSummary } from './finance.js';
import { Language, translations } from './i18n.js';
import {
	mapChiqimToRow,
	mapHodimToRow,
	mapKirimToRow,
	mapMaoshToRow,
	mapMijozToRow,
	mapRowToChiqim,
	mapRowToHodim,
	mapRowToKirim,
	mapRowToMaosh,
	mapRowToMijoz,
} from './mappers.js';
import { Chiqim, Hodim, Kirim, MaoshYozuvi, Mijoz } from './types.js';

import { ChiqimTab } from './components/ChiqimTab';
import { DashboardTab } from './components/DashboardTab';
import { HodimlarTab } from './components/HodimlarTab';
import { KirimTab } from './components/KirimTab';
import { MaoshTab } from './components/MaoshTab';
import { MijozlarTab } from './components/MijozlarTab';

export default function App() {
	const [lang, setLang] = useState<Language>('uz');
	const t = translations[lang];

	const [isDark, setIsDark] = useState<boolean>(
		() => localStorage.getItem('theme') === 'dark',
	);

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

	const [mijozlar, setMijozlar] = useState<Mijoz[]>([]);
	const [hodimlar, setHodimlar] = useState<Hodim[]>([]);
	const [kirimlar, setKirimlar] = useState<Kirim[]>([]);
	const [chiqimlar, setChiqimlar] = useState<Chiqim[]>([]);
	const [maoshlar, setMaoshlar] = useState<MaoshYozuvi[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	// 1. Google Sheets'dan ma'lumotlarni yuklash
	const loadData = async () => {
		try {
			setLoading(true);
			const data = await fetchAllSheetData();
			if (data.Mijozlar) setMijozlar(data.Mijozlar.map(mapRowToMijoz));
			if (data.Hodimlar) setHodimlar(data.Hodimlar.map(mapRowToHodim));
			if (data.Kirim) setKirimlar(data.Kirim.map(mapRowToKirim));
			if (data.Chiqim) setChiqimlar(data.Chiqim.map(mapRowToChiqim));
			if (data.Maosh) setMaoshlar(data.Maosh.map(mapRowToMaosh));
		} catch (err) {
			console.error("Google Sheets ma'lumotlarini yuklashda xatolik:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const dashboardSummary = calculateDashboardSummary(
		mijozlar,
		hodimlar,
		kirimlar,
		chiqimlar,
		maoshlar,
	);

	// --- CRUD va Google Sheets Sync ---

	// Mijozlar
	const handleAddMijoz = (yangi: Mijoz) => {
		setMijozlar(prev => [yangi, ...prev]);
		addSheetRow('Mijozlar', mapMijozToRow(yangi));
	};
	const handleUpdateMijoz = (tahrir: Mijoz) => {
		setMijozlar(prev => prev.map(m => (m.id === tahrir.id ? tahrir : m)));
		updateSheetRow('Mijozlar', tahrir.id, mapMijozToRow(tahrir));
	};
	const handleDeleteMijoz = (id: string) => {
		setMijozlar(prev => prev.filter(m => m.id !== id));
		deleteSheetRow('Mijozlar', id);
	};

	// Hodimlar
	const handleAddHodim = (yangi: Hodim) => {
		setHodimlar(prev => [yangi, ...prev]);
		addSheetRow('Hodimlar', mapHodimToRow(yangi));
	};
	const handleUpdateHodim = (tahrir: Hodim) => {
		setHodimlar(prev => prev.map(h => (h.id === tahrir.id ? tahrir : h)));
		updateSheetRow('Hodimlar', tahrir.id, mapHodimToRow(tahrir));
	};
	const handleDeleteHodim = (id: string) => {
		setHodimlar(prev => prev.filter(h => h.id !== id));
		deleteSheetRow('Hodimlar', id);
	};

	// Kirim
	const handleAddKirim = (yangi: Kirim) => {
		setKirimlar(prev => [yangi, ...prev]);
		addSheetRow('Kirim', mapKirimToRow(yangi));
	};
	const handleUpdateKirim = (tahrir: Kirim) => {
		setKirimlar(prev => prev.map(k => (k.id === tahrir.id ? tahrir : k)));
		updateSheetRow('Kirim', tahrir.id, mapKirimToRow(tahrir));
	};
	const handleDeleteKirim = (id: string) => {
		setKirimlar(prev => prev.filter(k => k.id !== id));
		deleteSheetRow('Kirim', id);
	};

	// Chiqim
	const handleAddChiqim = (yangi: Chiqim) => {
		setChiqimlar(prev => [yangi, ...prev]);
		addSheetRow('Chiqim', mapChiqimToRow(yangi));
	};
	const handleUpdateChiqim = (tahrir: Chiqim) => {
		setChiqimlar(prev => prev.map(x => (x.id === tahrir.id ? tahrir : x)));
		updateSheetRow('Chiqim', tahrir.id, mapChiqimToRow(tahrir));
	};
	const handleDeleteChiqim = (id: string) => {
		setChiqimlar(prev => prev.filter(x => x.id !== id));
		deleteSheetRow('Chiqim', id);
	};

	// Maosh
	const handleAddMaosh = (yangi: MaoshYozuvi) => {
		setMaoshlar(prev => [yangi, ...prev]);
		addSheetRow('Maosh', mapMaoshToRow(yangi));
	};
	const handleUpdateMaosh = (tahrir: MaoshYozuvi) => {
		setMaoshlar(prev => prev.map(m => (m.id === tahrir.id ? tahrir : m)));
		updateSheetRow('Maosh', tahrir.id, mapMaoshToRow(tahrir));
	};
	const handleDeleteMaosh = (id: string) => {
		setMaoshlar(prev => prev.filter(m => m.id !== id));
		deleteSheetRow('Maosh', id);
	};

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
					{loading && (
						<span className='text-xs text-amber-400 animate-pulse flex items-center gap-1'>
							🔄 Sinxronlanmoqda...
						</span>
					)}
				</div>

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
				{loading && mijozlar.length === 0 ? (
					<div className='flex flex-col items-center justify-center py-24 space-y-3'>
						<div className='w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin'></div>
						<div className='text-sm text-slate-500 dark:text-slate-400'>
							Google Sheets bazasiga ulanmoqda...
						</div>
					</div>
				) : (
					<>
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
					</>
				)}
			</main>
		</div>
	);
}

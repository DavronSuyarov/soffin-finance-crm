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
import { AuthLock } from './components/AuthLock';

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
			console.log("1. Google Sheets'dan so'rov yuborilmoqda...");
			const data = await fetchAllSheetData();
			console.log("2. Google Sheets'dan kelgan xom ma'lumot:", data);

			if (data.Mijozlar && data.Mijozlar.length > 0) {
				const parsed = data.Mijozlar.map(mapRowToMijoz);
				console.log("3. O'girilgan Mijozlar:", parsed);
				setMijozlar(parsed);
			}
			if (data.Hodimlar && data.Hodimlar.length > 0) {
				setHodimlar(data.Hodimlar.map(mapRowToHodim));
			}
			if (data.Kirim && data.Kirim.length > 0) {
				const parsedKirim = data.Kirim.map(mapRowToKirim);
				console.log("4. O'girilgan Kirimlar:", parsedKirim);
				setKirimlar(parsedKirim);
			}
			if (data.Chiqim && data.Chiqim.length > 0) {
				setChiqimlar(data.Chiqim.map(mapRowToChiqim));
			}
			if (data.Maosh && data.Maosh.length > 0) {
				setMaoshlar(data.Maosh.map(mapRowToMaosh));
			}
		} catch (err) {
			console.error('Yuklashda xatolik yuz berdi:', err);
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
	// LOGIN PAROL
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

	useEffect(() => {
		// Brauzer yopilguncha kirish saqlanib turadi
		const isAuth = sessionStorage.getItem('soffinp_auth') === 'true';
		setIsAuthenticated(isAuth);
	}, []);

	if (!isAuthenticated) {
		return <AuthLock onSuccess={() => setIsAuthenticated(true)} />;
	}

	return (
		<div className='min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-12 transition-colors duration-200'>
			{/* Navigatsiya */}
			<nav className='bg-slate-900 dark:bg-slate-950 text-white px-4 md:px-6 py-3 sticky top-0 z-50 shadow-md border-b border-slate-800'>
				<div className='max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
					{/* 1. Yuqori qism: Logotip, CRM yozuvi va Sozlamalar (Til + Tun rejimi) */}
					<div className='flex items-center justify-between w-full sm:w-auto gap-3'>
						<div className='flex items-center gap-2'>
							<span className='text-sky-400 font-extrabold text-base md:text-lg tracking-wider shrink-0'>
								💼 SOFFIN_PAY
							</span>
							<span className='hidden xs:inline-block text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded'>
								CRM
							</span>
							{loading && (
								<span className='text-xs text-amber-400 animate-pulse flex items-center gap-1'>
									🔄{' '}
									<span className='hidden sm:inline'>Sinxronlanmoqda...</span>
								</span>
							)}
						</div>

						{/* Mobile uchun Til va Tun rejimi shu qatorda qulay turadi */}
						<div className='flex sm:hidden items-center gap-2'>
							<div className='flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs'>
								{(['uz', 'ru', 'en'] as const).map(langKey => (
									<button
										key={langKey}
										onClick={() => setLang(langKey)}
										className={`px-1.5 py-0.5 rounded uppercase font-semibold transition-all ${
											lang === langKey
												? 'bg-sky-600 text-white'
												: 'text-slate-400'
										}`}
									>
										{langKey}
									</button>
								))}
							</div>
							<button
								onClick={() => setIsDark(!isDark)}
								className='w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs'
							>
								{isDark ? '☀️' : '🌙'}
							</button>
						</div>
					</div>

					{/* 2. Pastki/O'ng qism: Menyu tugmalari va Desktop Sozlamalari */}
					<div className='flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto overflow-hidden'>
						{/* Telefonlarda bemalol barmoq bilan gorizontal suriladigan menyu */}
						<div className='flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full sm:w-auto'>
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
									className={`px-2.5 py-1.5 rounded-md text-xs md:text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
										tab === tKey
											? 'bg-sky-700 text-white shadow-xs'
											: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
									}`}
								>
									{tKey === 'maosh' ? `💰 ${t[tKey]}` : t[tKey]}
								</button>
							))}
						</div>

						{/* Desktop (Katta ekran) sozlamalari */}
						<div className='hidden sm:flex items-center gap-3 shrink-0'>
							<div className='flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs'>
								{(['uz', 'ru', 'en'] as const).map(langKey => (
									<button
										key={langKey}
										onClick={() => setLang(langKey)}
										className={`px-2 py-1 rounded uppercase font-semibold transition-all ${
											lang === langKey
												? 'bg-sky-600 text-white'
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
					</div>
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

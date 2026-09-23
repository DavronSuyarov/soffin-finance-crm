// src/App.tsx
import { useEffect, useMemo, useState } from 'react';
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
	mapDavomatToRow,
	mapHodimToRow,
	mapKirimToRow,
	mapMaoshToRow,
	mapMijozToRow,
	mapRowToChiqim,
	mapRowToDavomat,
	mapRowToHodim,
	mapRowToKirim,
	mapRowToMaosh,
	mapRowToMijoz,
	mapRowToSoliq,
	mapSoliqToRow,
} from './mappers.js';
import {
	Chiqim,
	DavomatYozuvi,
	Hodim,
	Kirim,
	MaoshYozuvi,
	Mijoz,
	SoliqHisoboti,
} from './types.js';

import { AuthLock } from './components/AuthLock';
import { ChiqimTab } from './components/ChiqimTab';
import { DashboardTab } from './components/DashboardTab';
import { HodimlarTab } from './components/HodimlarTab';
import { KirimTab } from './components/KirimTab';
import { KpiTab } from './components/KpiTab';
import { MaoshTab } from './components/MaoshTab';
import { MijozlarTab } from './components/MijozlarTab';
import { SoliqlarTab } from './components/SoliqlarTab';

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
		| 'dashboard'
		| 'mijozlar'
		| 'soliqlar'
		| 'hodimlar'
		| 'kpiDavomat'
		| 'kirim'
		| 'chiqim'
		| 'maosh'
	>('dashboard');

	const [mijozlar, setMijozlar] = useState<Mijoz[]>([]);
	const [hodimlar, setHodimlar] = useState<Hodim[]>([]);
	const [kirimlar, setKirimlar] = useState<Kirim[]>([]);
	const [chiqimlar, setChiqimlar] = useState<Chiqim[]>([]);
	const [maoshlar, setMaoshlar] = useState<MaoshYozuvi[]>([]);
	const [soliqlar, setSoliqlar] = useState<SoliqHisoboti[]>([]);
	const [davomatlar, setDavomatlar] = useState<DavomatYozuvi[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

	useEffect(() => {
		const isAuth = sessionStorage.getItem('soffinp_auth') === 'true';
		setIsAuthenticated(isAuth);
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);
			const res = await fetchAllSheetData();

			// Apps Script to'g'ridan-to'g'ri obyekt yoki { data: ... } qaytarishini xavfsiz tekshiramiz
			const rawObj = (res as any) || {};
			const data: Record<string, string[][] | undefined> =
				rawObj.data && typeof rawObj.data === 'object' ? rawObj.data : rawObj;

			if (data.Mijozlar && Array.isArray(data.Mijozlar)) {
				setMijozlar(data.Mijozlar.map(mapRowToMijoz));
			}
			if (data.Hodimlar && Array.isArray(data.Hodimlar)) {
				setHodimlar(data.Hodimlar.map(mapRowToHodim));
			}
			if (data.Kirim && Array.isArray(data.Kirim)) {
				setKirimlar(data.Kirim.map(mapRowToKirim));
			}
			if (data.Chiqim && Array.isArray(data.Chiqim)) {
				setChiqimlar(data.Chiqim.map(mapRowToChiqim));
			}
			if (data.Maosh && Array.isArray(data.Maosh)) {
				setMaoshlar(data.Maosh.map(mapRowToMaosh));
			}
			if (data.Soliqlar && Array.isArray(data.Soliqlar)) {
				setSoliqlar(data.Soliqlar.map(mapRowToSoliq));
			}
			if (data.Davomat && Array.isArray(data.Davomat)) {
				setDavomatlar(data.Davomat.map(mapRowToDavomat));
			}
		} catch (err) {
			console.error('Yuklashda xatolik:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (isAuthenticated) {
			loadData();
		}
	}, [isAuthenticated]);

	// Dashboard umumiy statistikasi
	const dashboardSummary = useMemo(() => {
		return calculateDashboardSummary(
			mijozlar,
			hodimlar,
			kirimlar,
			chiqimlar,
			maoshlar,
			soliqlar,
		);
	}, [mijozlar, hodimlar, kirimlar, chiqimlar, maoshlar, soliqlar]);

	// --- CRUD: Mijozlar ---
	const handleAddMijoz = (yangi: Mijoz) => {
		setMijozlar(prev => [yangi, ...prev]);
		addSheetRow('Mijozlar' as any, mapMijozToRow(yangi));
	};
	const handleUpdateMijoz = (tahrir: Mijoz) => {
		setMijozlar(prev => prev.map(m => (m.id === tahrir.id ? tahrir : m)));
		updateSheetRow('Mijozlar' as any, tahrir.id, mapMijozToRow(tahrir));
	};
	const handleDeleteMijoz = (id: string) => {
		setMijozlar(prev => prev.filter(m => m.id !== id));
		deleteSheetRow('Mijozlar' as any, id);
	};

	// --- CRUD: Soliqlar ---
	const handleAddSoliq = (yangi: SoliqHisoboti) => {
		setSoliqlar(prev => [yangi, ...prev]);
		addSheetRow('Soliqlar' as any, mapSoliqToRow(yangi));
	};
	const handleUpdateSoliq = (tahrir: SoliqHisoboti) => {
		setSoliqlar(prev => prev.map(s => (s.id === tahrir.id ? tahrir : s)));
		updateSheetRow('Soliqlar' as any, tahrir.id, mapSoliqToRow(tahrir));
	};
	const handleDeleteSoliq = (id: string) => {
		setSoliqlar(prev => prev.filter(s => s.id !== id));
		deleteSheetRow('Soliqlar' as any, id);
	};

	// --- CRUD: Hodimlar ---
	const handleAddHodim = (yangi: Hodim) => {
		setHodimlar(prev => [yangi, ...prev]);
		addSheetRow('Hodimlar' as any, mapHodimToRow(yangi));
	};
	const handleUpdateHodim = (tahrir: Hodim) => {
		setHodimlar(prev => prev.map(h => (h.id === tahrir.id ? tahrir : h)));
		updateSheetRow('Hodimlar' as any, tahrir.id, mapHodimToRow(tahrir));
	};
	const handleDeleteHodim = (id: string) => {
		setHodimlar(prev => prev.filter(h => h.id !== id));
		deleteSheetRow('Hodimlar' as any, id);
	};

	// --- CRUD: Davomat ---
	const handleAddDavomat = (yangi: DavomatYozuvi) => {
		setDavomatlar(prev => [yangi, ...prev]);
		addSheetRow('Davomat' as any, mapDavomatToRow(yangi));
	};
	const handleDeleteDavomat = (id: string) => {
		setDavomatlar(prev => prev.filter(d => d.id !== id));
		deleteSheetRow('Davomat' as any, id);
	};

	// --- CRUD: Kirim ---
	const handleAddKirim = (yangi: Kirim) => {
		setKirimlar(prev => [yangi, ...prev]);
		addSheetRow('Kirim' as any, mapKirimToRow(yangi));
	};
	const handleUpdateKirim = (tahrir: Kirim) => {
		setKirimlar(prev => prev.map(k => (k.id === tahrir.id ? tahrir : k)));
		updateSheetRow('Kirim' as any, tahrir.id, mapKirimToRow(tahrir));
	};
	const handleDeleteKirim = (id: string) => {
		setKirimlar(prev => prev.filter(k => k.id !== id));
		deleteSheetRow('Kirim' as any, id);
	};

	// --- CRUD: Chiqim ---
	const handleAddChiqim = (yangi: Chiqim) => {
		setChiqimlar(prev => [yangi, ...prev]);
		addSheetRow('Chiqim' as any, mapChiqimToRow(yangi));
	};
	const handleUpdateChiqim = (tahrir: Chiqim) => {
		setChiqimlar(prev => prev.map(x => (x.id === tahrir.id ? tahrir : x)));
		updateSheetRow('Chiqim' as any, tahrir.id, mapChiqimToRow(tahrir));
	};
	const handleDeleteChiqim = (id: string) => {
		setChiqimlar(prev => prev.filter(x => x.id !== id));
		deleteSheetRow('Chiqim' as any, id);
	};

	// --- CRUD: Maosh ---
	const handleAddMaosh = (yangi: MaoshYozuvi) => {
		setMaoshlar(prev => [yangi, ...prev]);
		addSheetRow('Maosh' as any, mapMaoshToRow(yangi));
	};
	const handleUpdateMaosh = (tahrir: MaoshYozuvi) => {
		setMaoshlar(prev => prev.map(m => (m.id === tahrir.id ? tahrir : m)));
		updateSheetRow('Maosh' as any, tahrir.id, mapMaoshToRow(tahrir));
	};
	const handleDeleteMaosh = (id: string) => {
		setMaoshlar(prev => prev.filter(m => m.id !== id));
		deleteSheetRow('Maosh' as any, id);
	};

	if (!isAuthenticated) {
		return <AuthLock onSuccess={() => setIsAuthenticated(true)} />;
	}

	return (
		<div className='min-h-screen w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200'>
			{/* Responsiv Navigatsiya (Kesilmaydigan tartibda) */}
			<nav className='bg-slate-900 dark:bg-slate-950 text-white w-full sticky top-0 z-50 shadow-md border-b border-slate-800'>
				<div className='w-full px-4 sm:px-6 lg:px-8'>
					<div className='flex items-center justify-between h-16 gap-3'>
						{/* 1. Logo */}
						<div className='flex items-center gap-2 shrink-0'>
							<span className='text-sky-400 font-extrabold text-base md:text-lg tracking-wider'>
								💼 SOFFIN_PAY
							</span>
							<span className='hidden sm:inline-block text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700'>
								CRM
							</span>
							{loading && (
								<span className='text-xs text-amber-400 animate-pulse ml-1'>
									🔄
								</span>
							)}
						</div>

						{/* 2. Markaziy Tablar (Kesilmaydi, qisilmaydi, sig'masa o'z ichida aylanadi) */}
						<div className='flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 flex-1 min-w-0 px-2 justify-start'>
							{(
								[
									'dashboard',
									'mijozlar',
									'soliqlar',
									'hodimlar',
									'kpiDavomat',
									'kirim',
									'chiqim',
									'maosh',
								] as const
							).map(tKey => (
								<button
									key={tKey}
									onClick={() => setTab(tKey)}
									className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
										tab === tKey
											? 'bg-sky-600 text-white shadow-xs'
											: 'text-slate-300 hover:text-white hover:bg-slate-800'
									}`}
								>
									{tKey === 'dashboard'
										? `🏠 ${t[tKey] || 'Bosh sahifa'}`
										: tKey === 'soliqlar'
											? `📋 ${t[tKey]}`
											: tKey === 'kpiDavomat'
												? `🎯 ${t[tKey]}`
												: tKey === 'maosh'
													? `💰 ${t[tKey]}`
													: t[tKey]}
								</button>
							))}
						</div>

						{/* 3. O'ng tomon: Til va Mavzu */}
						<div className='flex items-center gap-2 shrink-0'>
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

			{/* Asosiy Ekran Konteyneri (To'liq xavfsiz padding bilan) */}
			<main className='flex-1 w-full px-3 sm:px-6 py-4 overflow-x-hidden'>
				{loading && mijozlar.length === 0 ? (
					<div className='flex flex-col items-center justify-center py-24 space-y-3'>
						<div className='w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin'></div>
						<div className='text-sm text-slate-500 dark:text-slate-400'>
							Google Sheets bazasiga ulanmoqda...
						</div>
					</div>
				) : (
					<div className='w-full'>
						{tab === 'dashboard' && (
							<DashboardTab summary={dashboardSummary} t={t} />
						)}
						{tab === 'mijozlar' && (
							<MijozlarTab
								mijozlar={mijozlar}
								hodimlar={hodimlar}
								kirimlar={kirimlar}
								t={t}
								onAddMijoz={handleAddMijoz}
								onUpdateMijoz={handleUpdateMijoz}
								onDeleteMijoz={handleDeleteMijoz}
							/>
						)}
						{tab === 'soliqlar' && (
							<SoliqlarTab
								soliqlar={soliqlar}
								mijozlar={mijozlar}
								hodimlar={hodimlar}
								t={t}
								onAddSoliq={handleAddSoliq}
								onUpdateSoliq={handleUpdateSoliq}
								onDeleteSoliq={handleDeleteSoliq}
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
						{tab === 'kpiDavomat' && (
							<KpiTab
								hodimlar={hodimlar}
								davomatlar={davomatlar}
								soliqlar={soliqlar}
								t={t}
								onAddDavomat={handleAddDavomat}
								onDeleteDavomat={handleDeleteDavomat}
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
					</div>
				)}
			</main>
		</div>
	);
}

// src/components/SoliqlarTab.tsx
import React, { useMemo, useState } from 'react';
import { parseOy } from '../finance';
import { translations } from '../i18n.js';
import {
	generatsiyaMijozSoliqlari,
	getHaqiqiyIshKuniMuddat,
} from '../taxRules';
import {
	Hodim,
	Mijoz,
	SoliqHisoboti,
	SoliqHisobotiDavriyligi,
	SoliqTuri,
	StatusSoliqHisoboti,
} from '../types.js';
import { generateNextId } from '../utils';
import { Modal } from './Modal';
import { StatusBadge } from './StatusBadge';

interface SoliqlarTabProps {
	soliqlar: SoliqHisoboti[];
	mijozlar: Mijoz[];
	hodimlar: Hodim[];
	t: (typeof translations)['uz'];
	onAddSoliq: (yangi: SoliqHisoboti) => void;
	onUpdateSoliq: (tahrirlangan: SoliqHisoboti) => void;
	onDeleteSoliq: (id: string) => void;
}

export const SoliqlarTab: React.FC<SoliqlarTabProps> = ({
	soliqlar,
	mijozlar,
	hodimlar,
	t,
	onAddSoliq,
	onUpdateSoliq,
	onDeleteSoliq,
}) => {
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [turiFilter, setTuriFilter] = useState('');
	const [davriylikFilter, setDavriylikFilter] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const [mijozId, setMijozId] = useState('');
	const [soliqTuri, setSoliqTuri] = useState<SoliqTuri>(
		'JSHOD va Ijtimoiy soliq',
	);
	const [davriyligi, setDavriyligi] =
		useState<SoliqHisobotiDavriyligi>('Oylik');
	const [davr, setDavr] = useState(parseOy(new Date().toISOString()));
	const [oxirgiMuddat, setOxirgiMuddat] = useState('');
	const [topshirilganSana, setTopshirilganSana] = useState('');
	const [holat, setHolat] = useState<StatusSoliqHisoboti>('Kutilmoqda');
	const [masulHodimId, setMasulHodimId] = useState('');
	const [izoh, setIzoh] = useState('');

	const bugunStr = new Date().toISOString().slice(0, 10);

	// Hodimlar xaritasi (ID bo'yicha ismni darhol topish uchun)
	const hodimlarMap = useMemo(() => {
		return new Map(hodimlar.map(h => [h.id, h.ism]));
	}, [hodimlar]);

	// Muddat o'tganligini tekshirib statusni yangilash
	const formatlanganSoliqlar = useMemo(() => {
		return soliqlar.map(s => {
			const masulIsm =
				s.masulHodimIsm ||
				(s.masulHodimId ? hodimlarMap.get(s.masulHodimId) || '—' : '—');
			if (
				s.holat === 'Kutilmoqda' &&
				s.oxirgiMuddat &&
				s.oxirgiMuddat < bugunStr
			) {
				return {
					...s,
					masulHodimIsm: masulIsm,
					holat: 'Kechikkan' as StatusSoliqHisoboti,
				};
			}
			return { ...s, masulHodimIsm: masulIsm };
		});
	}, [soliqlar, bugunStr, hodimlarMap]);

	const filtered = formatlanganSoliqlar
		.filter(s => {
			const matchSearch =
				(s.kompaniya || '').toLowerCase().includes(search.toLowerCase()) ||
				(s.masulHodimIsm || '').toLowerCase().includes(search.toLowerCase()) ||
				(s.davr || '').includes(search);
			const matchStatus = !statusFilter || s.holat === statusFilter;
			const matchTuri = !turiFilter || s.soliqTuri === turiFilter;
			const matchDavriylik =
				!davriylikFilter || s.davriyligi === davriylikFilter;
			return matchSearch && matchStatus && matchTuri && matchDavriylik;
		})
		.sort((a, b) => (a.oxirgiMuddat || '').localeCompare(b.oxirgiMuddat || ''));

	const jamiHisobotlar = filtered.length;
	const topshirilganlar = filtered.filter(
		s => s.holat === 'Topshirildi',
	).length;
	const kutilayotganlar = filtered.filter(s => s.holat === 'Kutilmoqda').length;
	const kechikkanlar = filtered.filter(s => s.holat === 'Kechikkan').length;

	// Har bir mijozning soliq rejimiga mos soliqlarni avtomatik generatsiya qilish
	const handleGeneratsiyaOylikSoliqlar = () => {
		const joriyTopshirishOyi = parseOy(new Date().toISOString());
		let jamiQoshildi = 0;

		const faolMijozlar = mijozlar.filter(m => m.status === 'Faol');
		if (faolMijozlar.length === 0) {
			alert(t.statuslar['Faol'] + ' — 0');
			return;
		}

		faolMijozlar.forEach(mijoz => {
			// Mas'ul xodimni aniqlash
			const masulHodim = hodimlar.find(h => h.id === mijoz.masulHodimId);
			const hodimIsm = masulHodim ? masulHodim.ism : '';

			// O'zbekiston soliq kalendariga ko'ra o'tgan oy davri va joriy oy muddati bilan generatsiya qilish
			const royxat = generatsiyaMijozSoliqlari(
				mijoz,
				joriyTopshirishOyi,
				soliqlar,
				hodimIsm,
			);

			royxat.forEach(yangi => {
				onAddSoliq(yangi);
				jamiQoshildi++;
			});
		});

		if (jamiQoshildi > 0) {
			alert(
				`${jamiQoshildi} ta soliq hisoboti to‘g‘ri hisobot davri va mas'ul buxgalterlar bilan shakllantirildi!`,
			);
		} else {
			alert(
				'Barcha faol mijozlarning hisobotlari allaqachon to‘liq shakllantirilgan.',
			);
		}
	};

	const handleOpenAdd = () => {
		setEditingId(null);
		const birinchiMijoz = mijozlar.length ? mijozlar[0] : null;
		setMijozId(birinchiMijoz ? birinchiMijoz.id : '');
		setSoliqTuri('JSHOD va Ijtimoiy soliq');
		setDavriyligi('Oylik');

		const bugun = new Date();
		const joriyYil = bugun.getFullYear();
		const joriyOy = bugun.getMonth() + 1;

		// Oylik hisobot davri: o'tgan oy
		let davrYili = joriyYil;
		let davrOyi = joriyOy - 1;
		if (davrOyi === 0) {
			davrOyi = 12;
			davrYili = joriyYil - 1;
		}
		setDavr(`${davrYili}-${String(davrOyi).padStart(2, '0')}`);

		// Muddat: joriy oyning 15-ish kuni
		setOxirgiMuddat(getHaqiqiyIshKuniMuddat(joriyYil, joriyOy, 15));
		setTopshirilganSana('');
		setHolat('Kutilmoqda');
		setMasulHodimId(birinchiMijoz?.masulHodimId || '');
		setIzoh('');
		setIsModalOpen(true);
	};

	const handleOpenEdit = (s: SoliqHisoboti) => {
		setEditingId(s.id);
		setMijozId(s.mijozId);
		setSoliqTuri(s.soliqTuri);
		setDavriyligi(s.davriyligi || 'Oylik');
		setDavr(s.davr);
		setOxirgiMuddat(s.oxirgiMuddat);
		setTopshirilganSana(s.topshirilganSana || '');
		setHolat(s.holat);
		setMasulHodimId(s.masulHodimId || '');
		setIzoh(s.izoh || '');
		setIsModalOpen(true);
	};

	const handleStatusniAlmashtirish = (s: SoliqHisoboti) => {
		const yangiHolat: StatusSoliqHisoboti =
			s.holat === 'Topshirildi' ? 'Kutilmoqda' : 'Topshirildi';
		onUpdateSoliq({
			...s,
			holat: yangiHolat,
			topshirilganSana: yangiHolat === 'Topshirildi' ? bugunStr : '',
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!mijozId) return;

		const tanlanganMijoz = mijozlar.find(m => m.id === mijozId);
		const tanlanganHodim = hodimlar.find(h => h.id === masulHodimId);

		if (editingId) {
			onUpdateSoliq({
				id: editingId,
				mijozId,
				kompaniya: tanlanganMijoz ? tanlanganMijoz.kompaniya : '—',
				soliqTuri,
				davriyligi,
				davr,
				oxirgiMuddat,
				topshirilganSana:
					holat === 'Topshirildi' ? topshirilganSana || bugunStr : '',
				holat,
				masulHodimId,
				masulHodimIsm: tanlanganHodim ? tanlanganHodim.ism : '',
				izoh: izoh.trim(),
			});
		} else {
			onAddSoliq({
				id: generateNextId('S', soliqlar),
				mijozId,
				kompaniya: tanlanganMijoz ? tanlanganMijoz.kompaniya : '—',
				soliqTuri,
				davriyligi,
				davr,
				oxirgiMuddat,
				topshirilganSana:
					holat === 'Topshirildi' ? topshirilganSana || bugunStr : '',
				holat,
				masulHodimId,
				masulHodimIsm: tanlanganHodim ? tanlanganHodim.ism : '',
				izoh: izoh.trim(),
			});
		}
		setIsModalOpen(false);
	};

	return (
		<div className='space-y-4'>
			{/* 1. FILTRLASH VA AMALLAR */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors'>
				<div className='flex flex-wrap items-center gap-3 flex-1'>
					<input
						type='text'
						placeholder={`🔍 ${t.qidirish}`}
						value={search}
						onChange={e => setSearch(e.target.value)}
						className='px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:border-sky-500 w-full sm:w-52'
					/>
					<select
						value={statusFilter}
						onChange={e => setStatusFilter(e.target.value)}
						className='px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
					>
						<option value=''>{t.barchaHolatlar}</option>
						<option value='Topshirildi'>{t.statuslar['Topshirildi']}</option>
						<option value='Kutilmoqda'>{t.statuslar['Kutilmoqda']}</option>
						<option value='Kechikkan'>{t.statuslar['Kechikkan']}</option>
					</select>
					<select
						value={davriylikFilter}
						onChange={e => setDavriylikFilter(e.target.value)}
						className='px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
					>
						<option value=''>Davriylik (Barchasi)</option>
						<option value='Oylik'>{t.davriyliklar['Oylik']}</option>
						<option value='Choraklik'>{t.davriyliklar['Choraklik']}</option>
						<option value='Yillik'>{t.davriyliklar['Yillik']}</option>
					</select>
					<select
						value={turiFilter}
						onChange={e => setTuriFilter(e.target.value)}
						className='px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500 max-w-xs'
					>
						<option value=''>
							{t.soliqTuri} ({t.barchaKategoriyalar})
						</option>
						{Object.keys(t.soliqTurlari).map(st => (
							<option key={st} value={st}>
								{t.soliqTurlari[st as keyof typeof t.soliqTurlari]}
							</option>
						))}
					</select>
				</div>

				<div className='flex items-center gap-2'>
					<button
						onClick={handleGeneratsiyaOylikSoliqlar}
						title="Mijozlar rejimiga ko'ra soliq hisobotlarini avtomatik tuzish"
						className='px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs flex items-center gap-1.5'
					>
						{t.soliqShakllantirish}
					</button>
					<button
						onClick={handleOpenAdd}
						className='px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs'
					>
						{t.yangiSoliqHisoboti}
					</button>
				</div>
			</div>

			{/* Xulosa Chiplari */}
			<div className='flex flex-wrap gap-2.5'>
				<div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300'>
					Jami:{' '}
					<span className='font-bold text-slate-900 dark:text-slate-100'>
						{jamiHisobotlar}
					</span>
				</div>
				<div className='bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-300'>
					{t.statuslar['Topshirildi']}:{' '}
					<span className='font-bold'>{topshirilganlar} ✓</span>
				</div>
				<div className='bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3.5 py-1.5 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300'>
					{t.statuslar['Kutilmoqda']}:{' '}
					<span className='font-bold'>{kutilayotganlar} ⏳</span>
				</div>
				{kechikkanlar > 0 && (
					<div className='bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3.5 py-1.5 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-300 animate-pulse'>
						{t.statuslar['Kechikkan']}:{' '}
						<span className='font-bold'>{kechikkanlar} ⚠️</span>
					</div>
				)}
			</div>

			{/* JADVAL */}
			<div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors'>
				<div className='overflow-x-auto'>
					<table className='w-full text-left text-sm text-slate-600 dark:text-slate-300'>
						<thead className='bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800'>
							<tr>
								<th className='px-4 py-3.5'>{t.id}</th>
								<th className='px-4 py-3.5'>{t.kompaniya}</th>
								<th className='px-4 py-3.5'>{t.soliqTuri}</th>
								<th className='px-4 py-3.5'>{t.davriyligi}</th>
								<th className='px-4 py-3.5'>{t.davr}</th>
								<th className='px-4 py-3.5'>{t.oxirgiMuddat}</th>
								<th className='px-4 py-3.5'>{t.topshirilganSana}</th>
								<th className='px-4 py-3.5'>{t.masulBuxgalter}</th>
								<th className='px-4 py-3.5'>{t.holat}</th>
								<th className='px-4 py-3.5'>{t.izoh}</th>
								<th className='px-4 py-3.5 text-right'>{t.amallar}</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
							{filtered.length === 0 ? (
								<tr>
									<td
										colSpan={11}
										className='text-center py-8 text-slate-400 dark:text-slate-500'
									>
										—
									</td>
								</tr>
							) : (
								filtered.map(s => {
									const muddatiKechikkan = s.holat === 'Kechikkan';

									return (
										<tr
											key={s.id}
											className={`hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors ${
												muddatiKechikkan
													? 'bg-rose-50/30 dark:bg-rose-950/20'
													: ''
											}`}
										>
											<td className='px-4 py-3 font-semibold text-slate-900 dark:text-slate-100'>
												{s.id}
											</td>
											<td className='px-4 py-3 font-medium text-slate-900 dark:text-slate-100'>
												{s.kompaniya}
											</td>
											<td className='px-4 py-3 text-xs'>
												{t.soliqTurlari[
													s.soliqTuri as keyof typeof t.soliqTurlari
												] || s.soliqTuri}
											</td>
											<td className='px-4 py-3'>
												<span
													className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
														s.davriyligi === 'Yillik'
															? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
															: s.davriyligi === 'Choraklik'
																? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
																: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
													}`}
												>
													{s.davriyligi || 'Oylik'}
												</span>
											</td>
											<td className='px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400'>
												{s.davr}
											</td>
											<td className='px-4 py-3 text-xs font-semibold'>
												<span
													className={
														muddatiKechikkan
															? 'text-rose-600 dark:text-rose-400 font-bold'
															: 'text-slate-700 dark:text-slate-300'
													}
												>
													{s.oxirgiMuddat} {muddatiKechikkan ? '⚠️' : ''}
												</span>
											</td>
											<td className='px-4 py-3 text-xs text-slate-500 dark:text-slate-400'>
												{s.topshirilganSana || '—'}
											</td>
											<td className='px-4 py-3 text-xs font-semibold text-sky-700 dark:text-sky-400'>
												{s.masulHodimIsm || '—'}
											</td>
											<td className='px-4 py-3'>
												<button
													onClick={() => handleStatusniAlmashtirish(s)}
													className='cursor-pointer'
												>
													<StatusBadge status={s.holat} t={t} />
												</button>
											</td>
											<td
												className='px-4 py-3 text-slate-500 dark:text-slate-400 text-xs max-w-[140px] truncate'
												title={s.izoh || ''}
											>
												{s.izoh || '—'}
											</td>
											<td className='px-4 py-3 text-right space-x-2'>
												<button
													onClick={() => handleOpenEdit(s)}
													className='text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded hover:bg-amber-100 transition-colors'
												>
													✏️ {t.tahrirlash}
												</button>
												<button
													onClick={() => {
														if (confirm(`${s.kompaniya} - ${s.soliqTuri}?`)) {
															onDeleteSoliq(s.id);
														}
													}}
													className='text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded hover:bg-rose-100 transition-colors'
												>
													🗑️ {t.ochirish}
												</button>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* 2. MODAL FORMA */}
			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title={editingId ? `✏️ ${t.tahrirlash}` : `📋 ${t.yangiSoliqHisoboti}`}
			>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
							{t.kompaniya} *
						</label>
						<select
							required
							value={mijozId}
							onChange={e => {
								const mId = e.target.value;
								setMijozId(mId);
								const tanlangan = mijozlar.find(m => m.id === mId);
								if (tanlangan?.masulHodimId && !editingId) {
									setMasulHodimId(tanlangan.masulHodimId);
								}
							}}
							className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
						>
							{mijozlar.map(m => (
								<option key={m.id} value={m.id}>
									{m.kompaniya} ({m.soliqRejimi || 'AOS'})
								</option>
							))}
						</select>
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.soliqTuri} *
							</label>
							<select
								value={soliqTuri}
								onChange={e => {
									const turi = e.target.value as SoliqTuri;
									setSoliqTuri(turi);
									const [yStr, mStr] = davr.split('-');
									const kun =
										turi === 'QQS' || turi.includes('Foyda') ? 20 : 15;
									setOxirgiMuddat(
										getHaqiqiyIshKuniMuddat(
											parseInt(yStr, 10),
											parseInt(mStr, 10),
											kun,
										),
									);
								}}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
							>
								{Object.keys(t.soliqTurlari).map(st => (
									<option key={st} value={st}>
										{t.soliqTurlari[st as keyof typeof t.soliqTurlari]}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.davriyligi} *
							</label>
							<select
								value={davriyligi}
								onChange={e =>
									setDavriyligi(e.target.value as SoliqHisobotiDavriyligi)
								}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
							>
								<option value='Oylik'>{t.davriyliklar['Oylik']}</option>
								<option value='Choraklik'>{t.davriyliklar['Choraklik']}</option>
								<option value='Yillik'>{t.davriyliklar['Yillik']}</option>
							</select>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.davr} *
							</label>
							<input
								type='month'
								required
								value={davr}
								onChange={e => {
									const d = e.target.value;
									setDavr(d);
									const [yStr, mStr] = d.split('-');
									const kun = soliqTuri === 'QQS' ? 20 : 15;
									setOxirgiMuddat(
										getHaqiqiyIshKuniMuddat(
											parseInt(yStr, 10),
											parseInt(mStr, 10),
											kun,
										),
									);
								}}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
							/>
						</div>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.oxirgiMuddat} *
							</label>
							<input
								type='date'
								required
								value={oxirgiMuddat}
								onChange={e => setOxirgiMuddat(e.target.value)}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
							/>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.holat}
							</label>
							<select
								value={holat}
								onChange={e => {
									const h = e.target.value as StatusSoliqHisoboti;
									setHolat(h);
									if (h === 'Topshirildi' && !topshirilganSana) {
										setTopshirilganSana(bugunStr);
									}
								}}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
							>
								<option value='Kutilmoqda'>{t.statuslar['Kutilmoqda']}</option>
								<option value='Topshirildi'>
									{t.statuslar['Topshirildi']}
								</option>
								<option value='Kechikkan'>{t.statuslar['Kechikkan']}</option>
							</select>
						</div>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.topshirilganSana}
							</label>
							<input
								type='date'
								value={topshirilganSana}
								onChange={e => setTopshirilganSana(e.target.value)}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
							/>
						</div>
					</div>

					<div>
						<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
							{t.masulBuxgalter}
						</label>
						<select
							value={masulHodimId}
							onChange={e => setMasulHodimId(e.target.value)}
							className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
						>
							<option value=''>— {t.masulBuxgalter} —</option>
							{hodimlar.map(h => (
								<option key={h.id} value={h.id}>
									{h.ism} ({h.lavozim})
								</option>
							))}
						</select>
					</div>

					<div>
						<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
							{t.izoh}
						</label>
						<textarea
							value={izoh}
							onChange={e => setIzoh(e.target.value)}
							rows={2}
							className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
						/>
					</div>

					<div className='flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800'>
						<button
							type='button'
							onClick={() => setIsModalOpen(false)}
							className='px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'
						>
							{t.bekorQilish}
						</button>
						<button
							type='submit'
							className='px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs'
						>
							{t.saqlash}
						</button>
					</div>
				</form>
			</Modal>
		</div>
	);
};

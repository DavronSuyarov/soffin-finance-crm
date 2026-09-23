// src/components/KpiTab.tsx
import React, { useMemo, useState } from 'react';
import { hisoblaHodimKPI, parseOy } from '../finance';
import { translations } from '../i18n.js';
import {
	DavomatHolati,
	DavomatYozuvi,
	Hodim,
	SoliqHisoboti,
} from '../types.js';
import { generateNextId } from '../utils';
import { Modal } from './Modal';
import { StatusBadge } from './StatusBadge';

interface KpiTabProps {
	hodimlar: Hodim[];
	davomatlar: DavomatYozuvi[];
	soliqlar: SoliqHisoboti[];
	t: (typeof translations)['uz'];
	onAddDavomat: (yangi: DavomatYozuvi) => void;
	onDeleteDavomat: (id: string) => void;
}

const fmt = (n: number) => (Number(n) || 0).toLocaleString('uz-UZ');

export const KpiTab: React.FC<KpiTabProps> = ({
	hodimlar,
	davomatlar,
	soliqlar,
	t,
	onAddDavomat,
	onDeleteDavomat,
}) => {
	const [tanlanganDavr, setTanlanganDavr] = useState(
		parseOy(new Date().toISOString()),
	);
	const [search, setSearch] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Yangi davomat yozuvi uchun holatlar
	const [hodimId, setHodimId] = useState('');
	const [sana, setSana] = useState(new Date().toISOString().slice(0, 10));
	const [kelganVaqt, setKelganVaqt] = useState('09:30');
	const [holat, setHolat] = useState<DavomatHolati>('Keldi');
	const [kechikishDaqiqa, setKechikishDaqiqa] = useState<number>(0);
	const [izoh, setIzoh] = useState('');

	// Faol xodimlar bo'yicha KPI hisob-kitoblarini shakllantirish
	const kpiHisobotlar = useMemo(() => {
		const faolHodimlar = hodimlar.filter(
			h => h.holat === 'Faol' || (h as any).status === 'Faol',
		);

		return faolHodimlar.map(h =>
			hisoblaHodimKPI(h, tanlanganDavr, davomatlar, soliqlar),
		);
	}, [hodimlar, tanlanganDavr, davomatlar, soliqlar]);

	const filteredKpi = kpiHisobotlar.filter(k =>
		k.ism.toLowerCase().includes(search.toLowerCase()),
	);

	// Shu tanlangan oy bo'yicha kiritilgan davomat yozuvlari
	const oylikDavomatlar = useMemo(() => {
		return davomatlar
			.filter(d => parseOy(d.sana) === tanlanganDavr)
			.sort((a, b) => b.sana.localeCompare(a.sana));
	}, [davomatlar, tanlanganDavr]);

	// Vaqt o'zgarganda kechikishni avtomatik aniqlash (09:30 dan keyin)
	const handleVaqtChange = (v: string) => {
		setKelganVaqt(v);
		if (!v) return;

		const [soat, daqiqa] = v.split(':').map(Number);
		const jamiDaqiqa = soat * 60 + daqiqa;
		const standartDaqiqa = 9 * 60 + 30; // 09:30

		if (jamiDaqiqa > standartDaqiqa) {
			setHolat('Kechikdi');
			setKechikishDaqiqa(jamiDaqiqa - standartDaqiqa);
		} else {
			setHolat('Keldi');
			setKechikishDaqiqa(0);
		}
	};

	const handleOpenAddDavomat = () => {
		const birinchi = hodimlar.length ? hodimlar[0].id : '';
		setHodimId(birinchi);
		setSana(new Date().toISOString().slice(0, 10));
		setKelganVaqt('09:30');
		setHolat('Keldi');
		setKechikishDaqiqa(0);
		setIzoh('');
		setIsModalOpen(true);
	};

	const handleSubmitDavomat = (e: React.FormEvent) => {
		e.preventDefault();
		if (!hodimId || !sana) return;

		onAddDavomat({
			id: generateNextId('D', davomatlar),
			hodimId,
			sana,
			kelganVaqt: holat === 'Kelmadi' ? '' : kelganVaqt,
			holat,
			kechikishDaqiqa: Number(kechikishDaqiqa) || 0,
			izoh: izoh.trim(),
		});

		setIsModalOpen(false);
	};

	return (
		<div className='space-y-6'>
			{/* 1. BOSHQARUV PANELI */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors'>
				<div className='flex flex-wrap items-center gap-3 flex-1'>
					<input
						type='text'
						placeholder={`🔍 ${t.qidirish}`}
						value={search}
						onChange={e => setSearch(e.target.value)}
						className='px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:border-sky-500 w-full sm:w-64'
					/>
					<div className='flex items-center gap-2'>
						<span className='text-xs font-semibold text-slate-500 dark:text-slate-400'>
							{t.davr}:
						</span>
						<input
							type='month'
							value={tanlanganDavr}
							onChange={e => setTanlanganDavr(e.target.value)}
							className='px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:border-sky-500 font-bold'
						/>
					</div>
				</div>

				<button
					onClick={handleOpenAddDavomat}
					className='px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs flex items-center justify-center gap-1.5'
				>
					{t.davomatKiritish}
				</button>
			</div>

			{/* 2. ASOSIY KPI VA 15% BONUS JADVALI */}
			<div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors'>
				<div className='p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between'>
					<div>
						<h3 className='font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2'>
							🎯 {t.kpiDavomat} — {tanlanganDavr}
						</h3>
						<p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>
							85% kafolatlangan shtat qismi + 15% intizom va sifat bonus fondi
						</p>
					</div>
				</div>

				<div className='overflow-x-auto'>
					<table className='w-full text-left text-sm text-slate-600 dark:text-slate-300'>
						<thead className='bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800'>
							<tr>
								<th className='px-4 py-3.5'>{t.ismFamiliya}</th>
								<th className='px-4 py-3.5'>{t.bazaviyMaosh}</th>
								<th className='px-4 py-3.5'>{t.asosiyQism}</th>
								<th className='px-4 py-3.5'>{t.bonusFond}</th>
								<th className='px-4 py-3.5'>{t.kechikishlar}</th>
								<th className='px-4 py-3.5'>{t.kelmaganKunlar}</th>
								<th className='px-4 py-3.5'>{t.kechikkanHisobotlar}</th>
								<th className='px-4 py-3.5'>{t.hisoblanganBonus}</th>
								<th className='px-4 py-3.5 text-right'>{t.yakuniyMaosh}</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
							{filteredKpi.length === 0 ? (
								<tr>
									<td
										colSpan={9}
										className='text-center py-8 text-slate-400 dark:text-slate-500'
									>
										—
									</td>
								</tr>
							) : (
								filteredKpi.map(k => {
									const bonusKamaygan = k.hisoblanganBonus < k.bonusFond;

									return (
										<tr
											key={k.hodimId}
											className='hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors'
										>
											<td className='px-4 py-3 font-semibold text-slate-900 dark:text-slate-100'>
												{k.ism}
											</td>
											<td className='px-4 py-3 text-slate-700 dark:text-slate-300'>
												{fmt(k.bazaviyMaosh)} UZS
											</td>
											<td className='px-4 py-3 font-medium text-slate-600 dark:text-slate-400'>
												{fmt(k.asosiyQism)} UZS
											</td>
											<td className='px-4 py-3 font-medium text-indigo-600 dark:text-indigo-400'>
												{fmt(k.bonusFond)} UZS
											</td>
											<td className='px-4 py-3'>
												{k.kechikishlarSoni > 0 ? (
													<span className='px-2 py-0.5 rounded text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'>
														{k.kechikishlarSoni} marta
													</span>
												) : (
													<span className='text-emerald-600 dark:text-emerald-400 text-xs font-semibold'>
														0 ✓
													</span>
												)}
											</td>
											<td className='px-4 py-3'>
												{k.sababsizKelmadiKun > 0 ? (
													<span className='px-2 py-0.5 rounded text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'>
														{k.sababsizKelmadiKun} kun
													</span>
												) : (
													<span className='text-emerald-600 dark:text-emerald-400 text-xs font-semibold'>
														0 ✓
													</span>
												)}
											</td>
											<td className='px-4 py-3'>
												{k.kechiktirilganHisobotlar > 0 ? (
													<span className='px-2 py-0.5 rounded text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'>
														{k.kechiktirilganHisobotlar} ta ⚠️
													</span>
												) : (
													<span className='text-emerald-600 dark:text-emerald-400 text-xs font-semibold'>
														0 ✓
													</span>
												)}
											</td>
											<td className='px-4 py-3'>
												<span
													className={`font-bold ${
														bonusKamaygan
															? 'text-amber-600 dark:text-amber-400'
															: 'text-emerald-600 dark:text-emerald-400'
													}`}
												>
													{fmt(k.hisoblanganBonus)} UZS
												</span>
											</td>
											<td className='px-4 py-3 text-right font-extrabold text-slate-900 dark:text-slate-100 text-sm'>
												{fmt(k.jamiHisoblanganMaosh)} UZS
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* 3. OYLIK DAVOMAT REGISTRI JADVALI */}
			<div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors'>
				<div className='p-4 border-b border-slate-200 dark:border-slate-800'>
					<h4 className='font-bold text-slate-800 dark:text-slate-100 text-sm'>
						📅 {tanlanganDavr} — Oylik Davomat Yozuvlari
					</h4>
				</div>
				<div className='overflow-x-auto'>
					<table className='w-full text-left text-sm text-slate-600 dark:text-slate-300'>
						<thead className='bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800'>
							<tr>
								<th className='px-4 py-3'>{t.sana}</th>
								<th className='px-4 py-3'>{t.ismFamiliya}</th>
								<th className='px-4 py-3'>{t.kelganVaqt}</th>
								<th className='px-4 py-3'>{t.holat}</th>
								<th className='px-4 py-3'>{t.kechikishDaqiqa}</th>
								<th className='px-4 py-3'>{t.izoh}</th>
								<th className='px-4 py-3 text-right'>{t.amallar}</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
							{oylikDavomatlar.length === 0 ? (
								<tr>
									<td
										colSpan={7}
										className='text-center py-6 text-slate-400 dark:text-slate-500'
									>
										—
									</td>
								</tr>
							) : (
								oylikDavomatlar.map(d => {
									const hodim = hodimlar.find(h => h.id === d.hodimId);

									return (
										<tr
											key={d.id}
											className='hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors'
										>
											<td className='px-4 py-2.5 font-mono text-xs'>
												{d.sana}
											</td>
											<td className='px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100'>
												{hodim?.ism || d.hodimId}
											</td>
											<td className='px-4 py-2.5 text-xs'>
												{d.kelganVaqt || '—'}
											</td>
											<td className='px-4 py-2.5'>
												<StatusBadge status={d.holat} t={t} />
											</td>
											<td className='px-4 py-2.5 text-xs'>
												{d.kechikishDaqiqa > 0 ? (
													<span className='text-rose-600 dark:text-rose-400 font-semibold'>
														+{d.kechikishDaqiqa} daq
													</span>
												) : (
													'—'
												)}
											</td>
											<td className='px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400'>
												{d.izoh || '—'}
											</td>
											<td className='px-4 py-2.5 text-right'>
												<button
													onClick={() => {
														if (confirm(`Davomat yozuvini o'chirasizmi?`)) {
															onDeleteDavomat(d.id);
														}
													}}
													className='text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400'
												>
													🗑️
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

			{/* 4. DAVOMAT QO'SHISH MODAL FORMASI */}
			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title={`⏱️ ${t.davomatKiritish}`}
			>
				<form onSubmit={handleSubmitDavomat} className='space-y-4'>
					<div>
						<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
							{t.hodimlar} *
						</label>
						<select
							required
							value={hodimId}
							onChange={e => setHodimId(e.target.value)}
							className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
						>
							{hodimlar
								.filter(h => h.holat === 'Faol' || (h as any).status === 'Faol')
								.map(h => (
									<option key={h.id} value={h.id}>
										{h.ism} ({h.lavozim})
									</option>
								))}
						</select>
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.sana} *
							</label>
							<input
								type='date'
								required
								value={sana}
								onChange={e => setSana(e.target.value)}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
							/>
						</div>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.kelganVaqt}
							</label>
							<input
								type='time'
								value={kelganVaqt}
								onChange={e => handleVaqtChange(e.target.value)}
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
								onChange={e => setHolat(e.target.value as DavomatHolati)}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
							>
								<option value='Keldi'>{t.statuslar['Keldi']}</option>
								<option value='Kechikdi'>{t.statuslar['Kechikdi']}</option>
								<option value='Kelmadi'>{t.statuslar['Kelmadi']}</option>
								<option value='Sababli'>{t.statuslar['Sababli']}</option>
							</select>
						</div>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.kechikishDaqiqa}
							</label>
							<input
								type='number'
								min='0'
								value={kechikishDaqiqa}
								onChange={e => setKechikishDaqiqa(Number(e.target.value))}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
							/>
						</div>
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

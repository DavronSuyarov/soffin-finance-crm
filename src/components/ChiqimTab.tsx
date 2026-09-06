// src/components/ChiqimTab.tsx
import React, { useState } from 'react';
import { translations } from '../i18n.js';
import {
	Chiqim,
	ChiqimKategoriya,
	Currency,
	Hodim,
	StatusTranzaksiya,
} from '../types.js';
import { Modal } from './Modal';
import { StatusBadge } from './StatusBadge';

interface ChiqimTabProps {
	chiqimlar: Chiqim[];
	hodimlar: Hodim[];
	t: (typeof translations)['uz'];
	onAddChiqim: (yangi: Chiqim) => void;
	onUpdateChiqim: (tahrirlangan: Chiqim) => void;
	onDeleteChiqim: (id: string) => void;
}

const fmt = (n: number) => n.toLocaleString('uz-UZ');

export const ChiqimTab: React.FC<ChiqimTabProps> = ({
	chiqimlar,
	hodimlar,
	t,
	onAddChiqim,
	onUpdateChiqim,
	onDeleteChiqim,
}) => {
	const [search, setSearch] = useState('');
	const [katFilter, setKatFilter] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const [kategoriya, setKategoriya] =
		useState<ChiqimKategoriya>('Ofis xarajat');
	const [tavsif, setTavsif] = useState('');
	const [summa, setSumma] = useState<number | ''>('');
	const [valyuta, setValyuta] = useState<Currency>('UZS');
	const [sana, setSana] = useState('');
	const [masulHodimId, setMasulHodimId] = useState('');
	const [holat, setHolat] = useState<StatusTranzaksiya>('Tolangan');
	const [izoh, setIzoh] = useState('');

	const filtered = chiqimlar.filter(x => {
		const matchSearch =
			x.tavsif.toLowerCase().includes(search.toLowerCase()) ||
			(x.masulIsm && x.masulIsm.toLowerCase().includes(search.toLowerCase()));
		const matchKat = !katFilter || x.kategoriya === katFilter;
		return matchSearch && matchKat;
	});

	const jamiChiqim = filtered.reduce((acc, x) => acc + x.summa, 0);

	const handleOpenAdd = () => {
		setEditingId(null);
		setKategoriya('Ofis xarajat');
		setTavsif('');
		setSumma('');
		setValyuta('UZS');
		setSana(new Date().toLocaleDateString('uz-UZ'));
		setMasulHodimId(hodimlar.length ? hodimlar[0].id : '');
		setHolat('Tolangan');
		setIzoh('');
		setIsModalOpen(true);
	};

	const handleOpenEdit = (x: Chiqim) => {
		setEditingId(x.id);
		setKategoriya(x.kategoriya);
		setTavsif(x.tavsif);
		setSumma(x.summa);
		setValyuta(x.valyuta);
		setSana(x.sana);
		setMasulHodimId(x.masulHodimId || (hodimlar.length ? hodimlar[0].id : ''));
		setHolat(x.holat);
		setIzoh(x.izoh || '');
		setIsModalOpen(true);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!tavsif.trim() || !summa || Number(summa) <= 0) return;

		const tanlanganHodim = hodimlar.find(h => h.id === masulHodimId);
		const masulIsm = tanlanganHodim ? tanlanganHodim.ism : '';

		if (editingId) {
			onUpdateChiqim({
				id: editingId,
				kategoriya,
				tavsif: tavsif.trim(),
				summa: Number(summa),
				valyuta,
				sana: sana || new Date().toLocaleDateString('uz-UZ'),
				masulHodimId,
				masulIsm,
				holat,
				izoh: izoh.trim(),
			});
		} else {
			onAddChiqim({
				id: `X${String(chiqimlar.length + 1).padStart(3, '0')}`,
				kategoriya,
				tavsif: tavsif.trim(),
				summa: Number(summa),
				valyuta,
				sana: sana || new Date().toLocaleDateString('uz-UZ'),
				masulHodimId,
				masulIsm,
				holat,
				izoh: izoh.trim(),
			});
		}
		setIsModalOpen(false);
	};

	return (
		<div className='space-y-4'>
			{/* 1. FILTRLASH PANELI */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors'>
				<div className='flex flex-wrap items-center gap-3 flex-1'>
					<input
						type='text'
						placeholder={`🔍 ${t.qidirish}`}
						value={search}
						onChange={e => setSearch(e.target.value)}
						className='px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:border-sky-500 w-full sm:w-64'
					/>
					{/* Kategoriyalar filtri (Ko'p tilli) */}
					<select
						value={katFilter}
						onChange={e => setKatFilter(e.target.value)}
						className='px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
					>
						<option value=''>{t.barchaKategoriyalar}</option>
						<option value='Ijara'>{t.chiqimKategoriyalari['Ijara']}</option>
						<option value='Ofis xarajat'>
							{t.chiqimKategoriyalari['Ofis xarajat']}
						</option>
						<option value='Kommunal'>
							{t.chiqimKategoriyalari['Kommunal']}
						</option>
						<option value='Marketing'>
							{t.chiqimKategoriyalari['Marketing']}
						</option>
						<option value='Transport'>
							{t.chiqimKategoriyalari['Transport']}
						</option>
						<option value="Dasturiy ta'minot">
							{t.chiqimKategoriyalari["Dasturiy ta'minot"]}
						</option>
						<option value='Boshqa'>{t.chiqimKategoriyalari['Boshqa']}</option>
					</select>
				</div>
				<button
					onClick={handleOpenAdd}
					className='px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs'
				>
					{t.yangiChiqim}
				</button>
			</div>

			<div className='flex'>
				<div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300'>
					{t.chiqim}:{' '}
					<span className='font-bold text-rose-600 dark:text-rose-400'>
						{fmt(jamiChiqim)} UZS
					</span>
				</div>
			</div>

			{/* JADVAL */}
			<div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors'>
				<div className='overflow-x-auto'>
					<table className='w-full text-left text-sm text-slate-600 dark:text-slate-300'>
						<thead className='bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800'>
							<tr>
								<th className='px-4 py-3.5'>{t.id}</th>
								<th className='px-4 py-3.5'>{t.kategoriya}</th>
								<th className='px-4 py-3.5'>{t.tavsif}</th>
								<th className='px-4 py-3.5'>{t.summa}</th>
								<th className='px-4 py-3.5'>{t.sana}</th>
								<th className='px-4 py-3.5'>{t.masulShaxs}</th>
								<th className='px-4 py-3.5'>{t.holat}</th>
								<th className='px-4 py-3.5'>{t.izoh}</th>
								<th className='px-4 py-3.5 text-right'>{t.amallar}</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
							{filtered.length === 0 ? (
								<tr>
									<td
										colSpan={9}
										className='text-center py-8 text-slate-400 dark:text-slate-500'
									>
										—
									</td>
								</tr>
							) : (
								filtered.map(x => (
									<tr
										key={x.id}
										className='hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors'
									>
										<td className='px-4 py-3 font-semibold text-slate-900 dark:text-slate-100'>
											{x.id}
										</td>
										{/* Kategoriya tarjimasi */}
										<td className='px-4 py-3 font-medium text-slate-800 dark:text-slate-200'>
											{t.chiqimKategoriyalari[
												x.kategoriya as keyof typeof t.chiqimKategoriyalari
											] || x.kategoriya}
										</td>
										<td className='px-4 py-3'>{x.tavsif}</td>
										<td className='px-4 py-3 font-bold text-rose-600 dark:text-rose-400'>
											{fmt(x.summa)} {x.valyuta}
										</td>
										<td className='px-4 py-3 text-slate-500 dark:text-slate-400'>
											{x.sana}
										</td>
										<td className='px-4 py-3 text-slate-500 dark:text-slate-400'>
											{x.masulIsm || '—'}
										</td>
										{/* Holat tarjimasi */}
										<td className='px-4 py-3'>
											<StatusBadge status={x.holat} t={t} />
										</td>
										<td
											className='px-4 py-3 text-slate-500 dark:text-slate-400 text-xs max-w-[180px] truncate'
											title={x.izoh || ''}
										>
											{x.izoh || '—'}
										</td>
										<td className='px-4 py-3 text-right space-x-2'>
											<button
												onClick={() => handleOpenEdit(x)}
												className='text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded hover:bg-amber-100 transition-colors'
											>
												✏️ {t.tahrirlash}
											</button>
											<button
												onClick={() => {
													if (confirm(`${x.tavsif}?`)) {
														onDeleteChiqim(x.id);
													}
												}}
												className='text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded hover:bg-rose-100 transition-colors'
											>
												🗑️ {t.ochirish}
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* 2. MODAL FORMA */}
			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title={editingId ? `✏️ ${t.tahrirlash}` : `⬇️ ${t.yangiChiqim}`}
			>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.kategoriya} *
							</label>
							{/* Modal ichidagi kategoriyalar tanlovi */}
							<select
								value={kategoriya}
								onChange={e =>
									setKategoriya(e.target.value as ChiqimKategoriya)
								}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
							>
								<option value='Ijara'>{t.chiqimKategoriyalari['Ijara']}</option>
								<option value='Ofis xarajat'>
									{t.chiqimKategoriyalari['Ofis xarajat']}
								</option>
								<option value='Kommunal'>
									{t.chiqimKategoriyalari['Kommunal']}
								</option>
								<option value='Marketing'>
									{t.chiqimKategoriyalari['Marketing']}
								</option>
								<option value='Transport'>
									{t.chiqimKategoriyalari['Transport']}
								</option>
								<option value="Dasturiy ta'minot">
									{t.chiqimKategoriyalari["Dasturiy ta'minot"]}
								</option>
								<option value='Boshqa'>
									{t.chiqimKategoriyalari['Boshqa']}
								</option>
							</select>
						</div>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.holat}
							</label>
							{/* Modal ichidagi holatlar tanlovi */}
							<select
								value={holat}
								onChange={e => setHolat(e.target.value as StatusTranzaksiya)}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
							>
								<option value='Tolangan'>{t.statuslar['Tolangan']}</option>
								<option value='Kutilmoqda'>{t.statuslar['Kutilmoqda']}</option>
								<option value='Bekor'>{t.statuslar['Bekor']}</option>
							</select>
						</div>
					</div>

					<div>
						<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
							{t.tavsif} *
						</label>
						<input
							type='text'
							required
							value={tavsif}
							onChange={e => setTavsif(e.target.value)}
							className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
						/>
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.summa} *
							</label>
							<input
								type='number'
								required
								min={1}
								value={summa}
								onChange={e =>
									setSumma(e.target.value ? Number(e.target.value) : '')
								}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
							/>
						</div>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								Valyuta
							</label>
							<select
								value={valyuta}
								onChange={e => setValyuta(e.target.value as Currency)}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
							>
								<option value='UZS'>UZS</option>
								<option value='USD'>USD</option>
								<option value='EUR'>EUR</option>
							</select>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.masulShaxs}
							</label>
							<select
								value={masulHodimId}
								onChange={e => setMasulHodimId(e.target.value)}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
							>
								<option value=''>—</option>
								{hodimlar.map(h => (
									<option key={h.id} value={h.id}>
										{h.ism} ({h.lavozim})
									</option>
								))}
							</select>
						</div>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.sana}
							</label>
							<input
								type='text'
								value={sana}
								onChange={e => setSana(e.target.value)}
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

// src/components/MijozlarTab.tsx
import React, { useMemo, useState } from 'react';
import { hisoblaMijozlarQarzi } from '../finance';
import { translations } from '../i18n.js';
import { Kirim, Mijoz, SoliqRejimi, StatusMijoz } from '../types.js';
import { generateNextId } from '../utils';
import { Modal } from './Modal';
import { StatusBadge } from './StatusBadge';

interface MijozlarTabProps {
	mijozlar: Mijoz[];
	kirimlar?: Kirim[];
	t: (typeof translations)['uz'];
	onAddMijoz: (yangi: Mijoz) => void;
	onUpdateMijoz: (tahrirlangan: Mijoz) => void;
	onDeleteMijoz: (id: string) => void;
}

const fmt = (n: number) => (Number(n) || 0).toLocaleString('uz-UZ');

export const MijozlarTab: React.FC<MijozlarTabProps> = ({
	mijozlar,
	kirimlar = [],
	t,
	onAddMijoz,
	onUpdateMijoz,
	onDeleteMijoz,
}) => {
	const [search, setSearch] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const [kompaniya, setKompaniya] = useState('');
	const [kontakt, setKontakt] = useState('');
	const [telefon, setTelefon] = useState('');
	const [inn, setInn] = useState('');
	const [tarifSummasi, setTarifSummasi] = useState<number | ''>('');
	const [tolovKuni, setTolovKuni] = useState<number>(5);
	const [soliqRejimi, setSoliqRejimi] = useState<SoliqRejimi>('AOS');
	const [status, setStatus] = useState<StatusMijoz>('Faol');
	const [izoh, setIzoh] = useState('');

	// Har bir mijoz bo'yicha haqiqiy debitorlik qarzini hisoblaymiz
	const debitorlikMap = useMemo(() => {
		const royxat = hisoblaMijozlarQarzi(mijozlar, kirimlar);
		return new Map(royxat.map(d => [d.mijozId, d.qarzSummasi]));
	}, [mijozlar, kirimlar]);

	const filtered = mijozlar
		.filter(
			m =>
				(m.kompaniya || '').toLowerCase().includes(search.toLowerCase()) ||
				(m.kontakt || '').toLowerCase().includes(search.toLowerCase()) ||
				(m.soliqRejimi || '').toLowerCase().includes(search.toLowerCase()) ||
				(m.inn || '').includes(search),
		)
		.sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));

	const handleOpenAdd = () => {
		setEditingId(null);
		setKompaniya('');
		setKontakt('');
		setTelefon('');
		setInn('');
		setTarifSummasi('');
		setTolovKuni(5);
		setSoliqRejimi('AOS');
		setStatus('Faol');
		setIzoh('');
		setIsModalOpen(true);
	};

	const handleOpenEdit = (m: Mijoz) => {
		setEditingId(m.id);
		setKompaniya(m.kompaniya);
		setKontakt(m.kontakt);
		setTelefon(m.telefon);
		setInn(m.inn);
		setTarifSummasi(m.tarifSummasi || '');
		setTolovKuni(m.tolovKuni || 5);
		setSoliqRejimi(m.soliqRejimi || 'AOS');
		setStatus(m.status);
		setIzoh(m.izoh || '');
		setIsModalOpen(true);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!kompaniya.trim()) return;

		const tSumma = Number(tarifSummasi) || 0;
		const tKuni = Number(tolovKuni) || 5;

		if (editingId) {
			const mavjud = mijozlar.find(m => m.id === editingId);
			onUpdateMijoz({
				id: editingId,
				kompaniya: kompaniya.trim(),
				kontakt: kontakt.trim(),
				telefon: telefon.trim(),
				inn: inn.trim(),
				tarifSummasi: tSumma,
				tolovKuni: tKuni,
				soliqRejimi,
				status,
				izoh: izoh.trim(),
				sana: mavjud ? mavjud.sana : new Date().toLocaleDateString('uz-UZ'),
			});
		} else {
			onAddMijoz({
				id: generateNextId('M', mijozlar),
				kompaniya: kompaniya.trim(),
				kontakt: kontakt.trim(),
				telefon: telefon.trim(),
				inn: inn.trim(),
				tarifSummasi: tSumma,
				tolovKuni: tKuni,
				soliqRejimi,
				status,
				izoh: izoh.trim(),
				sana: new Date().toLocaleDateString('uz-UZ'),
			});
		}
		setIsModalOpen(false);
	};

	// Soliq rejimi nishoni (badge) uchun ranglar
	const renderRejimBadge = (rejim?: SoliqRejimi) => {
		const val = rejim || 'AOS';
		let cls =
			'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
		if (val === 'Umumbelgilangan') {
			cls =
				'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
		} else if (val === 'Nodavlat/NHT') {
			cls =
				'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
		}

		return (
			<span
				className={`px-2 py-0.5 rounded text-xs font-semibold border ${cls}`}
			>
				{val}
			</span>
		);
	};

	return (
		<div className='space-y-4'>
			{/* Qidiruv va Yangi Mijoz tugmasi */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors'>
				<div className='relative flex-1 max-w-md'>
					<input
						type='text'
						placeholder={`🔍 ${t.qidirish}`}
						value={search}
						onChange={e => setSearch(e.target.value)}
						className='w-full pl-3 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:border-sky-500'
					/>
				</div>
				<button
					onClick={handleOpenAdd}
					className='inline-flex items-center justify-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs'
				>
					{t.yangiMijoz}
				</button>
			</div>

			{/* Jadval */}
			<div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors'>
				<div className='overflow-x-auto'>
					<table className='w-full text-left text-sm text-slate-600 dark:text-slate-300'>
						<thead className='bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800'>
							<tr>
								<th className='px-4 py-3.5'>{t.id}</th>
								<th className='px-4 py-3.5'>{t.kompaniya}</th>
								<th className='px-4 py-3.5'>{t.soliqRejimi}</th>
								<th className='px-4 py-3.5'>{t.masulShaxs}</th>
								<th className='px-4 py-3.5'>{t.telefon}</th>
								<th className='px-4 py-3.5'>{t.inn}</th>
								<th className='px-4 py-3.5'>{t.tarifSummasi}</th>
								<th className='px-4 py-3.5'>{t.tolovKuni}</th>
								<th className='px-4 py-3.5'>{t.qoldiq}</th>
								<th className='px-4 py-3.5'>{t.holat}</th>
								<th className='px-4 py-3.5'>{t.izoh}</th>
								<th className='px-4 py-3.5 text-right'>{t.amallar}</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
							{filtered.length === 0 ? (
								<tr>
									<td
										colSpan={12}
										className='text-center py-8 text-slate-400 dark:text-slate-500'
									>
										—
									</td>
								</tr>
							) : (
								filtered.map(m => {
									const qarz = debitorlikMap.get(m.id) || 0;
									const sanaMatni = `Har oyning ${m.tolovKuni || 5}-sanasi`;

									return (
										<tr
											key={m.id}
											className='hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors'
										>
											<td className='px-4 py-3 font-semibold text-slate-900 dark:text-slate-100'>
												{m.id}
											</td>
											<td className='px-4 py-3 font-medium text-slate-900 dark:text-slate-100'>
												{m.kompaniya}
											</td>
											<td className='px-4 py-3'>
												{renderRejimBadge(m.soliqRejimi)}
											</td>
											<td className='px-4 py-3'>{m.kontakt || '—'}</td>
											<td className='px-4 py-3 text-slate-500 dark:text-slate-400'>
												{m.telefon || '—'}
											</td>
											<td className='px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400'>
												{m.inn || '—'}
											</td>
											<td className='px-4 py-3 font-bold text-slate-800 dark:text-slate-100'>
												{fmt(m.tarifSummasi || 0)} UZS
											</td>
											<td className='px-4 py-3 text-xs text-slate-500 dark:text-slate-400'>
												{sanaMatni}
											</td>
											<td className='px-4 py-3'>
												{qarz > 0 ? (
													<span className='font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded text-xs inline-block'>
														{fmt(qarz)} UZS ⚠️
													</span>
												) : (
													<span className='text-emerald-600 dark:text-emerald-400 text-xs font-semibold'>
														Qarzi yo‘q ✓
													</span>
												)}
											</td>
											<td className='px-4 py-3'>
												<StatusBadge status={m.status} t={t} />
											</td>
											<td
												className='px-4 py-3 text-slate-500 dark:text-slate-400 text-xs max-w-[150px] truncate'
												title={m.izoh || ''}
											>
												{m.izoh || '—'}
											</td>
											<td className='px-4 py-3 text-right space-x-2'>
												<button
													onClick={() => handleOpenEdit(m)}
													className='text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded hover:bg-amber-100 transition-colors'
												>
													✏️ {t.tahrirlash}
												</button>
												<button
													onClick={() => {
														if (confirm(`${m.kompaniya}?`)) {
															onDeleteMijoz(m.id);
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

			{/* Modal Forma */}
			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title={editingId ? `✏️ ${t.tahrirlash}` : `👤 ${t.yangiMijoz}`}
			>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
							{t.kompaniya} *
						</label>
						<input
							type='text'
							required
							value={kompaniya}
							onChange={e => setKompaniya(e.target.value)}
							className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
						/>
					</div>

					{/* Soliq Rejimi */}
					<div>
						<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
							{t.soliqRejimi} *
						</label>
						<select
							value={soliqRejimi}
							onChange={e => setSoliqRejimi(e.target.value as SoliqRejimi)}
							className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500 font-medium'
						>
							<option value='AOS'>{t.soliqRejimlari['AOS']}</option>
							<option value='Umumbelgilangan'>
								{t.soliqRejimlari['Umumbelgilangan']}
							</option>
							<option value='Nodavlat/NHT'>
								{t.soliqRejimlari['Nodavlat/NHT']}
							</option>
						</select>
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.kontakt}
							</label>
							<input
								type='text'
								value={kontakt}
								onChange={e => setKontakt(e.target.value)}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
							/>
						</div>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.telefon}
							</label>
							<input
								type='text'
								value={telefon}
								onChange={e => setTelefon(e.target.value)}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
							/>
						</div>
					</div>
					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.inn}
							</label>
							<input
								type='text'
								value={inn}
								onChange={e => setInn(e.target.value)}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
							/>
						</div>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.holat}
							</label>
							<select
								value={status}
								onChange={e => setStatus(e.target.value as StatusMijoz)}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
							>
								<option value='Faol'>{t.statuslar['Faol']}</option>
								<option value='Kutilmoqda'>{t.statuslar['Kutilmoqda']}</option>
								<option value='Nofaol'>{t.statuslar['Nofaol']}</option>
							</select>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.tarifSummasi} *
							</label>
							<input
								type='number'
								required
								min='0'
								value={tarifSummasi}
								onChange={e =>
									setTarifSummasi(e.target.value ? Number(e.target.value) : '')
								}
								placeholder='3000000'
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500 font-bold'
							/>
						</div>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.tolovKuni} *
							</label>
							<input
								type='number'
								required
								min='1'
								max='31'
								value={tolovKuni}
								onChange={e => setTolovKuni(Number(e.target.value))}
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

// src/components/MijozlarTab.tsx
import React, { useState } from 'react';
import { translations } from '../i18n.js';
import { Mijoz, StatusMijoz } from '../types.js';
import { generateNextId } from '../utils';
import { Modal } from './Modal';
import { StatusBadge } from './StatusBadge';

interface MijozlarTabProps {
	mijozlar: Mijoz[];
	t: (typeof translations)['uz'];
	onAddMijoz: (yangi: Mijoz) => void;
	onUpdateMijoz: (tahrirlangan: Mijoz) => void;
	onDeleteMijoz: (id: string) => void;
}

export const MijozlarTab: React.FC<MijozlarTabProps> = ({
	mijozlar,
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
	const [status, setStatus] = useState<StatusMijoz>('Faol');
	const [izoh, setIzoh] = useState('');

	const filtered = mijozlar.filter(
		m =>
			m.kompaniya.toLowerCase().includes(search.toLowerCase()) ||
			m.kontakt.toLowerCase().includes(search.toLowerCase()) ||
			m.inn.includes(search),
	);

	const handleOpenAdd = () => {
		setEditingId(null);
		setKompaniya('');
		setKontakt('');
		setTelefon('');
		setInn('');
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
		setStatus(m.status);
		setIzoh(m.izoh || '');
		setIsModalOpen(true);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!kompaniya.trim()) return;

		if (editingId) {
			const mavjud = mijozlar.find(m => m.id === editingId);
			onUpdateMijoz({
				id: editingId,
				kompaniya: kompaniya.trim(),
				kontakt: kontakt.trim(),
				telefon: telefon.trim(),
				inn: inn.trim(),
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
				status,
				izoh: izoh.trim(),
				sana: new Date().toLocaleDateString('uz-UZ'),
			});
		}
		setIsModalOpen(false);
	};

	return (
		<div className='space-y-4'>
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

			<div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors'>
				<div className='overflow-x-auto'>
					<table className='w-full text-left text-sm text-slate-600 dark:text-slate-300'>
						<thead className='bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800'>
							<tr>
								<th className='px-4 py-3.5'>{t.id}</th>
								<th className='px-4 py-3.5'>{t.kompaniya}</th>
								<th className='px-4 py-3.5'>{t.masulShaxs}</th>
								<th className='px-4 py-3.5'>{t.telefon}</th>
								<th className='px-4 py-3.5'>{t.inn}</th>
								<th className='px-4 py-3.5'>{t.holat}</th>
								<th className='px-4 py-3.5'>{t.izoh}</th>
								<th className='px-4 py-3.5 text-right'>{t.amallar}</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
							{filtered.length === 0 ? (
								<tr>
									<td
										colSpan={8}
										className='text-center py-8 text-slate-400 dark:text-slate-500'
									>
										—
									</td>
								</tr>
							) : (
								filtered.map(m => (
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
										<td className='px-4 py-3'>{m.kontakt}</td>
										<td className='px-4 py-3 text-slate-500 dark:text-slate-400'>
											{m.telefon}
										</td>
										<td className='px-4 py-3 text-slate-500 dark:text-slate-400'>
											{m.inn}
										</td>
										<td className='px-4 py-3'>
											<StatusBadge status={m.status} />
										</td>
										<td
											className='px-4 py-3 text-slate-500 dark:text-slate-400 text-xs max-w-[180px] truncate'
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
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

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
					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.masulShaxs}
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
								<option value='Faol'>Faol</option>
								<option value='Kutilmoqda'>Kutilmoqda</option>
								<option value='Nofaol'>Nofaol</option>
							</select>
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

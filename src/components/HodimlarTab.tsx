// src/components/HodimlarTab.tsx
import React, { useState } from 'react';
import { Hodim, StatusHodim } from '../types.js';
import { StatusBadge } from './StatusBadge';
import { Modal } from './Modal';
import { translations } from '../i18n.js';

interface HodimlarTabProps {
	hodimlar: Hodim[];
	t: (typeof translations)['uz'];
	onAddHodim: (yangi: Hodim) => void;
	onUpdateHodim: (tahrir: Hodim) => void;
	onDeleteHodim: (id: string) => void;
}

const fmt = (n: number) => n.toLocaleString('uz-UZ');

export const HodimlarTab: React.FC<HodimlarTabProps> = ({
	hodimlar,
	t,
	onAddHodim,
	onUpdateHodim,
	onDeleteHodim,
}) => {
	const [search, setSearch] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const [ism, setIsm] = useState('');
	const [lavozim, setLavozim] = useState('');
	const [bolim, setBolim] = useState('Moliya');
	const [oylikMaosh, setOylikMaosh] = useState<number | ''>('');
	const [telefon, setTelefon] = useState('');
	const [holat, setHolat] = useState<StatusHodim>('Faol');
	const [izoh, setIzoh] = useState('');

	const filtered = hodimlar.filter(
		h =>
			h.ism.toLowerCase().includes(search.toLowerCase()) ||
			h.lavozim.toLowerCase().includes(search.toLowerCase()) ||
			h.bolim.toLowerCase().includes(search.toLowerCase()),
	);

	const jamiMaoshFond = filtered.reduce((acc, h) => acc + h.oylikMaosh, 0);

	const handleOpenAdd = () => {
		setEditingId(null);
		setIsm('');
		setLavozim('');
		setBolim('Moliya');
		setOylikMaosh('');
		setTelefon('');
		setHolat('Faol');
		setIzoh('');
		setIsModalOpen(true);
	};

	const handleOpenEdit = (h: Hodim) => {
		setEditingId(h.id);
		setIsm(h.ism);
		setLavozim(h.lavozim);
		setBolim(h.bolim);
		setOylikMaosh(h.oylikMaosh);
		setTelefon(h.telefon);
		setHolat(h.holat);
		setIzoh(h.izoh || '');
		setIsModalOpen(true);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!ism.trim() || !oylikMaosh || Number(oylikMaosh) <= 0) return;

		if (editingId) {
			const mavjud = hodimlar.find(h => h.id === editingId);
			onUpdateHodim({
				id: editingId,
				ism: ism.trim(),
				lavozim: lavozim.trim(),
				bolim: bolim.trim(),
				oylikMaosh: Number(oylikMaosh),
				telefon: telefon.trim(),
				holat,
				sana: mavjud ? mavjud.sana : new Date().toLocaleDateString('uz-UZ'),
				izoh: izoh.trim(),
			});
		} else {
			onAddHodim({
				id: `H${String(hodimlar.length + 1).padStart(3, '0')}`,
				ism: ism.trim(),
				lavozim: lavozim.trim(),
				bolim: bolim.trim(),
				oylikMaosh: Number(oylikMaosh),
				telefon: telefon.trim(),
				holat,
				sana: new Date().toLocaleDateString('uz-UZ'),
				izoh: izoh.trim(),
			});
		}
		setIsModalOpen(false);
	};

	return (
		<div className='space-y-4'>
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors'>
				<input
					type='text'
					placeholder={`🔍 ${t.qidirish}`}
					value={search}
					onChange={e => setSearch(e.target.value)}
					className='px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:border-sky-500 w-full sm:w-72'
				/>
				<button
					onClick={handleOpenAdd}
					className='px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs'
				>
					{t.yangiHodim}
				</button>
			</div>

			<div className='flex'>
				<div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300'>
					{t.oylikMaosh}:{' '}
					<span className='font-bold text-slate-900 dark:text-slate-100'>
						{fmt(jamiMaoshFond)} UZS
					</span>
				</div>
			</div>

			<div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors'>
				<div className='overflow-x-auto'>
					<table className='w-full text-left text-sm text-slate-600 dark:text-slate-300'>
						<thead className='bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800'>
							<tr>
								<th className='px-4 py-3.5'>{t.id}</th>
								<th className='px-4 py-3.5'>{t.ismFamiliya}</th>
								<th className='px-4 py-3.5'>{t.lavozim}</th>
								<th className='px-4 py-3.5'>{t.bolim}</th>
								<th className='px-4 py-3.5'>{t.oylikMaosh}</th>
								<th className='px-4 py-3.5'>{t.telefon}</th>
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
								filtered.map(h => (
									<tr
										key={h.id}
										className='hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors'
									>
										<td className='px-4 py-3 font-semibold text-slate-900 dark:text-slate-100'>
											{h.id}
										</td>
										<td className='px-4 py-3 font-medium text-slate-900 dark:text-slate-100'>
											{h.ism}
										</td>
										<td className='px-4 py-3'>{h.lavozim}</td>
										<td className='px-4 py-3 text-slate-500 dark:text-slate-400'>
											{h.bolim}
										</td>
										<td className='px-4 py-3 font-bold text-slate-900 dark:text-slate-100'>
											{fmt(h.oylikMaosh)} UZS
										</td>
										<td className='px-4 py-3 text-slate-500 dark:text-slate-400'>
											{h.telefon}
										</td>
										<td className='px-4 py-3'>
											<StatusBadge status={h.holat} />
										</td>
										<td
											className='px-4 py-3 text-slate-500 dark:text-slate-400 text-xs max-w-[180px] truncate'
											title={h.izoh || ''}
										>
											{h.izoh || '—'}
										</td>
										<td className='px-4 py-3 text-right space-x-2'>
											<button
												onClick={() => handleOpenEdit(h)}
												className='text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded hover:bg-amber-100 transition-colors'
											>
												✏️ {t.tahrirlash}
											</button>
											<button
												onClick={() => {
													if (confirm(`${h.ism}?`)) {
														onDeleteHodim(h.id);
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
				title={editingId ? `✏️ ${t.tahrirlash}` : `👤 ${t.yangiHodim}`}
			>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
							{t.ismFamiliya} *
						</label>
						<input
							type='text'
							required
							value={ism}
							onChange={e => setIsm(e.target.value)}
							className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
						/>
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.lavozim}
							</label>
							<input
								type='text'
								value={lavozim}
								onChange={e => setLavozim(e.target.value)}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
							/>
						</div>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.bolim}
							</label>
							<input
								type='text'
								value={bolim}
								onChange={e => setBolim(e.target.value)}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
							/>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.oylikMaosh} *
							</label>
							<input
								type='number'
								required
								min={1}
								value={oylikMaosh}
								onChange={e =>
									setOylikMaosh(e.target.value ? Number(e.target.value) : '')
								}
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

					<div>
						<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
							{t.holat}
						</label>
						<select
							value={holat}
							onChange={e => setHolat(e.target.value as StatusHodim)}
							className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
						>
							<option value='Faol'>Faol</option>
							<option value="Ta'tilda">Ta'tilda</option>
							<option value='Nofaol'>Nofaol</option>
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

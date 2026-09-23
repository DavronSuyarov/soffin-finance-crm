// src/components/KirimTab.tsx
import React, { useState } from 'react';
import { parseOy } from '../finance';
import { translations } from '../i18n.js';
import {
	Currency,
	Kirim,
	KirimXizmatTuri,
	Mijoz,
	StatusTranzaksiya,
} from '../types.js';
import { generateNextId, validateAmount } from '../utils';
import { Modal } from './Modal';
import { StatusBadge } from './StatusBadge';

interface KirimTabProps {
	kirimlar: Kirim[];
	mijozlar: Mijoz[];
	t: (typeof translations)['uz'];
	onAddKirim: (yangi: Kirim) => void;
	onUpdateKirim: (tahrirlangan: Kirim) => void;
	onDeleteKirim: (id: string) => void;
}

const fmt = (n: number) => (Number(n) || 0).toLocaleString('uz-UZ');

export const KirimTab: React.FC<KirimTabProps> = ({
	kirimlar,
	mijozlar,
	t,
	onAddKirim,
	onUpdateKirim,
	onDeleteKirim,
}) => {
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const [mijozId, setMijozId] = useState('');
	const [davr, setDavr] = useState(parseOy(new Date().toISOString()));
	const [summa, setSumma] = useState<number | ''>('');
	const [valyuta, setValyuta] = useState<Currency>('UZS');
	const [sana, setSana] = useState('');
	const [tur, setTur] = useState<KirimXizmatTuri>('Buxgalteriya hisobi');
	const [holat, setHolat] = useState<StatusTranzaksiya>('Tolangan');
	const [invoice, setInvoice] = useState('');
	const [izoh, setIzoh] = useState('');

	const filtered = kirimlar
		.filter(k => {
			const matchSearch =
				(k.kompaniya || '').toLowerCase().includes(search.toLowerCase()) ||
				(k.invoice || '').toLowerCase().includes(search.toLowerCase()) ||
				(k.tur || '').toLowerCase().includes(search.toLowerCase()) ||
				(k.davr || '').includes(search);
			const matchStatus = !statusFilter || k.holat === statusFilter;
			return matchSearch && matchStatus;
		})
		.sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));

	const jamiSumma = filtered.reduce(
		(acc, k) => acc + (Number(k.summa) || 0),
		0,
	);
	const tolanganSumma = filtered
		.filter(k => k.holat === 'Tolangan')
		.reduce((acc, k) => acc + (Number(k.summa) || 0), 0);
	const kutilayotganSumma = filtered
		.filter(k => k.holat === 'Kutilmoqda')
		.reduce((acc, k) => acc + (Number(k.summa) || 0), 0);

	// Barcha faol mijozlarga oylik abonent hisobini avtomatik chiqarish
	const handleGeneratsiyaOylikAbonent = () => {
		const joriyOy = parseOy(new Date().toISOString());
		let hisob = 0;

		const faolMijozlar = mijozlar.filter(m => m.status === 'Faol');
		if (faolMijozlar.length === 0) {
			alert('Abonent shakllantirish uchun faol mijozlar topilmadi.');
			return;
		}

		faolMijozlar.forEach((m, idx) => {
			const mavjud = kirimlar.some(
				k =>
					(k.mijozId === m.id || k.kompaniya === m.kompaniya) &&
					parseOy(k.davr || k.sana) === joriyOy,
			);

			if (!mavjud && Number(m.tarifSummasi) > 0) {
				const tolovSanasi = `${joriyOy}-${String(m.tolovKuni || 5).padStart(2, '0')}`;
				onAddKirim({
					id: generateNextId('k', kirimlar) + (idx > 0 ? `_${idx}` : ''),
					mijozId: m.id,
					kompaniya: m.kompaniya,
					davr: joriyOy,
					summa: Number(m.tarifSummasi),
					valyuta: 'UZS',
					sana: tolovSanasi,
					tur: 'Buxgalteriya hisobi',
					holat: 'Kutilmoqda',
					invoice: `INV-${joriyOy.replace('-', '')}-${m.id}`,
					izoh: `${joriyOy} oylik abonent to‘lovi`,
				});
				hisob++;
			}
		});

		if (hisob > 0) {
			alert(
				`${hisob} ta mijoz uchun ${joriyOy} oyi to‘lovlari kutilmoqda sifatida shakllantirildi!`,
			);
		} else {
			alert(
				`Barcha faol mijozlar uchun ${joriyOy} oyi kvitansiyalari allaqachon mavjud.`,
			);
		}
	};

	const handleOpenAdd = () => {
		setEditingId(null);
		const birinchi = mijozlar.length ? mijozlar[0] : null;
		setMijozId(birinchi ? birinchi.id : '');
		setDavr(parseOy(new Date().toISOString()));
		setSumma(birinchi ? birinchi.tarifSummasi || '' : '');
		setValyuta('UZS');
		setSana(new Date().toISOString().slice(0, 10));
		setTur('Buxgalteriya hisobi');
		setHolat('Tolangan');
		setInvoice(`INV-${String(kirimlar.length + 1).padStart(3, '0')}`);
		setIzoh('');
		setIsModalOpen(true);
	};

	const handleOpenEdit = (k: Kirim) => {
		setEditingId(k.id);
		setMijozId(k.mijozId);
		setDavr(parseOy(k.davr || k.sana));
		setSumma(k.summa);
		setValyuta(k.valyuta);
		setSana(k.sana);
		setTur(k.tur);
		setHolat(k.holat);
		setInvoice(k.invoice);
		setIzoh(k.izoh || '');
		setIsModalOpen(true);
	};

	const handleMijozSelectChange = (yangiId: string) => {
		setMijozId(yangiId);
		const tanlangan = mijozlar.find(m => m.id === yangiId);
		if (tanlangan && !editingId) {
			setSumma(tanlangan.tarifSummasi || '');
		}
	};

	const handleStatusniAlmashtirish = (k: Kirim) => {
		const yangiHolat: StatusTranzaksiya =
			k.holat === 'Tolangan' ? 'Kutilmoqda' : 'Tolangan';
		onUpdateKirim({
			...k,
			holat: yangiHolat,
			sana:
				yangiHolat === 'Tolangan'
					? new Date().toISOString().slice(0, 10)
					: k.sana,
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const amountCheck = validateAmount(summa);
		if (!amountCheck.isValid) {
			alert(amountCheck.error);
			return;
		}
		if (!mijozId || !summa || Number(summa) <= 0) return;

		const tanlanganMijoz = mijozlar.find(m => m.id === mijozId);
		const kompaniyaNomi = tanlanganMijoz ? tanlanganMijoz.kompaniya : '—';
		const joriySana = sana || new Date().toISOString().slice(0, 10);

		if (editingId) {
			onUpdateKirim({
				id: editingId,
				mijozId,
				kompaniya: kompaniyaNomi,
				davr: parseOy(davr || joriySana),
				summa: Number(summa),
				valyuta,
				sana: joriySana,
				tur,
				holat,
				invoice: invoice.trim(),
				izoh: izoh.trim(),
			});
		} else {
			onAddKirim({
				id: generateNextId('k', kirimlar),
				mijozId,
				kompaniya: kompaniyaNomi,
				davr: parseOy(davr || joriySana),
				summa: Number(summa),
				valyuta,
				sana: joriySana,
				tur,
				holat,
				invoice: invoice.trim(),
				izoh: izoh.trim(),
			});
		}
		setIsModalOpen(false);
	};

	return (
		<div className='space-y-4'>
			{/* 1. FILTRLASH VA AMALLAR PANELI */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors'>
				<div className='flex flex-wrap items-center gap-3 flex-1'>
					<input
						type='text'
						placeholder={`🔍 ${t.qidirish}`}
						value={search}
						onChange={e => setSearch(e.target.value)}
						className='px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:border-sky-500 w-full sm:w-64'
					/>
					<select
						value={statusFilter}
						onChange={e => setStatusFilter(e.target.value)}
						className='px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
					>
						<option value=''>{t.barchaHolatlar}</option>
						<option value='Tolangan'>{t.statuslar['Tolangan']}</option>
						<option value='Kutilmoqda'>{t.statuslar['Kutilmoqda']}</option>
						<option value='Bekor'>{t.statuslar['Bekor']}</option>
					</select>
				</div>

				<div className='flex items-center gap-2'>
					<button
						onClick={handleGeneratsiyaOylikAbonent}
						title="Faol mijozlar uchun oylik tarif to‘lovlarini 'Kutilmoqda' sifatida chiqarish"
						className='px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs flex items-center gap-1.5'
					>
						⚡ Oylik abonentlarni shakllantirish
					</button>
					<button
						onClick={handleOpenAdd}
						className='px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs'
					>
						{t.yangiKirim}
					</button>
				</div>
			</div>

			{/* Xulosa chiplari */}
			<div className='flex flex-wrap gap-2.5'>
				<div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300'>
					Jami:{' '}
					<span className='font-bold text-slate-900 dark:text-slate-100'>
						{fmt(jamiSumma)} UZS
					</span>
				</div>
				<div className='bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-300'>
					{t.statuslar['Tolangan']}:{' '}
					<span className='font-bold'>{fmt(tolanganSumma)} UZS</span>
				</div>
				<div className='bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3.5 py-1.5 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300'>
					{t.kutilmoqda} (Debitorlik):{' '}
					<span className='font-bold'>{fmt(kutilayotganSumma)} UZS ⏳</span>
				</div>
			</div>

			{/* JADVAL */}
			<div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors'>
				<div className='overflow-x-auto'>
					<table className='w-full text-left text-sm text-slate-600 dark:text-slate-300'>
						<thead className='bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800'>
							<tr>
								<th className='px-4 py-3.5'>{t.id}</th>
								<th className='px-4 py-3.5'>{t.kompaniya}</th>
								<th className='px-4 py-3.5'>Davr (Oy)</th>
								<th className='px-4 py-3.5'>{t.xizmatTuri}</th>
								<th className='px-4 py-3.5'>{t.summa}</th>
								<th className='px-4 py-3.5'>{t.sana}</th>
								<th className='px-4 py-3.5'>{t.invoice}</th>
								<th className='px-4 py-3.5'>{t.holat}</th>
								<th className='px-4 py-3.5'>{t.izoh}</th>
								<th className='px-4 py-3.5 text-right'>{t.amallar}</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
							{filtered.length === 0 ? (
								<tr>
									<td
										colSpan={10}
										className='text-center py-8 text-slate-400 dark:text-slate-500'
									>
										—
									</td>
								</tr>
							) : (
								filtered.map(k => (
									<tr
										key={k.id}
										className='hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors'
									>
										<td className='px-4 py-3 font-semibold text-slate-900 dark:text-slate-100'>
											{k.id}
										</td>
										<td className='px-4 py-3 font-medium text-slate-900 dark:text-slate-100'>
											{k.kompaniya}
										</td>
										<td className='px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400'>
											{parseOy(k.davr || k.sana)}
										</td>
										<td className='px-4 py-3'>
											{t.kirimTurlari[k.tur as keyof typeof t.kirimTurlari] ||
												k.tur}
										</td>
										<td className='px-4 py-3 font-bold text-slate-900 dark:text-slate-100'>
											{fmt(k.summa)} {k.valyuta}
										</td>
										<td className='px-4 py-3 text-slate-500 dark:text-slate-400'>
											{k.sana}
										</td>
										<td className='px-4 py-3 text-slate-500 dark:text-slate-400 text-xs'>
											{k.invoice || '—'}
										</td>
										<td className='px-4 py-3'>
											<button
												onClick={() => handleStatusniAlmashtirish(k)}
												title="Statusni o'zgartirish uchun bosing"
												className='cursor-pointer'
											>
												<StatusBadge status={k.holat} t={t} />
											</button>
										</td>
										<td
											className='px-4 py-3 text-slate-500 dark:text-slate-400 text-xs max-w-[160px] truncate'
											title={k.izoh || ''}
										>
											{k.izoh || '—'}
										</td>
										<td className='px-4 py-3 text-right space-x-2'>
											<button
												onClick={() => handleOpenEdit(k)}
												className='text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded hover:bg-amber-100 transition-colors'
											>
												✏️ {t.tahrirlash}
											</button>
											<button
												onClick={() => {
													if (confirm(`${k.invoice}?`)) {
														onDeleteKirim(k.id);
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
				title={editingId ? `✏️ ${t.tahrirlash}` : `⬆️ ${t.yangiKirim}`}
			>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
							{t.kompaniya} *
						</label>
						<select
							required
							value={mijozId}
							onChange={e => handleMijozSelectChange(e.target.value)}
							className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
						>
							{mijozlar.map(m => (
								<option key={m.id} value={m.id}>
									{m.kompaniya} (Tarif: {fmt(m.tarifSummasi || 0)} UZS)
								</option>
							))}
						</select>
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								Davr (Oy) *
							</label>
							<input
								type='month'
								required
								value={davr}
								onChange={e => setDavr(e.target.value)}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
							/>
						</div>
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
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.summa} *
							</label>
							<input
								type='number'
								min='0'
								max='100000000000'
								required
								value={summa}
								onChange={e =>
									setSumma(e.target.value ? Number(e.target.value) : '')
								}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500 font-bold'
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
								{t.xizmatTuri}
							</label>
							<select
								value={tur}
								onChange={e => setTur(e.target.value as KirimXizmatTuri)}
								className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
							>
								<option value='Buxgalteriya hisobi'>
									{t.kirimTurlari['Buxgalteriya hisobi']}
								</option>
								<option value='Audit'>{t.kirimTurlari['Audit']}</option>
								<option value='Konsultatsiya'>
									{t.kirimTurlari['Konsultatsiya']}
								</option>
								<option value='Qayta tiklash'>
									{t.kirimTurlari['Qayta tiklash']}
								</option>
								<option value='Boshqa'>{t.kirimTurlari['Boshqa']}</option>
							</select>
						</div>
						<div>
							<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
								{t.holat}
							</label>
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
							{t.invoice}
						</label>
						<input
							type='text'
							value={invoice}
							onChange={e => setInvoice(e.target.value)}
							className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
						/>
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

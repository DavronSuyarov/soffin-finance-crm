// src/components/MaoshTab.tsx
import React, { useMemo, useState } from 'react';
import { translations } from '../i18n.js';
import { Hodim, MaoshYozuvi, StatusMaosh } from '../types.js';
import { generateNextId, validateAmount } from '../utils';
import { Modal } from './Modal';
import { StatusBadge } from './StatusBadge';

export interface MaoshTabProps {
	maoshlar: MaoshYozuvi[];
	hodimlar: Hodim[];
	t: (typeof translations)['uz'];
	onAddMaosh: (yangi: MaoshYozuvi) => void;
	onUpdateMaosh: (tahrir: MaoshYozuvi) => void;
	onDeleteMaosh: (id: string) => void;
}

const fmt = (n: number) => (Number(n) || 0).toLocaleString('uz-UZ');

const formatOy = (dateStr: string): string => {
	if (!dateStr) return '—';
	try {
		if (/^\d{4}-\d{2}$/.test(dateStr.trim())) return dateStr.trim();
		const d = new Date(dateStr);
		if (isNaN(d.getTime())) return dateStr;
		const yil = d.getFullYear();
		const oy = String(d.getMonth() + 1).padStart(2, '0');
		return `${yil}-${oy}`;
	} catch {
		return dateStr;
	}
};

export const MaoshTab: React.FC<MaoshTabProps> = ({
	maoshlar,
	hodimlar,
	t,
	onAddMaosh,
	onUpdateMaosh,
	onDeleteMaosh,
}) => {
	const [search, setSearch] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const [hodimId, setHodimId] = useState('');
	const [davr, setDavr] = useState('2026-07');
	const [berilgan, setBerilgan] = useState<number | ''>('');
	const [izoh, setIzoh] = useState('');

	const filtered = useMemo(() => {
		return maoshlar
			.filter(
				m =>
					m.ism.toLowerCase().includes(search.toLowerCase()) ||
					m.davr.includes(search),
			)
			.sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));
	}, [maoshlar, search]);

	// Xodimning haqiqiy shtat oyligini topish
	const getHodimOylik = (hId: string, hIsm?: string) => {
		const h = hodimlar.find(
			item => item.id === hId || (hIsm && item.ism === hIsm),
		);
		return h ? Number(h.oylikMaosh) || 0 : 0;
	};

	// Tanlangan oy va xodim uchun qoldiq qarzni aniqlash
	const getHodimDavrQoldiq = (
		hId: string,
		oyStr: string,
		excludeId?: string | null,
	) => {
		const shtatMaosh = getHodimOylik(hId);
		const normOy = formatOy(oyStr);

		const oldBerilgan = maoshlar
			.filter(
				m =>
					(m.hodimId === hId ||
						m.ism === hodimlar.find(x => x.id === hId)?.ism) &&
					formatOy(m.davr) === normOy &&
					m.id !== excludeId,
			)
			.reduce((sum, m) => sum + (Number(m.berilgan) || 0), 0);

		return Math.max(0, shtatMaosh - oldBerilgan);
	};

	// Tepadagi kartochkalar va jadval qatorlari hisob-kitobi
	const { jamiBelgilangan, jamiBerilgan, jamiQarz, hisoblanganQatorlar } =
		useMemo(() => {
			const davrBerilganMap = new Map<string, number>();
			const davrBelgilanganMap = new Map<string, number>();

			filtered.forEach(m => {
				const shtat =
					getHodimOylik(m.hodimId, m.ism) || Number(m.belgilangan) || 0;
				const kalit = `${m.hodimId || m.ism}_${formatOy(m.davr)}`;

				const oldBer = davrBerilganMap.get(kalit) || 0;
				davrBerilganMap.set(kalit, oldBer + (Number(m.berilgan) || 0));

				if (!davrBelgilanganMap.has(kalit)) {
					davrBelgilanganMap.set(kalit, shtat);
				}
			});

			const hisoblangan = filtered.map(m => {
				const shtat =
					getHodimOylik(m.hodimId, m.ism) || Number(m.belgilangan) || 0;
				const kalit = `${m.hodimId || m.ism}_${formatOy(m.davr)}`;
				const jamiOyBerilgan = davrBerilganMap.get(kalit) || 0;
				const haqiqiyQoldiq = Math.max(0, shtat - jamiOyBerilgan);
				const holat: StatusMaosh = haqiqiyQoldiq > 0 ? 'Qarzli' : 'Tolangan';

				return {
					...m,
					haqiqiyBelgilangan: shtat,
					haqiqiyQoldiq,
					haqiqiyHolat: holat,
				};
			});

			const jamiBelg = Array.from(davrBelgilanganMap.values()).reduce(
				(a, b) => a + b,
				0,
			);
			const jamiBer = filtered.reduce(
				(acc, m) => acc + (Number(m.berilgan) || 0),
				0,
			);
			const qarz = Math.max(0, jamiBelg - jamiBer);

			return {
				jamiBelgilangan: jamiBelg,
				jamiBerilgan: jamiBer,
				jamiQarz: qarz,
				hisoblanganQatorlar: hisoblangan,
			};
		}, [filtered, hodimlar]);

	const handleOpenAdd = () => {
		setEditingId(null);
		const birinchi = hodimlar.length ? hodimlar[0] : null;
		const initialId = birinchi ? birinchi.id : '';
		const initialOy = '2026-07';

		setHodimId(initialId);
		setDavr(initialOy);
		const qarz = getHodimDavrQoldiq(initialId, initialOy);
		setBerilgan(qarz > 0 ? qarz : '');
		setIzoh('');
		setIsModalOpen(true);
	};

	const handleOpenEdit = (m: MaoshYozuvi) => {
		setEditingId(m.id);
		setHodimId(m.hodimId);
		setDavr(formatOy(m.davr));
		setBerilgan(m.berilgan);
		setIzoh(m.izoh || '');
		setIsModalOpen(true);
	};

	const handleHodimChange = (newHodimId: string) => {
		setHodimId(newHodimId);
		if (!editingId) {
			const qarz = getHodimDavrQoldiq(newHodimId, davr);
			setBerilgan(qarz > 0 ? qarz : '');
		}
	};

	const handleDavrChange = (newDavr: string) => {
		setDavr(newDavr);
		if (!editingId && hodimId) {
			const qarz = getHodimDavrQoldiq(hodimId, newDavr);
			setBerilgan(qarz > 0 ? qarz : '');
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!hodimId) return;

		const gSumma = Number(berilgan) || 0;
		const checkBerilgan = validateAmount(gSumma);
		if (!checkBerilgan.isValid) {
			alert(checkBerilgan.error);
			return;
		}

		const tanlanganHodim = hodimlar.find(h => h.id === hodimId);
		const ism = tanlanganHodim ? tanlanganHodim.ism : '—';
		const shtatMaosh = getHodimOylik(hodimId);

		if (editingId) {
			onUpdateMaosh({
				id: editingId,
				hodimId,
				ism,
				davr: formatOy(davr),
				belgilangan: shtatMaosh,
				berilgan: gSumma,
				qoldiq: 0,
				holat: 'Tolangan',
				izoh: izoh.trim(),
			});
		} else {
			onAddMaosh({
				id: generateNextId('MSH', maoshlar),
				hodimId,
				ism,
				davr: formatOy(davr),
				belgilangan: shtatMaosh,
				berilgan: gSumma,
				qoldiq: 0,
				holat: 'Tolangan',
				izoh: izoh.trim(),
			});
		}
		setIsModalOpen(false);
	};

	const joriyQoldiqQarz = getHodimDavrQoldiq(hodimId, davr, editingId);

	return (
		<div className='space-y-4'>
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors'>
				<input
					type='text'
					placeholder={`🔍 ${t.qidirish}`}
					value={search}
					onChange={e => setSearch(e.target.value)}
					className='px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:border-sky-500 w-full sm:w-64'
				/>
				<button
					onClick={handleOpenAdd}
					className='px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs'
				>
					{t.yangiMaosh}
				</button>
			</div>

			{/* STATISTIKA */}
			<div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
				<div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg'>
					<div className='text-xs text-slate-500 dark:text-slate-400'>
						{t.belgilangan}:
					</div>
					<div className='text-base font-bold text-slate-800 dark:text-slate-100'>
						{fmt(jamiBelgilangan)} UZS
					</div>
				</div>
				<div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg'>
					<div className='text-xs text-slate-500 dark:text-slate-400'>
						{t.berilgan}:
					</div>
					<div className='text-base font-bold text-emerald-600 dark:text-emerald-400'>
						{fmt(jamiBerilgan)} UZS
					</div>
				</div>
				<div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg'>
					<div className='text-xs text-slate-500 dark:text-slate-400'>
						{t.qoldiq}:
					</div>
					<div className='text-base font-bold text-rose-600 dark:text-rose-400'>
						{fmt(jamiQarz)} UZS {jamiQarz > 0 ? '⚠️' : ''}
					</div>
				</div>
			</div>

			{/* JADVAL */}
			<div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors'>
				<div className='overflow-x-auto'>
					<table className='w-full text-left text-sm text-slate-600 dark:text-slate-300'>
						<thead className='bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800'>
							<tr>
								<th className='px-4 py-3.5'>{t.id}</th>
								<th className='px-4 py-3.5'>{t.ismFamiliya}</th>
								<th className='px-4 py-3.5'>{t.davr}</th>
								<th className='px-4 py-3.5'>{t.belgilangan}</th>
								<th className='px-4 py-3.5'>{t.berilgan}</th>
								<th className='px-4 py-3.5'>{t.qoldiq}</th>
								<th className='px-4 py-3.5'>{t.holat}</th>
								<th className='px-4 py-3.5'>{t.izoh}</th>
								<th className='px-4 py-3.5 text-right'>{t.amallar}</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
							{hisoblanganQatorlar.length === 0 ? (
								<tr>
									<td
										colSpan={9}
										className='text-center py-8 text-slate-400 dark:text-slate-500'
									>
										—
									</td>
								</tr>
							) : (
								hisoblanganQatorlar.map(m => (
									<tr
										key={m.id}
										className='hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors'
									>
										<td className='px-4 py-3 font-semibold text-slate-900 dark:text-slate-100'>
											{m.id}
										</td>
										<td className='px-4 py-3 font-medium text-slate-900 dark:text-slate-100'>
											{m.ism}
										</td>
										<td className='px-4 py-3 text-slate-500 dark:text-slate-400'>
											{formatOy(m.davr)}
										</td>
										<td className='px-4 py-3'>
											{fmt(m.haqiqiyBelgilangan)} UZS
										</td>
										<td className='px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400'>
											{fmt(m.berilgan)} UZS
										</td>
										<td className='px-4 py-3 font-bold text-rose-600 dark:text-rose-400'>
											{fmt(m.haqiqiyQoldiq)} UZS
										</td>
										<td className='px-4 py-3'>
											<StatusBadge status={m.haqiqiyHolat} />
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
													if (confirm(`${m.ism}?`)) {
														onDeleteMaosh(m.id);
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

			{/* MODAL */}
			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title={editingId ? `✏️ ${t.tahrirlash}` : `💰 ${t.yangiMaosh}`}
			>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
							{t.ismFamiliya} *
						</label>
						<select
							value={hodimId}
							onChange={e => handleHodimChange(e.target.value)}
							className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500'
						>
							{hodimlar.map(h => (
								<option key={h.id} value={h.id}>
									{h.ism} — {h.lavozim} ({fmt(h.oylikMaosh)} UZS)
								</option>
							))}
						</select>
					</div>

					<div>
						<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
							{t.davr} (Oy) *
						</label>
						<input
							type='month'
							required
							value={davr}
							onChange={e => handleDavrChange(e.target.value)}
							className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
						/>
					</div>

					<div className='p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex justify-between items-center'>
						<span className='text-slate-600 dark:text-slate-300'>
							Oy bo‘yicha to‘lanishi kerak qoldiq:
						</span>
						<span className='font-bold text-slate-900 dark:text-slate-100 text-sm'>
							{fmt(joriyQoldiqQarz)} UZS
						</span>
					</div>

					<div>
						<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
							{t.berilgan} (Kassadan berilayotgan summa) *
						</label>
						<input
							type='number'
							required
							min='1'
							max='100000000000'
							value={berilgan}
							onChange={e =>
								setBerilgan(e.target.value ? Number(e.target.value) : '')
							}
							className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500 font-semibold'
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
							placeholder='Masalan: Qisman to‘lov yoki Avans'
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

export default MaoshTab;

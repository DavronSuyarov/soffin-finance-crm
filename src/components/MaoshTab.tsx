// src/components/MaoshTab.tsx
import React, { useMemo, useState } from 'react';
import { hisoblaHodimlarBalansi, parseOy } from '../finance';
import { translations } from '../i18n.js';
import {
	DavomatYozuvi,
	Hodim,
	MaoshYozuvi,
	SoliqHisoboti,
	StatusMaosh,
} from '../types.js';
import { generateNextId, validateAmount } from '../utils';
import { Modal } from './Modal';
import { StatusBadge } from './StatusBadge';

export interface MaoshTabProps {
	maoshlar: MaoshYozuvi[];
	hodimlar: Hodim[];
	davomatlar?: DavomatYozuvi[];
	soliqlar?: SoliqHisoboti[];
	t: (typeof translations)['uz'];
	onAddMaosh: (yangi: MaoshYozuvi) => void;
	onUpdateMaosh: (tahrir: MaoshYozuvi) => void;
	onDeleteMaosh: (id: string) => void;
}

const fmt = (n: number) => (Number(n) || 0).toLocaleString('uz-UZ');

export const MaoshTab: React.FC<MaoshTabProps> = ({
	maoshlar,
	hodimlar,
	davomatlar = [],
	soliqlar = [],
	t,
	onAddMaosh,
	onUpdateMaosh,
	onDeleteMaosh,
}) => {
	const [search, setSearch] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const [hodimId, setHodimId] = useState('');
	const [davr, setDavr] = useState(parseOy(new Date().toISOString()));
	const [berilgan, setBerilgan] = useState<number | ''>('');
	const [izoh, setIzoh] = useState('');

	// Xodimning shtat bo'yicha bazaviy maoshini olish
	const getHodimOylik = (hId: string, hIsm?: string) => {
		const h = hodimlar.find(
			item => item.id === hId || (hIsm && item.ism === hIsm),
		);
		return h ? Number(h.oylikMaosh) || 0 : 0;
	};

	// KPI, Davomat va Soliqlar monitoringi inobatga olingan holda xodimlarning zanjirli oylik balansi
	const umumiyBalansMap = useMemo(() => {
		return hisoblaHodimlarBalansi(hodimlar, maoshlar, davomatlar, soliqlar);
	}, [hodimlar, maoshlar, davomatlar, soliqlar]);

	// Modalda tanlangan xodim va davr bo'yicha qoldiq qarz yoki avansni hisoblash
	const getHodimDavrHisob = (hId: string, oyStr: string) => {
		const normOy = parseOy(oyStr);
		const kalit = `${hId}_${normOy}`;
		const balans = umumiyBalansMap.get(kalit);

		if (balans) {
			return {
				qoldiqQarz: balans.qoldiqQarz,
				avans: balans.yakuniyAvans,
				boshlangichAvans: balans.boshlangichAvans,
				hisoblanganMaosh: balans.hisoblanganMaosh,
			};
		}

		// Agar bu oyda hali yozuv bo'lmasa, o'tgan oydagi yakuniy balansni aniqlaymiz
		const oldingiOylar = Array.from(umumiyBalansMap.values())
			.filter(item => item.hodimId === hId && item.davr < normOy)
			.sort((a, b) => a.davr.localeCompare(b.davr));

		let otganOydanBalans = 0;
		if (oldingiOylar.length > 0) {
			const oxirgi = oldingiOylar[oldingiOylar.length - 1];
			otganOydanBalans = oxirgi.yakuniyAvans - oxirgi.qoldiqQarz;
		}

		const shtatMaosh = getHodimOylik(hId);
		const sofQarz = Math.max(0, shtatMaosh - otganOydanBalans);

		return {
			qoldiqQarz: sofQarz,
			avans: otganOydanBalans > shtatMaosh ? otganOydanBalans - shtatMaosh : 0,
			boshlangichAvans: otganOydanBalans,
			hisoblanganMaosh: shtatMaosh,
		};
	};

	const filtered = useMemo(() => {
		return maoshlar
			.filter(
				m =>
					m.ism.toLowerCase().includes(search.toLowerCase()) ||
					parseOy(m.davr).includes(search),
			)
			.sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));
	}, [maoshlar, search]);

	// Jadval qatorlari va tepadagi jamlama statistika
	const { jamiHisoblangan, jamiBerilgan, jamiQarz, hisoblanganQatorlar } =
		useMemo(() => {
			const hisoblangan = filtered.map(m => {
				const normOy = parseOy(m.davr);
				const kalit = `${m.hodimId}_${normOy}`;
				const oyBalans = umumiyBalansMap.get(kalit);

				const shtat =
					getHodimOylik(m.hodimId, m.ism) || Number(m.belgilangan) || 0;
				const haqiqiyHisoblangan = oyBalans ? oyBalans.hisoblanganMaosh : shtat;
				const bonus = oyBalans ? oyBalans.hisoblanganBonus : 0;
				const haqiqiyQoldiq = oyBalans ? oyBalans.qoldiqQarz : 0;
				const yakuniyAvans = oyBalans ? oyBalans.yakuniyAvans : 0;
				const holat: StatusMaosh = haqiqiyQoldiq > 0 ? 'Qarzli' : 'Tolangan';
				const tolovlarSoni = oyBalans ? oyBalans.tolovlarSoni : 1;

				return {
					...m,
					haqiqiyBelgilangan: shtat,
					haqiqiyHisoblangan,
					bonus,
					haqiqiyQoldiq,
					yakuniyAvans,
					haqiqiyHolat: holat,
					tolovlarSoni,
				};
			});

			// 1. Hisoblangan summani unikal oylar bo'yicha yig'ish (takrorlanishni oldini olish)
			const unikalOylar = new Set<string>();
			hisoblangan.forEach(m => {
				unikalOylar.add(`${m.hodimId}_${parseOy(m.davr)}`);
			});

			let jamiHisob = 0;
			unikalOylar.forEach(kalit => {
				const b = umumiyBalansMap.get(kalit);
				if (b) {
					jamiHisob += b.hisoblanganMaosh;
				}
			});

			// 2. Berilgan summa — ro'yxatdagi barcha to'lovlar summasi
			const jamiBer = filtered.reduce(
				(acc, m) => acc + (Number(m.berilgan) || 0),
				0,
			);

			// 3. Haqiqiy qoldiq qarz hisobi:
			// Har bir xodimning ko'rilayotgan eng oxirgi davridagi yakuniy balansidan olinadi (eski oylarni qo'shib yubormaslik uchun)
			const hodimlarOxirgiOyi = new Map<string, string>();
			hisoblangan.forEach(m => {
				const joriyOy = parseOy(m.davr);
				const oxirgi = hodimlarOxirgiOyi.get(m.hodimId);
				if (!oxirgi || joriyOy > oxirgi) {
					hodimlarOxirgiOyi.set(m.hodimId, joriyOy);
				}
			});

			let haqiqiySofQarz = 0;
			hodimlarOxirgiOyi.forEach((oxirgiDavr, hId) => {
				const oxirgiBalans = umumiyBalansMap.get(`${hId}_${oxirgiDavr}`);
				if (oxirgiBalans) {
					haqiqiySofQarz += oxirgiBalans.qoldiqQarz;
				}
			});

			return {
				jamiHisoblangan: jamiHisob,
				jamiBerilgan: jamiBer,
				jamiQarz: haqiqiySofQarz,
				hisoblanganQatorlar: hisoblangan,
			};
		}, [filtered, hodimlar, umumiyBalansMap]);

	const handleOpenAdd = () => {
		setEditingId(null);
		const birinchi = hodimlar.length ? hodimlar[0] : null;
		const initialId = birinchi ? birinchi.id : '';
		const initialOy = parseOy(new Date().toISOString());

		setHodimId(initialId);
		setDavr(initialOy);

		const hisob = getHodimDavrHisob(initialId, initialOy);
		setBerilgan(hisob.qoldiqQarz > 0 ? hisob.qoldiqQarz : '');
		setIzoh('');
		setIsModalOpen(true);
	};

	const handleOpenEdit = (m: MaoshYozuvi) => {
		setEditingId(m.id);
		setHodimId(m.hodimId);
		setDavr(parseOy(m.davr));
		setBerilgan(m.berilgan);
		setIzoh(m.izoh || '');
		setIsModalOpen(true);
	};

	const handleHodimChange = (newHodimId: string) => {
		setHodimId(newHodimId);
		if (!editingId) {
			const hisob = getHodimDavrHisob(newHodimId, davr);
			setBerilgan(hisob.qoldiqQarz > 0 ? hisob.qoldiqQarz : '');
		}
	};

	const handleDavrChange = (newDavr: string) => {
		setDavr(newDavr);
		if (!editingId && hodimId) {
			const hisob = getHodimDavrHisob(hodimId, newDavr);
			setBerilgan(hisob.qoldiqQarz > 0 ? hisob.qoldiqQarz : '');
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
				davr: parseOy(davr),
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
				davr: parseOy(davr),
				belgilangan: shtatMaosh,
				berilgan: gSumma,
				qoldiq: 0,
				holat: 'Tolangan',
				izoh: izoh.trim(),
			});
		}
		setIsModalOpen(false);
	};

	const modalHisob = getHodimDavrHisob(hodimId, davr);

	return (
		<div className='space-y-4'>
			{/* QIDIRUV VA QO'SHISH TUGMASI */}
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

			{/* STATISTIKA KARTALARI */}
			<div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
				<div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg'>
					<div className='text-xs text-slate-500 dark:text-slate-400'>
						{t.hisoblangan} ({t.bonusKPI}):
					</div>
					<div className='text-base font-bold text-slate-800 dark:text-slate-100'>
						{fmt(jamiHisoblangan)} UZS
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
								<th className='px-4 py-3.5 whitespace-nowrap'>{t.id}</th>
								<th className='px-4 py-3.5 whitespace-nowrap'>
									{t.ismFamiliya}
								</th>
								<th className='px-4 py-3.5 whitespace-nowrap'>{t.davr}</th>
								<th className='px-4 py-3.5 whitespace-nowrap'>
									{t.hisoblangan}
								</th>
								<th className='px-4 py-3.5 whitespace-nowrap'>{t.bonusKPI}</th>
								<th className='px-4 py-3.5 whitespace-nowrap'>{t.berilgan}</th>
								<th className='px-4 py-3.5 whitespace-nowrap'>{t.qoldiq}</th>
								<th className='px-4 py-3.5 whitespace-nowrap'>{t.holat}</th>
								<th className='px-4 py-3.5 whitespace-nowrap'>{t.izoh}</th>
								<th className='px-4 py-3.5 text-right whitespace-nowrap'>
									{t.amallar}
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
							{hisoblanganQatorlar.length === 0 ? (
								<tr>
									<td
										colSpan={10}
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
										<td className='px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap'>
											{m.id}
										</td>
										<td className='px-4 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap'>
											{m.ism}
										</td>
										<td className='px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap'>
											{parseOy(m.davr)}
										</td>
										<td className='px-4 py-3 whitespace-nowrap'>
											<div className='font-semibold text-slate-900 dark:text-slate-100'>
												{fmt(m.haqiqiyHisoblangan)} UZS
											</div>
											{m.haqiqiyHisoblangan !== m.haqiqiyBelgilangan && (
												<div className='text-[10px] text-slate-400 line-through'>
													{fmt(m.haqiqiyBelgilangan)} UZS
												</div>
											)}
										</td>
										<td className='px-4 py-3 whitespace-nowrap'>
											<span className='text-xs font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded'>
												+{fmt(m.bonus)} UZS
											</span>
										</td>
										<td className='px-4 py-3 whitespace-nowrap'>
											<div className='font-medium text-emerald-600 dark:text-emerald-400'>
												{fmt(m.berilgan)} UZS
											</div>
											{m.tolovlarSoni > 1 && (
												<div className='text-[10px] text-slate-400'>
													({m.tolovlarSoni} {t.tolovlarSoni})
												</div>
											)}
										</td>
										<td className='px-4 py-3 font-bold whitespace-nowrap'>
											{m.haqiqiyQoldiq > 0 ? (
												<span className='text-rose-600 dark:text-rose-400'>
													{fmt(m.haqiqiyQoldiq)} UZS
												</span>
											) : m.yakuniyAvans > 0 ? (
												<span className='text-sky-600 dark:text-sky-400 font-semibold text-xs bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded'>
													{t.avans}: +{fmt(m.yakuniyAvans)} UZS
												</span>
											) : (
												<span className='text-slate-500'>0 UZS</span>
											)}
										</td>
										<td className='px-4 py-3 whitespace-nowrap'>
											<StatusBadge status={m.haqiqiyHolat} t={t} />
										</td>
										<td
											className='px-4 py-3 text-slate-500 dark:text-slate-400 text-xs max-w-[180px] truncate'
											title={m.izoh || ''}
										>
											{m.izoh || '—'}
										</td>
										<td className='px-4 py-3 text-right space-x-2 whitespace-nowrap'>
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
							{t.davr} *
						</label>
						<input
							type='month'
							required
							value={davr}
							onChange={e => handleDavrChange(e.target.value)}
							className='w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:border-sky-500'
						/>
					</div>

					{/* Dinamik qoldiq/avans ko'rsatkichi */}
					<div className='p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1.5'>
						{modalHisob.boshlangichAvans > 0 && (
							<div className='flex justify-between items-center text-sky-600 dark:text-sky-400 font-semibold'>
								<span>{t.otganOydanAvans}:</span>
								<span>+{fmt(modalHisob.boshlangichAvans)} UZS</span>
							</div>
						)}
						<div className='flex justify-between items-center'>
							<span className='text-slate-600 dark:text-slate-300'>
								{t.tolanishiKerakQoldiq}:
							</span>
							<span className='font-bold text-slate-900 dark:text-slate-100 text-sm'>
								{fmt(modalHisob.qoldiqQarz)} UZS
							</span>
						</div>
					</div>

					<div>
						<label className='block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1'>
							{t.kassadanBerilayotganSumma} *
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
							placeholder={t.qismanTolovPlaceholder}
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

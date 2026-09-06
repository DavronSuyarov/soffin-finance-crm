// src/components/DashboardTab.tsx
import React from 'react';
import { translations } from '../i18n.js';
import { DashboardXulosa } from '../types.js';
import { StatCard } from './StatCard';

interface DashboardTabProps {
	summary: DashboardXulosa;
	t: (typeof translations)['uz'];
}

const fmt = (n: number) => n.toLocaleString('uz-UZ');

export const DashboardTab: React.FC<DashboardTabProps> = ({ summary, t }) => {
	const isFoyda = summary.sofFoyda >= 0;
	const maxGrafikQiymat = Math.max(
		...summary.oylikTahlil.map(m => Math.max(m.kirim, m.jamiChiqim)),
		1,
	);

	return (
		<div className='space-y-6'>
			{/* 1. Asosiy Statistik Kartochkalar */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				<StatCard
					title={t.tushganKirim}
					value={`${fmt(summary.jamiKirim)} UZS`}
					subtitle={`${t.kutilmoqda}: ${fmt(summary.kutilayotganKirim)} UZS`}
					icon='⬆️'
					color='green'
				/>
				<StatCard
					title={t.umumiyChiqim}
					value={`${fmt(summary.umumiyChiqim)} UZS`}
					subtitle={`${t.operatsionChiqim}: ${fmt(summary.operatsionChiqim)} | ${t.maoshChiqim}: ${fmt(summary.berilganMaosh)}`}
					icon='⬇️'
					color='red'
				/>
				<StatCard
					title={isFoyda ? t.sofFoyda : t.zarar}
					value={`${fmt(Math.abs(summary.sofFoyda))} UZS`}
					subtitle={isFoyda ? t.ijobiyBalans : t.xarajatOshdi}
					icon={isFoyda ? '📈' : '📉'}
					color={isFoyda ? 'teal' : 'amber'}
				/>
				<StatCard
					title={t.xodimlargaQarz}
					value={`${fmt(summary.xodimlardanQarz)} UZS`}
					subtitle={`${t.hodimlar}: ${summary.jamiHodimlar} (${summary.faolHodimlar})`}
					icon='⚠️'
					color='purple'
				/>
			</div>

			{/* 2. Grafik va Chiqim Strukturasi */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Oylik Dinamika (Bar Chart) */}
				<div className='lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors'>
					<div className='flex items-center justify-between mb-6'>
						<h3 className='text-base font-bold text-slate-800 dark:text-slate-100'>
							📈 {t.oylikDinamika}
						</h3>
						<div className='flex items-center gap-4 text-xs'>
							<span className='flex items-center gap-1 text-slate-600 dark:text-slate-300'>
								<span className='w-3 h-3 rounded-xs bg-emerald-500 inline-block'></span>{' '}
								{t.kirim}
							</span>
							<span className='flex items-center gap-1 text-slate-600 dark:text-slate-300'>
								<span className='w-3 h-3 rounded-xs bg-rose-500 inline-block'></span>{' '}
								{t.chiqim}
							</span>
						</div>
					</div>

					<div className='flex items-end gap-6 h-48 pt-4 border-b border-slate-100 dark:border-slate-800'>
						{summary.oylikTahlil.map((m, idx) => {
							const hKirim = Math.round((m.kirim / maxGrafikQiymat) * 100);
							const hChiqim = Math.round(
								(m.jamiChiqim / maxGrafikQiymat) * 100,
							);

							return (
								<div
									key={idx}
									className='flex-1 flex flex-col items-center h-full justify-end group'
								>
									<div className='w-full flex items-end justify-center gap-1.5 h-full'>
										<div
											style={{ height: `${hKirim}%` }}
											className='w-1/2 bg-emerald-500 rounded-t-xs transition-all group-hover:opacity-80'
											title={`${t.kirim}: ${fmt(m.kirim)} UZS`}
										></div>
										<div
											style={{ height: `${hChiqim}%` }}
											className='w-1/2 bg-rose-400 rounded-t-xs transition-all group-hover:opacity-80'
											title={`${t.chiqim}: ${fmt(m.jamiChiqim)} UZS`}
										></div>
									</div>
									<span className='text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2'>
										{m.davr}
									</span>
								</div>
							);
						})}
					</div>
				</div>

				{/* Chiqimlar Strukturasi */}
				<div className='bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors'>
					<div>
						<h3 className='text-base font-bold text-slate-800 dark:text-slate-100 mb-4'>
							📊 {t.chiqimStrukturasi}
						</h3>
						<div className='space-y-3.5'>
							{summary.chiqimKategoriyalari.map((item, idx) => (
								<div key={idx} className='space-y-1'>
									<div className='flex justify-between text-xs font-medium'>
										<span className='text-slate-600 dark:text-slate-300'>
											{item.kategoriya}
										</span>
										<span className='text-slate-800 dark:text-slate-100 font-bold'>
											{fmt(item.summa)} UZS ({item.ulushFoiz}%)
										</span>
									</div>
									<div className='w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden'>
										<div
											className='bg-sky-600 h-full rounded-full'
											style={{ width: `${item.ulushFoiz}%` }}
										></div>
									</div>
								</div>
							))}
						</div>
					</div>
					<div className='mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400'>
						* {t.maosh}
					</div>
				</div>
			</div>
		</div>
	);
};

// src/components/DashboardTab.tsx
import React, { useMemo } from 'react';
import { translations } from '../i18n.js';
import { DashboardXulosa } from '../types.js';
import { StatCard } from './StatCard';

interface DashboardTabProps {
	summary: DashboardXulosa;
	t: (typeof translations)['uz'];
}

const fmt = (n: number) => (Number(n) || 0).toLocaleString('uz-UZ');

export const DashboardTab: React.FC<DashboardTabProps> = ({ summary, t }) => {
	const isFoyda = (summary?.sofFoyda ?? 0) >= 0;

	// Grafik ustunlari uchun maksimal qiymatni xavfsiz aniqlash
	const maxGrafikQiymat = useMemo(() => {
		if (!summary?.oylikTahlil || summary.oylikTahlil.length === 0) return 1;
		const maxVal = Math.max(
			...summary.oylikTahlil.map(m =>
				Math.max(Number(m.kirim) || 0, Number(m.jamiChiqim) || 0),
			),
		);
		return maxVal > 0 ? maxVal : 1;
	}, [summary?.oylikTahlil]);

	return (
		<div className='space-y-6'>
			{/* 1. Asosiy Statistik Kartochkalar */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				<StatCard
					title={t.tushganKirim}
					value={`${fmt(summary?.jamiKirim ?? 0)} UZS`}
					subtitle={`${t.kutilmoqda}: ${fmt(summary?.kutilayotganKirim ?? 0)} UZS`}
					icon='⬆️'
					color='green'
				/>
				<StatCard
					title={t.umumiyChiqim}
					value={`${fmt(summary?.umumiyChiqim ?? 0)} UZS`}
					subtitle={`${t.operatsionChiqim}: ${fmt(summary?.operatsionChiqim ?? 0)} | ${t.maoshChiqim}: ${fmt(summary?.berilganMaosh ?? 0)}`}
					icon='⬇️'
					color='red'
				/>
				<StatCard
					title={isFoyda ? t.sofFoyda : t.zarar}
					value={`${fmt(Math.abs(summary?.sofFoyda ?? 0))} UZS`}
					subtitle={isFoyda ? t.ijobiyBalans : t.xarajatOshdi}
					icon={isFoyda ? '📈' : '📉'}
					color={isFoyda ? 'teal' : 'amber'}
				/>
				<StatCard
					title={t.xodimlargaQarz}
					value={`${fmt(summary?.xodimlardanQarz ?? 0)} UZS`}
					subtitle={`${t.hodimlar}: ${summary?.jamiHodimlar ?? 0} (${summary?.faolHodimlar ?? 0})`}
					icon='⚠️'
					color='purple'
				/>
			</div>

			{/* 2. Grafik va Chiqim Strukturasi */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Oylik Dinamika (Bar Chart) */}
				<div className='lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors flex flex-col justify-between'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2'>
							📈 {t.oylikDinamika}
						</h3>
						<div className='flex items-center gap-4 text-xs font-medium'>
							<span className='flex items-center gap-1.5 text-slate-600 dark:text-slate-300'>
								<span className='w-3 h-3 rounded-xs bg-emerald-500 inline-block'></span>{' '}
								{t.kirim}
							</span>
							<span className='flex items-center gap-1.5 text-slate-600 dark:text-slate-300'>
								<span className='w-3 h-3 rounded-xs bg-rose-400 inline-block'></span>{' '}
								{t.chiqim}
							</span>
						</div>
					</div>

					{!summary?.oylikTahlil || summary.oylikTahlil.length === 0 ? (
						<div className='h-48 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500'>
							Ma'lumotlar mavjud emas
						</div>
					) : (
						<div className='flex items-end gap-3 sm:gap-6 h-52 pt-6 border-b border-slate-100 dark:border-slate-800'>
							{summary.oylikTahlil.map((m, idx) => {
								const kSumma = Number(m.kirim) || 0;
								const chSumma = Number(m.jamiChiqim) || 0;
								const hKirim = Math.min(
									100,
									Math.max(
										kSumma > 0 ? 6 : 0,
										Math.round((kSumma / maxGrafikQiymat) * 100),
									),
								);
								const hChiqim = Math.min(
									100,
									Math.max(
										chSumma > 0 ? 6 : 0,
										Math.round((chSumma / maxGrafikQiymat) * 100),
									),
								);

								return (
									<div
										key={idx}
										className='flex-1 flex flex-col items-center h-full justify-end group relative'
									>
										<div className='w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full pb-1'>
											<div
												style={{ height: `${hKirim}%` }}
												className='w-1/2 bg-emerald-500 rounded-t-xs transition-all duration-300 group-hover:bg-emerald-600'
												title={`${t.kirim}: ${fmt(kSumma)} UZS`}
											></div>
											<div
												style={{ height: `${hChiqim}%` }}
												className='w-1/2 bg-rose-400 rounded-t-xs transition-all duration-300 group-hover:bg-rose-500'
												title={`${t.chiqim}: ${fmt(chSumma)} UZS`}
											></div>
										</div>
										<span className='text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center'>
											{m.davr}
										</span>
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Chiqimlar Strukturasi */}
				<div className='bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors'>
					<div>
						<h3 className='text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2'>
							📊 {t.chiqimStrukturasi}
						</h3>

						{!summary?.chiqimKategoriyalari ||
						summary.chiqimKategoriyalari.length === 0 ? (
							<div className='py-8 text-center text-xs text-slate-400 dark:text-slate-500'>
								Chiqimlar qayd etilmagan
							</div>
						) : (
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
												className='bg-sky-600 h-full rounded-full transition-all duration-500'
												style={{
													width: `${Math.min(100, Math.max(0, item.ulushFoiz))}%`,
												}}
											></div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					<div className='mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between'>
						<span>
							* {t.maosh} amalda berilgan to‘lovlarni o‘z ichiga oladi
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

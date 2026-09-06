// src/components/StatCard.tsx
import React from 'react';

interface StatCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon: string;
	color?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'teal';
}

const colorMap = {
	blue: 'border-t-blue-500 text-blue-600 dark:text-blue-400',
	green: 'border-t-emerald-500 text-emerald-600 dark:text-emerald-400',
	red: 'border-t-rose-500 text-rose-600 dark:text-rose-400',
	amber: 'border-t-amber-500 text-amber-600 dark:text-amber-400',
	purple: 'border-t-purple-500 text-purple-600 dark:text-purple-400',
	teal: 'border-t-teal-500 text-teal-600 dark:text-teal-400',
};

export const StatCard: React.FC<StatCardProps> = ({
	title,
	value,
	subtitle,
	icon,
	color = 'blue',
}) => {
	return (
		<div
			className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs border-t-4 ${colorMap[color]} transition-colors`}
		>
			<div className='flex items-center justify-between mb-2'>
				<span className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
					{title}
				</span>
				<span className='text-xl'>{icon}</span>
			</div>
			<div className='text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight'>
				{value}
			</div>
			{subtitle && (
				<div className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
					{subtitle}
				</div>
			)}
		</div>
	);
};

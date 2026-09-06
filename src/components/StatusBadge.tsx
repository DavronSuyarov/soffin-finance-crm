// src/components/StatusBadge.tsx
import React from 'react';
import { translations } from '../i18n.js';

interface StatusBadgeProps {
	status: string;
	t?: (typeof translations)['uz'];
}

const statusColors: Record<string, string> = {
	Faol: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
	Tolangan:
		'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
	Kutilmoqda:
		'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
	"Ta'tilda":
		'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
	Nofaol:
		'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
	Bekor:
		'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
	Qarzli:
		'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 font-bold',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, t }) => {
	const colorClass =
		statusColors[status] || 'bg-slate-50 text-slate-700 border-slate-200';
	// Agar tarjima lug'ati berilgan bo'lsa, tarjima qilib chiqaradi:
	const displayText =
		t?.statuslar?.[status as keyof typeof t.statuslar] || status;

	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
		>
			{displayText}
		</span>
	);
};

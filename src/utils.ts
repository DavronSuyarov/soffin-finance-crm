// src/utils.ts

export function generateNextId(
	prefix: string,
	items: { id?: string | number }[],
): string {
	if (!items || items.length === 0) {
		return `${prefix}001`;
	}

	// Ro'yxatdagi barcha elementlarning ID ichidan faqat son qismini sug'urib olamiz
	const numbers = items
		.map(item => {
			if (!item.id) return 0;
			const match = String(item.id).match(/\d+/);
			return match ? parseInt(match[0], 10) : 0;
		})
		.filter(num => !isNaN(num));

	// Ro'yxatdagi eng katta sonni aniqlaymiz
	const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
	const nextNumber = maxNumber + 1;

	// 3 xonali formatda qaytaramiz (M001, M002, M010, M105...)
	return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}
// src/utils.ts

// 1. Pul summasini cheklash (masalan: 0 dan 100 milliard so'mgacha)
export const MAX_SAFE_AMOUNT = 100_000_000_000; // 100 mlrd UZS

export function validateAmount(val: number | string): {
	isValid: boolean;
	error?: string;
} {
	const num =
		typeof val === 'string' ? parseFloat(val.replace(/\s+/g, '')) : val;
	if (isNaN(num) || num < 0) {
		return { isValid: false, error: "Summa musbat son bo'lishi kerak" };
	}
	if (num > MAX_SAFE_AMOUNT) {
		return {
			isValid: false,
			error: "Summa 100 milliard so'mdan oshmasligi lozim",
		};
	}
	return { isValid: true };
}

// 2. O'zbekiston INN tekshiruvi (aniq 9 ta raqam)
export function validateINN(inn: string): boolean {
	return /^\d{9}$/.test(inn.trim());
}

// 3. Telefon raqami tekshiruvi (+998...)
export function validatePhone(phone: string): boolean {
	const clean = phone.replace(/[^\d+]/g, '');
	return /^\+?998\d{9}$/.test(clean);
}

// 4. Katta sonlarni kartalarda sig'dirish uchun formatlagich (ixtiyoriy, UI buzilmasligi uchun)
export function formatCompactNumber(num: number): string {
	if (num >= 1e12) return (num / 1e12).toFixed(1) + ' trln';
	if (num >= 1e9) return (num / 1e9).toFixed(1) + ' mlrd';
	if (num >= 1e6) return (num / 1e6).toFixed(1) + ' mln';
	return num.toLocaleString('uz-UZ');
}
export function formatOy(dateStr: string): string {
	if (!dateStr) return '—';
	try {
		const d = new Date(dateStr);
		if (isNaN(d.getTime())) return dateStr;
		// Natija: "2026-07" yoki "Iyul 2026"
		return d.toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit' });
	} catch {
		return dateStr;
	}
}

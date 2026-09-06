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

// src/api.ts

const API_URL = import.meta.env.VITE_GOOGLE_SHEETS_API_URL;

export interface SheetDataResponse {
	Mijozlar: any[][];
	Hodimlar: any[][];
	Kirim: any[][];
	Chiqim: any[][];
	Maosh: any[][];
}

// 1. Google Sheets'dan JSONP orqali ma'lumotlarni o'qish (CORS butunlay aylanib o'tiladi)
export function fetchAllSheetData(): Promise<SheetDataResponse> {
	return new Promise((resolve, reject) => {
		if (!API_URL) {
			return reject(
				new Error(
					'VITE_GOOGLE_SHEETS_API_URL topilmadi. .env faylini tekshiring.',
				),
			);
		}

		const callbackName =
			'googleSheetsCallback_' + Math.round(100000 * Math.random());
		const script = document.createElement('script');

		// Callback funksiyasini global window obyektiga ulaymiz
		(window as any)[callbackName] = (response: any) => {
			// Tozalash
			delete (window as any)[callbackName];
			document.body.removeChild(script);

			if (response && response.status === 'success') {
				resolve(response.data);
			} else {
				reject(new Error(response?.message || "Noma'lum xatolik"));
			}
		};

		script.src = `${API_URL}?callback=${callbackName}`;
		script.onerror = () => {
			delete (window as any)[callbackName];
			document.body.removeChild(script);
			reject(new Error("Google Apps Script bilan bog'lanib bo'lmadi."));
		};

		document.body.appendChild(script);
	});
}

// 2. Google Sheets'ga yangi qator qo'shish (Add)
export async function addSheetRow(
	sheet: string,
	rowData: any[],
): Promise<void> {
	if (!API_URL) return;

	await fetch(API_URL, {
		method: 'POST',
		mode: 'no-cors',
		headers: {
			'Content-Type': 'text/plain;charset=utf-8',
		},
		body: JSON.stringify({
			action: 'add',
			sheet,
			data: rowData,
		}),
	});
}

// 3. Qatorni tahrirlash (Update)
export async function updateSheetRow(
	sheet: string,
	id: string,
	rowData: any[],
): Promise<void> {
	if (!API_URL) return;

	await fetch(API_URL, {
		method: 'POST',
		mode: 'no-cors',
		headers: {
			'Content-Type': 'text/plain;charset=utf-8',
		},
		body: JSON.stringify({
			action: 'update',
			sheet,
			id,
			data: rowData,
		}),
	});
}

// 4. Qatorni o'chirish (Delete)
export async function deleteSheetRow(sheet: string, id: string): Promise<void> {
	if (!API_URL) return;

	await fetch(API_URL, {
		method: 'POST',
		mode: 'no-cors',
		headers: {
			'Content-Type': 'text/plain;charset=utf-8',
		},
		body: JSON.stringify({
			action: 'delete',
			sheet,
			id,
		}),
	});
}

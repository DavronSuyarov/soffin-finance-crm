"use strict";
// src/mappers.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRowToMijoz = mapRowToMijoz;
exports.mapRowToHodim = mapRowToHodim;
exports.mapRowToKirim = mapRowToKirim;
exports.mapRowToChiqim = mapRowToChiqim;
exports.mapRowToMaosh = mapRowToMaosh;
// ============================================================
// YORDAMCHI XAVFSIZLIK FUNKSIYALARI (HELPERS)
// ============================================================
/** Matnni xavfsiz songa o'tkazadi. Agar bo'sh yoki noto'g'ri bo'lsa, 0 qaytaradi */
function parseNumber(val) {
    if (typeof val === 'number')
        return isNaN(val) ? 0 : val;
    if (!val)
        return 0;
    const cleaned = String(val).replace(/\s+/g, '').replace(/,/g, '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}
/** Matnni tozalaydi */
function parseString(val) {
    return val ? String(val).trim() : '';
}
// ============================================================
// MAPPERS (MASSIV -> TS OBYEKT)
// ============================================================
function mapRowToMijoz(row) {
    return {
        id: parseString(row[0]),
        kompaniya: parseString(row[1]),
        kontakt: parseString(row[2]),
        telefon: parseString(row[3]),
        inn: parseString(row[4]),
        status: (parseString(row[5]) || 'Faol'),
        izoh: parseString(row[6]),
        sana: parseString(row[7]),
    };
}
function mapRowToHodim(row) {
    return {
        id: parseString(row[0]),
        ism: parseString(row[1]),
        lavozim: parseString(row[2]),
        bolim: parseString(row[3]),
        oylikMaosh: parseNumber(row[4]),
        telefon: parseString(row[5]),
        holat: (parseString(row[6]) || 'Faol'),
        sana: parseString(row[7]),
    };
}
function mapRowToKirim(row) {
    return {
        id: parseString(row[0]),
        mijozId: parseString(row[1]),
        kompaniya: parseString(row[2]),
        summa: parseNumber(row[3]),
        valyuta: (parseString(row[4]) || 'UZS'),
        sana: parseString(row[5]),
        tur: (parseString(row[6]) || 'Boshqa'),
        holat: (parseString(row[7]) || 'Kutilmoqda'),
        invoice: parseString(row[8]),
        izoh: parseString(row[9]),
    };
}
function mapRowToChiqim(row) {
    return {
        id: parseString(row[0]),
        kategoriya: (parseString(row[1]) || 'Boshqa'),
        tavsif: parseString(row[2]),
        summa: parseNumber(row[3]),
        valyuta: (parseString(row[4]) || 'UZS'),
        sana: parseString(row[5]),
        masulIsm: parseString(row[6]),
        holat: (parseString(row[7]) || 'Kutilmoqda'),
        izoh: parseString(row[8]),
    };
}
function mapRowToMaosh(row) {
    const belgilangan = parseNumber(row[4]);
    const berilgan = parseNumber(row[5]);
    const qoldiq = Math.max(0, belgilangan - berilgan);
    return {
        id: parseString(row[0]),
        hodimId: parseString(row[1]),
        ism: parseString(row[2]),
        davr: parseString(row[3]),
        belgilangan,
        berilgan,
        qoldiq,
        holat: (qoldiq > 0 ? 'Qarzli' : 'Tolangan'),
        izoh: parseString(row[8]),
    };
}

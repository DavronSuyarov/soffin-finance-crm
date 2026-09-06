"use strict";
// src/finance.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDashboardSummary = calculateDashboardSummary;
// ============================================================
// 1. VAQT VA SANA BILAN ISHLOVCHI YORDAMCHI FUNKSIYALAR
// ============================================================
/**
 * DD.MM.YYYY formatidagi sanani guruhlash uchun "YYYY-MM" ga aylantiradi.
 * Masalan: "15.01.2026" -> "2026-01"
 */
function extractYearMonth(sanaStr) {
    if (!sanaStr)
        return '';
    const parts = sanaStr.split('.');
    if (parts.length === 3) {
        const [kun, oy, yil] = parts;
        return `${yil}-${oy.padStart(2, '0')}`;
    }
    return '';
}
/**
 * "YYYY-MM" kalitini grafiklarga qulay nomga aylantiradi.
 * Masalan: "2026-01" -> "Yan 2026"
 */
function formatMonthLabel(ym) {
    const oyNomlari = {
        '01': 'Yan',
        '02': 'Fev',
        '03': 'Mar',
        '04': 'Apr',
        '05': 'May',
        '06': 'Iyn',
        '07': 'Iyl',
        '08': 'Avg',
        '09': 'Sen',
        '10': 'Okt',
        '11': 'Noy',
        '12': 'Dek',
    };
    const [yil, oy] = ym.split('-');
    return oyNomlari[oy] ? `${oyNomlari[oy]} ${yil}` : ym;
}
// ============================================================
// 2. MOLIYAVIY HISOB-KITOB MOTORLARI (PURE ENGINES)
// ============================================================
/**
 * Barcha bo'lim ma'lumotlarini qabul qilib, mukammal boshqaruv
 * tahlilini (DashboardXulosa) generatsiya qiladi.
 */
function calculateDashboardSummary(mijozlar, hodimlar, kirimlar, chiqimlar, maoshlar) {
    // --- 1. Mijozlar va Hodimlar statistikasi ---
    const jamiMijozlar = mijozlar.length;
    const faolMijozlar = mijozlar.filter(m => m.status === 'Faol').length;
    const jamiHodimlar = hodimlar.length;
    const faolHodimlar = hodimlar.filter(h => h.holat === 'Faol').length;
    // --- 2. Kirimlar tahlili ---
    let jamiKirim = 0; // Faqat to'langan (haqiqiy kassa)
    let kutilayotganKirim = 0;
    for (const k of kirimlar) {
        if (k.holat === 'Tolangan') {
            jamiKirim += k.summa;
        }
        else if (k.holat === 'Kutilmoqda') {
            kutilayotganKirim += k.summa;
        }
    }
    // --- 3. Operatsion Chiqimlar tahlili ---
    let operatsionChiqim = 0; // Faqat to'langan
    const kategoriyaXarajatMap = {};
    for (const x of chiqimlar) {
        if (x.holat === 'Tolangan') {
            operatsionChiqim += x.summa;
            kategoriyaXarajatMap[x.kategoriya] =
                (kategoriyaXarajatMap[x.kategoriya] || 0) + x.summa;
        }
    }
    // --- 4. Maosh (Payroll) tahlili ---
    let berilganMaosh = 0;
    let xodimlardanQarz = 0;
    for (const m of maoshlar) {
        berilganMaosh += m.berilgan;
        xodimlardanQarz += m.qoldiq;
    }
    // --- 5. Asosiy Moliyaviy Balans Formulalari ---
    const umumiyChiqim = operatsionChiqim + berilganMaosh;
    const sofFoyda = jamiKirim - umumiyChiqim;
    // --- 6. Chiqimlar Strukturasi (Kategoriyalar ulushi) ---
    const chiqimKategoriyalari = Object.entries(kategoriyaXarajatMap)
        .map(([kat, summa]) => ({
        kategoriya: kat,
        summa: summa,
        ulushFoiz: operatsionChiqim > 0
            ? Math.round((summa / operatsionChiqim) * 100)
            : 0,
    }))
        .sort((a, b) => b.summa - a.summa);
    // --- 7. Oylik Dinamika (Kirim vs Chiqim grafikasi) ---
    const oylikMap = {};
    // Kirimlarni oylar bo'yicha guruhlash
    for (const k of kirimlar) {
        if (k.holat !== 'Tolangan')
            continue;
        const ym = extractYearMonth(k.sana);
        if (!ym)
            continue;
        if (!oylikMap[ym])
            oylikMap[ym] = { kirim: 0, operatsion: 0, maosh: 0 };
        oylikMap[ym].kirim += k.summa;
    }
    // Operatsion chiqimlarni oylar bo'yicha guruhlash
    for (const x of chiqimlar) {
        if (x.holat !== 'Tolangan')
            continue;
        const ym = extractYearMonth(x.sana);
        if (!ym)
            continue;
        if (!oylikMap[ym])
            oylikMap[ym] = { kirim: 0, operatsion: 0, maosh: 0 };
        oylikMap[ym].operatsion += x.summa;
    }
    // Maosh chiqimlarini oylar bo'yicha guruhlash
    for (const m of maoshlar) {
        const ym = m.davr; // Masalan "2026-09"
        if (!ym)
            continue;
        if (!oylikMap[ym])
            oylikMap[ym] = { kirim: 0, operatsion: 0, maosh: 0 };
        oylikMap[ym].maosh += m.berilgan;
    }
    // So'nggi oylarni tartib bilan massivga o'tkazish
    const oylikTahlil = Object.keys(oylikMap)
        .sort()
        .slice(-6) // Oxirgi 6 oyni ko'rsatish
        .map(ym => {
        const data = oylikMap[ym];
        const jamiChq = data.operatsion + data.maosh;
        return {
            davr: formatMonthLabel(ym),
            kirim: data.kirim,
            operatsionChiqim: data.operatsion,
            maoshChiqim: data.maosh,
            jamiChiqim: jamiChq,
            sofFoyda: data.kirim - jamiChq,
        };
    });
    return {
        jamiMijozlar,
        faolMijozlar,
        jamiHodimlar,
        faolHodimlar,
        jamiKirim,
        operatsionChiqim,
        berilganMaosh,
        umumiyChiqim,
        sofFoyda,
        kutilayotganKirim,
        xodimlardanQarz,
        oylikTahlil,
        chiqimKategoriyalari,
    };
}

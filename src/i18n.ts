// src/i18n.ts

export type Language = 'uz' | 'ru' | 'en';

export const translations = {
	uz: {
		// Asosiy bo'limlar / Navigatsiya
		dashboard: 'Bosh sahifa',
		mijozlar: 'Mijozlar',
		soliqlar: 'Soliqlar nazorati',
		hodimlar: 'Xodimlar',
		kpiDavomat: 'KPI va Davomat',
		kirim: 'Kirim (Daromad)',
		chiqim: 'Chiqim (Xarajat)',
		maosh: 'Maoshlar',

		// Umumiy tugmalar va matnlar
		qidirish: 'Qidirish...',
		filtrlash: 'Filtrlash',
		saqlash: 'Saqlash',
		bekorQilish: 'Bekor qilish',
		ochirish: 'O‘chirish',
		tahrirlash: 'Tahrirlash',
		amallar: 'Amallar',
		barchaHolatlar: 'Barcha holatlar',
		barchaKategoriyalar: 'Barcha toifalar',
		id: 'ID',
		sana: 'Sana',
		davr: 'Davr',
		izoh: 'Izoh',
		holat: 'Holat',
		summa: 'Summa',
		valyuta: 'Valyuta',

		// Dashboard bo'limi (Kartochkalar va Grafika)
		chiqimStrukturasi: 'Xarajatlar strukturasi',
		oylikDinamika: 'Oylik moliyaviy dinamika',
		jamiKirim: 'Jami Kirim',
		tushganKirim: 'Tushgan mablag‘',
		kutilmoqda: 'Kutilmoqda',
		kutilayotganKirim: 'Kutilayotgan tushum',
		mijozlarQarzi: 'Mijozlar qarzdorligi',
		debitorlik: 'Debitorlik',
		debitorlikQarzi: 'Debitorlik qarzi',
		qarziYoq: 'Qarzi yo‘q',
		umumiyChiqim: 'Umumiy Chiqim',
		operatsionChiqim: 'Operatsion chiqim',
		maoshChiqim: 'Maosh chiqimi',
		jamiChiqim: 'Jami Chiqim',
		sofFoyda: 'Sof Foyda',
		zarar: 'Zarar',
		ijobiyBalans: 'Ijobiy balans',
		xarajatOshdi: 'Xarajat daromaddan oshdi',
		xodimlargaQarz: 'Xodimlarga qarz',
		xodimlardanQarz: 'Xodimlarga qarz',

		// Kirim (Daromad) bo'limi
		yangiKirim: '+ Yangi kirim qo‘shish',
		invoice: 'Hisob-faktura (Invoice)',
		xizmatTuri: 'Xizmat turi',
		tolanganSana: 'To‘lov sanasi',
		shakllantirishAbonent: '⚡ Oylik abonent to‘lovlarini shakllantirish',
		abonentShakllantirish: '⚡ Oylik abonent to‘lovlarini shakllantirish',
		kirimTurlari: {
			'Buxgalteriya hisobi': 'Buxgalteriya hisobi',
			Audit: 'Audit xizmati',
			Konsultatsiya: 'Soliq konsultatsiyasi',
			'Qayta tiklash': 'Hisobni qayta tiklash',
			Boshqa: 'Boshqa xizmat',
		},
		kirimXizmatTurlari: {
			'Buxgalteriya hisobi': 'Buxgalteriya hisobi',
			Audit: 'Audit xizmati',
			Konsultatsiya: 'Soliq konsultatsiyasi',
			'Qayta tiklash': 'Hisobni qayta tiklash',
			Boshqa: 'Boshqa xizmat',
		},

		// Chiqim (Xarajat) bo'limi
		yangiChiqim: '+ Yangi chiqim qo‘shish',
		kategoriya: 'Xarajat toifasi',
		tavsif: 'Tavsif',
		chiqimKategoriyalari: {
			Ijara: 'Ofis ijarasi',
			'Ofis xarajat': 'Ofis xarajatlari',
			Kommunal: 'Kommunal to‘lovlar',
			Transport: 'Transport xarajatlari',
			Marketing: 'Marketing va reklama',
			"Dasturiy ta'minot": "Dasturiy ta'minot (1C, CRM)",
			Boshqa: 'Boshqa xarajatlar',
			Maosh: 'Ish haqi to‘lovlari',
		},

		// Mijozlar bo'limi
		yangiMijoz: '+ Yangi mijoz qo‘shish',
		kompaniya: 'Kompaniya nomi',
		kontakt: 'Mas’ul shaxs (F.I.SH)',
		masulShaxs: 'Mas’ul shaxs (F.I.SH)',
		telefon: 'Telefon raqam',
		inn: 'STIR (INN)',
		tarifSummasi: 'Oylik xizmat tarifi',
		tolovKuni: 'Oylik to‘lov sanasi',
		masulBuxgalter: 'Mas’ul buxgalter',
		soliqRejimi: 'Soliq rejimi',
		oylikTarif: 'Oylik tarif',
		tolovMuddati: 'To‘lov muddati',
		harOyningSanasi: 'Har oyning {kun}-sanasi',

		// Soliq rejimlari
		soliqRejimlari: {
			AOS: 'AOS (Aylanmadan olinadigan soliq - 4%)',
			Umumbelgilangan: 'Umumbelgilangan (QQS 12% + Foyda solig‘i 15%)',
			'Nodavlat/NHT': 'Nodavlat notijorat (Faqat JSHOD va Ijtimoiy)',
		},

		// Davriylik
		davriyliklar: {
			Oylik: 'Oylik hisobot',
			Choraklik: 'Choraklik hisobot',
			Yillik: 'Yillik hisobot',
		},

		// Soliqlar monitoringi
		soliqTuri: 'Soliq hisoboti turi',
		oxirgiMuddat: 'Oxirgi topshirish muddati',
		topshirilganSana: 'Topshirilgan sana',
		yangiSoliqHisoboti: '+ Soliq hisoboti qo‘shish',
		soliqShakllantirish: '⚡ Oylik soliqlarni shakllantirish',
		davriyligi: 'Davriyligi',

		// Soliq turlari
		soliqTurlari: {
			'JSHOD va Ijtimoiy soliq': 'JSHOD va Ijtimoiy soliq (15-sanagacha)',
			'Aylanmadan olinadigan soliq (AOS)':
				'Aylanmadan olinadigan soliq (AOS - 15-sana)',
			QQS: 'QQS (Qo‘shilgan qiymat solig‘i - 20-sanagacha)',
			'Foyda solig‘i (Choraklik)':
				'Foyda solig‘i (Choraklik hisob-kitob - 20-sana)',
			'Yillik Foyda solig‘i': 'Yillik Foyda solig‘i (1-martgacha)',
			'Yillik Moliyaviy hisobot (1-2 shakl)':
				'Yillik Moliyaviy hisobot 1-2 shakl (15-fevralgacha)',
			'Mol-mulk va Yer solig‘i': 'Mol-mulk va Yer solig‘i hisoboti',
			'Suv resurslaridan foydalanish solig‘i':
				'Suv resurslaridan foydalanish solig‘i',
			'Statistika hisoboti': 'Davlat statistika hisoboti',
			'Boshqa hisobot': 'Boshqa turdagi hisobot',
		},

		// Xodimlar va Davomat / KPI
		yangiHodim: '+ Yangi xodim',
		ismFamiliya: 'F.I.SH',
		lavozim: 'Lavozimi',
		bolim: 'Bo‘limi',
		oylikMaosh: 'Oylik shtat maoshi',
		davomatKiritish: '+ Davomat qayd etish',
		kelganVaqt: 'Kelgan vaqti',
		kechikishDaqiqa: 'Kechikish (daqiqa)',
		bazaviyMaosh: 'Shtat maoshi',
		asosiyQism: 'Asosiy qism (85%)',
		bonusFond: 'Bonus fondi (15%)',
		kechikishlar: 'Kechikishlar soni',
		kelmaganKunlar: 'Kelmagan kunlar',
		kechikkanHisobotlar: 'Kechikkan hisobotlar',
		hisoblanganBonus: 'Haqiqiy bonus',
		yakuniyMaosh: 'Jami to‘lanadigan maosh',

		// Maoshlar
		belgilangan: 'Belgilangan maosh',
		berilgan: 'Berilgan summa',
		qoldiq: 'Qoldiq (Qarz)',
		yangiMaosh: '+ Maosh to‘lovi yozish',

		// Universal statuslar
		statuslar: {
			Faol: 'Faol',
			Kutilmoqda: 'Kutilmoqda',
			Nofaol: 'Nofaol',
			"Ta'tilda": 'Ta’tilda',
			Tolangan: 'To‘langan',
			Qarzli: 'Qarzdorlik bor',
			Bekor: 'Bekor qilingan',
			Topshirildi: 'Topshirildi',
			Kechikkan: 'Muddati o‘tgan',
			Keldi: 'O‘z vaqtida keldi',
			Kechikdi: 'Kechikdi',
			Kelmadi: 'Kelmadi',
			Sababli: 'Sababli kelmadi',
		},
	},

	ru: {
		// Разделы / Навигация
		dashboard: 'Главная',
		mijozlar: 'Клиенты',
		soliqlar: 'Налоговый контроль',
		hodimlar: 'Сотрудники',
		kpiDavomat: 'KPI и Посещаемость',
		kirim: 'Доходы',
		chiqim: 'Расходы',
		maosh: 'Зарплаты',

		// Общие
		qidirish: 'Поиск...',
		filtrlash: 'Фильтр',
		saqlash: 'Сохранить',
		bekorQilish: 'Отмена',
		ochirish: 'Удалить',
		tahrirlash: 'Редактировать',
		amallar: 'Действия',
		barchaHolatlar: 'Все статусы',
		barchaKategoriyalar: 'Все категории',
		id: 'ID',
		sana: 'Дата',
		davr: 'Период',
		izoh: 'Примечание',
		holat: 'Статус',
		summa: 'Сумма',
		valyuta: 'Валюта',

		// Главная
		chiqimStrukturasi: 'Структура расходов',
		oylikDinamika: 'Ежемесячная динамика',
		jamiKirim: 'Всего Доходов',
		tushganKirim: 'Поступившие средства',
		kutilmoqda: 'Ожидается',
		kutilayotganKirim: 'Ожидаемые поступления',
		mijozlarQarzi: 'Задолженность клиентов',
		debitorlik: 'Дебиторская задолженность',
		debitorlikQarzi: 'Дебиторская задолженность',
		qarziYoq: 'Нет долга',
		umumiyChiqim: 'Общие расходы',
		operatsionChiqim: 'Операционные расходы',
		maoshChiqim: 'Расходы на зарплату',
		jamiChiqim: 'Всего Расходов',
		sofFoyda: 'Чистая прибыль',
		zarar: 'Убыток',
		ijobiyBalans: 'Положительный баланс',
		xarajatOshdi: 'Расходы превысили доходы',
		xodimlargaQarz: 'Долг перед сотрудниками',
		xodimlardanQarz: 'Долг перед сотрудниками',

		// Доходы
		yangiKirim: '+ Добавить доход',
		invoice: 'Счет-фактура (Инвойс)',
		xizmatTuri: 'Вид услуги',
		tolanganSana: 'Дата оплаты',
		shakllantirishAbonent: '⚡ Сформировать абонентские счета',
		abonentShakllantirish: '⚡ Сформировать абонентские счета',
		kirimTurlari: {
			'Buxgalteriya hisobi': 'Бухгалтерский учет',
			Audit: 'Аудиторские услуги',
			Konsultatsiya: 'Налоговый консалтинг',
			'Qayta tiklash': 'Восстановление учета',
			Boshqa: 'Прочие услуги',
		},
		kirimXizmatTurlari: {
			'Buxgalteriya hisobi': 'Бухгалтерский учет',
			Audit: 'Аудиторские услуги',
			Konsultatsiya: 'Налоговый консалтинг',
			'Qayta tiklash': 'Восстановление учета',
			Boshqa: 'Прочие услуги',
		},

		// Расходы
		yangiChiqim: '+ Добавить расход',
		kategoriya: 'Категория расходов',
		tavsif: 'Описание',
		chiqimKategoriyalari: {
			Ijara: 'Аренда офиса',
			'Ofis xarajat': 'Офисные расходы',
			Kommunal: 'Коммунальные услуги',
			Transport: 'Транспортные расходы',
			Marketing: 'Маркетинг и реклама',
			"Dasturiy ta'minot": 'ПО (1С, CRM)',
			Boshqa: 'Прочие расходы',
			Maosh: 'Выплаты по зарплате',
		},

		// Клиенты
		yangiMijoz: '+ Добавить клиента',
		kompaniya: 'Компания',
		kontakt: 'Контактное лицо',
		masulShaxs: 'Контактное лицо',
		telefon: 'Телефон',
		inn: 'ИНН',
		tarifSummasi: 'Тариф за месяц',
		tolovKuni: 'День оплаты',
		masulBuxgalter: 'Ответственный бухгалтер',
		soliqRejimi: 'Налоговый режим',
		oylikTarif: 'Ежемесячный тариф',
		tolovMuddati: 'Срок оплаты',
		harOyningSanasi: 'Каждое {kun}-е число месяца',

		// Налоговые режимы
		soliqRejimlari: {
			AOS: 'Налог с оборота (4%)',
			Umumbelgilangan: 'Общеустановленный (НДС 12% + Налог на прибыль 15%)',
			'Nodavlat/NHT': 'ННО / Некоммерческий (Только НДФЛ и Соцналог)',
		},

		// Периодичность
		davriyliklar: {
			Oylik: 'Ежемесячный',
			Choraklik: 'Квартальный',
			Yillik: 'Годовой',
		},

		// Налоги
		soliqTuri: 'Вид налогового отчета',
		oxirgiMuddat: 'Крайний срок',
		topshirilganSana: 'Дата сдачи',
		yangiSoliqHisoboti: '+ Добавить отчет',
		soliqShakllantirish: '⚡ Сформировать налоги месяца',
		davriyligi: 'Периодичность',

		// Виды налогов
		soliqTurlari: {
			'JSHOD va Ijtimoiy soliq': 'НДФЛ и Социальный налог (до 15-го)',
			'Aylanmadan olinadigan soliq (AOS)': 'Налог с оборота (до 15-го)',
			QQS: 'НДС (до 20-го)',
			'Foyda solig‘i (Choraklik)': 'Налог на прибыль (Квартальный - до 20-го)',
			'Yillik Foyda solig‘i': 'Налог на прибыль (Годовой - до 1 марта)',
			'Yillik Moliyaviy hisobot (1-2 shakl)':
				'Финансовая отчетность Формы 1-2 (до 15 февраля)',
			'Mol-mulk va Yer solig‘i': 'Налог на имущество и землю',
			'Suv resurslaridan foydalanish solig‘i': 'Налог за водопользование',
			'Statistika hisoboti': 'Статистическая отчетность',
			'Boshqa hisobot': 'Прочая отчетность',
		},

		// Сотрудники / Посещаемость
		yangiHodim: '+ Сотрудник',
		ismFamiliya: 'Ф.И.О.',
		lavozim: 'Должность',
		bolim: 'Отдел',
		oylikMaosh: 'Оклад',
		davomatKiritish: '+ Отметить визит',
		kelganVaqt: 'Время прибытия',
		kechikishDaqiqa: 'Опоздание (мин)',
		bazaviyMaosh: 'Базовый оклад',
		asosiyQism: 'Гарант. часть (85%)',
		bonusFond: 'Бонусный фонд (15%)',
		kechikishlar: 'Кол-во опозданий',
		kelmaganKunlar: 'Пропуски (дни)',
		kechikkanHisobotlar: 'Просроченные отчеты',
		hisoblanganBonus: 'Начисленный бонус',
		yakuniyMaosh: 'Итого к выплате',

		// Зарплаты
		belgilangan: 'Установлено',
		berilgan: 'Выплачено',
		qoldiq: 'Остаток (Долг)',
		yangiMaosh: '+ Выплата зарплаты',

		// Статусы
		statuslar: {
			Faol: 'Активный',
			Kutilmoqda: 'Ожидается',
			Nofaol: 'Неактивный',
			"Ta'tilda": 'В отпуске',
			Tolangan: 'Оплачено',
			Qarzli: 'Есть долг',
			Bekor: 'Отменено',
			Topshirildi: 'Сдано',
			Kechikkan: 'Просрочено',
			Keldi: 'Вовремя',
			Kechikdi: 'Опоздал',
			Kelmadi: 'Не явился',
			Sababli: 'Уважительная',
		},
	},

	en: {
		// Sections
		dashboard: 'Dashboard',
		mijozlar: 'Clients',
		soliqlar: 'Tax Control',
		hodimlar: 'Employees',
		kpiDavomat: 'KPI & Attendance',
		kirim: 'Income',
		chiqim: 'Expenses',
		maosh: 'Salaries',

		// Common
		qidirish: 'Search...',
		filtrlash: 'Filter',
		saqlash: 'Save',
		bekorQilish: 'Cancel',
		ochirish: 'Delete',
		tahrirlash: 'Edit',
		amallar: 'Actions',
		barchaHolatlar: 'All statuses',
		barchaKategoriyalar: 'All categories',
		id: 'ID',
		sana: 'Date',
		davr: 'Period',
		izoh: 'Note',
		holat: 'Status',
		summa: 'Amount',
		valyuta: 'Currency',

		// Dashboard
		chiqimStrukturasi: 'Expense Structure',
		oylikDinamika: 'Monthly Financial Trend',
		jamiKirim: 'Total Income',
		tushganKirim: 'Received Inflow',
		kutilmoqda: 'Pending',
		kutilayotganKirim: 'Expected Inflow',
		mijozlarQarzi: 'Client Receivables',
		debitorlik: 'Receivables',
		debitorlikQarzi: 'Receivables Due',
		qarziYoq: 'No Debt',
		umumiyChiqim: 'Total Expenses',
		operatsionChiqim: 'Operating Expenses',
		maoshChiqim: 'Payroll Expenses',
		jamiChiqim: 'Total Expenses',
		sofFoyda: 'Net Profit',
		zarar: 'Loss',
		ijobiyBalans: 'Positive Balance',
		xarajatOshdi: 'Expenses exceeded income',
		xodimlargaQarz: 'Due to Employees',
		xodimlardanQarz: 'Due to Employees',

		// Income
		yangiKirim: '+ Add Income',
		invoice: 'Invoice',
		xizmatTuri: 'Service Type',
		tolanganSana: 'Payment Date',
		shakllantirishAbonent: '⚡ Generate Subscription Invoices',
		abonentShakllantirish: '⚡ Generate Subscription Invoices',
		kirimTurlari: {
			'Buxgalteriya hisobi': 'Accounting',
			Audit: 'Audit Service',
			Konsultatsiya: 'Tax Consulting',
			'Qayta tiklash': 'Record Reconstruction',
			Boshqa: 'Other Service',
		},
		kirimXizmatTurlari: {
			'Buxgalteriya hisobi': 'Accounting',
			Audit: 'Audit Service',
			Konsultatsiya: 'Tax Consulting',
			'Qayta tiklash': 'Record Reconstruction',
			Boshqa: 'Other Service',
		},

		// Expenses
		yangiChiqim: '+ Add Expense',
		kategoriya: 'Expense Category',
		tavsif: 'Description',
		chiqimKategoriyalari: {
			Ijara: 'Office Rent',
			'Ofis xarajat': 'Office Supplies',
			Kommunal: 'Utilities',
			Transport: 'Transportation',
			Marketing: 'Marketing & Ads',
			"Dasturiy ta'minot": 'Software (1C, CRM)',
			Boshqa: 'Other Expenses',
			Maosh: 'Payroll Expenses',
		},

		// Clients
		yangiMijoz: '+ Add Client',
		kompaniya: 'Company',
		kontakt: 'Contact Person',
		masulShaxs: 'Contact Person',
		telefon: 'Phone',
		inn: 'TIN (INN)',
		tarifSummasi: 'Monthly Fee',
		tolovKuni: 'Billing Day',
		masulBuxgalter: 'Assigned Accountant',
		soliqRejimi: 'Tax Regime',
		oylikTarif: 'Monthly Fee',
		tolovMuddati: 'Payment Deadline',
		harOyningSanasi: 'Every {kun}th of month',

		// Tax Regimes
		soliqRejimlari: {
			AOS: 'Turnover Tax (4%)',
			Umumbelgilangan: 'Standard (VAT 12% + Profit Tax 15%)',
			'Nodavlat/NHT': 'Non-commercial (PIT & Social Tax only)',
		},

		// Periodicity
		davriyliklar: {
			Oylik: 'Monthly',
			Choraklik: 'Quarterly',
			Yillik: 'Annual',
		},

		// Taxes
		soliqTuri: 'Tax Report Type',
		oxirgiMuddat: 'Deadline',
		topshirilganSana: 'Submission Date',
		yangiSoliqHisoboti: '+ Add Tax Report',
		soliqShakllantirish: '⚡ Generate Monthly Taxes',
		davriyligi: 'Periodicity',

		// Tax Types
		soliqTurlari: {
			'JSHOD va Ijtimoiy soliq': 'PIT & Social Tax (by 15th)',
			'Aylanmadan olinadigan soliq (AOS)': 'Turnover Tax (by 15th)',
			QQS: 'VAT (by 20th)',
			'Foyda solig‘i (Choraklik)': 'Corporate Profit Tax (Quarterly - by 20th)',
			'Yillik Foyda solig‘i': 'Annual Corporate Profit Tax (by Mar 1)',
			'Yillik Moliyaviy hisobot (1-2 shakl)':
				'Annual Financial Statements Form 1-2 (by Feb 15)',
			'Mol-mulk va Yer solig‘i': 'Property & Land Tax',
			'Suv resurslaridan foydalanish solig‘i': 'Water Resources Tax',
			'Statistika hisoboti': 'State Statistics Report',
			'Boshqa hisobot': 'Other Report',
		},

		// Employees & Attendance
		yangiHodim: '+ Employee',
		ismFamiliya: 'Full Name',
		lavozim: 'Position',
		bolim: 'Department',
		oylikMaosh: 'Base Salary',
		davomatKiritish: '+ Log Attendance',
		kelganVaqt: 'Arrival Time',
		kechikishDaqiqa: 'Late (min)',
		bazaviyMaosh: 'Base Salary',
		asosiyQism: 'Guaranteed (85%)',
		bonusFond: 'Bonus Pool (15%)',
		kechikishlar: 'Late Count',
		kelmaganKunlar: 'Absence Days',
		kechikkanHisobotlar: 'Overdue Reports',
		hisoblanganBonus: 'Earned Bonus',
		yakuniyMaosh: 'Total Payout',

		// Salaries
		belgilangan: 'Designated',
		berilgan: 'Paid Out',
		qoldiq: 'Balance Due',
		yangiMaosh: '+ Record Salary',

		// Statuses
		statuslar: {
			Faol: 'Active',
			Kutilmoqda: 'Pending',
			Nofaol: 'Inactive',
			"Ta'tilda": 'On Vacation',
			Tolangan: 'Paid',
			Qarzli: 'Has Debt',
			Bekor: 'Cancelled',
			Topshirildi: 'Submitted',
			Kechikkan: 'Overdue',
			Keldi: 'On Time',
			Kechikdi: 'Late',
			Kelmadi: 'Absent',
			Sababli: 'Excused',
		},
	},
};

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// ===== CONFIG =====
const token = process.env.BOT_TOKEN;
const adminChatId = process.env.ADMIN_CHAT_ID;
const stripeToken = process.env.STRIPE_TOKEN;

if (!token) {
  console.error('Error: BOT_TOKEN not set in .env file');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const userSessions = {};
const userLanguages = {};
const userDocuments = {};

// Create uploads directory
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// ===== TRANSLATIONS =====
const T = {
  en: {
    welcome: (name) => `Hello *${name}*!\n\n*Your UAE Journey Starts Here*\n\nFast and reliable UAE visa processing and professional PRO services.\n\n30 & 60 Day Visit Visas | Visa Extensions | Status Changes | PRO Services\n\nProcessing: 24-48 Hours | Abu Dhabi, UAE`,
    menu: 'Main Menu',
    apply: 'Apply Now',
    pricing: 'Pricing',
    services: 'Visa Services',
    proServices: 'PRO Services',
    faq: 'FAQ',
    contact: 'Contact',
    testimonials: 'Testimonials',
    howItWorks: 'How It Works',
    whyChooseUs: 'Why Choose Us',
    settings: 'Settings',
    language: 'Change Language',
    back: 'Back',
    selectLanguage: 'Select your language / ቋንቋ ምረጥ / ቛንቛ ምረፅ',
    price30: 'AED 1,200',
    price60: 'AED 1,800',
    priceExt: 'AED 1,100',
    step: (current, total) => `Step ${current} of ${total}`,
    enterFullName: 'Please enter your *Full Name*',
    enterNationality: 'Please enter your *Nationality*',
    enterLocation: 'Please enter your *Current Location*',
    selectVisaType: 'Select your *Visa Type*',
    enterTravelDate: 'Enter your *Travel Date* (or type "Not sure")',
    enterPhone: 'Enter your *WhatsApp Number* (with country code)',
    enterEmail: 'Enter your *Email Address* (or type "Skip")',
    uploadPassport: 'Please upload a clear photo of your *Passport* (data page)',
    uploadPhoto: 'Please upload your *Passport Size Photo* (white background)',
    uploadBankStmt: 'Please upload your *6-Month Bank Statement* (PDF or photo)',
    docReceived: (type) => `Received your *${type}*`,
    allDocsReceived: 'All documents received! Now proceed to payment.',
    selectPayment: 'Select *Payment Method*',
    payCard: 'Pay with Card (Stripe)',
    payBank: 'Bank Transfer',
    payCash: 'Cash Payment',
    payWhatsApp: 'Pay via WhatsApp',
    bankDetails: 'Bank Transfer Details:\n\nBank: RAKBANK (RAK)\nAccount Name: ASK MIAN LLC\nAccount: 0303698014001\nIBAN: AE770400000303698014001\n\nAfter transfer, please upload your receipt.', // <-- UPDATE: Edit these values in bot.js to match your real bank account
    uploadReceipt: 'Please upload your *Transfer Receipt* (screenshot/photo)',
    receiptReceived: 'Receipt received! We will verify your payment.',
    cashInstructions: 'For cash payment, please visit our office in Abu Dhabi.\n\nAddress: Office on Appointment\nAbu Dhabi, UAE\nPhone: +971 55 868 9543\n\nMon - Fri: 9:00 AM - 9:00 PM',
    whatsappPayment: 'Tap the button below to open WhatsApp and complete your payment.',
    paymentSuccess: 'Payment successful! Your application is now being processed.',
    applicationSubmitted: 'Application Submitted Successfully!',
    thankYou: 'Thank you! Our team will contact you within 24 hours.',
    newLead: 'NEW LEAD',
    newPayment: 'NEW PAYMENT RECEIVED',
    newDoc: 'NEW DOCUMENT UPLOADED',
    service: 'Service',
    name: 'Name',
    nationality: 'Nationality',
    location: 'Location',
    phone: 'Phone',
    email: 'Email',
    travelDate: 'Travel Date',
    status: 'Status',
    submitted: 'Submitted',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
    continue: 'Continue',
    skip: 'Skip',
    cancel: 'Cancel',
    confirm: 'Confirm',
    documentTypes: ['Passport Copy', 'Passport Photo', 'Bank Statement'],
    docPassport: 'Passport Copy',
    docPhoto: 'Passport Photo',
    docBank: 'Bank Statement',
    visaTypes: ['30-Day Visit Visa', '60-Day Visit Visa', 'Visa Extension', 'Status Change', 'PRO Services'],
    contactInfo: 'Contact Us\n\nAbu Dhabi, UAE\nMon - Fri: 9:00 AM - 9:00 PM\nPhone: +971 55 868 9543\nEmail: askmian.llc@gmail.com\nTrade License: 5038098',
    howItWorksSteps: ['Submit Documents', 'Processing & Verification', 'Receive Your Visa'],
    howItWorksDesc: ['Share your documents via Telegram', 'Our team reviews and submits', 'Get your visa within 24-48 hours'],
  },
  am: {
    welcome: (name) => `ሰላም *${name}*!\n\n*የእርስዎ UAE ጉዞ እዚህ ይጀምራል*\n\nፈጣን እና አስተማማኝ የUAE ቪዛ ማስኬድ እና prefessional PRO አገልግሎቶች።\n\n30 እና 60 ቀን የጉብኝት ቪዛ | ቪዛ መራዘሚያ | ሁኔታ መቀየሪያ | PRO አገልግሎቶች\n\nማስኬድ: 24-48 ሰዓታት | አቡ ዳቢ, UAE`,
    menu: 'ዋና ማውጫ',
    apply: 'አሁን ያመልክቱ',
    pricing: 'ዋጋዎች',
    services: 'የቪዛ አገልግሎቶች',
    proServices: 'PRO አገልግሎቶች',
    faq: 'ብዙ ጊዜ የሚጠየቁ ጥያቄዎች',
    contact: 'አግኙን',
    testimonials: 'መስክረዋል',
    howItWorks: 'እንዴት እንደሚሰራ',
    whyChooseUs: 'ለምን እኛን ይምረጡ',
    settings: 'ቅንብሮች',
    language: 'ቋንቋ ቀይር',
    back: 'ተመለስ',
    selectLanguage: 'ቋንቋዎን ይምረጡ',
    price30: '1,200 ድርሀም',
    price60: '1,800 ድርሀም',
    priceExt: '1,100 ድርሀም',
    step: (current, total) => `ቦታ ${current} ከ ${total}`,
    enterFullName: 'እባክዎ *ሙሉ ስምዎን* ያስገቡ',
    enterNationality: 'እባክዎ *ዜግነትዎን* ያስገቡ',
    enterLocation: 'እባክዎ *አሁን ያሉበትን ቦታ* ያስገቡ',
    selectVisaType: '*የቪዖ አይነት* ይምረጡ',
    enterTravelDate: '*የጉዞ ቀንዎን* ያስገቡ (ወይም "አላውቅም" ይበሉ)',
    enterPhone: '*የWhatsApp ቁጥርዎን* ያስገቡ (ከአገር ኮድ ጋር)',
    enterEmail: '*የኢሜል አድራሻዎን* ያስገቡ (ወይም "ዝለል" ይበሉ)',
    uploadPassport: 'እባክዎ የፓስፖርትዎን ግልፅ ፎቶ *አብራሪ ገጽ* ያስገቡ',
    uploadPhoto: 'የፓስፖርት መጠን ያለው *ፎቶዎን* (ነጭ መነሻ) ያስገቡ',
    uploadBankStmt: 'የ6 ወር *ባንክ መግቢያዎን* (PDF ወይም ፎቶ) ያስገቡ',
    docReceived: (type) => `*${type}* ተቀብለናል`,
    allDocsReceived: 'ሰነዶች ሁሉ ተቀብለናል! አሁን ወደ መክፈያ ይሂዱ።',
    selectPayment: '*የክፍያ ዘዴ* ይምረጡ',
    payCard: 'በካርድ ይክፈሉ (Stripe)',
    payBank: 'ባንክ ዝውውር',
    payCash: 'ጥሬ ገንዘብ',
    payWhatsApp: 'በWhatsApp ይክፈሉ',
    bankDetails: ' // <-- UPDATE: Real bank details here የባንክ ዝውውር ዝርዝሮች:\n\nባንክ: First Abu Dhabi Bank (FAB)\nስም: ASK MIAN LLC\nሂሳብ: 1234567890\nIBAN: AE123456789012345678901\n\nእባክዎ ዝውውር ካደረጉ በኋላ ደረሰኝዎን ያስገቡ።' // <-- UPDATE: Real bank details here ,
    uploadReceipt: 'እባክዎ *የዝውውር ደረሰኝዎን* (screenshot/ፎቶ) ያስገቡ',
    receiptReceived: 'ደረሰኝ ተቀብለናል! ክፍያዎን እናረጋግጣለን።',
    cashInstructions: 'ጥሬ ገንዘብ ለመክፈያ፣ እባክዎ ወደ ቢሮአችን በአቡ ዳቢ ይምጡ።\n\nአድራሻ: በቀጠሮ\nአቡ ዳቢ, UAE\nስልክ: +971 55 868 9543\n\nሰኞ - አርብ: 9:00 ሰዓት - 9:00 ማታ',
    whatsappPayment: 'ክፍያዎን ለማጠናቀቅ ከታች ያለውን ቁልፍ መታ ያድርጉ።',
    paymentSuccess: 'ክፍያ ተሳክቷል! ማመልከቻዎ አሁን በሂደት ላይ ነው።',
    applicationSubmitted: 'ማመልከቻ ተሳክቶ ተልኳል!',
    thankYou: 'አመሰግናለን! ቡድናችን በ24 ሰዓታት ውስጥ እናገኝዎታለን።',
    newLead: 'አዲስ መመዝገቢያ',
    newPayment: 'አዲስ ክፍያ ተቀብለናል',
    newDoc: 'አዲስ ሰነድ ተላክቷል',
    service: 'አገልግሎት',
    name: 'ስም',
    nationality: 'ዜግነት',
    location: 'ቦታ',
    phone: 'ስልክ',
    email: 'ኢሜል',
    travelDate: 'የጉዞ ቀን',
    status: 'ሁኔታ',
    submitted: 'ተልኳል',
    processing: 'በሂደት ላይ',
    completed: 'ተጠናቋል',
    cancelled: 'በይቅርታ ተሰርዟል',
    continue: 'ቀጥል',
    skip: 'ዝለል',
    cancel: 'ይቅር',
    confirm: 'አረጋግጥ',
    documentTypes: ['የፓስፖርት ቅጂ', 'የፓስፖርት መጠን ፎቶ', 'የባንክ መግቢያ'],
    docPassport: 'የፓስፖርት ቅጂ',
    docPhoto: 'የፓስፖርት መጠን ፎቶ',
    docBank: 'የባንክ መግቢያ',
    visaTypes: ['30-ቀን የጉብኝት ቪዛ', '60-ቀን የጉብኝት ቪዛ', 'የቪዛ ማራዘሚያ', 'ሁኔታ መቀየሪያ', 'PRO አገልግሎቶች'],
    contactInfo: 'አግኙን\n\nአቡ ዳቢ, UAE\nሰኞ - አርብ: 9:00 ሰዓት - 9:00 ማታ\nስልክ: +971 55 868 9543\nኢሜል: askmian.llc@gmail.com\nየንግድ ፈቃድ: 5038098',
    howItWorksSteps: ['ሰነዶችን ያስገቡ', 'ማስኬድ እና ማረጋገጫ', 'ቪዛዎን ይቀበሉ'],
    howItWorksDesc: ['ሰነዶችዎን በTelegram ያጋሩ', 'ቡድናችን ይመረምራል እና ያስገባል', 'በ24-48 ሰዓታት ውስጥ ቪዛዎን ይቀበሉ'],
  },
  ti: {
    welcome: (name) => `ሰላም *${name}*!\n\n*ናይ UAE ጉዕዞኹም ኣብዚ ይጅምር*\n\nቅልጡፍን ዘለኣድምን ናይ UAE ቪዛ ምክያድን prefessional PRO ኣገልግሎትን።\n\n30ን 60ን መዓልቲ ናይ ዝብእሉ ቪዛ | ቪዛ ልዋጋ | ለውጢ ሁኔታ | PRO ኣገልግሎታት\n\nምክያድ: 24-48 ሰዓት | አቡ ዳቢ, UAE`,
    menu: 'ዋና ዝርዝር',
    apply: 'ሕጂ ይሕተቱ',
    pricing: 'ክፍልኦት',
    services: 'ናይ ቪዛ ኣገልግሎታት',
    proServices: 'PRO ኣገልግሎታት',
    faq: 'ብዙሕ ግዜ ዝሕተው ሕቶታት',
    contact: 'ተራኸቡ',
    testimonials: 'ናይ ምስክርነት ቃላት',
    howItWorks: 'ከመይ ይሰርሕ',
    whyChooseUs: 'አንቲ ስለምንታይ ንአና ትመርጹ',
    settings: 'ቅንብራት',
    language: 'ቋንቋ ቅይር',
    back: 'ተመለስ',
    selectLanguage: 'ቋንቋኹም ምረፅዎ',
    price30: '1,200 ድርሀም',
    price60: '1,800 ድርሀም',
    priceExt: '1,100 ድርሀም',
    step: (current, total) => `ደረጃ ${current} ካብ ${total}`,
    enterFullName: 'እባእኹም *ምሉእ ስምኹም* ኣእትዉ',
    enterNationality: 'እባእኹም *ዜግነትኹም* ኣእትዉ',
    enterLocation: 'እባእኹም *አበይ ዘለኹም* ኣእትዉ',
    selectVisaType: '*ዓይነት ቪዛ* ምረፅዎ',
    enterTravelDate: '*ዕለት ምጉያይኹም* ኣእትዉ (ወይ "አይፈልጥን" ይበሉ)',
    enterPhone: '*ቑጽሪ WhatsAppኹም* ኣእትዉ (ስሉጥ ብሄር ኮድ)',
    enterEmail: '*አድራሻ ኢመይልኹም* ኣእትዉ (ወይ "ዝለል" ይበሉ)',
    uploadPassport: 'እባእኹም ግልጽ ምስሊ ፓስፖርትኹም *ዋና ገጽ* ኣሰዓቡ',
    uploadPhoto: 'ናይ ፓስፖርት መጠን ዘለዎ *ምስሊኹም* (ጻዕዳ መነሻ) ኣሰዓቡ',
    uploadBankStmt: '*6-ወርሒ ባንክ መግቢኹም* (PDF ወይ ምስሊ) ኣሰዓቡ',
    docReceived: (type) => `*${type}* ተቐቢልና`,
    allDocsReceived: 'ኵሉ ሰነዳት ተቐቢልና! ሕጂ ናብ ክፍሊት ኩዑዑ።',
    selectPayment: '*ኣገባብ ክፍሊት* ምረፅዎ',
    payCard: 'ብካርድ ክፈል (Stripe)',
    payBank: 'ናይ ባንክ ምሕዳስ',
    payCash: 'ጥሬ ገንዘብ',
    payWhatsApp: 'ብWhatsApp ክፈል',
    bankDetails: 'ናይ ባንክ ምሕዳስ ዝርዝር:\n\nባንክ: First Abu Dhabi Bank (FAB)\nስም: ASK MIAN LLC\nሒሳብ: 1234567890\nIBAN: AE123456789012345678901\n\nድሕሪ ምሕዳስ እባእኹም ደረሰኽኩም ኣሰዓቡ።',
    uploadReceipt: 'እባእኹም *ደረሰኽ ምሕዳስ* (screenshot/ምስሊ) ኣሰዓቡ',
    receiptReceived: 'ደረሰኽ ተቐቢልና! ክፍሊትኹም ንናረጋግጽ።',
    cashInstructions: 'ጥሬ ገንዘብ ንምኽፋል እባእኹም ናብ ቢሮና ኣብ አቡ ዳቢ ኑዑ።\n\nአድራሻ: ብቀይሮ\nአቡ ዳቢ, UAE\nስልኪ: +971 55 868 9543\n\nሰኑይ - ዓርቢ: 9:00 ሰዓት - 9:00 ምሸት',
    whatsappPayment: 'ክፍሊትኹም ንምዝዛም ንታሕቲ ዘሎ መልጎም ጠውቑ።',
    paymentSuccess: 'ክፍሊት ተዓዊት! ማመልክቲኹም ሕጂ ብሂደት ኣሎ።',
    applicationSubmitted: 'ማመልክቲ ብዓወት ተልኺዑ!',
    thankYou: 'የቐንየልና! ቡድናና ኣብ 24 ሰዓታት ክራኸብኩም እዩ።',
    newLead: 'ሓድሽ ማመልክቲ',
    newPayment: 'ሓድሽ ክፍሊተ ተቐቢልና',
    newDoc: 'ሓድሽ ሰነድ ተልኺዑ',
    service: 'ኣገልግሎት',
    name: 'ስም',
    nationality: 'ዜግነት',
    location: 'ቦታ',
    phone: 'ስልኪ',
    email: 'ኢመይል',
    travelDate: 'ዕለት ምጉያይ',
    status: 'ሁኔታ',
    submitted: 'ተልኺዑ',
    processing: 'ብሂደት ኣሎ',
    completed: 'ተዛዚሙ',
    cancelled: 'ተሰረዘ',
    continue: 'ቀጽል',
    skip: 'ዝለል',
    cancel: 'ሰርዝ',
    confirm: 'ኣረጋግጽ',
    documentTypes: ['ቅዳሕ ፓስፖርት', 'ናይ ፓስፖርት መጠን ምስሊ', 'ናይ ባንክ መግቢ'],
    docPassport: 'ቅዳሕ ፓስፖርት',
    docPhoto: 'ናይ ፓስፖርት መጠን ምስሊ',
    docBank: 'ናይ ባንክ መግቢ',
    visaTypes: ['30-መዓልቲ ናይ ዝብእሉ ቪዛ', '60-መዓልቲ ናይ ዝብእሉ ቪዛ', 'ምልዋጋ ቪዛ', 'ለውጢ ሁኔታ', 'PRO ኣገልግሎታት'],
    contactInfo: 'ተራኸቡና\n\nአቡ ዳቢ, UAE\nሰኑይ - ዓርቢ: 9:00 ሰዓት - 9:00 ምሸት\nስልኪ: +971 55 868 9543\nኢመይል: askmian.llc@gmail.com\nፍቓድ ንግዲ: 5038098',
    howItWorksSteps: ['ሰነዳት ኣእትዉ', 'ምክያድን ምርግጋጽን', 'ቪዛኹም ተቐበሉ'],
    howItWorksDesc: ['ሰነዳትኹም ብTelegram ኣካፍሉ', 'ቡድናና ንምርምርን ንምእታውን', 'ኣብ 24-48 ሰዓታት ቪዛኹም ተቐበሉ'],
  },
  om: {
    welcome: (name) => `Akkam *${name}*!\n\n*Daawwii UAE Keessan Asi Jalqabaa*\n\nUAE visa geggoo fi tajaajila PRO prefessional.\n\n30 fi 60 Guyya Visa Daawwataa | Dabalata Visa | Jijjiirama Haalaa | Tajaajila PRO\n\nGeggoo: 24-48 Sa\'a\'aa | Abu Dhabi, UAE`,
    menu: 'Cuunaa Guddaa',
    apply: 'Amma Iyyadaa',
    pricing: 'Gatiiwwan',
    services: 'Tajaajila Visa',
    proServices: 'Tajaajila PRO',
    faq: 'Gaaffilee Daddarban',
    contact: 'Nu Quunnamaa',
    testimonials: 'Ragaa',
    howItWorks: 'Akkamitti Hojjata',
    whyChooseUs: 'Maliif Nuti',
    settings: 'Teessoo',
    language: 'Afaan Jijjiiri',
    back: 'Deebi\'i',
    selectLanguage: 'Afaan keessan filadhaa',
    price30: '1,200 Dirhaam',
    price60: '1,800 Dirhaam',
    priceExt: '1,100 Dirhaam',
    step: (current, total) => `Tarkaanfii ${current} irraa ${total}`,
    enterFullName: 'Maaloo *Maqaa Guutuu* keessan galchaa',
    enterNationality: 'Maaloo *Lammummaa* keessan galchaa',
    enterLocation: 'Maaloo *Bakka Ammaa* keessan galchaa',
    selectVisaType: '*Gosa Visa* filadhaa',
    enterTravelDate: '*Guyyaa Imala* keessan galchaa (ykn "Dadhabe" jedhaa)',
    enterPhone: '*Lakkoofsa WhatsApp* keessan galchaa (koodii biyya waliin)',
    enterEmail: '*Teessoo Email* keessan galchaa (ykn "Irraanbali" jedhaa)',
    uploadPassport: 'Maaloo suuraa *Paaspoortii* keessan (fuula ogeessaa) ergaa',
    uploadPhoto: 'Suuraa *Gosa Paaspoortii* keessan (bifa adii) ergaa',
    uploadBankStmt: 'Galimee *Ji\'a 6 Bankii* keessan (PDF ykn suuraa) ergaa',
    docReceived: (type) => `*${type}* fudhannerra`,
    allDocsReceived: 'Galimeen hundi fudhatameera! Amma kaffaltii itti aansee.',
    selectPayment: '*Karaa Kaffaltii* filadhaa',
    payCard: 'Kaardii (Stripe)tiin Kaffali',
    payBank: 'Daddaffiin Bankii',
    payCash: 'Kaffaltii Qarshii',
    payWhatsApp: 'WhatsAppitiin Kaffali',
    bankDetails: 'Odeeffannoo Daddaffii Bankii:\n\nBankii: First Abu Dhabi Bank (FAB)\nMaqaa: ASK MIAN LLC\nLakkoofsa Herrega: 1234567890\nIBAN: AE123456789012345678901\n\nDaddaffii booda maaloo risiipiiti ergaa.',
    uploadReceipt: 'Maaloo *Risiipiiti Daddaffii* keessan (screenshot/suuraa) ergaa',
    receiptReceived: 'Risiipiiti fudhatameera! Kaffaltii keessan mirkaneessina.',
    cashInstructions: 'Qarshiin kaffaltiif, maaloo waajjira keenya Abu Dhabitti dhufaa.\n\nTeessoo: Waajjira Appointment\nAbu Dhabi, UAE\nBilbila: +971 55 868 9543\n\nJimaata - Gumata: 9:00 WD - 9:00 WB',
    whatsappPayment: 'Kaffaltii keessan xumuraaf kutaan armaan gadii cuqaasaa.',
    paymentSuccess: 'Kaffalti milkaa\'eera! Iyyannoon keessan amma hojjetaa jira.',
    applicationSubmitted: 'Iyyannoon Milkaa\'eera!',
    thankYou: 'Galatoomi! Hojjetaan keenya sa\'aatii 24 keessatti nu qunnamuu danda\'a.',
    newLead: 'IYYANNOO HAARAA',
    newPayment: 'KAFFALTII HAARAA FUDHATAMERA',
    newDoc: 'GALIMA HAARAA ERGAMERA',
    service: 'Tajaajila',
    name: 'Maqaa',
    nationality: 'Lammummaa',
    location: 'Bakka',
    phone: 'Bilbila',
    email: 'Email',
    travelDate: 'Guyyaa Imala',
    status: 'Haala',
    submitted: 'Ergameera',
    processing: 'Hojjetaa jira',
    completed: 'Xumurameera',
    cancelled: 'Haquunera',
    continue: 'Itti Fufi',
    skip: 'Irraanbali',
    cancel: 'Haqi',
    confirm: 'Mirkaneessi',
    documentTypes: ['Koopii Paaspoortii', 'Suuraa Gosa Paaspoortii', 'Galimee Bankii'],
    docPassport: 'Koopii Paaspoortii',
    docPhoto: 'Suuraa Gosa Paaspoortii',
    docBank: 'Galimee Bankii',
    visaTypes: ['30-Guyyaa Visa Daawwataa', '60-Guyyaa Visa Daawwataa', 'Dabalata Visa', 'Jijjiirama Haalaa', 'Tajaajila PRO'],
    contactInfo: 'Nu Quunnamaa\n\nAbu Dhabi, UAE\nJimaata - Gumata: 9:00 WD - 9:00 WB\nBilbila: +971 55 868 9543\nEmail: askmian.llc@gmail.com\nLakkoofsa Shaakalsiisaa: 5038098',
    howItWorksSteps: ['GALIMA ERGAA', 'GEGGOO FI MIRKANNEESSA', 'VISA KEESAN FUDHADHAA'],
    howItWorksDesc: ['GALIMA keessan Telegramtiin qoodaa', 'Hojjettoonni keenya qorannoo fi galmeessu', 'VISA keessan sa\'aatii 24-48 keessatti fudhadhaa'],
  }
};

// ===== LANGUAGE HELPER =====
function L(chatId, key, ...args) {
  const lang = userLanguages[chatId] || 'en';
  const t = T[lang] || T.en;
  const val = t[key];
  if (typeof val === 'function') return val(...args);
  if (val === undefined) return T.en[key] ? (typeof T.en[key] === 'function' ? T.en[key](...args) : T.en[key]) : key;
  return val;
}

function getLangName(code) {
  const names = { en: 'English', am: 'Amharic', ti: 'Tigrinya', om: 'Oromo' };
  return names[code] || code;
}


// ===== BUSINESS DATA =====
const services = {
  visa: [
    { name: { en: '30-Day Visit Visa', am: '30-ቀን የጉብኝት ቪዛ', ti: '30-መዓልቲ ናይ ዝብእሉ ቪዛ', om: '30-Guyyaa Visa Daawwataa' }, price: 'AED 1,200', time: '24-48 hours', req: ['Passport Copy', 'Passport Photo'], icon: '' },
    { name: { en: '60-Day Visit Visa', am: '60-ቀን የጉብኝት ቪዛ', ti: '60-መዓልቲ ናይ ዝብእሉ ቪዛ', om: '60-Guyyaa Visa Daawwataa' }, price: 'AED 1,800', time: '24-48 hours', req: ['Passport Copy', 'Passport Photo'], icon: '' },
    { name: { en: 'Visa Extension', am: 'የቪዛ ማራዘሚያ', ti: 'ምልዋጋ ቪዛ', om: 'Dabalata Visa' }, price: 'AED 1,100', time: 'Same Day / 24 Hours', req: ['Current Visa Copy', 'Passport Copy'], icon: '' },
    { name: { en: 'Inside Country Status Change', am: 'ከውጭ ሳይወጡ ሁኔታ መቀየሪያ', ti: 'ናብ ውሽጢ ሃገር ለውጢ ሁኔታ', om: 'Jijjiirama Haalaa Biyya Keessaa' }, price: 'Price on Request', time: '24-48 hours', req: ['Passport Copy', 'Current Visa Copy'], icon: '' },
  ],
  pro: [
    { name: { en: 'Business Setup', am: 'ንግድ ማቋቋሚያ', ti: 'ምስራሕ ቢዝነስ', om: 'Qindeessuu Daldalaa' }, desc: { en: 'Complete company formation services including mainland, free zone, and offshore setups.', am: 'ሙሉ የኩባንያ ምስረታ አገልግሎቶች።', ti: 'ምሉእ ናይ ኩባንያ ምስራሕ ኣገልግሎታት።', om: 'Tajaajila ijaarsa kampanii guutuu.' } },
    { name: { en: 'Trade License Renewals', am: 'የንግድ ፈቃድ ማደሻዎች', ti: 'ምሕዳስ ፍቓድ ንግዲ', om: 'Haaromsa Eeyyama Daldalaa' }, desc: { en: 'Hassle-free renewal of your trade license with timely reminders.', am: 'ያለችግር የንግድ ፈቃድ ማደስ።', ti: 'ዘየሕስስ ምሕዳስ ፍቓድ ንግዲ።', om: 'Haaromsa eeyyama daldalaa rakkoo malee.' } },
    { name: { en: 'Document Clearing', am: 'የሰነድ ማጽዳት', ti: 'ምፍሳስ ሰነዳት', om: 'Qulqullina Galmee' }, desc: { en: 'Efficient document attestation, translation, and government approval.', am: 'የሰነድ ማረጋገጫ፣ ትርጉም እና የመንግስት ማፅደቂያ።', ti: 'ብቑዕ ምርጋጥ ሰነዳት፣ ትርጉም፣ ፍቓድ መንግስቲ።', om: 'Mirkaneessa galmee hiika fi walii galte mootummaa.' } },
    { name: { en: 'Family Visa Assistance', am: 'የቤተሰብ ቪዛ እገዛ', ti: 'ሓገዝ ናይ ስድራ ቪዛ', om: 'Gargaarsa Visa Maatii' }, desc: { en: 'Complete family visa processing services.', am: 'ሙሉ የቤተሰብ ቪዛ ማስኬጃ አገልግሎቶች።', ti: 'ምሉእ ናይ ስድራ ቪዛ ኣገልግሎታት።', om: 'Tajaajila geggoo visa maatii guutuu.' } },
    { name: { en: 'Immigration Services', am: 'የህዝብ ዝውውር አገልግሎቶች', ti: 'ኣገልግሎታት ኣጋዓዚ', om: 'Tajaajila Ba\'umsaa' }, desc: { en: 'Full immigration support including entry permits and residence visas.', am: 'ሙሉ የህዝብ ዝውውር ድጋፍ።', ti: 'ምሉእ ሓገዝ ኣጋዓዚ።', om: 'Gargaarsa ba\'umsaa guutuu.' } },
    { name: { en: 'Emirates ID Assistance', am: 'የኢሚራት መታወቂያ እገዛ', ti: 'ሓገዝ ናይ Emirates ID', om: 'Gargaarsa ID Emirates' }, desc: { en: 'Quick Emirates ID application, renewal, and replacement.', am: 'ፈጣን የኢሚራት መታወቂያ ማመልከቻ እና ማደስ።', ti: 'ቅልጡፍ ሕተም፣ ምሕዳስ፣ ምትካል Emirates ID።', om: 'Iyyannoo ID Emirates geggoo fi haaromsa.' } },
  ]
};

const faqs = [
  { q: { en: 'How long does visa approval take?', am: 'የቪዛ ፍቃድ ማግኘት ምን ያህል ጊዜ ይወስዳል?', ti: 'ክሳብ መንገዲ ቪዛ ዝወስድ ግዜ?', om: 'Visa yeroon meeqa fudhata?' },
    a: { en: 'Standard processing takes 24-48 hours. Express processing available within 24 hours.', am: 'መደበኛ ማስኬድ 24-48 ሰዓት ይወስዳል። ፈጣን ማስኬድ በ24 ሰዓት ውስጥ ይገኛል።', ti: 'ስታንዳርድ ምክያድ 24-48 ሰዓት ይል። ቅልጡፍ ኣብ 24 ሰዓት።', om: 'Geggoo duraanffisaa sa\'aata 24-48 fudhata. Geggoo dhiyoo sa\'aata 24 keessatti argama.' } },
  { q: { en: 'What documents are required?', am: 'የትኞች ሰነዶች ያስፈልጋሉ?', ti: 'ኣየኖት ሰነዳት የድሊ?', om: 'Galmee akkamii barbaachisa?' },
    a: { en: 'Passport copy (6 months validity) and passport photo. Some visas need additional docs.', am: 'የፓስፖርት ቅጂ (6 ወር ተረጋጋይነት) እና የፓስፖርት ፎቶ። አንዳንድ ቪዛዎች ተጨማሪ ሰነዶችን ይጠይቃሉ።', ti: 'ናይ ፓስፖርት ኮፒ (6 ወርሒ ትኹረት) ከምኡ\'ውን ምስሊ ፓስፖርት።', om: 'Koopii paaspoortii (ji\'a 6 iftooma) fi suuraa paaspoortii.' } },
  { q: { en: 'Can I extend my visa inside the UAE?', am: 'ቪዛዬን ከUAE ውስጥ ማራዘም እችላለሁ?', ti: 'ቪዛይ ኣብ UAE ክዉዋገ ይኽእል እየ?', om: 'Visa koo UAE keessaa dheeressuu danda\'aa?' },
    a: { en: 'Yes! We offer same-day and 24-hour visa extensions inside the UAE without leaving.', am: 'አዎ! ከUAE ውጭ ሳይወጡ የእለቱን እና የ24 ሰዓት የቪዛ ማራዘሚያ እንሰጣለን።', ti: 'እወ! ካብ UAE ኣይወጽኩን ሎሚ\'ውን ከምኡ\'ውን 24 ሰዓት።', om: 'Eeyyeen! Dheerewwanis visa har\'a fi sa\'aata 24 UAE alaatti bahuu hin barbaachisne.' } },
  { q: { en: 'What if my visa is rejected?', am: 'ቪዛዬ ቢሳካ ምን ይሆናል?', ti: 'ደላይ ቪዛይ እንተተሰኪሙ?', om: 'Visan koo yoo hafu maal ta\'a?' },
    a: { en: 'We analyze the reason and guide you on the best course of action, including reapplying.', am: 'ምክንያቱን እንተንሰሳትን እንመራዎታለን፣ ተጨማሪ መረጃዎችን ጨምረው እንደገና ለማመልከት።', ti: 'ምኽንያቱ ንምርምር ንመራኹም፣ ዳግማይ ንምሕታም።', om: 'Sababa qoranna si qajeelchina, irra deebi\'ii iyyachuus dabalachuun.' } },
  { q: { en: 'Can I apply from inside the UAE?', am: 'ከUAE ውስጥ ማመልከት እችላለሁ?', ti: 'ኣብ ውሽጢ UAE ክሕተም ይኽእል እየ?', om: 'UAE keessaa iyyachuu danda\'aa?' },
    a: { en: 'Yes! We offer inside-country status change services without requiring you to exit.', am: 'አዎ! ከሀገር ውስጥ ሳይወጡ ሁኔታ መቀየሪያ አገልግሎቶችን እንሰጣለን።', ti: 'እወ! ኣብ ውሽጢ ሃገር ለውጢ ሁኔታ ኣይወጽኩን።', om: 'Eeyyeen! Jijjiirama haalaa biyya keessaa alaatti bahuu hin barbaachisne.' } },
];

const testimonials = [
  { name: 'Sarah Al-Rashid', role: { en: 'Business Consultant', am: 'የቢዝነስ አማካሪ', ti: 'ኣማኻሪ ቢዝነስ', om: 'Gorsaa Daldalaa' }, text: { en: 'Ask Mian made my visa process incredibly smooth. I received my 60-day visa within 2 days.', am: 'Ask Mian የቪዛ ሂደቴን በጣም አስተማማኝ አደረገው። 60-ቀን ቪዛዬን በ2 ቀናት ተቀብያለሁ።', ti: 'Ask Mian ንናይ ቪዛ ሂደተይ ብጣይም ኣመላልኦ። 60-መዓልቲ ቪዛይ ኣብ 2 መዓልቲ ተቐበልኩ።', om: 'Ask Mian geggoo visa koo raawwate. Visa 60-guyyaa 2-guyyaa keessatti fudhane.' }, rating: 5 },
  { name: 'Ahmed Hassan', role: { en: 'Entrepreneur', am: 'የንግድ ባለቤት', ti: 'ባዕል ንግዲ', om: 'Abbaa Daldalaa' }, text: { en: 'The PRO services saved my business countless hours. Outstanding understanding of UAE regulations.', am: 'PRO አገልግሎቶች ንግዴን ብዙ ሰዓታት አዳኑት። የUAE ደንቦችን በጣም ያውቃሉ።', ti: 'PRO ኣገልግሎታት ንቢዝነሰይ ብሙሉእ ኣድሒኑዎ። ናይ UAE ሕጋታት ንፉዕ ኢዮም ዝፈልጡ።', om: 'Tajaajila PRO daldala koo sa\'aawwan hedduu barbareesse.' }, rating: 5 },
  { name: 'Raj Patel', role: { en: 'Marketing Director', am: 'የማርኬቲንግ ዳይሬክተር', ti: 'ዳይረክተር መሸጣ', om: 'Hoggana Daldalaa' }, text: { en: 'I needed an urgent visa extension and Ask Mian delivered beyond expectations. Same-day processing!', am: 'አስቸኳይ የቪዛ ማራዘሚያ ያስፈልገኝ ነበር እና Ask Mian በጣም ፈጣን አገልግሎት ሰጠ።', ti: 'ዘድሊ ዝነበረኒ ቅልጡፍ ምልዋጋ ቪዛ Ask Mian ንምብርታር።', om: 'Dabalata visa akka hatattamaatti barbaadame Ask Mian kennef.' }, rating: 5 },
];

// ===== KEYBOARDS =====
function mainKeyboard(chatId) {
  const l = (k) => L(chatId, k);
  return {
    reply_markup: {
      keyboard: [
        [l('services'), l('proServices')],
        [l('pricing'), l('apply')],
        [l('faq'), l('contact')],
        [l('language'), l('howItWorks')],
      ],
      resize_keyboard: true,
    }
  };
}

function backToMenuKeyboard(chatId) {
  return {
    reply_markup: {
      inline_keyboard: [[{ text: '◀ ' + L(chatId, 'menu'), callback_data: 'menu' }]]
    }
  };
}

function languageKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'English', callback_data: 'lang_en' }],
        [{ text: 'Amharic / አማርኛ', callback_data: 'lang_am' }],
        [{ text: 'Tigrinya / ትግርኛ', callback_data: 'lang_ti' }],
        [{ text: 'Oromo / Oromiffa', callback_data: 'lang_om' }],
      ]
    }
  };
}

function contactButtons(chatId) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: ' WhatsApp', url: 'https://wa.me/971558689543' }],
        [{ text: ' Call +971 55 868 9543', url: 'tel:+971558689543' }],
        [{ text: ' Email', url: 'mailto:askmian.llc@gmail.com' }],
        [{ text: ' Website', url: 'https://askmian.com' }],
        [{ text: '◀ ' + L(chatId, 'menu'), callback_data: 'menu' }],
      ]
    }
  };
}

// ===== HELPERS =====
function saveLead(data) {
  const file = './leads.json';
  let leads = [];
  if (fs.existsSync(file)) leads = JSON.parse(fs.readFileSync(file, 'utf8'));
  leads.push({ ...data, timestamp: new Date().toISOString() });
  fs.writeFileSync(file, JSON.stringify(leads, null, 2));
}

function saveApplication(data) {
  const file = './applications.json';
  let apps = [];
  if (fs.existsSync(file)) apps = JSON.parse(fs.readFileSync(file, 'utf8'));
  const app = { ...data, id: Date.now().toString(), timestamp: new Date().toISOString() };
  apps.push(app);
  fs.writeFileSync(file, JSON.stringify(apps, null, 2));
  return app.id;
}

function notifyAdmin(text) {
  if (adminChatId) {
    bot.sendMessage(adminChatId, text, { parse_mode: 'Markdown' }).catch(() => {});
  }
}

function stars(n) {
  return '⭐'.repeat(n);
}

function getServiceName(svc, chatId) {
  const lang = userLanguages[chatId] || 'en';
  return svc.name[lang] || svc.name.en;
}


// ===== COMMANDS =====
// /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from.first_name || 'there';

  // If no language set, ask first
  if (!userLanguages[chatId]) {
    bot.sendMessage(chatId, 'Welcome! Please select your language / ቋንቋ ምረጥ / ቛንቛ ምረፅ / Afaan filadhaa:', languageKeyboard());
    return;
  }

  sendWelcome(chatId, name);
});

// /language
bot.onText(/\/language/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Select your language / ቋንቋ ምረጥ / ቛንቛ ምረፅ / Afaan filadhaa:', languageKeyboard());
});

function sendWelcome(chatId, name) {
  const welcome = L(chatId, 'welcome', name);
  bot.sendMessage(chatId, welcome, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: L(chatId, 'apply'), callback_data: 'apply_menu' }],
        [{ text: ' WhatsApp', url: 'https://wa.me/971558689543' }],
      ]
    }
  }).then(() => {
    bot.sendMessage(chatId, '  Fast Processing\n  Transparent Pricing\n  Secure Application\n  UAE Support', mainKeyboard(chatId));
  });
}

// ===== SECTION HANDLERS =====
function sendPricing(chatId) {
  let text = `  *${L(chatId, 'pricing')}*\n\n`;
  services.visa.forEach((s) => {
    text += `${getServiceName(s, chatId)}\n  ${s.price} | ${s.time}\n\n`;
  });
  text += `${L(chatId, 'proServices')}  ${L(chatId, 'contact')}`;
  bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...contactButtons(chatId) });
}

function sendVisaServices(chatId) {
  const inline = {
    reply_markup: {
      inline_keyboard: [
        ...services.visa.map((s, i) => [{ text: getServiceName(s, chatId), callback_data: `visa_${i}` }]),
        [{ text: '◀ ' + L(chatId, 'menu'), callback_data: 'menu' }],
      ]
    }
  };
  bot.sendMessage(chatId, `  *${L(chatId, 'services')}*\n\n${L(chatId, 'selectVisaType')}`, { parse_mode: 'Markdown', ...inline });
}

function sendVisaDetail(chatId, index) {
  const s = services.visa[index];
  const lang = userLanguages[chatId] || 'en';
  const text =
    `  *${getServiceName(s, chatId)}*\n\n` +
    `  *${L(chatId, 'price30') === 'AED 1,200' && index === 0 ? s.price : index === 1 ? s.price : index === 2 ? s.price : s.price}*\n` +
    `  ${s.time}\n\n` +
    `  *${L(chatId, 'docPassport')}*\n` +
    s.req.map(r => `  ${r}`).join('\n') + '\n\n' +
    `${L(chatId, 'apply')}?`;

  const buttons = {
    reply_markup: {
      inline_keyboard: [
        [{ text: L(chatId, 'apply'), callback_data: `apply_v_${index}` }],
        [{ text: ' WhatsApp', url: 'https://wa.me/971558689543' }],
        [{ text: '◀ ' + L(chatId, 'back'), callback_data: 'visa_services' }],
      ]
    }
  };
  bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...buttons });
}

function sendPROServices(chatId) {
  const inline = {
    reply_markup: {
      inline_keyboard: [
        ...services.pro.map((s, i) => [{ text: getServiceName(s, chatId), callback_data: `pro_${i}` }]),
        [{ text: '◀ ' + L(chatId, 'menu'), callback_data: 'menu' }],
      ]
    }
  };
  bot.sendMessage(chatId, `  *${L(chatId, 'proServices')}*\n\nComprehensive business and government services.`, { parse_mode: 'Markdown', ...inline });
}

function sendPRODetail(chatId, index) {
  const s = services.pro[index];
  const lang = userLanguages[chatId] || 'en';
  const text = `  *${getServiceName(s, chatId)}*\n\n${s.desc[lang] || s.desc.en}\n\n${L(chatId, 'contact')} ${L(chatId, 'pricing').toLowerCase()}.`;
  bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...contactButtons(chatId) });
}

function sendFAQ(chatId) {
  const inline = {
    reply_markup: {
      inline_keyboard: [
        ...faqs.map((f, i) => [{ text: (f.q[userLanguages[chatId]] || f.q.en).substring(0, 30) + '...', callback_data: `faq_${i}` }]),
        [{ text: '◀ ' + L(chatId, 'menu'), callback_data: 'menu' }],
      ]
    }
  };
  bot.sendMessage(chatId, `  *${L(chatId, 'faq')}*\n\nFind answers to common questions.`, { parse_mode: 'Markdown', ...inline });
}

function sendFAQAnswer(chatId, index) {
  const f = faqs[index];
  const lang = userLanguages[chatId] || 'en';
  bot.sendMessage(chatId,
    `  *${f.q[lang] || f.q.en}*\n\n${f.a[lang] || f.a.en}\n\n${L(chatId, 'contact')}?`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: ' WhatsApp', url: 'https://wa.me/971558689543' }],
          [{ text: '◀ ' + L(chatId, 'faq'), callback_data: 'faq_menu' }],
        ]
      }
    }
  );
}

function sendContact(chatId) {
  bot.sendMessage(chatId, L(chatId, 'contactInfo'), { parse_mode: 'Markdown', ...contactButtons(chatId) });
}

function sendHowItWorks(chatId) {
  const steps = L(chatId, 'howItWorksSteps');
  const descs = L(chatId, 'howItWorksDesc');
  let text = `  *${L(chatId, 'howItWorks')}*\n\n`;
  steps.forEach((s, i) => {
    text += `*${i + 1}. ${s}*\n${descs[i]}\n\n`;
  });
  bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...backToMenuKeyboard(chatId) });
}

function sendTestimonials(chatId) {
  const lang = userLanguages[chatId] || 'en';
  let text = `  *${L(chatId, 'testimonials')}*\n\n`;
  testimonials.forEach((t) => {
    const role = typeof t.role === 'object' ? (t.role[lang] || t.role.en) : t.role;
    const txt = typeof t.text === 'object' ? (t.text[lang] || t.text.en) : t.text;
    text += `*${t.name}*  ${role}\n${stars(t.rating)}\n"${txt}"\n\n`;
  });
  bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...backToMenuKeyboard(chatId) });
}


// ===== APPLICATION FLOW =====
function startApplication(chatId, serviceIndex, isPro = false) {
  const lang = userLanguages[chatId] || 'en';
  const serviceName = isPro ? L(chatId, 'proServices') : (services.visa[serviceIndex]?.name[lang] || services.visa[serviceIndex]?.name?.en || 'Visa Service');
  userSessions[chatId] = {
    step: 'form_name',
    serviceIndex: serviceIndex,
    serviceName: serviceName,
    isPro: isPro,
    data: {},
    docs: { passport: null, photo: null, bank: null },
    docOrder: ['passport', 'photo', 'bank'],
    docIndex: 0,
    paymentMethod: null,
    paymentConfirmed: false,
  };
  bot.sendMessage(chatId,
    `  *${L(chatId, 'apply')}*\n\n*${serviceName}*\n\n${L(chatId, 'step', 1, 6)}\n${L(chatId, 'enterFullName')}`,
    { parse_mode: 'Markdown', reply_markup: { remove_keyboard: true } }
  );
}

function handleForm(chatId, text, from) {
  const session = userSessions[chatId];
  if (!session) return false;

  // Handle cancellation
  if (text.toLowerCase() === '/cancel') {
    delete userSessions[chatId];
    bot.sendMessage(chatId, `  Application cancelled.`, mainKeyboard(chatId));
    return true;
  }

  switch (session.step) {
    case 'form_name':
      session.data.fullName = text;
      session.step = 'form_nationality';
      bot.sendMessage(chatId,
        `  *${session.serviceName}*\n\n${L(chatId, 'step', 2, 6)}\n${L(chatId, 'enterNationality')}`,
        { parse_mode: 'Markdown' }
      );
      return true;

    case 'form_nationality':
      session.data.nationality = text;
      session.step = 'form_location';
      bot.sendMessage(chatId,
        `  *${session.serviceName}*\n\n${L(chatId, 'step', 3, 6)}\n${L(chatId, 'enterLocation')}`,
        { parse_mode: 'Markdown' }
      );
      return true;

    case 'form_location':
      session.data.currentLocation = text;
      session.step = 'form_visa';
      const visaTypes = L(chatId, 'visaTypes');
      let visaText = `  *${session.serviceName}*\n\n${L(chatId, 'step', 4, 6)}\n${L(chatId, 'selectVisaType')}\n\n`;
      visaTypes.forEach((v, i) => {
        visaText += `${i + 1}. ${v}\n`;
      });
      bot.sendMessage(chatId, visaText, { parse_mode: 'Markdown' });
      return true;

    case 'form_visa':
      const types = L(chatId, 'visaTypes');
      const idx = parseInt(text) - 1;
      if (idx >= 0 && idx < types.length) {
        session.data.visaType = types[idx];
      } else {
        session.data.visaType = text;
      }
      session.step = 'form_travel';
      bot.sendMessage(chatId,
        `  *${session.serviceName}*\n\n${L(chatId, 'step', 5, 6)}\n${L(chatId, 'enterTravelDate')}`,
        { parse_mode: 'Markdown' }
      );
      return true;

    case 'form_travel':
      session.data.travelDate = text;
      session.step = 'form_whatsapp';
      bot.sendMessage(chatId,
        `  *${session.serviceName}*\n\n${L(chatId, 'step', 6, 6)}\n${L(chatId, 'enterPhone')}`,
        { parse_mode: 'Markdown' }
      );
      return true;

    case 'form_whatsapp':
      session.data.whatsapp = text;
      // Start document upload phase
      session.step = 'docs_upload';
      requestNextDocument(chatId);
      return true;
  }
  return false;
}

// ===== DOCUMENT UPLOAD FLOW =====
function requestNextDocument(chatId) {
  const session = userSessions[chatId];
  if (!session) return;

  const docKeys = session.docOrder;
  const currentIdx = session.docIndex;

  if (currentIdx >= docKeys.length) {
    // All docs received
    session.step = 'payment_select';
    bot.sendMessage(chatId,
      `  ${L(chatId, 'allDocsReceived')}\n\n${L(chatId, 'selectPayment')}`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            ...(stripeToken ? [[{ text: L(chatId, 'payCard'), callback_data: 'pay_card' }]] : []),
            [{ text: L(chatId, 'payBank'), callback_data: 'pay_bank' }],
            [{ text: L(chatId, 'payCash'), callback_data: 'pay_cash' }],
            [{ text: L(chatId, 'payWhatsApp'), callback_data: 'pay_whatsapp' }],
            [{ text: L(chatId, 'cancel'), callback_data: 'cancel_app' }],
          ]
        }
      }
    );
    return;
  }

  const docKey = docKeys[currentIdx];
  const docLabel = L(chatId, docKey === 'passport' ? 'docPassport' : docKey === 'photo' ? 'docPhoto' : 'docBank');
  const prompt = docKey === 'passport' ? L(chatId, 'uploadPassport') :
                 docKey === 'photo' ? L(chatId, 'uploadPhoto') :
                 L(chatId, 'uploadBankStmt');

  bot.sendMessage(chatId,
    `  *${L(chatId, 'apply')}*\n\n${prompt}\n\n_${L(chatId, 'step', currentIdx + 1, 3)} ${docLabel}_`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: L(chatId, 'skip'), callback_data: `skip_doc_${docKey}` }],
        ]
      }
    }
  );
}

// Handle document uploads (photo/document)
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];
  if (!session || session.step !== 'docs_upload') {
    // Not in upload mode - just acknowledge
    return;
  }

  await handleDocumentUpload(chatId, msg, 'photo');
});

bot.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];
  if (!session || session.step !== 'docs_upload') {
    return;
  }

  await handleDocumentUpload(chatId, msg, 'document');
});

async function handleDocumentUpload(chatId, msg, type) {
  const session = userSessions[chatId];
  const docKey = session.docOrder[session.docIndex];
  const docLabel = L(chatId, docKey === 'passport' ? 'docPassport' : docKey === 'photo' ? 'docPhoto' : 'docBank');

  try {
    // Create user-specific directory
    const userDir = path.join('./uploads', chatId.toString());
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

    let fileId, fileName;
    if (type === 'photo') {
      const photos = msg.photo;
      const largest = photos[photos.length - 1];
      fileId = largest.file_id;
      fileName = `${docKey}_${Date.now()}.jpg`;
    } else {
      fileId = msg.document.file_id;
      fileName = `${docKey}_${Date.now()}_${msg.document.file_name || 'doc.pdf'}`;
    }

    const filePath = path.join(userDir, fileName);
    const downloaded = await bot.downloadFile(fileId, userDir);

    // Rename to our naming convention
    fs.renameSync(downloaded, filePath);

    session.docs[docKey] = filePath;
    session.docIndex++;

    // Confirm receipt
    bot.sendMessage(chatId, `  ${L(chatId, 'docReceived', docLabel)}`);

    // Notify admin about new document
    notifyAdmin(
      `  *${L(chatId, 'newDoc')}*\n\n` +
      `*${L(chatId, 'name')}:* ${session.data.fullName || 'N/A'}\n` +
      `*${L(chatId, 'service')}:* ${session.serviceName}\n` +
      `*Document:* ${docLabel}\n` +
      `*From:* @${msg.from.username || 'N/A'} (Chat: ${chatId})\n` +
      `*File:* ${fileName}`
    );

    // Request next document
    setTimeout(() => requestNextDocument(chatId), 1000);
  } catch (err) {
    console.error('Document upload error:', err);
    bot.sendMessage(chatId, 'Error uploading document. Please try again.');
  }
}


// ===== PAYMENT FLOW =====
function handlePayment(chatId, method) {
  const session = userSessions[chatId];
  if (!session) return;

  session.paymentMethod = method;

  switch (method) {
    case 'card':
      handleStripePayment(chatId);
      break;
    case 'bank':
      session.step = 'payment_bank';
      bot.sendMessage(chatId, L(chatId, 'bankDetails'), {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: L(chatId, 'uploadReceipt'), callback_data: 'upload_receipt' }],
            [{ text: '◀ ' + L(chatId, 'back'), callback_data: 'payment_back' }],
          ]
        }
      });
      break;
    case 'cash':
      session.step = 'payment_done';
      session.paymentConfirmed = true;
      bot.sendMessage(chatId, L(chatId, 'cashInstructions'), {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: L(chatId, 'confirm'), callback_data: 'confirm_cash' }],
            [{ text: '◀ ' + L(chatId, 'back'), callback_data: 'payment_back' }],
          ]
        }
      });
      break;
    case 'whatsapp':
      session.step = 'payment_done';
      session.paymentConfirmed = true;
      bot.sendMessage(chatId, L(chatId, 'whatsappPayment'), {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: ' Pay on WhatsApp', url: 'https://wa.me/971558689543?text=' + encodeURIComponent(`Hi, I want to pay for ${session.serviceName} - ${session.data.fullName}`) }],
            [{ text: L(chatId, 'confirm'), callback_data: 'confirm_whatsapp' }],
            [{ text: '◀ ' + L(chatId, 'back'), callback_data: 'payment_back' }],
          ]
        }
      });
      break;
  }
}

function handleStripePayment(chatId) {
  const session = userSessions[chatId];
  if (!session || !stripeToken) return;

  // Determine price based on service
  let price = 120000; // AED 1200 in smallest unit (fils)
  if (session.serviceIndex === 1) price = 180000; // 60-day
  if (session.serviceIndex === 2) price = 110000; // extension

  const prices = { en: 'AED 1,200', am: '1,200 ድርሀም', ti: '1,200 ድርሀም', om: '1,200 Dirhaam' };
  const lang = userLanguages[chatId] || 'en';
  const title = session.serviceName;
  const desc = `${L(lang, 'name')}: ${session.data.fullName}`;

  bot.sendInvoice(chatId, title, desc, session.data.whatsapp || String(chatId), stripeToken, 'AED', [
    { label: title, amount: price }
  ], {
    photo_url: 'https://askmian.com/logo.png',
    need_name: false,
    need_phone_number: false,
    need_email: false,
    need_shipping_address: false,
    is_flexible: false,
  }).catch(err => {
    console.error('Invoice error:', err);
    bot.sendMessage(chatId, 'Payment service unavailable. Please choose another method.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: L(chatId, 'payBank'), callback_data: 'pay_bank' }],
          [{ text: L(chatId, 'payCash'), callback_data: 'pay_cash' }],
          [{ text: L(chatId, 'payWhatsApp'), callback_data: 'pay_whatsapp' }],
        ]
      }
    });
  });
}

// Handle successful payment
bot.on('pre_checkout_query', (query) => {
  bot.answerPreCheckoutQuery(query.id, true).catch(() => {
    bot.answerPreCheckoutQuery(query.id, false, 'Payment could not be processed.');
  });
});

bot.on('successful_payment', (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];

  session.paymentConfirmed = true;
  session.step = 'payment_done';

  bot.sendMessage(chatId, `  *${L(chatId, 'paymentSuccess')}*\n\n` +
    `*${L(chatId, 'service')}:* ${session.serviceName}\n` +
    `*${L(chatId, 'name')}:* ${session.data.fullName}\n` +
    `*Amount:* ${msg.successful_payment.total_amount / 100} ${msg.successful_payment.currency}`
  );

  // Notify admin
  notifyAdmin(
    `  *${L(chatId, 'newPayment')}*\n\n` +
    `*${L(chatId, 'name')}:* ${session.data.fullName}\n` +
    `*${L(chatId, 'service')}:* ${session.serviceName}\n` +
    `*Amount:* ${msg.successful_payment.total_amount / 100} ${msg.successful_payment.currency}\n` +
    `*Method:* Card (Stripe)\n` +
    `*From:* @${msg.from.username || 'N/A'} (Chat: ${chatId})`
  );

  // Complete application
  completeApplication(chatId);
});

// Handle receipt upload for bank transfer
function handleReceiptUpload(chatId, msg) {
  const session = userSessions[chatId];
  if (!session || session.step !== 'payment_bank') return;

  const userDir = path.join('./uploads', chatId.toString());
  if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

  let fileId;
  if (msg.photo) {
    const photos = msg.photo;
    fileId = photos[photos.length - 1].file_id;
  } else if (msg.document) {
    fileId = msg.document.file_id;
  }

  if (fileId) {
    bot.downloadFile(fileId, userDir).then((downloaded) => {
      const fileName = `receipt_${Date.now}.jpg`;
      const filePath = path.join(userDir, fileName);
      fs.renameSync(downloaded, filePath);

      session.paymentConfirmed = true;
      session.step = 'payment_done';

      bot.sendMessage(chatId, L(chatId, 'receiptReceived'));

      notifyAdmin(
        `  *${L(chatId, 'newPayment')}*\n\n` +
        `*${L(chatId, 'name')}:* ${session.data.fullName}\n` +
        `*${L(chatId, 'service')}:* ${session.serviceName}\n` +
        `*Method:* Bank Transfer\n` +
        `*Status:* Receipt uploaded, awaiting verification\n` +
        `*From:* @${msg.from.username || 'N/A'} (Chat: ${chatId})`
      );

      completeApplication(chatId);
    }).catch(err => {
      console.error('Receipt upload error:', err);
      bot.sendMessage(chatId, 'Error uploading receipt. Please try again.');
    });
  }
}

// ===== APPLICATION COMPLETION =====
function completeApplication(chatId) {
  const session = userSessions[chatId];
  if (!session) return;

  const appId = saveApplication({
    service: session.serviceName,
    ...session.data,
    documents: session.docs,
    paymentMethod: session.paymentMethod,
    paymentConfirmed: session.paymentConfirmed,
    telegramUser: `${session.data.telegramFirstName || ''} ${session.data.telegramLastName || ''}`,
    telegramUsername: session.data.telegramUsername || 'N/A',
    chatId: chatId.toString(),
    status: 'submitted',
  });

  // Final summary to user
  const summary =
    `  *${L(chatId, 'applicationSubmitted')}*\n\n` +
    `*ID:* \`${appId}\`\n` +
    `*${L(chatId, 'service')}:* ${session.serviceName}\n` +
    `*${L(chatId, 'name')}:* ${session.data.fullName}\n` +
    `*${L(chatId, 'nationality')}:* ${session.data.nationality}\n` +
    `*${L(chatId, 'location')}:* ${session.data.currentLocation}\n` +
    `*${L(chatId, 'phone')}:* ${session.data.whatsapp}\n` +
    `*${L(chatId, 'travelDate')}:* ${session.data.travelDate}\n\n` +
    ` ${L(chatId, 'thankYou')}`;

  bot.sendMessage(chatId, summary, { parse_mode: 'Markdown', ...mainKeyboard(chatId) });

  // Notify admin
  notifyAdmin(
    `  *${L(chatId, 'newLead')}* #${appId}\n\n` +
    `*${L(chatId, 'service')}:* ${session.serviceName}\n` +
    `*${L(chatId, 'name')}:* ${session.data.fullName}\n` +
    `*${L(chatId, 'nationality')}:* ${session.data.nationality}\n` +
    `*${L(chatId, 'location')}:* ${session.data.currentLocation}\n` +
    `*${L(chatId, 'phone')}:* ${session.data.whatsapp}\n` +
    `*${L(chatId, 'travelDate')}:* ${session.data.travelDate}\n` +
    `*Payment:* ${session.paymentMethod} (${session.paymentConfirmed ? 'Confirmed' : 'Pending'})\n` +
    `*Documents:* ${Object.entries(session.docs).filter(([k, v]) => v).map(([k]) => k).join(', ') || 'None'}\n` +
    `*From:* @${session.data.telegramUsername || 'N/A'} (Chat: ${chatId})`
  );

  delete userSessions[chatId];
}


// ===== CALLBACK QUERY HANDLER =====
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  bot.answerCallbackQuery(query.id);

  // Language selection
  if (data.startsWith('lang_')) {
    const lang = data.split('_')[1];
    userLanguages[chatId] = lang;
    bot.sendMessage(chatId, `Language set to *${getLangName(lang)}*`, { parse_mode: 'Markdown' });
    sendWelcome(chatId, query.from.first_name || 'there');
    return;
  }

  // Menu navigation
  if (data === 'menu') {
    bot.sendMessage(chatId, `  *${L(chatId, 'menu')}*\n\nWhat would you like to do?`, { parse_mode: 'Markdown', ...mainKeyboard(chatId) });
    return;
  }

  if (data === 'visa_services') {
    sendVisaServices(chatId);
    return;
  }

  if (data === 'pro_services') {
    sendPROServices(chatId);
    return;
  }

  if (data === 'faq_menu') {
    sendFAQ(chatId);
    return;
  }

  if (data === 'pricing') {
    sendPricing(chatId);
    return;
  }

  if (data === 'contact') {
    sendContact(chatId);
    return;
  }

  if (data === 'how_it_works') {
    sendHowItWorks(chatId);
    return;
  }

  if (data === 'testimonials') {
    sendTestimonials(chatId);
    return;
  }

  if (data === 'settings' || data === 'language') {
    bot.sendMessage(chatId, L(chatId, 'selectLanguage'), languageKeyboard());
    return;
  }

  if (data === 'apply_menu') {
    const visaTypes = L(chatId, 'visaTypes');
    const inline = {
      reply_markup: {
        inline_keyboard: [
          ...services.visa.map((s, i) => [{ text: getServiceName(s, chatId), callback_data: `apply_v_${i}` }]),
          [{ text: L(chatId, 'proServices'), callback_data: 'apply_pro' }],
          [{ text: '◀ ' + L(chatId, 'menu'), callback_data: 'menu' }],
        ].flat()
      }
    };
    bot.sendMessage(chatId, `  *${L(chatId, 'apply')}*\n\n${L(chatId, 'selectVisaType')}`, { parse_mode: 'Markdown', ...inline });
    return;
  }

  // Visa details
  if (data.startsWith('visa_')) {
    const idx = parseInt(data.split('_')[1]);
    if (!isNaN(idx) && services.visa[idx]) {
      sendVisaDetail(chatId, idx);
    }
    return;
  }

  // PRO details
  if (data.startsWith('pro_')) {
    const idx = parseInt(data.split('_')[1]);
    if (!isNaN(idx) && services.pro[idx]) {
      sendPRODetail(chatId, idx);
    }
    return;
  }

  // FAQ answers
  if (data.startsWith('faq_')) {
    const idx = parseInt(data.split('_')[1]);
    if (!isNaN(idx) && faqs[idx]) {
      sendFAQAnswer(chatId, idx);
    }
    return;
  }

  // Application start
  if (data.startsWith('apply_v_')) {
    const idx = parseInt(data.split('_')[2]);
    if (!isNaN(idx)) {
      startApplication(chatId, idx);
    }
    return;
  }

  if (data === 'apply_pro') {
    startApplication(chatId, -1, true);
    return;
  }

  // Payment methods
  if (data === 'pay_card') {
    handlePayment(chatId, 'card');
    return;
  }
  if (data === 'pay_bank') {
    handlePayment(chatId, 'bank');
    return;
  }
  if (data === 'pay_cash') {
    handlePayment(chatId, 'cash');
    return;
  }
  if (data === 'pay_whatsapp') {
    handlePayment(chatId, 'whatsapp');
    return;
  }

  if (data === 'payment_back') {
    session.step = 'payment_select';
    bot.sendMessage(chatId, L(chatId, 'selectPayment'), {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          ...(stripeToken ? [[{ text: L(chatId, 'payCard'), callback_data: 'pay_card' }]] : []),
          [{ text: L(chatId, 'payBank'), callback_data: 'pay_bank' }],
          [{ text: L(chatId, 'payCash'), callback_data: 'pay_cash' }],
          [{ text: L(chatId, 'payWhatsApp'), callback_data: 'pay_whatsapp' }],
        ]
      }
    });
    return;
  }

  // Bank transfer receipt upload trigger
  if (data === 'upload_receipt') {
    const session = userSessions[chatId];
    if (session) {
      session.step = 'upload_receipt';
      bot.sendMessage(chatId, L(chatId, 'uploadReceipt'), { parse_mode: 'Markdown' });
    }
    return;
  }

  // Cash confirmation
  if (data === 'confirm_cash') {
    completeApplication(chatId);
    return;
  }

  // WhatsApp payment confirmation
  if (data === 'confirm_whatsapp') {
    completeApplication(chatId);
    return;
  }

  // Skip document
  if (data.startsWith('skip_doc_')) {
    const session = userSessions[chatId];
    if (session && session.step === 'docs_upload') {
      const docKey = data.replace('skip_doc_', '');
      session.docs[docKey] = 'skipped';
      session.docIndex++;
      bot.sendMessage(chatId, `Skipped ${docKey}.`);
      requestNextDocument(chatId);
    }
    return;
  }

  // Cancel application
  if (data === 'cancel_app') {
    delete userSessions[chatId];
    bot.sendMessage(chatId, `  Application cancelled.`, mainKeyboard(chatId));
    return;
  }
});

// ===== TEXT MESSAGE HANDLER =====
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Skip if no text (handled by photo/document handlers)
  if (!text || text.startsWith('/')) return;

  const session = userSessions[chatId];

  // Handle receipt upload
  if (session && session.step === 'upload_receipt' && (msg.photo || msg.document)) {
    handleReceiptUpload(chatId, msg);
    return;
  }

  // Handle form input
  if (session && handleForm(chatId, text, msg.from)) return;

  // Menu buttons - match in any language
  const lang = userLanguages[chatId] || 'en';
  const menuItems = {
    home: ['Home', 'ዋና ማውጫ', 'ዋና ዝርዝር', 'Cuunaa Guddaa'],
    pricing: ['Pricing', 'ዋጋዎች', 'ክፍልኦት', 'Gatiiwwan'],
    services: ['Visa Services', 'የቪዛ አገልግሎቶች', 'ናይ ቪዛ ኣገልግሎታት', 'Tajaajila Visa'],
    proServices: ['PRO Services', 'PRO አገልግሎቶች', 'PRO ኣገልግሎታት', 'Tajaajila PRO'],
    faq: ['FAQ', 'ብዙ ጊዜ የሚጠየቁ ጥያቄዎች', 'ብዙሕ ግዜ ዝሕተው ሕቶታት', 'Gaaffilee Daddarban'],
    contact: ['Contact', 'አግኙን', 'ተራኸቡ', 'Nu Quunnamaa'],
    apply: ['Apply Now', 'አሁን ያመልክቱ', 'ሕጂ ይሕተቱ', 'Amma Iyyadaa'],
    language: ['Change Language', 'ቋንቋ ቀይር', 'ቋንቋ ቅይር', 'Afaan Jijjiiri'],
    howItWorks: ['How It Works', 'እንዴት እንደሚሰራ', 'ከመይ ይሰርሕ', 'Akkamitti Hojjata'],
    testimonials: ['Testimonials', 'መስክረዋል', 'ናይ ምስክርነት ቃላት', 'Ragaa'],
  };

  const textTrim = text.trim();
  for (const [key, values] of Object.entries(menuItems)) {
    if (values.includes(textTrim)) {
      switch (key) {
        case 'home':
          sendWelcome(chatId, msg.from.first_name || 'there');
          break;
        case 'pricing':
          sendPricing(chatId);
          break;
        case 'services':
          sendVisaServices(chatId);
          break;
        case 'proServices':
          sendPROServices(chatId);
          break;
        case 'faq':
          sendFAQ(chatId);
          break;
        case 'contact':
          sendContact(chatId);
          break;
        case 'apply':
          bot.sendMessage(chatId, L(chatId, 'selectVisaType'), {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                ...services.visa.map((s, i) => [{ text: getServiceName(s, chatId), callback_data: `apply_v_${i}` }]),
                [{ text: L(chatId, 'proServices'), callback_data: 'apply_pro' }],
              ].flat()
            }
          });
          break;
        case 'language':
          bot.sendMessage(chatId, L(chatId, 'selectLanguage'), languageKeyboard());
          break;
        case 'howItWorks':
          sendHowItWorks(chatId);
          break;
        case 'testimonials':
          sendTestimonials(chatId);
          break;
      }
      return;
    }
  }

  // Smart replies
  const lower = text.toLowerCase();
  if (lower.includes('price') || lower.includes('cost') || lower.includes('how much') || lower.includes('aed') || lower.includes('gatii') || lower.includes('ዋጋ')) {
    sendPricing(chatId);
  } else if (lower.includes('visa') || lower.includes('visit') || lower.includes('extension') || lower.includes('ቪዛ')) {
    sendVisaServices(chatId);
  } else if (lower.includes('pro') || lower.includes('business') || lower.includes('license') || lower.includes('ንግድ')) {
    sendPROServices(chatId);
  } else if (lower.includes('contact') || lower.includes('phone') || lower.includes('call') || lower.includes('email') || lower.includes('ስልክ')) {
    sendContact(chatId);
  } else if (lower.includes('faq') || lower.includes('question') || lower.includes('how') || lower.includes('ጥያቄ')) {
    sendFAQ(chatId);
  } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('salam') || lower.includes('ሰላም') || lower.includes('akkam')) {
    bot.sendMessage(chatId, `${L(chatId, 'welcome', msg.from.first_name || 'there')}`, { parse_mode: 'Markdown', ...mainKeyboard(chatId) });
  } else {
    bot.sendMessage(chatId, `I'm not sure I understand. Choose an option from the menu below.`, mainKeyboard(chatId));
  }
});

// ===== ADDITIONAL COMMANDS =====
bot.onText(/\/services/, (msg) => sendVisaServices(msg.chat.id));
bot.onText(/\/apply/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, L(chatId, 'selectVisaType'), {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        ...services.visa.map((s, i) => [{ text: getServiceName(s, chatId), callback_data: `apply_v_${i}` }]),
        [{ text: L(chatId, 'proServices'), callback_data: 'apply_pro' }],
      ].flat()
    }
  });
});
bot.onText(/\/price/, (msg) => sendPricing(msg.chat.id));
bot.onText(/\/contact/, (msg) => sendContact(msg.chat.id));
bot.onText(/\/faq/, (msg) => sendFAQ(msg.chat.id));
bot.onText(/\/how/, (msg) => sendHowItWorks(msg.chat.id));
bot.onText(/\/testimonials/, (msg) => sendTestimonials(msg.chat.id));
bot.onText(/\/cancel/, (msg) => {
  delete userSessions[msg.chat.id];
  bot.sendMessage(msg.chat.id, 'Application cancelled.', mainKeyboard(msg.chat.id));
});

// Mini App command
bot.onText(/\/app/, (msg) => {
  bot.sendMessage(msg.chat.id,
    '  *Open Ask Mian Website*\n\nTap below to open our website:',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: ' Open Website', web_app: { url: 'https://askmian.com' } }],
        ]
      }
    }
  );
});

// Admin commands
bot.onText(/\/leads/, (msg) => {
  if (adminChatId && msg.chat.id.toString() === adminChatId) {
    const file = './leads.json';
    if (fs.existsSync(file)) {
      const leads = JSON.parse(fs.readFileSync(file, 'utf8'));
      const recent = leads.slice(-10);
      let text = `  *Recent Leads (${leads.length} total)*\n\n`;
      recent.forEach((l) => {
        text += `*${l.fullName || 'N/A'}*  ${l.visaType || 'N/A'}\n${l.whatsapp || 'N/A'}\n${new Date(l.timestamp).toLocaleDateString()}\n\n`;
      });
      bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
    } else {
      bot.sendMessage(msg.chat.id, 'No leads yet.');
    }
  }
});

bot.onText(/\/apps/, (msg) => {
  if (adminChatId && msg.chat.id.toString() === adminChatId) {
    const file = './applications.json';
    if (fs.existsSync(file)) {
      const apps = JSON.parse(fs.readFileSync(file, 'utf8'));
      const recent = apps.slice(-10);
      let text = `  *Applications (${apps.length} total)*\n\n`;
      recent.forEach((a) => {
        text += `*#${a.id}*  ${a.visaType || 'N/A'}\n${a.fullName || 'N/A'}  ${a.paymentMethod || 'N/A'}\n${new Date(a.timestamp).toLocaleDateString()}\n\n`;
      });
      bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
    } else {
      bot.sendMessage(msg.chat.id, 'No applications yet.');
    }
  }
});

console.log('  Ask Mian Telegram Bot v2.0 is running!');
console.log('Multi-language | Document Upload | Payment Integration');
console.log('Commands: /start, /services, /apply, /price, /contact, /faq, /how, /testimonials, /language, /cancel, /app');
console.log('Admin: /leads, /apps');

process.on('SIGINT', () => {
  console.log('\n  Bot stopped.');
  process.exit(0);
});

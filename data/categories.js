// Service categories data with bilingual descriptions, base prices, and common issues
export const CATEGORIES = [
  {
    id: 'plumber',
    name_en: 'Plumber',
    name_hi: 'प्लम्बर (नल/पाइप)',
    icon: 'Wrench',
    color: 'from-blue-600 to-cyan-600',
    bgLight: 'bg-blue-50 text-blue-700 border-blue-200',
    basePrice: 199,
    avgTime: '30-45 mins',
    popularProblems: [
      { id: 'tap_leak', label_en: 'Leaking Tap / Mixer', label_hi: 'नल से पानी टपकना', min: 149, max: 299 },
      { id: 'flush_tank', label_en: 'Flush Tank / Cistern Issue', label_hi: 'फ्लश टैंक खराबी', min: 249, max: 499 },
      { id: 'pipe_block', label_en: 'Drainage / Basin Blockage', label_hi: 'नाली या सिंक जाम', min: 299, max: 599 },
      { id: 'motor_pump', label_en: 'Water Motor / Pump Repair', label_hi: 'पानी की मोटर खराबी', min: 499, max: 999 },
      { id: 'new_fitting', label_en: 'New Tap / Shower Fitting', label_hi: 'नया नल / शॉवर लगाना', min: 199, max: 399 }
    ]
  },
  {
    id: 'electrician',
    name_en: 'Electrician',
    name_hi: 'इलेक्ट्रीशियन (बिजली)',
    icon: 'Zap',
    color: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
    basePrice: 199,
    avgTime: '25-40 mins',
    popularProblems: [
      { id: 'mcb_trip', label_en: 'MCB Tripping / Short Circuit', label_hi: 'MCB बार-बार गिरना', min: 249, max: 499 },
      { id: 'fan_repair', label_en: 'Ceiling Fan Noise / Repair', label_hi: 'पंखा रिपेयर / धीमी गति', min: 199, max: 399 },
      { id: 'switchboard', label_en: 'Switchboard / Socket Sparking', label_hi: 'स्विचबोर्ड में स्पार्किंग', min: 149, max: 299 },
      { id: 'inverter', label_en: 'Inverter & Battery Wiring', label_hi: 'इन्वर्टर और बैटरी वायरिंग', min: 399, max: 799 },
      { id: 'geyser_elec', label_en: 'Geyser Power Fault', label_hi: 'गीज़र चालू नहीं होना', min: 299, max: 549 }
    ]
  },
  {
    id: 'ac_repair',
    name_en: 'AC Repair',
    name_hi: 'एसी रिपेयर (AC)',
    icon: 'Wind',
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    basePrice: 299,
    avgTime: '45-60 mins',
    popularProblems: [
      { id: 'ac_cooling', label_en: 'Less / No Cooling', label_hi: 'कूलिंग नहीं हो रही', min: 399, max: 699 },
      { id: 'water_leak', label_en: 'Water Dripping from Indoor Unit', label_hi: 'अंदर से पानी टपकना', min: 299, max: 499 },
      { id: 'gas_leak', label_en: 'Gas Leakage & Refill', label_hi: 'गैस लीकेज व रिफिलिंग', min: 1499, max: 2499 },
      { id: 'ac_service', label_en: 'Deep Foam Jet Service', label_hi: 'डीप फोम जेट सर्विस', min: 499, max: 799 },
      { id: 'ac_noise', label_en: 'Unusual Noise / Fan Vibration', label_hi: 'कंपन या तेज़ आवाज़', min: 349, max: 599 }
    ]
  },
  {
    id: 'tutor',
    name_en: 'Home Tutor',
    name_hi: 'होम ट्यूटर (शिक्षक)',
    icon: 'GraduationCap',
    color: 'from-indigo-600 to-purple-600',
    bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    basePrice: 350,
    avgTime: '1 hr demo class',
    popularProblems: [
      { id: 'maths_science', label_en: 'Maths & Science (Class 6-10)', label_hi: 'गणित व विज्ञान (कक्षा 6-10)', min: 350, max: 600 },
      { id: 'physics_chem', label_en: 'Physics / Chemistry (Class 11-12)', label_hi: 'भौतिकी / रसायन (कक्षा 11-12)', min: 500, max: 900 },
      { id: 'english_comm', label_en: 'Spoken English & Reading', label_hi: 'स्पोकन इंग्लिश और रीडिंग', min: 300, max: 500 },
      { id: 'coding_basics', label_en: 'Coding for Kids (Python/Scratch)', label_hi: 'बच्चों के लिए कोडिंग', min: 400, max: 800 },
      { id: 'exam_prep', label_en: 'Competitive Exams Foundation', label_hi: 'प्रतियोगी परीक्षा तैयारी', min: 600, max: 1200 }
    ]
  },
  {
    id: 'carpenter',
    name_en: 'Carpenter',
    name_hi: 'बढ़ई (फर्नीचर)',
    icon: 'Hammer',
    color: 'from-yellow-600 to-amber-700',
    bgLight: 'bg-amber-50 text-amber-800 border-amber-300',
    basePrice: 249,
    avgTime: '40-60 mins',
    popularProblems: [
      { id: 'door_lock', label_en: 'Door Lock Repair / Installation', label_hi: 'दरवाजे का ताला रिपेयर', min: 249, max: 499 },
      { id: 'hinge_drawer', label_en: 'Hinges / Drawer Channel Repair', label_hi: 'कब्जे या दराज चैनल खराबी', min: 199, max: 399 },
      { id: 'furniture_assembly', label_en: 'Bed / Table Assembly', label_hi: 'फर्नीचर फिटिंग / असेंबली', min: 399, max: 799 },
      { id: 'wood_cutting', label_en: 'Custom Wood Cutting & Trimming', label_hi: 'लकड़ी की कटाई व फिटिंग', min: 299, max: 599 }
    ]
  },
  {
    id: 'painter',
    name_en: 'Painter',
    name_hi: 'पेंटर (रंगाई)',
    icon: 'Paintbrush',
    color: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50 text-rose-700 border-rose-200',
    basePrice: 299,
    avgTime: 'Custom quote',
    popularProblems: [
      { id: 'touchup_damp', label_en: 'Dampness / Seepage Touchup', label_hi: 'सीलन व पैच वर्क रिपेयर', min: 499, max: 999 },
      { id: 'single_room', label_en: 'Single Room Painting', label_hi: 'एक कमरे का पेंट', min: 1499, max: 2999 },
      { id: 'wall_texture', label_en: 'Accent Texture Wall Design', label_hi: 'टेक्सचर डिज़ाइन वॉल', min: 1200, max: 2500 },
      { id: 'waterproofing', label_en: 'Balcony / Roof Waterproofing', label_hi: 'वॉटरप्रूफिंग कोटिंग', min: 999, max: 2499 }
    ]
  }
];

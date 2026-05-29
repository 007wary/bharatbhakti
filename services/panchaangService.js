const TITHIS = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
  'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
  'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
  'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

const YOGAS = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
  'Indra', 'Vaidhriti',
];

const KARANS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'];

const VARA = ['Ravivara', 'Somvara', 'Mangalvara', 'Budhvara', 'Guruvara', 'Shukravara', 'Shanivara'];

// Rahu Kaal windows per weekday (start hour, start min, end hour, end min)
const RAHU_KAAL = [
  [16, 30, 18, 0],   // Sunday
  [7, 30, 9, 0],     // Monday
  [15, 0, 16, 30],   // Tuesday
  [12, 0, 13, 30],   // Wednesday
  [13, 30, 15, 0],   // Thursday
  [10, 30, 12, 0],   // Friday
  [9, 0, 10, 30],    // Saturday
];

export const getPanchang = () => {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const weekday = now.getDay();

  const tithi = TITHIS[dayOfYear % 30];
  const nakshatra = NAKSHATRAS[dayOfYear % 27];
  const yoga = YOGAS[dayOfYear % 27];
  const karan = KARANS[dayOfYear % 7];
  const vara = VARA[weekday];

  const [rStartH, rStartM, rEndH, rEndM] = RAHU_KAAL[weekday];
  const rahuStart = new Date(now);
  rahuStart.setHours(rStartH, rStartM, 0, 0);
  const rahuEnd = new Date(now);
  rahuEnd.setHours(rEndH, rEndM, 0, 0);

  const isRahuActive = now >= rahuStart && now <= rahuEnd;

  return {
    tithi,
    nakshatra,
    yoga,
    karan,
    vara,
    rahuStart,
    rahuEnd,
    isRahuActive,
  };
};

export const getRahuCountdown = () => {
  const now = new Date();
  const weekday = now.getDay();
  const [rStartH, rStartM, rEndH, rEndM] = RAHU_KAAL[weekday];

  const rahuStart = new Date(now);
  rahuStart.setHours(rStartH, rStartM, 0, 0);
  const rahuEnd = new Date(now);
  rahuEnd.setHours(rEndH, rEndM, 0, 0);

  const isActive = now >= rahuStart && now <= rahuEnd;
  const target = isActive ? rahuEnd : rahuStart;
  const diff = Math.max(0, Math.floor((target - now) / 1000));

  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;

  return {
    isActive,
    countdown: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
    diff,
  };
};
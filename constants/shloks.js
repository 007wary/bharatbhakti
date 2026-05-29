const SHLOKS = [
  {
    shlok: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।',
    meaning: 'You have the right to perform your duties, but not to the fruits of your actions.',
    source: 'Bhagavad Gita 2.47',
  },
  {
    shlok: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।',
    meaning: 'Whenever there is a decline in righteousness, O Arjuna, I manifest myself.',
    source: 'Bhagavad Gita 4.7',
  },
  {
    shlok: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।',
    meaning: 'Abandon all duties and surrender unto me alone. I shall liberate you from all sins.',
    source: 'Bhagavad Gita 18.66',
  },
  {
    shlok: 'न जायते म्रियते वा कदाचिन्नायं भूत्वा भविता वा न भूयः।',
    meaning: 'The soul is never born nor dies. It has not come into being and will not cease to be.',
    source: 'Bhagavad Gita 2.20',
  },
  {
    shlok: 'समं सर्वेषु भूतेषु तिष्ठन्तं परमेश्वरम्।',
    meaning: 'He who sees the Supreme Lord equally present in all beings truly sees.',
    source: 'Bhagavad Gita 13.28',
  },
  {
    shlok: 'मन्मना भव मद्भक्तो मद्याजी मां नमस्कुरु।',
    meaning: 'Fix your mind on me, be devoted to me, worship me, bow down to me.',
    source: 'Bhagavad Gita 18.65',
  },
  {
    shlok: 'श्रद्धावान् लभते ज्ञानं तत्परः संयतेन्द्रियः।',
    meaning: 'One who has faith, who is devoted, and who has mastered the senses obtains knowledge.',
    source: 'Bhagavad Gita 4.39',
  },
];

export const getDailyShlok = () => {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return SHLOKS[dayOfYear % SHLOKS.length];
};
export const ADHAN_SOUNDS = [
  {
    id: 'makkah',
    name: 'أذان الحرم المكي',
    source: require('../assets/makkah.mp3')
  },
  {
    id: 'madina',
    name: 'أذان المسجد النبوي',
    source: require('../assets/madina.mp3')
  },
  {
    id: 'afasy',
    name: 'أذان مشاري العفاسي',
    source: require('../assets/afasy.mp3')
  }
];

// البحث عن صوت بواسطة معرفه
export const getAdhanSound = (adhanId) => {
  const sound = ADHAN_SOUNDS.find(s => s.id === adhanId);
  return sound || ADHAN_SOUNDS[0];
};

// الحصول على معرف الصوت الافتراضي
export const getDefaultAdhanSound = () => {
  return ADHAN_SOUNDS[0];
};

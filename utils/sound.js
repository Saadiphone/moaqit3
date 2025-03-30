import { Audio } from 'expo-av';

// متغير لتخزين حالة الصوت
let soundObject = null;
let isPlaying = false;

// التحقق مما إذا كان هناك صوت قيد التشغيل
export const isSoundPlaying = () => {
  return isPlaying;
};

// إيقاف الصوت الحالي بطريقة أكثر موثوقية
export const stopSound = async () => {
  if (soundObject) {
    try {
      console.log('محاولة إيقاف الصوت...');
      
      // محاولة إيقاف الصوت
      try {
        await soundObject.stopAsync();
        await soundObject.unloadAsync();
      } catch (e) {
        console.log('خطأ أثناء إيقاف الصوت:', e);
      }
    } finally {
      // تعيين المتغيرات إلى القيم الافتراضية حتى في حالة حدوث خطأ
      soundObject = null;
      isPlaying = false;
    }
  }
  return true;
};

// تشغيل ملف صوتي مع تحسين التعامل مع الأخطاء
export const playSound = async (soundSource) => {
  try {
    // إيقاف أي صوت نشط حاليًا
    await stopSound();
    
    if (!soundSource) {
      console.log('لم يتم تحديد مصدر الصوت');
      return false;
    }
    
    console.log('جاري محاولة تشغيل الصوت...');
    
    // إنشاء كائن صوت جديد
    soundObject = new Audio.Sound();
    
    // تحميل الصوت
    await soundObject.loadAsync(soundSource);
    
    // تشغيل الصوت
    await soundObject.playAsync();
    isPlaying = true;
    
    // إعداد معالج لنهاية التشغيل
    soundObject.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        isPlaying = false;
        soundObject = null;
      }
    });
    
    return true;
  } catch (error) {
    console.error('خطأ في تشغيل الصوت:', error);
    isPlaying = false;
    soundObject = null;
    return false;
  }
};

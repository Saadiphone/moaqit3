import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Linking, Alert } from 'react-native';
import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { getAdhanSound } from '../constants/adhanSounds';

// أسماء الصلوات
const PRAYER_NAMES = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء'
};

// تهيئة نظام الإشعارات
export const initNotifications = async () => {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      }),
    });
    
    return true;
  } catch (error) {
    console.log('فشل في تهيئة نظام الإشعارات:', error);
    return false;
  }
};

// التحقق من أذونات الإشعارات
export const checkNotificationsPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      return existingStatus === 'granted';
    }
    
    // في نظام iOS نتحقق بطريقة مختلفة
    const settings = await Notifications.getPermissionsAsync();
    return settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  } catch (error) {
    console.log('خطأ في التحقق من أذونات الإشعارات:', error);
    return false;
  }
};

// طلب أذونات الإشعارات
export const requestNotificationsPermission = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
    });
    
    return status === 'granted';
  } catch (error) {
    console.log('خطأ في طلب أذونات الإشعارات:', error);
    return false;
  }
};

// فتح إعدادات التطبيق
export const openAppSettings = () => {
  try {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
    return true;
  } catch (error) {
    console.log('خطأ في فتح إعدادات التطبيق:', error);
    return false;
  }
};

// عرض مربع حوار لطلب الإذن
export const showPermissionDialog = () => {
  return new Promise((resolve) => {
    Alert.alert(
      'السماح بالإشعارات',
      'يحتاج التطبيق إلى إذن لإرسال إشعارات في أوقات الصلاة. هل تريد فتح إعدادات التطبيق لمنح هذا الإذن؟',
      [
        {
          text: 'لاحقًا',
          onPress: () => resolve(false),
          style: 'cancel',
        },
        {
          text: 'فتح الإعدادات',
          onPress: () => {
            openAppSettings();
            resolve(true);
          },
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
};

// إلغاء جميع الإشعارات المجدولة
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('تم إلغاء جميع الإشعارات المجدولة');
    return true;
  } catch (error) {
    console.log('خطأ في إلغاء الإشعارات:', error);
    return false;
  }
};

// جدولة إشعار واحد
const scheduleNotification = async (title, body, date, soundId) => {
  try {
    // تهيئة المحتوى
    const notificationContent = {
      title,
      body,
      data: { soundId },
    };
    
    // تهيئة التوقيت
    const trigger = new Date(date);
    
    // جدولة الإشعار
    const identifier = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger,
    });
    
    console.log(`تم جدولة إشعار في ${date.toLocaleTimeString()} (${identifier})`);
    return true;
  } catch (error) {
    console.log(`خطأ في جدولة الإشعار: ${title}`, error);
    return false;
  }
};

// حساب أوقات الصلاة
export const calculatePrayerTimes = async () => {
  try {
    // الحصول على الموقع من التخزين
    let coordinates;
    const locationString = await AsyncStorage.getItem('location');
    if (locationString) {
      const location = JSON.parse(locationString);
      coordinates = new Coordinates(location.coords.latitude, location.coords.longitude);
    } else {
      // موقع افتراضي (مكة المكرمة)
      coordinates = new Coordinates(21.3891, 39.8579);
    }
    
    // الحصول على تعديلات أوقات الصلاة
    let prayerAdjustments = {};
    const adjustmentsString = await AsyncStorage.getItem('prayerAdjustments');
    if (adjustmentsString) {
      prayerAdjustments = JSON.parse(adjustmentsString);
    }
    
    // حساب أوقات الصلاة لليوم
    const params = CalculationMethod.UmmAlQura();
    const today = new Date();
    const todayPrayers = new PrayerTimes(coordinates, today, params);
    
    // تطبيق التعديلات على الأوقات
    const prayerTimesMap = {};
    
    // أوقات اليوم
    for (const prayer in PRAYER_NAMES) {
      if (prayer === 'sunrise') continue; // تخطي الشروق
      
      const adjustment = prayerAdjustments[prayer] || 0;
      const prayerTime = new Date(todayPrayers[prayer]);
      prayerTime.setMinutes(prayerTime.getMinutes() + adjustment);
      
      // نضيف فقط الأوقات المستقبلية
      if (prayerTime > today) {
        prayerTimesMap[prayer] = prayerTime;
      }
    }
    
    // إذا لم نجد أي أوقات صلاة مستقبلية لليوم، نحسب أوقات الغد
    if (Object.keys(prayerTimesMap).length === 0) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowPrayers = new PrayerTimes(coordinates, tomorrow, params);
      
      for (const prayer in PRAYER_NAMES) {
        if (prayer === 'sunrise') continue; // تخطي الشروق
        
        const adjustment = prayerAdjustments[prayer] || 0;
        const prayerTime = new Date(tomorrowPrayers[prayer]);
        prayerTime.setMinutes(prayerTime.getMinutes() + adjustment);
        prayerTimesMap[prayer] = prayerTime;
        
        // نكتفي بصلاة الفجر من اليوم التالي
        if (prayer === 'fajr') break;
      }
    }
    
    return prayerTimesMap;
  } catch (error) {
    console.log('خطأ في حساب أوقات الصلاة:', error);
    return null;
  }
};

// جدولة إشعارات الصلاة
export const schedulePrayerNotifications = async () => {
  try {
    // تهيئة نظام الإشعارات
    await initNotifications();
    
    // تحقق من الأذونات
    let hasPermission = await checkNotificationsPermission();
    if (!hasPermission) {
      hasPermission = await requestNotificationsPermission();
      if (!hasPermission) {
        console.log('لم يتم منح أذونات الإشعارات');
        await showPermissionDialog();
        return false;
      }
    }
    
    // إلغاء الإشعارات السابقة
    await cancelAllNotifications();
    
    // الحصول على معرف صوت الأذان المختار
    let selectedSoundId = '';
    try {
      selectedSoundId = await AsyncStorage.getItem('selectedSound') || 'makkah';
    } catch (e) {
      console.log('خطأ في قراءة صوت الأذان المفضل:', e);
      selectedSoundId = 'makkah'; // القيمة الافتراضية
    }
    
    // حساب أوقات الصلاة
    const prayerTimesMap = await calculatePrayerTimes();
    if (!prayerTimesMap) {
      console.log('فشل في حساب أوقات الصلاة');
      return false;
    }
    
    // جدولة الإشعارات لكل صلاة
    let scheduledCount = 0;
    for (const [prayer, time] of Object.entries(prayerTimesMap)) {
      const prayerName = PRAYER_NAMES[prayer];
      
      // جدولة الإشعار
      await scheduleNotification(
        `حان وقت صلاة ${prayerName}`,
        `حان وقت أداء صلاة ${prayerName}`,
        time,
        selectedSoundId
      );
      
      scheduledCount++;
    }
    
    // إرسال إشعار تأكيد بعد ثوانٍ قليلة
    if (scheduledCount > 0) {
      const confirmTime = new Date();
      confirmTime.setSeconds(confirmTime.getSeconds() + 3);
      
      await scheduleNotification(
        'تم تفعيل إشعارات الصلاة',
        `سيتم تنبيهك في أوقات الصلاة (${scheduledCount} أوقات قادمة)`,
        confirmTime,
        ''
      );
      
      console.log(`تم جدولة ${scheduledCount} إشعارات للصلوات القادمة`);
    }
    
    return true;
  } catch (error) {
    console.log('خطأ في جدولة إشعارات الصلاة:', error);
    return false;
  }
};

// تحديث حالة الإشعارات
export const updateNotifications = async (enabled) => {
  // حفظ تفضيل المستخدم
  await AsyncStorage.setItem('notificationsEnabled', String(enabled));
  
  if (enabled) {
    return await schedulePrayerNotifications();
  } else {
    return await cancelAllNotifications();
  }
};

// إعداد مستمع للإشعارات
export const setupNotificationListeners = (onReceiveCallback) => {
  try {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('تم استلام إشعار:', notification.request.content.title);
      
      if (typeof onReceiveCallback === 'function') {
        onReceiveCallback(notification);
      }
    });
    
    return subscription;
  } catch (error) {
    console.log('خطأ في إعداد مستمع الإشعارات:', error);
    return { remove: () => {} };
  }
};

// دالة جديدة لاختبار الإشعارات
export const testNotification = async () => {
  try {
    // تهيئة نظام الإشعارات
    await initNotifications();
    
    // تحقق من الأذونات
    let hasPermission = await checkNotificationsPermission();
    if (!hasPermission) {
      hasPermission = await requestNotificationsPermission();
      if (!hasPermission) {
        console.log('لم يتم منح أذونات الإشعارات');
        await showPermissionDialog();
        return false;
      }
    }
    
    // إرسال إشعار اختبار بعد 5 ثواني
    const testTime = new Date();
    testTime.setSeconds(testTime.getSeconds() + 5);
    
    await scheduleNotification(
      'إشعار اختبار',
      'هذا إشعار اختباري للتأكد من عمل نظام الإشعارات',
      testTime,
      ''
    );
    
    return true;
  } catch (error) {
    console.log('خطأ في اختبار الإشعار:', error);
    return false;
  }
};

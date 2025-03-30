import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { ScrollView, View, Text, Switch, Button, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';

// استيراد الأدوات المساعدة
import { ADHAN_SOUNDS } from './constants/adhanSounds';
import { isSoundPlaying, playSound, stopSound } from './utils/sound';
import { updateNotifications, testNotification } from './utils/notifications';

// استيراد الشاشات
import PrayerTimes from './screens/PrayerTimes';
import Qibla from './screens/Qibla';
import Tasbeeh from './screens/Tasbeeh';

const Tab = createBottomTabNavigator();

// تعريف الثيم الفاتح
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2ecc71',
    secondary: '#3498db',
    background: '#f5f6fa',
    surface: '#ffffff',
  },
};

// تعريف الثيم الداكن
const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#2ecc71',
    secondary: '#3498db',
    background: '#121212',
    surface: '#1e1e1e',
  },
};

// مكون الإعدادات مبسط تمامًا
const SimpleSettings = ({ toggleAppTheme, isDarkMode }) => {
  const [location, setLocation] = useState(null);
  const [prayerAdjustments, setPrayerAdjustments] = useState({
    fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedSound, setSelectedSound] = useState('makkah');
  const [playingSound, setPlayingSound] = useState(null);
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      // تحميل إعدادات الموقع
      const savedLocation = await AsyncStorage.getItem('location');
      if (savedLocation) setLocation(JSON.parse(savedLocation));
      
      // تحميل إعدادات أوقات الصلاة
      const savedAdjustments = await AsyncStorage.getItem('prayerAdjustments');
      if (savedAdjustments) setPrayerAdjustments(JSON.parse(savedAdjustments));

      // تحميل حالة الإشعارات
      const notifications = await AsyncStorage.getItem('notificationsEnabled');
      setNotificationsEnabled(notifications === 'true');

      // تحميل صوت الأذان المحدد
      const savedSound = await AsyncStorage.getItem('selectedSound');
      if (savedSound) setSelectedSound(savedSound);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('يجب السماح بالوصول إلى الموقع');
        return;
      }

      setLocation({ status: 'جاري تحديد الموقع...' });
      const currentLocation = await Location.getCurrentPositionAsync({});
      await AsyncStorage.setItem('location', JSON.stringify(currentLocation));
      setLocation(currentLocation);
      Alert.alert('تم تحديث الموقع بنجاح');
    } catch (error) {
      console.error('Error updating location:', error);
      Alert.alert('حدث خطأ في تحديد الموقع');
    }
  };
  
  const adjustPrayerTime = async (prayer, amount) => {
    try {
      const newAdjustments = {
        ...prayerAdjustments,
        [prayer]: amount
      };
      await AsyncStorage.setItem('prayerAdjustments', JSON.stringify(newAdjustments));
      setPrayerAdjustments(newAdjustments);
    } catch (error) {
      console.error('Error saving prayer adjustments:', error);
    }
  };

  // تبسيط تام لمعالج الإشعارات
  const toggleNotifications = async (value) => {
    try {
      const success = await updateNotifications(value);
      setNotificationsEnabled(value);
      
      if (value && !success) {
        Alert.alert(
          'تنبيه',
          'لا يمكن جدولة الإشعارات. يرجى التحقق من أذونات التطبيق في إعدادات الهاتف.'
        );
      } else {
        Alert.alert(
          'إشعارات الصلاة',
          value ? 'تم تفعيل إشعارات الصلاة بنجاح' : 'تم إيقاف إشعارات الصلاة'
        );
      }
    } catch (error) {
      console.error('خطأ في تحديث الإشعارات:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث إعدادات الإشعارات');
    }
  };

  // تشغيل الصوت - تحسين معالجة الأخطاء
  const handlePlaySound = async (sound) => {
    try {
      if (!sound || !sound.source) {
        console.error('صوت غير صالح:', sound);
        Alert.alert('الصوت غير متوفر');
        return;
      }
      
      const soundIsPlaying = isSoundPlaying();
      if (soundIsPlaying && playingSound === sound.id) {
        await stopSound();
        setPlayingSound(null);
      } else {
        if (soundIsPlaying) {
          await stopSound();
        }
        
        const success = await playSound(sound.source);
        if (success) {
          setPlayingSound(sound.id);
        } else {
          setPlayingSound(null);
        }
      }
    } catch (error) {
      console.error('خطأ في تشغيل/إيقاف الصوت:', error);
      setPlayingSound(null);
    }
  };

  const renderAudioButton = (sound) => {
    const isPlaying = playingSound === sound.id;
    
    return (
      <TouchableOpacity
        onPress={() => handlePlaySound(sound)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isPlaying ? '#e53935' : '#2ecc71',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 20,
          marginLeft: 10
        }}
      >
        <Icon 
          name={isPlaying ? "stop" : "play"} 
          size={24} 
          color="white" 
          style={{ marginRight: 5 }}
        />
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {isPlaying ? "إيقاف" : "تشغيل"}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleSoundChange = async (soundId) => {
    try {
      await AsyncStorage.setItem('selectedSound', soundId);
      setSelectedSound(soundId);
    } catch (error) {
      console.error('Error saving selected sound:', error);
    }
  };

  const testNotificationSystem = async () => {
    try {
      const success = await testNotification();
      if (success) {
        Alert.alert('تم جدولة إشعار اختباري', 'سيظهر إشعار خلال 5 ثوانٍ');
      } else {
        Alert.alert('فشل الاختبار', 'تعذر جدولة إشعار اختباري');
      }
    } catch (error) {
      console.error('خطأ في اختبار الإشعارات:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء اختبار نظام الإشعارات');
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: isDarkMode ? '#121212' : '#f5f6fa' }}>
      {/* قسم الوضع الليلي */}
      <View style={{ 
        borderRadius: 10, 
        overflow: 'hidden', 
        backgroundColor: isDarkMode ? '#1e1e1e' : 'white',
        marginBottom: 16,
        padding: 16
      }}>
        <Text style={{ fontSize: 18, marginBottom: 10, color: isDarkMode ? 'white' : 'black' }}>
          الوضع الليلي
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: isDarkMode ? 'white' : 'black' }}>
            {isDarkMode ? 'مفعل' : 'غير مفعل'}
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleAppTheme}
            trackColor={{ false: "#767577", true: "#2ecc71" }}
            thumbColor="#f4f3f4"
          />
        </View>
      </View>
      
      {/* قسم الموقع */}
      <View style={{ 
        borderRadius: 10, 
        overflow: 'hidden', 
        backgroundColor: isDarkMode ? '#1e1e1e' : 'white',
        marginBottom: 16,
        padding: 16
      }}>
        <Text style={{ fontSize: 18, marginBottom: 10, color: isDarkMode ? 'white' : 'black' }}>
          الموقع الحالي
        </Text>
        
        {location ? (
          <View style={{ marginBottom: 10 }}>
            {location.coords ? (
              <>
                <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 4 }}>
                  خط العرض: {location.coords.latitude.toFixed(4)}
                </Text>
                <Text style={{ color: isDarkMode ? 'white' : 'black' }}>
                  خط الطول: {location.coords.longitude.toFixed(4)}
                </Text>
              </>
            ) : (
              <Text style={{ color: isDarkMode ? 'white' : 'black' }}>
                {location.status || 'موقع غير محدد'}
              </Text>
            )}
          </View>
        ) : (
          <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 10 }}>
            لم يتم تحديد الموقع
          </Text>
        )}
        
        <TouchableOpacity
          onPress={updateLocation}
          style={{
            backgroundColor: '#2ecc71',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 8
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
            تحديث الموقع
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* قسم تعديل أوقات الصلاة */}
      <View style={{ 
        borderRadius: 10, 
        overflow: 'hidden', 
        backgroundColor: isDarkMode ? '#1e1e1e' : 'white',
        marginBottom: 16,
        padding: 16
      }}>
        <Text style={{ fontSize: 18, marginBottom: 10, color: isDarkMode ? 'white' : 'black' }}>
          تعديل أوقات الصلاة
        </Text>
        
        {Object.entries({
          fajr: 'الفجر',
          dhuhr: 'الظهر',
          asr: 'العصر',
          maghrib: 'المغرب',
          isha: 'العشاء'
        }).map(([prayer, label]) => (
          <View key={prayer} style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#333' : '#eee'
          }}>
            <Text style={{ color: isDarkMode ? 'white' : 'black' }}>{label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: isDarkMode ? 'white' : 'black', marginRight: 10 }}>
                {prayerAdjustments[prayer]} دقيقة
              </Text>
              <Button
                title="-"
                color="#999"
                onPress={() => adjustPrayerTime(prayer, prayerAdjustments[prayer] - 1)}
              />
              <View style={{ width: 10 }} />
              <Button
                title="+"
                color="#2ecc71"
                onPress={() => adjustPrayerTime(prayer, prayerAdjustments[prayer] + 1)}
              />
            </View>
          </View>
        ))}
      </View>

      {/* قسم اختيار صوت الأذان */}
      <View style={{ 
        borderRadius: 10, 
        overflow: 'hidden', 
        backgroundColor: isDarkMode ? '#1e1e1e' : 'white',
        marginBottom: 16,
        padding: 16
      }}>
        <Text style={{ fontSize: 20, marginBottom: 16, color: isDarkMode ? 'white' : 'black', fontWeight: 'bold' }}>
          اختيار صوت الأذان
        </Text>
        
        {ADHAN_SOUNDS.map(sound => (
          <View key={sound.id} style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#333' : '#eee'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: selectedSound === sound.id ? '#2ecc71' : isDarkMode ? '#555' : '#ddd',
                marginRight: 12,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {selectedSound === sound.id && (
                  <View style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: '#2ecc71'
                  }} />
                )}
              </View>
              <Text
                style={{ color: isDarkMode ? 'white' : 'black', fontSize: 16 }}
                onPress={() => handleSoundChange(sound.id)}
              >
                {sound.name}
              </Text>
            </View>
            
            {renderAudioButton(sound)}
          </View>
        ))}
      </View>

      {/* قسم الإشعارات */}
      <View style={{ 
        borderRadius: 10, 
        overflow: 'hidden', 
        backgroundColor: isDarkMode ? '#1e1e1e' : 'white',
        marginBottom: 16,
        padding: 16
      }}>
        <Text style={{ fontSize: 18, marginBottom: 10, color: isDarkMode ? 'white' : 'black' }}>
          إعدادات الإشعارات
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <Text style={{ color: isDarkMode ? 'white' : 'black' }}>
            تفعيل الإشعارات
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: "#767577", true: "#2ecc71" }}
            thumbColor="#f4f3f4"
          />
        </View>
        
        <TouchableOpacity
          onPress={testNotificationSystem}
          style={{
            backgroundColor: '#3498db',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            اختبار الإشعارات
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        const value = await AsyncStorage.getItem('darkMode');
        setIsDarkMode(value === 'true');
      } catch (e) {
        console.error(e);
      }
    };
    
    loadDarkMode();
  }, []);
  
  const toggleTheme = async () => {
    try {
      const newValue = !isDarkMode;
      await AsyncStorage.setItem('darkMode', String(newValue));
      setIsDarkMode(newValue);
    } catch (e) {
      console.error(e);
    }
  };
  
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style={isDarkMode ? 'light' : 'dark'} />
          <Tab.Navigator
            initialRouteName="المواقيت"
            screenOptions={({ route }) => ({
              tabBarIcon: ({ color, size }) => {
                let iconName;
                switch (route.name) {
                  case 'المواقيت': iconName = 'clock-time-five'; break;
                  case 'القبلة': iconName = 'compass'; break;
                  case 'المسبحة': iconName = 'circle-multiple'; break;
                  case 'الإعدادات': iconName = 'cog'; break;
                }
                return <Icon name={iconName} size={size + 4} color={color} />;
              },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarStyle: {
                backgroundColor: theme.colors.surface,
                height: 65,
                paddingBottom: 10,
                paddingTop: 5
              },
              tabBarLabelStyle: {
                fontSize: 13,
                fontWeight: '500',
                paddingBottom: 4
              },
              headerStyle: {
                backgroundColor: theme.colors.surface,
              },
              headerTintColor: theme.colors.onSurface,
            })}
          >
            <Tab.Screen 
              name="الإعدادات" 
              options={{ title: 'الإعدادات' }}
            >
              {() => <SimpleSettings toggleAppTheme={toggleTheme} isDarkMode={isDarkMode} />}
            </Tab.Screen>
            <Tab.Screen name="المسبحة" component={Tasbeeh} />
            <Tab.Screen name="القبلة" component={Qibla} />
            <Tab.Screen name="المواقيت" component={PrayerTimes} />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

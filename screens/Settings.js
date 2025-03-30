import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Surface, Switch, useTheme, List, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const Settings = ({ isDarkMode, toggleTheme }) => {
  const theme = useTheme();
  const [location, setLocation] = useState(null);
  const [prayerAdjustments, setPrayerAdjustments] = useState({
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLocation = await AsyncStorage.getItem('location');
      const savedAdjustments = await AsyncStorage.getItem('prayerAdjustments');

      if (savedLocation) setLocation(JSON.parse(savedLocation));
      if (savedAdjustments) setPrayerAdjustments(JSON.parse(savedAdjustments));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('يجب السماح بالوصول إلى الموقع');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      await AsyncStorage.setItem('location', JSON.stringify(currentLocation));
      setLocation(currentLocation);
    } catch (error) {
      console.error('Error updating location:', error);
      alert('حدث خطأ في تحديد الموقع');
    }
  };

  const adjustPrayerTime = async (prayer, minutes) => {
    try {
      const newAdjustments = {
        ...prayerAdjustments,
        [prayer]: minutes
      };
      await AsyncStorage.setItem('prayerAdjustments', JSON.stringify(newAdjustments));
      setPrayerAdjustments(newAdjustments);
    } catch (error) {
      console.error('Error saving prayer adjustments:', error);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.section}>
        <List.Item
          title="الوضع الليلي"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={isDarkMode}
              onValueChange={() => toggleTheme(!isDarkMode)}
              color={theme.colors.primary}
            />
          )}
        />
      </Surface>

      <Surface style={styles.section}>
        <List.Subheader>الموقع الحالي</List.Subheader>
        {location ? (
          <List.Item
            title={`خط العرض: ${location.coords.latitude.toFixed(4)}`}
            description={`خط الطول: ${location.coords.longitude.toFixed(4)}`}
            left={props => <List.Icon {...props} icon="map-marker" />}
          />
        ) : (
          <List.Item
            title="لم يتم تحديد الموقع"
            left={props => <List.Icon {...props} icon="map-marker-off" />}
          />
        )}
        <Button 
          mode="contained" 
          onPress={updateLocation}
          style={styles.button}
        >
          تحديث الموقع
        </Button>
      </Surface>

      <Surface style={styles.section}>
        <List.Subheader>تعديل أوقات الإقامة</List.Subheader>
        {Object.entries({
          fajr: 'الفجر',
          dhuhr: 'الظهر',
          asr: 'العصر',
          maghrib: 'المغرب',
          isha: 'العشاء'
        }).map(([prayer, label]) => (
          <List.Item
            key={prayer}
            title={label}
            description={`${prayerAdjustments[prayer]} دقيقة`}
            right={() => (
              <View style={styles.adjustButtons}>
                <Button 
                  onPress={() => adjustPrayerTime(prayer, prayerAdjustments[prayer] - 1)}
                  mode="text"
                >-</Button>
                <Button 
                  onPress={() => adjustPrayerTime(prayer, prayerAdjustments[prayer] + 1)}
                  mode="text"
                >+</Button>
              </View>
            )}
          />
        ))}
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
  },
  button: {
    margin: 16,
  },
  adjustButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Settings;
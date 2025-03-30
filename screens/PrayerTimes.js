import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Surface, Text, useTheme, List } from 'react-native-paper';
import { CalculationMethod, Coordinates, PrayerTimes as AdhanPrayer } from 'adhan';
import moment from 'moment';
import momentHijri from 'moment-hijri';
import 'moment/locale/ar';

const PrayerTimes = () => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(moment());
  const [prayerTimes, setPrayerTimes] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment());
    }, 1000);

    loadPrayerTimes();

    return () => clearInterval(timer);
  }, []);

  const loadPrayerTimes = async () => {
    try {
      const coordinates = new Coordinates(21.3891, 39.8579);
      const date = new Date();
      const params = CalculationMethod.UmmAlQura();
      
      const pTimes = new AdhanPrayer(coordinates, date, params);
      setPrayerTimes({
        fajr: pTimes.fajr,
        sunrise: pTimes.sunrise,
        dhuhr: pTimes.dhuhr,
        asr: pTimes.asr,
        maghrib: pTimes.maghrib,
        isha: pTimes.isha
      });
    } catch (error) {
      console.error('Error calculating prayer times:', error);
    }
  };

  const formatPrayerTime = (time) => {
    if (!time) return '--:--';
    return moment(time).format('hh:mm A');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Surface style={styles.timeSection}>
          <Text style={[styles.time, { color: theme.colors.primary }]}>
            {currentTime.format('hh:mm')}
            <Text style={styles.ampm}> {currentTime.format('A')}</Text>
          </Text>
          <Text style={[styles.date, { color: theme.colors.onSurface }]}>
            {currentTime.format('dddd, D MMMM YYYY')}
          </Text>
          <Text style={[styles.hijriDate, { color: theme.colors.onSurface }]}>
            {momentHijri(currentTime).format('iD iMMMM iYYYY')}
          </Text>
        </Surface>

        <Surface style={styles.prayerTimesSection}>
          <List.Section>
            <List.Subheader style={styles.sectionHeader}>مواقيت الصلاة اليوم</List.Subheader>
            {prayerTimes && [
              { name: 'الفجر', time: prayerTimes?.fajr },
              { name: 'الشروق', time: prayerTimes?.sunrise },
              { name: 'الظهر', time: prayerTimes?.dhuhr },
              { name: 'العصر', time: prayerTimes?.asr },
              { name: 'المغرب', time: prayerTimes?.maghrib },
              { name: 'العشاء', time: prayerTimes?.isha }
            ].map((prayer) => (
              <List.Item
                key={prayer.name}
                title={prayer.name}
                right={() => (
                  <Text style={[styles.prayerTime, { color: theme.colors.primary }]}>
                    {formatPrayerTime(prayer.time)}
                  </Text>
                )}
                left={props => <List.Icon {...props} icon="clock-outline" />}
                style={styles.prayerItem}
              />
            ))}
          </List.Section>
        </Surface>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32, // إضافة مساحة في الأسفل
  },
  timeSection: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
  },
  time: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  ampm: {
    fontSize: 20,
  },
  date: {
    fontSize: 18,
    marginTop: 8,
  },
  hijriDate: {
    fontSize: 16,
    marginTop: 4,
    fontWeight: '500',
  },
  prayerTimesSection: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  prayerItem: {
    paddingVertical: 8,
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
});

export default PrayerTimes;

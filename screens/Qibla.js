import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Dimensions, ActivityIndicator } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { Magnetometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { compassBase } from '../assets/compass-base';
import { qiblaNeedle } from '../assets/qibla-needle';

const Qibla = () => {
  const theme = useTheme();
  const [magnetometer, setMagnetometer] = useState(0);
  const [location, setLocation] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    startMagnetometer();
    getLocation();

    return () => {
      stopMagnetometer();
    };
  }, []);

  const startMagnetometer = async () => {
    setSubscription(
      Magnetometer.addListener(data => {
        let angle = Math.atan2(data.y, data.x) * 180 / Math.PI;
        angle = (angle + 360) % 360;
        setMagnetometer(angle);
      })
    );
    await Magnetometer.setUpdateInterval(100);
  };

  const stopMagnetometer = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('يجب السماح بالوصول إلى الموقع لتحديد اتجاه القبلة');
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      setLocation(position);
      setIsLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      alert('حدث خطأ في تحديد الموقع');
      setIsLoading(false);
    }
  };

  const calculateQiblaDirection = () => {
    if (!location) return 0;
    
    const makkah = {
      latitude: 21.3891,
      longitude: 39.8579
    };

    const φ1 = location.coords.latitude * Math.PI / 180;
    const φ2 = makkah.latitude * Math.PI / 180;
    const Δλ = (makkah.longitude - location.coords.longitude) * Math.PI / 180;

    const y = Math.sin(Δλ);
    const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
    let qiblaDirection = Math.atan2(y, x) * 180 / Math.PI;
    
    return (qiblaDirection + 360) % 360;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 20, color: theme.colors.primary }}>جاري تحديد الموقع...</Text>
      </View>
    );
  }

  const qiblaAngle = calculateQiblaDirection();
  const compassRotation = {
    transform: [{ rotate: `${360 - magnetometer}deg` }]
  };
  const needleRotation = {
    transform: [{ rotate: `${qiblaAngle}deg` }]
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.compassContainer}>
        <View style={styles.compass}>
          <Image
            source={{ uri: compassBase }}
            style={[styles.compassBase, compassRotation]}
          />
          <Image
            source={{ uri: qiblaNeedle }}
            style={[styles.qiblaNeedle, needleRotation]}
          />
          <View style={styles.centerDot} />
        </View>
        <Text style={[styles.degrees, { color: theme.colors.primary }]}>
          {`${Math.round(magnetometer)}°`}
        </Text>
        <Text style={[styles.qiblaInfo, { color: theme.colors.secondary }]}>
          اتجاه القبلة: {Math.round(qiblaAngle)}°
        </Text>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassContainer: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    width: Math.min(Dimensions.get('window').width - 40, 400),
    aspectRatio: 1,
  },
  compass: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassBase: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'contain',
  },
  qiblaNeedle: {
    width: '80%',
    height: '80%',
    position: 'absolute',
    resizeMode: 'contain',
  },
  degrees: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  qiblaInfo: {
    fontSize: 18,
    marginTop: 10,
  },
  centerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'blue',
  },
});

export default Qibla;
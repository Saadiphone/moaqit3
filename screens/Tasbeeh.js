import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Surface, Text, IconButton, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const DHIKR_TYPES = [
  'سبحان الله',
  'الحمد لله',
  'الله أكبر',
  'أستغفر الله'
];

const Tasbeeh = () => {
  const theme = useTheme();
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentDhikr, setCurrentDhikr] = useState(DHIKR_TYPES[0]);

  useEffect(() => {
    loadCount();
  }, []);

  const loadCount = async () => {
    try {
      const savedCount = await AsyncStorage.getItem('tasbeehCount');
      const savedTotal = await AsyncStorage.getItem('tasbeehTotal');
      if (savedCount) setCount(parseInt(savedCount));
      if (savedTotal) setTotalCount(parseInt(savedTotal));
    } catch (error) {
      console.error('Error loading count:', error);
    }
  };

  const saveCount = async (newCount, newTotal) => {
    try {
      await AsyncStorage.setItem('tasbeehCount', String(newCount));
      await AsyncStorage.setItem('tasbeehTotal', String(newTotal));
    } catch (error) {
      console.error('Error saving count:', error);
    }
  };

  const changeDhikr = () => {
    const currentIndex = DHIKR_TYPES.indexOf(currentDhikr);
    const nextIndex = (currentIndex + 1) % DHIKR_TYPES.length;
    setCurrentDhikr(DHIKR_TYPES[nextIndex]);
  };

  const increment = async () => {
    const newCount = count + 1;
    const newTotal = totalCount + 1;
    setCount(newCount);
    setTotalCount(newTotal);
    await saveCount(newCount, newTotal);

    Haptics.selectionAsync();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.mainContainer}>
        <View style={styles.dhikrContainer}>
          <Text style={[styles.dhikrText, { color: theme.colors.primary }]}>
            {currentDhikr}
          </Text>
        </View>

        <Text style={[styles.totalCount, { color: theme.colors.secondary }]}>
          المجموع: {totalCount}
        </Text>

        <Pressable
          onPress={increment}
          style={({ pressed }) => [
            styles.countButton,
            {
              backgroundColor: theme.colors.primaryContainer,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
        >
          <Text style={[styles.count, { color: theme.colors.primary }]}>
            {count}
          </Text>
        </Pressable>

        <View style={styles.controls}>
          <IconButton
            icon="refresh"
            size={30}
            mode="contained"
            onPress={() => {
              setCount(0);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }}
            style={[styles.controlButton, { backgroundColor: theme.colors.errorContainer }]}
            iconColor={theme.colors.error}
          />
          <IconButton
            icon="rotate-right"
            size={30}
            mode="contained"
            onPress={changeDhikr}
            style={[styles.controlButton, { backgroundColor: theme.colors.secondaryContainer }]}
            iconColor={theme.colors.secondary}
          />
          <IconButton
            icon="refresh-circle"
            size={30}
            mode="contained"
            onPress={() => {
              setCount(0);
              setTotalCount(0);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }}
            style={[styles.controlButton, { backgroundColor: theme.colors.errorContainer }]}
            iconColor={theme.colors.error}
          />
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    margin: 16,
    borderRadius: 16
  },
  dhikrContainer: {
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 10
  },
  dhikrText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  totalCount: {
    fontSize: 18,
    marginBottom: 40,
  },
  countButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  count: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    marginTop: 40,
    justifyContent: 'space-around',
    width: '100%',
  },
  controlButton: {
    elevation: 4,
    margin: 10,
  },
});

export default Tasbeeh;
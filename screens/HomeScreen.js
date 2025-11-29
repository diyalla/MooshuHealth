// screens/HomeScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = 'http://192.168.2.129:5000';

export default function HomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  const [loading, setLoading] = useState(true);
  const [totalPatients, setTotalPatients] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [maleCount, setMaleCount] = useState(0);

  useEffect(() => {
    loadAnalytics();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/patients`);
      const data = await res.json();

      setTotalPatients(data.length);
      setCriticalCount(data.filter(p => p.critical).length);
      setMaleCount(data.filter(p => p.gender === 'Male').length);
      setFemaleCount(data.filter(p => p.gender === 'Female').length);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const AnalyticsCard = ({ icon, label, value, color }) => (
    <Animated.View style={styles.analyticsCard}>
      <View style={[styles.analyticsIconWrapper, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View>
        <Text style={styles.analyticsValue}>{value}</Text>
        <Text style={styles.analyticsLabel}>{label}</Text>
      </View>
    </Animated.View>
  );

  const MenuCard = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardIconWrapper}>
        <Ionicons name={icon} size={22} color="#00D8FF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{label}</Text>
        <Text style={styles.cardSubtitle}>Tap to continue</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <Text style={styles.appTitle}>Mooshu Health</Text>
        <Text style={styles.appSubtitle}>Patient Management System</Text>

        <View style={{ height: 20 }} />

        <Text style={styles.sectionLabel}>Analytics Overview</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#00D8FF" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.analyticsContainer}>
            <AnalyticsCard icon="people-outline" label="Total Patients" value={totalPatients} color="#00D8FF" />
            <AnalyticsCard icon="alert-circle-outline" label="Critical Cases" value={criticalCount} color="#ff453a" />
            <AnalyticsCard icon="male-outline" label="Male" value={maleCount} color="#4DA1FF" />
            <AnalyticsCard icon="female-outline" label="Female" value={femaleCount} color="#ff9aff" />
          </View>
        )}

        <View style={{ height: 20 }} />

        <Text style={styles.sectionLabel}>Main Actions</Text>

        <MenuCard icon="person-add-outline" label="Add New Patient" onPress={() => navigation.navigate('AddPatient')} />
        <MenuCard icon="document-text-outline" label="Add Patient Record" onPress={() => navigation.navigate('AddRecord')} />
        <MenuCard icon="list-outline" label="List All Patients" onPress={() => navigation.navigate('ListPatients')} />
        <MenuCard icon="search-outline" label="View Records" onPress={() => navigation.navigate('ViewPatient')} />

        <View style={{ flex: 1 }} />

        <Text style={styles.footerText}>Mooshu Health • Demo hospital console</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  appTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  appSubtitle: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
  },
  sectionLabel: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
  },

  // Analytics
  analyticsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    width: '48%',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  analyticsIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  analyticsValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  analyticsLabel: {
    color: '#888',
    fontSize: 12,
  },

  // Menu cards
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  cardIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: '#777',
    fontSize: 12,
    marginTop: 2,
  },

  footerText: {
    color: '#555',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },
});

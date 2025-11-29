// screens/ListPatientsScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Animated,
  ScrollView,
} from 'react-native';
import SuccessModal from '../components/SuccessModal';

const API_BASE = 'http://192.168.2.129:5000';

export default function ListPatientsScreen({ navigation }) {
  // STATE
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const typingTimer = useRef(null);

  const [selected, setSelected] = useState(null);
  const [editData, setEditData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

  const [msgModalOpen, setMsgModalOpen] = useState(false);
  const [msgContent, setMsgContent] = useState('');
  const [msgSuccess, setMsgSuccess] = useState(false);

  // ANIMATION
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // META COUNTS
  const [totalPatients, setTotalPatients] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);

  useEffect(() => {
    fetchPatients();
    startAnimation();
  }, []);

  useEffect(() => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => fetchPatients(search), 250);
    return () => clearTimeout(typingTimer.current);
  }, [search, showCriticalOnly]);

  const startAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  };

  const fetchPatients = async (q = '') => {
    try {
      const url = q
        ? `${API_BASE}/patients?search=${encodeURIComponent(q)}`
        : `${API_BASE}/patients`;

      const res = await fetch(url);
      let json = await res.json();
      json = json || [];

      // META COUNTS
      setTotalPatients(json.length);
      setCriticalCount(json.filter((p) => p.critical).length);

      // FILTER critical
      if (showCriticalOnly) json = json.filter((p) => p.critical === true);

      setPatients(json);
    } catch (err) {
      console.log(err);
    }
  };

  // --- EDIT HANDLING ---
  const openEdit = (p) => {
    setSelected(p);
    setEditData({ ...p });
    setModalOpen(true);
  };

  const saveEdit = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`${API_BASE}/patients/${selected._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      const json = await res.json();
      if (res.ok) {
        setMsgContent('Patient updated successfully!');
        setMsgSuccess(true);
        setModalOpen(false);
        fetchPatients(search);
      } else {
        setMsgContent(json.message || 'Failed to update patient.');
        setMsgSuccess(false);
      }
    } catch (err) {
      setMsgContent('Network error while updating.');
      setMsgSuccess(false);
    }
    setMsgModalOpen(true);
  };

  const deletePatient = () => {
    Alert.alert(
      'Delete Patient',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_BASE}/patients/${selected._id}`, {
                method: 'DELETE',
              });
              const json = await res.json();
              if (res.ok) {
                setMsgContent('Patient deleted.');
                setMsgSuccess(true);
                setModalOpen(false);
                fetchPatients(search);
              } else {
                setMsgContent(json.message || 'Failed to delete.');
                setMsgSuccess(false);
              }
            } catch (err) {
              setMsgContent('Network error.');
              setMsgSuccess(false);
            }
            setMsgModalOpen(true);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], flex: 1 }}
      >
        {/* TITLE */}
        <Text style={styles.title}>Patients</Text>
        <Text style={styles.subtitle}>Manage all registered patients</Text>

        {/* ANALYTICS CARDS (like Home) */}
        <View style={styles.analyticsRow}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsNumber}>{totalPatients}</Text>
            <Text style={styles.analyticsLabel}>Total Patients</Text>
          </View>
          <View style={[styles.analyticsCard, { backgroundColor: '#4A0000' }]}>
            <Text style={[styles.analyticsNumber, { color: 'red' }]}>
              {criticalCount}
            </Text>
            <Text style={[styles.analyticsLabel, { color: 'red' }]}>
              Critical
            </Text>
          </View>
        </View>

        {/* SEARCH + FILTER */}
        <View style={styles.searchRow}>
          <TextInput
            style={[styles.searchInput]}
            placeholder="Search (name / ID)…"
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />

          <TouchableOpacity
            onPress={() => setShowCriticalOnly((x) => !x)}
            style={[
              styles.filterBtn,
              showCriticalOnly && { backgroundColor: 'red' },
            ]}
          >
            <Text style={styles.filterText}>
              {showCriticalOnly ? 'Critical' : 'All'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* PATIENT LIST */}
        <FlatList
          data={patients}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.patientCard,
                item.critical && { borderColor: 'red', borderWidth: 2 },
              ]}
              onPress={() => openEdit(item)}
            >
              <Text style={styles.patientName}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={styles.patientMeta}>{item.medicalId}</Text>

              {item.critical && (
                <Text style={styles.criticalTag}>CRITICAL</Text>
              )}
            </TouchableOpacity>
          )}
        />
      </Animated.View>

      {/* EDIT MODAL (iOS Bottom Sheet style) */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            {selected && (
              <ScrollView style={{ maxHeight: '90%' }}>
                <Text style={styles.modalTitle}>Edit Patient</Text>

                <TextInput
                  style={styles.modalInput}
                  value={editData.firstName}
                  onChangeText={(t) =>
                    setEditData((p) => ({ ...p, firstName: t }))
                  }
                  placeholder="First Name"
                  placeholderTextColor="#888"
                />

                <TextInput
                  style={styles.modalInput}
                  value={editData.lastName}
                  onChangeText={(t) =>
                    setEditData((p) => ({ ...p, lastName: t }))
                  }
                  placeholder="Last Name"
                  placeholderTextColor="#888"
                />

                <TextInput
                  style={styles.modalInput}
                  value={editData.dateOfBirth}
                  onChangeText={(t) =>
                    setEditData((p) => ({ ...p, dateOfBirth: t }))
                  }
                  placeholder="DOB (YYYY-MM-DD)"
                  placeholderTextColor="#888"
                />

                <TextInput
                  style={styles.modalInput}
                  value={editData.gender}
                  onChangeText={(t) =>
                    setEditData((p) => ({ ...p, gender: t }))
                  }
                  placeholder="Gender"
                  placeholderTextColor="#888"
                />

                <TextInput
                  style={styles.modalInput}
                  value={editData.contactNumber}
                  onChangeText={(t) =>
                    setEditData((p) => ({
                      ...p,
                      contactNumber: t.replace(/[^0-9]/g, ''),
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="Contact Number"
                  placeholderTextColor="#888"
                />

                <TextInput
                  style={styles.modalInput}
                  value={editData.medicalId}
                  onChangeText={(t) =>
                    setEditData((p) => ({ ...p, medicalId: t }))
                  }
                  placeholder="Medical ID"
                  placeholderTextColor="#888"
                />

                {/* CRITICAL */}
                <View style={styles.modalCriticalRow}>
                  <Text style={{ color: '#fff' }}>Critical Condition?</Text>
                  <TouchableOpacity
                    style={[
                      styles.criticalToggle,
                      editData.critical && { backgroundColor: 'red' },
                    ]}
                    onPress={() =>
                      setEditData((p) => ({ ...p, critical: !p.critical }))
                    }
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>
                      {editData.critical ? 'YES' : 'NO'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* BUTTONS */}
                <View style={{ marginTop: 16 }}>
                  <Button title="Save Changes" onPress={saveEdit} />
                </View>

                <View style={{ marginTop: 8 }}>
                  <Button
                    title="View Medical Record"
                    onPress={() => {
                      setModalOpen(false);
                      navigation.navigate('ViewPatient', { patient: selected });
                    }}
                  />
                </View>

                <View style={{ marginTop: 8 }}>
                  <Button title="Delete Patient" color="red" onPress={deletePatient} />
                </View>

                <View style={{ marginTop: 8 }}>
                  <Button title="Close" onPress={() => setModalOpen(false)} />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <SuccessModal
        visible={msgModalOpen}
        message={msgContent}
        success={msgSuccess}
        onClose={() => setMsgModalOpen(false)}
      />
    </View>
  );
}

// ======================
// STYLES
// ======================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },

  title: { color: '#fff', fontSize: 26, fontWeight: '800' },
  subtitle: { color: '#888', marginBottom: 16, marginTop: 4 },

  analyticsRow: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 16,
  },
  analyticsNumber: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  analyticsLabel: {
    color: '#888',
    marginTop: 4,
    fontSize: 12,
  },

  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  searchInput: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    padding: 14,
    borderRadius: 12,
    color: '#fff',
  },
  filterBtn: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginLeft: 10,
  },
  filterText: { color: '#fff', fontWeight: '600' },

  patientCard: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  patientName: { color: '#fff', fontSize: 18, fontWeight: '600' },
  patientMeta: { color: '#888', marginTop: 4 },
  criticalTag: { color: 'red', marginTop: 6, fontWeight: '700' },

  modalBg: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  modalInput: {
    backgroundColor: '#2A2A2A',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalCriticalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  criticalToggle: {
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 20,
  },
});

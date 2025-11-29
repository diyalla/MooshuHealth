// screens/ViewPatientScreen.js
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import SuccessModal from '../components/SuccessModal';

const API_BASE = 'http://192.168.2.129:5000';

export default function ViewPatientScreen({ route }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [msgModalOpen, setMsgModalOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgSuccess, setMsgSuccess] = useState(false);

  const typingTimer = useRef(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  // If opened with a specific patient from ListPatients
  useEffect(() => {
    if (route && route.params && route.params.patient) {
      const p = route.params.patient;
      setSelected(p);
      setResults([p]);
      setModalOpen(true);
    }
  }, [route?.params?.patient]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Live search debounce
  const onType = (t) => {
    setQuery(t);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      search(t);
    }, 250);
  };

  const search = async (text) => {
    try {
      const res = await fetch(
        `${API_BASE}/patients?search=${encodeURIComponent(text)}`,
      );
      const json = await res.json();
      setResults(json || []);
    } catch (err) {
      console.log(err);
      setMsg('Network error');
      setMsgSuccess(false);
      setMsgModalOpen(true);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <Text style={styles.title}>View Patient & Records</Text>
        <Text style={styles.subtitle}>
          Search a patient and inspect their medical history
        </Text>

        <View style={styles.searchCard}>
          <TextInput
            style={styles.input}
            placeholder="Search name or Medical ID…"
            placeholderTextColor="#888"
            value={query}
            onChangeText={onType}
          />
          <Button title="Search" onPress={() => search(query)} />
        </View>

        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                setSelected(item);
                setModalOpen(true);
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16 }}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={{ color: '#888' }}>{item.medicalId}</Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>

      {/* Modal showing records for selected patient */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            {selected && (
              <ScrollView>
                <Text style={styles.patientName}>
                  {selected.firstName} {selected.lastName}
                </Text>
                <Text style={styles.patientLine}>
                  Medical ID: {selected.medicalId}
                </Text>
                <Text style={styles.patientLine}>
                  DOB: {selected.dateOfBirth || '-'}
                </Text>
                <Text style={styles.patientLine}>
                  Gender: {selected.gender || '-'}
                </Text>
                <Text style={[styles.patientLine, { marginBottom: 10 }]}>
                  Contact: {selected.contactNumber || '-'}
                </Text>

                <Text style={styles.recordsTitle}>Medical Records:</Text>

                {(!selected.records || selected.records.length === 0) && (
                  <Text style={{ color: '#ccc', marginBottom: 12 }}>
                    No records for this patient yet.
                  </Text>
                )}

                {selected.records &&
                  selected.records.map((r, index) => (
                    <View key={index} style={styles.recordCard}>
                      <Text style={styles.recordTitle}>
                        Record #{index + 1}
                      </Text>
                      <Text style={styles.recordLine}>
                        Diagnosis: {r.diagnosis || '-'}
                      </Text>
                      <Text style={styles.recordLine}>
                        Admitted: {r.admitted ? 'Yes' : 'No'}
                      </Text>
                      <Text style={styles.recordLine}>
                        Admitted Days:{' '}
                        {typeof r.admittedDays === 'number'
                          ? r.admittedDays
                          : r.admittedDays || '-'}
                      </Text>
                      <Text style={styles.recordLine}>
                        Discharged: {r.discharged ? 'Yes' : 'No'}
                      </Text>
                      {r.dateDischarged ? (
                        <Text style={styles.recordLine}>
                          Date Discharged: {r.dateDischarged}
                        </Text>
                      ) : null}
                      <Text style={styles.recordLine}>
                        Medication: {r.medication || '-'}
                      </Text>
                      <Text style={styles.recordLine}>
                        Tests Done: {r.testsDone ? 'Yes' : 'No'}
                      </Text>
                      {r.testsDone && r.testsDetails ? (
                        <Text style={styles.recordLine}>
                          Tests Details: {r.testsDetails}
                        </Text>
                      ) : null}
                    </View>
                  ))}

                <Button title="Close" onPress={() => setModalOpen(false)} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <SuccessModal
        visible={msgModalOpen}
        message={msg}
        success={msgSuccess}
        onClose={() => setMsgModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#888', fontSize: 13, marginTop: 4, marginBottom: 10 },

  searchCard: {
    backgroundColor: '#111',
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1C1C1E',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#1C1C1E',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },

  modalBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalBox: {
    width: '92%',
    maxHeight: '85%',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
  },
  patientName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  patientLine: { color: '#ccc', marginBottom: 4 },
  recordsTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 4,
  },
  recordCard: {
    backgroundColor: '#262626',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  recordTitle: { color: '#fff', fontWeight: '700', marginBottom: 6 },
  recordLine: { color: '#ddd', marginBottom: 2 },
});

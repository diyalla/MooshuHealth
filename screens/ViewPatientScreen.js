// screens/ViewPatientScreen.js
import React, { useRef, useState } from 'react';
import { View, TextInput, Button, FlatList, TouchableOpacity, Text, Modal, StyleSheet, ScrollView } from 'react-native';
import SuccessModal from '../components/SuccessModal';

const API_BASE = 'http://192.168.2.129:5000';

export default function ViewPatientScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [msgModalOpen, setMsgModalOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgSuccess, setMsgSuccess] = useState(false);
  const typingTimer = useRef(null);

  // Live search as you type (debounce)
  const onType = (t) => {
    setQuery(t);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => { search(t); }, 250);
  };

  const search = async (text) => {
    try {
      const res = await fetch(`${API_BASE}/patients?search=${encodeURIComponent(text)}`);
      const json = await res.json();
      setResults(json || []);
    } catch {
      setMsg('Network error'); setMsgSuccess(false); setMsgModalOpen(true);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Search name or Medical ID… (e.g. John / JD1990)" placeholderTextColor="#888" value={query} onChangeText={onType} />
      <Button title="Search" onPress={() => search(query)} />

      <FlatList
        data={results}
        keyExtractor={(i) => i._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => { setSelected(item); setModalOpen(true); }}>
            <Text style={{ color: '#fff', fontSize: 16 }}>{item.firstName} {item.lastName}</Text>
            <Text style={{ color: '#888' }}>{item.medicalId}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            {selected && (
              <ScrollView>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{selected.firstName} {selected.lastName}</Text>
                <Text style={{ color: '#fff', marginTop: 6 }}>DOB: {selected.dateOfBirth}</Text>
                <Text style={{ color: '#fff' }}>Gender: {selected.gender}</Text>
                <Text style={{ color: '#fff' }}>Contact: {selected.contactNumber}</Text>
                <Text style={{ color: '#fff' }}>Medical ID: {selected.medicalId}</Text>

                {/* Vertical record cards */}
                <Text style={{ color: '#fff', fontWeight: '700', marginTop: 12, marginBottom: 6 }}>Records</Text>
                {(selected.records || []).length === 0 && (
                  <Text style={{ color: '#888' }}>No records yet.</Text>
                )}
                {(selected.records || []).map((r, idx) => (
                  <View key={idx} style={styles.recordCard}>
                    <Text style={styles.recordTitle}>#{idx + 1} {r.diagnosis || 'No diagnosis'}</Text>
                    <Text style={styles.recordLine}>Admitted: {r.admitted ? 'Yes' : 'No'}</Text>
                    {r.admitted ? <Text style={styles.recordLine}>Days Admitted: {r.admittedDays}</Text> : null}
                    {r.admitted && r.discharged ? <Text style={styles.recordLine}>Discharged: Yes</Text> : <Text style={styles.recordLine}>Discharged: {r.admitted ? 'No' : '-'}</Text>}
                    {r.dateDischarged ? <Text style={styles.recordLine}>Date Discharged: {r.dateDischarged}</Text> : null}
                    <Text style={styles.recordLine}>Medication: {r.medication || '-'}</Text>
                    <Text style={styles.recordLine}>Tests Done: {r.testsDone ? 'Yes' : 'No'}</Text>
                    {r.testsDone && r.testsDetails ? <Text style={styles.recordLine}>Tests Details: {r.testsDetails}</Text> : null}
                  </View>
                ))}

                <Button title="Close" onPress={() => setModalOpen(false)} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <SuccessModal visible={msgModalOpen} message={msg} success={msgSuccess} onClose={() => setMsgModalOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  input: { backgroundColor: '#1C1C1E', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 10 },
  card: { backgroundColor: '#1C1C1E', padding: 12, borderRadius: 10, marginBottom: 8 },
  modalBg: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalBox: { width: '92%', maxHeight: '85%', backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12 },
  recordCard: { backgroundColor: '#262626', borderRadius: 10, padding: 10, marginBottom: 10 },
  recordTitle: { color: '#fff', fontWeight: '700', marginBottom: 6 },
  recordLine: { color: '#ddd', marginBottom: 2 }
});

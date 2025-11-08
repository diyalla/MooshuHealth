// screens/AddRecordScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import SuccessModal from '../components/SuccessModal';

const API_BASE = 'http://192.168.2.129:5000';

export default function AddRecordScreen() {
  const [patients, setPatients] = useState([]);
  const [listSearch, setListSearch] = useState('');
  const typingTimer = useRef(null);

  const [selected, setSelected] = useState(null);

  // form fields
  const [diagnosis, setDiagnosis] = useState('');
  const [admittedText, setAdmittedText] = useState('');          // empty by default
  const [admittedDays, setAdmittedDays] = useState('');
  const [dischargedText, setDischargedText] = useState('');      // empty by default, visible only if admitted = yes
  const [dateDischarged, setDateDischarged] = useState('');      // visible only if discharged = yes
  const [medication, setMedication] = useState('');
  const [testsText, setTestsText] = useState('');                // 'yes'/'no' empty by default
  const [testsDetails, setTestsDetails] = useState('');          // visible only if testsText = yes

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);

  useEffect(() => { fetchPatients(); }, []);

  // optional live filter list by typing
  useEffect(() => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => { fetchPatients(listSearch); }, 250);
    return () => clearTimeout(typingTimer.current);
  }, [listSearch]);

  const fetchPatients = async (q = '') => {
    try {
      const url = q ? `${API_BASE}/patients?search=${encodeURIComponent(q)}` : `${API_BASE}/patients`;
      const res = await fetch(url);
      const json = await res.json();
      setPatients(json || []);
    } catch (err) { console.log(err); }
  };

  const submitRecord = async () => {
    if (!selected) {
      setModalMsg('Please select a patient first'); setModalSuccess(false); setModalVisible(true); return;
    }

    const admitted = admittedText.toLowerCase() === 'yes';
    const discharged = dischargedText.toLowerCase() === 'yes';
    const testsDone = testsText.toLowerCase() === 'yes';

    const body = {
      diagnosis,
      admitted,
      admittedDays: admitted ? Number(admittedDays || 0) : 0,
      discharged: admitted ? discharged : false,      // only allow if admitted = yes
      medication,
      testsDone,
      testsDetails: testsDone ? testsDetails : '',
      dateDischarged: (admitted && discharged) ? dateDischarged : ''
    };

    try {
      const res = await fetch(`${API_BASE}/patients/${selected._id}/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (res.ok) {
        setModalMsg(json.message || 'Record added'); setModalSuccess(true);
        // clear everything
        setSelected(null); setDiagnosis(''); setAdmittedText(''); setAdmittedDays('');
        setDischargedText(''); setDateDischarged(''); setMedication(''); setTestsText(''); setTestsDetails('');
        fetchPatients(listSearch);
      } else { setModalMsg(json.message || 'Could not add record'); setModalSuccess(false); }
    } catch {
      setModalMsg('Network error'); setModalSuccess(false);
    }
    setModalVisible(true);
  };

  const showDischarged = admittedText.toLowerCase() === 'yes';
  const showDateDischarged = showDischarged && dischargedText.toLowerCase() === 'yes';
  const showTestsDetails = testsText.toLowerCase() === 'yes';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select a patient</Text>

      {/* optional filter for large lists */}
      <TextInput
        style={styles.search}
        placeholder="Filter patients by name or Medical ID…"
        placeholderTextColor="#888"
        value={listSearch}
        onChangeText={setListSearch}
      />

      <FlatList
        data={patients}
        keyExtractor={(i) => i._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.patientCard, selected?._id === item._id && styles.selectedCard]}
            onPress={() => setSelected(item)}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>{item.firstName} {item.lastName}</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>{item.medicalId}</Text>
          </TouchableOpacity>
        )}
        style={{ width: '100%', marginBottom: 12 }}
      />

      <TextInput style={styles.input} placeholder="Diagnosis (e.g. Flu)" placeholderTextColor="#888" value={diagnosis} onChangeText={setDiagnosis} />

      <TextInput style={styles.input} placeholder="Admitted? (yes/no)" placeholderTextColor="#888" value={admittedText} onChangeText={setAdmittedText} />
      {admittedText.toLowerCase() === 'yes' && (
        <>
          <TextInput style={styles.input} placeholder="Days admitted (e.g. 3)" placeholderTextColor="#888" keyboardType="numeric" value={admittedDays} onChangeText={setAdmittedDays} />
          <TextInput style={styles.input} placeholder="Discharged? (yes/no)" placeholderTextColor="#888" value={dischargedText} onChangeText={setDischargedText} />
          {showDateDischarged && (
            <TextInput style={styles.input} placeholder="Date discharged (YYYY-MM-DD)" placeholderTextColor="#888" value={dateDischarged} onChangeText={setDateDischarged} />
          )}
        </>
      )}

      <TextInput style={styles.input} placeholder="Medication (e.g. Paracetamol)" placeholderTextColor="#888" value={medication} onChangeText={setMedication} />

      <TextInput style={styles.input} placeholder="Tests done? (yes/no)" placeholderTextColor="#888" value={testsText} onChangeText={setTestsText} />
      {showTestsDetails && (
        <TextInput style={styles.input} placeholder="Tests details (e.g. X-Ray, Blood test)" placeholderTextColor="#888" value={testsDetails} onChangeText={setTestsDetails} />
      )}

      <TouchableOpacity style={styles.submitBtn} onPress={submitRecord}>
        <Text style={styles.submitText}>Add Record</Text>
      </TouchableOpacity>

      <SuccessModal visible={modalVisible} message={modalMsg} success={modalSuccess} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  label: { color: '#fff', marginBottom: 8, fontSize: 16 },
  search: { backgroundColor: '#1C1C1E', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 10 },
  patientCard: { backgroundColor: '#1C1C1E', padding: 12, borderRadius: 10, marginBottom: 8 },
  selectedCard: { borderWidth: 1.5, borderColor: '#007AFF' },
  input: { backgroundColor: '#1C1C1E', color: '#fff', padding: 12, borderRadius: 10, marginTop: 10 },
  submitBtn: { backgroundColor: '#007AFF', padding: 14, borderRadius: 10, marginTop: 14, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16 }
});

// screens/ListPatientsScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Button, StyleSheet, Alert } from 'react-native';
import SuccessModal from '../components/SuccessModal';

const API_BASE = 'http://192.168.2.129:5000'; // your IP

export default function ListPatientsScreen() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const typingTimer = useRef(null);

  const [selected, setSelected] = useState(null);
  const [editData, setEditData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [msgModalOpen, setMsgModalOpen] = useState(false);
  const [msgContent, setMsgContent] = useState('');
  const [msgSuccess, setMsgSuccess] = useState(false);

  useEffect(() => { fetchPatients(); }, []);

  // live search: debounce on type
  useEffect(() => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      fetchPatients(search);
    }, 250); // small debounce
    return () => clearTimeout(typingTimer.current);
  }, [search]);

  const fetchPatients = async (q = '') => {
    try {
      const url = q ? `${API_BASE}/patients?search=${encodeURIComponent(q)}` : `${API_BASE}/patients`;
      const res = await fetch(url);
      const json = await res.json();
      setPatients(json || []);
    } catch (err) { console.log(err); }
  };

  const openEdit = (p) => { setSelected(p); setEditData({ ...p }); setModalOpen(true); };

  const saveEdit = async () => {
    try {
      const res = await fetch(`${API_BASE}/patients/${selected._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (res.ok) { setMsgContent('Patient updated successfully'); setMsgSuccess(true); }
      else { const j = await res.json(); setMsgContent(j.message || 'Could not update patient'); setMsgSuccess(false); }
    } catch {
      setMsgContent('Network error'); setMsgSuccess(false);
    }
    setMsgModalOpen(true); setModalOpen(false); fetchPatients(search);
  };

  const deletePatient = async () => {
    Alert.alert('Delete', 'Are you sure you want to delete this patient?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await fetch(`${API_BASE}/patients/${selected._id}`, { method: 'DELETE' });
          setMsgContent('Patient deleted successfully'); setMsgSuccess(true);
          setMsgModalOpen(true); setModalOpen(false); fetchPatients(search);
        } catch { setMsgContent('Could not delete'); setMsgSuccess(false); setMsgModalOpen(true); }
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Patients</Text>

      {/* Live search input */}
      <TextInput
        style={styles.search}
        placeholder="Search by name or Medical ID…"
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={patients}
        keyExtractor={(i) => i._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openEdit(item)}>
            <Text style={{ color: '#fff', fontSize: 16 }}>{item.firstName} {item.lastName}</Text>
            <Text style={{ color: '#888', marginTop: 4 }}>{item.medicalId}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Edit modal */}
      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            {selected && (
              <>
                <TextInput style={styles.input} value={editData.firstName} onChangeText={(t) => setEditData({ ...editData, firstName: t })} placeholder="First Name" placeholderTextColor="#888" />
                <TextInput style={styles.input} value={editData.lastName} onChangeText={(t) => setEditData({ ...editData, lastName: t })} placeholder="Last Name" placeholderTextColor="#888" />
                <TextInput style={styles.input} value={editData.dateOfBirth} onChangeText={(t) => setEditData({ ...editData, dateOfBirth: t })} placeholder="DOB" placeholderTextColor="#888" />
                <TextInput style={styles.input} value={editData.contactNumber} onChangeText={(t) => setEditData({ ...editData, contactNumber: t })} placeholder="Contact" placeholderTextColor="#888" />
                <TextInput style={styles.input} value={editData.medicalId} onChangeText={(t) => setEditData({ ...editData, medicalId: t })} placeholder="Medical ID" placeholderTextColor="#888" />

                <View style={{ marginTop: 10 }}>
                  <Button title="Save Changes" onPress={saveEdit} />
                </View>
                <View style={{ marginTop: 8 }}>
                  <Button title="Delete Patient" color="red" onPress={deletePatient} />
                </View>
                <View style={{ marginTop: 8 }}>
                  <Button title="Close" onPress={() => setModalOpen(false)} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <SuccessModal visible={msgModalOpen} message={msgContent} success={msgSuccess} onClose={() => setMsgModalOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  search: { backgroundColor: '#1C1C1E', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 12 },
  card: { backgroundColor: '#1C1C1E', padding: 12, borderRadius: 10, marginBottom: 10 },
  modalBg: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalBox: { width: '92%', backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12 },
  input: { backgroundColor: '#2A2A2A', color: '#fff', padding: 10, borderRadius: 8, marginTop: 8 }
});

// screens/AddPatientScreen.js
import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, Text,
  StyleSheet, KeyboardAvoidingView, ScrollView
} from 'react-native';
import SuccessModal from '../components/SuccessModal';

const API_BASE = 'http://192.168.2.129:5000';


export default function AddPatientScreen({ navigation }) {
  // form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [medicalId, setMedicalId] = useState('');

  // modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);

  // submit handler
  const submit = async () => {
    // basic required field check
    if (!firstName || !lastName || !dateOfBirth || !medicalId) {
      setModalMsg('Please fill required fields: First name, Last name, DOB, Medical ID.');
      setModalSuccess(false);
      setModalVisible(true);
      return;
    }

    // payload
    const body = {
      firstName, lastName, dateOfBirth, gender, contactNumber, medicalId, records: []
    };

    try {
      const res = await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const json = await res.json();

      if (res.ok) {
        // success: show green tick modal and clear form
        setModalMsg('Patient added successfully');
        setModalSuccess(true);
        clearForm();
      } else {
        // e.g. duplicate - API should return 400 with message 'Patient already added'
        setModalMsg(json.message || 'Could not add patient');
        setModalSuccess(false);
        // clear form after duplicate so user can enter another patient
        clearForm();
      }
    } catch (err) {
      setModalMsg('Network error — make sure backend is running at http://localhost:5000');
      setModalSuccess(false);
    }

    setModalVisible(true);
  };

  const clearForm = () => {
    setFirstName(''); setLastName(''); setDateOfBirth(''); setGender(''); setContactNumber(''); setMedicalId('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={styles.container}>
        {/* Inputs with example placeholders */}
        <TextInput style={styles.input} placeholder="First Name (e.g. John)" placeholderTextColor="#888" value={firstName} onChangeText={setFirstName} />
        <TextInput style={styles.input} placeholder="Last Name (e.g. Doe)" placeholderTextColor="#888" value={lastName} onChangeText={setLastName} />
        <TextInput style={styles.input} placeholder="Date of Birth (YYYY-MM-DD)" placeholderTextColor="#888" value={dateOfBirth} onChangeText={setDateOfBirth} />
        <TextInput style={styles.input} placeholder="Gender (Male / Female)" placeholderTextColor="#888" value={gender} onChangeText={setGender} />
        <TextInput style={styles.input} placeholder="Contact Number (e.g. 555-1234)" placeholderTextColor="#888" value={contactNumber} onChangeText={setContactNumber} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Medical ID (e.g. JD1990)" placeholderTextColor="#888" value={medicalId} onChangeText={setMedicalId} />

        <TouchableOpacity style={styles.submitBtn} onPress={submit}>
          <Text style={styles.submitText}>Add Patient</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Reusable modal shows success or warning */}
      <SuccessModal
        visible={modalVisible}
        message={modalMsg}
        success={modalSuccess}
        onClose={() => setModalVisible(false)}
        onBackHome={() => { setModalVisible(false); navigation.navigate('Home'); }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#000', padding: 20, alignItems: 'center' },
  input: { backgroundColor: '#1C1C1E', color: '#fff', width: '100%', padding: 14, borderRadius: 10, marginVertical: 8 },
  submitBtn: { backgroundColor: '#007AFF', width: '100%', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});

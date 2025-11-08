// screens/HomeScreen.js: clean dark home menu matching your mockup
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>Mooshu Health{"\n"} Patient Managment System</Text>

      <Text style={styles.welcome}>Welcome Back</Text>
      <Text style={styles.doctor}>Dr Mooshu</Text>

      <View style={{ height: 18 }} />

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddPatient')}>
        <Ionicons name="person-add-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Add New Patient</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddRecord')}>
        <Ionicons name="document-text-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Add Patient Record</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ListPatients')}>
        <Ionicons name="list-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>List All Patients</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ViewPatient')}>
        <Ionicons name="search-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>View Patient</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 20, paddingTop: 28 },
  appTitle: { color: '#fff', fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  welcome: { color: '#fff', fontSize: 16, marginTop: 10, marginLeft: 4 },
  doctor: { color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: 4, marginBottom: 12 },
  button: {
    backgroundColor: '#1C1C1E',
    width: '100%',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  buttonText: { color: '#fff', fontSize: 16, marginLeft: 10 }
});

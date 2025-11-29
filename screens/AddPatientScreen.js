// screens/AddPatientScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  Platform,
  Animated,
} from 'react-native';
import SuccessModal from '../components/SuccessModal';

const API_BASE = 'http://192.168.2.129:5000';

// Helper
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export default function AddPatientScreen({ navigation }) {
  // =====================
  // FORM STATE
  // =====================
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('Male');
  const [contactNumber, setContactNumber] = useState('');
  const [medicalId, setMedicalId] = useState('');
  const [critical, setCritical] = useState(false);

  const today = new Date();
  const [dateOfBirth, setDateOfBirth] = useState(today);

  // Calendar modal
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());

  // Success modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);

  // =====================
  // ANIMATION (match Login/Home)
  // =====================
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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

  // =====================
  // CALENDAR LOGIC
  // =====================
  const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();

  const weeks = [];
  let current = 1 - firstDayOfMonth;

  while (current <= daysInMonth) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      if (current > 0 && current <= daysInMonth) week.push(current);
      else week.push(null);
      current++;
    }
    weeks.push(week);
  }

  const goPrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    const now = new Date();
    const nextYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
    const nextMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;

    // Stop navigation if moving into future
    if (
      nextYear > now.getFullYear() ||
      (nextYear === now.getFullYear() && nextMonth > now.getMonth())
    ) {
      return;
    }

    setCalendarYear(nextYear);
    setCalendarMonth(nextMonth);
  };

  const handleDayPress = (day) => {
    if (!day) return;

    const picked = new Date(calendarYear, calendarMonth, day);
    const now = new Date();
    picked.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    // Block selecting future dates
    if (picked > now) return;

    setDateOfBirth(picked);
  };

  // =====================
  // VALIDATION
  // =====================
  const validate = () => {
    if (!firstName || !lastName || !medicalId) {
      setModalMsg('Please fill required fields: First Name, Last Name, Medical ID.');
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }

    if (!contactNumber || contactNumber.length < 7 || isNaN(contactNumber)) {
      setModalMsg('Contact number must be numeric and at least 7 digits.');
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }

    const now = new Date();
    const dob = new Date(dateOfBirth);
    dob.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    if (dob > now) {
      setModalMsg('Date of birth cannot be in the future.');
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }

    return true;
  };

  // =====================
  // SUBMIT
  // =====================
  const submit = async () => {
    if (!validate()) return;

    const body = {
      firstName,
      lastName,
      dateOfBirth: dateOfBirth.toISOString().split('T')[0],
      gender,
      contactNumber,
      medicalId,
      critical,
      records: [],
    };

    try {
      const res = await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (res.ok) {
        setModalMsg('Patient added successfully!');
        setModalSuccess(true);
        clearForm();
      } else {
        setModalMsg(json.message || 'Failed to add patient.');
        setModalSuccess(false);
      }
    } catch (err) {
      setModalMsg('Network error. Check backend connection.');
      setModalSuccess(false);
    }

    setModalVisible(true);
  };

  const clearForm = () => {
    setFirstName('');
    setLastName('');
    setContactNumber('');
    setMedicalId('');
    setCritical(false);
    setGender('Male');
    const now = new Date();
    setDateOfBirth(now);
    setCalendarYear(now.getFullYear());
    setCalendarMonth(now.getMonth());
  };

  const formattedDOB = dateOfBirth.toISOString().split('T')[0];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#000' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View
          style={[
            styles.card,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.screenTitle}>Add New Patient</Text>
          <Text style={styles.screenSubtitle}>
            Register a new patient into Mooshu Health
          </Text>

          {/* First Name */}
          <TextInput
            style={styles.input}
            placeholder="First Name (Eg: John)"
            placeholderTextColor="#888"
            value={firstName}
            onChangeText={setFirstName}
          />

          {/* Last Name */}
          <TextInput
            style={styles.input}
            placeholder="Last Name (Eg: Doe)"
            placeholderTextColor="#888"
            value={lastName}
            onChangeText={setLastName}
          />

          {/* DOB */}
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowCalendar(true)}
          >
            <Text style={{ color: '#fff' }}>Date of Birth: {formattedDOB}</Text>
          </TouchableOpacity>

          {/* Gender */}
          <Text style={styles.label}>Gender</Text>
          <View style={styles.radioRow}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setGender('Male')}
            >
              <View
                style={[
                  styles.radioCircle,
                  gender === 'Male' && styles.radioSelected,
                ]}
              />
              <Text style={styles.radioText}>Male</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setGender('Female')}
            >
              <View
                style={[
                  styles.radioCircle,
                  gender === 'Female' && styles.radioSelected,
                ]}
              />
              <Text style={styles.radioText}>Female</Text>
            </TouchableOpacity>
          </View>

          {/* Contact Number */}
          <TextInput
            style={styles.input}
            placeholder="Contact Number (Eg: 4161234567)"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={contactNumber}
            onChangeText={(t) => setContactNumber(t.replace(/[^0-9]/g, ''))}
          />

          {/* Medical ID */}
          <TextInput
            style={styles.input}
            placeholder="Medical ID (Eg: YB100)"
            placeholderTextColor="#888"
            value={medicalId}
            onChangeText={setMedicalId}
          />

          {/* CRITICAL */}
          <View style={styles.switchRow}>
            <Text style={styles.label}>Critical Condition?</Text>
            <TouchableOpacity
              style={[styles.switchBtn, critical && { backgroundColor: 'red' }]}
              onPress={() => setCritical(!critical)}
            >
              <Text style={styles.switchBtnText}>
                {critical ? 'YES' : 'NO'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <TouchableOpacity style={styles.submitBtn} onPress={submit}>
            <Text style={styles.submitText}>Add Patient</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Calendar */}
      <Modal visible={showCalendar} transparent animationType="slide">
        <View style={styles.calendarBg}>
          <View style={styles.calendarBox}>
            <Text style={styles.calendarTitle}>Select Date of Birth</Text>

            {/* Month Controls */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={goPrevMonth}>
                <Text style={styles.arrow}>{'<'}</Text>
              </TouchableOpacity>

              <Text style={styles.headerText}>
                {new Date(calendarYear, calendarMonth).toLocaleString('en', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>

              <TouchableOpacity onPress={goNextMonth}>
                <Text style={styles.arrow}>{'>'}</Text>
              </TouchableOpacity>
            </View>

            {/* Weekdays */}
            <View style={styles.weekRow}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <Text key={d} style={styles.weekLabel}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Days */}
            {weeks.map((week, i) => (
              <View key={i} style={styles.weekRow}>
                {week.map((day, j) => {
                  if (!day)
                    return (
                      <View key={j} style={styles.dayBox}>
                        <Text style={styles.dayText}></Text>
                      </View>
                    );

                  const thisDate = new Date(calendarYear, calendarMonth, day);
                  const now = new Date();
                  thisDate.setHours(0, 0, 0, 0);
                  now.setHours(0, 0, 0, 0);

                  const isFuture = thisDate > now;
                  const isSelected =
                    thisDate.toDateString() === dateOfBirth.toDateString();

                  return (
                    <TouchableOpacity
                      key={j}
                      style={[
                        styles.dayBox,
                        isSelected && styles.daySelected,
                        isFuture && styles.dayDisabled,
                      ]}
                      disabled={isFuture}
                      onPress={() => handleDayPress(day)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isFuture && styles.dayTextDisabled,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SuccessModal
        visible={modalVisible}
        message={modalMsg}
        success={modalSuccess}
        onClose={() => setModalVisible(false)}
        onBackHome={() => navigation.navigate('Home')}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },

  // Card like Login/Home
  card: {
    width: '100%',
    backgroundColor: '#111',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },

  screenTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  screenSubtitle: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 10,
  },

  input: {
    backgroundColor: '#1C1C1E',
    color: '#fff',
    width: '100%',
    padding: 14,
    borderRadius: 12,
    marginVertical: 8,
  },

  label: {
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '500',
    fontSize: 13,
  },

  radioRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 8,
  },

  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },

  radioSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },

  radioText: {
    color: '#fff',
    marginLeft: 6,
  },

  switchRow: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  switchBtn: {
    backgroundColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },

  switchBtnText: {
    color: '#fff',
    fontWeight: '600',
  },

  submitBtn: {
    backgroundColor: '#007AFF',
    width: '100%',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },

  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  calendarBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },

  calendarBox: {
    backgroundColor: '#fff',
    width: '85%',
    padding: 20,
    borderRadius: 12,
  },

  calendarTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },

  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  arrow: {
    fontSize: 22,
    paddingHorizontal: 10,
    color: '#000',
  },

  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },

  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 3,
  },

  weekLabel: {
    width: 30,
    textAlign: 'center',
    color: '#000',
    fontWeight: '600',
  },

  dayBox: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dayText: {
    color: '#000',
  },

  daySelected: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },

  dayDisabled: {
    opacity: 0.3,
  },

  dayTextDisabled: {
    color: '#777',
  },

  doneBtn: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
  },

  doneText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
  },
});

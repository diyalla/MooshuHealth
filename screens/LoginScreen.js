// screens/LoginScreen.js
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleLogin = () => {
    // simple fake login for now: just check they typed *something*
    if (!email.trim() || !password.trim()) {
      return; // you can add a toast or error later
    }

    // Replace stack so user can't go "back" to login
    navigation.replace('Home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View
        style={[
          styles.card,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="heart-outline" size={26} color="#00D8FF" />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.appName}>Mooshu Health</Text>
            <Text style={styles.appSubtitle}>Patient Management System</Text>
          </View>
        </View>

        <Text style={styles.screenTitle}>Sign in</Text>
        <Text style={styles.screenSubtitle}>
          Secure access for hospital staff
        </Text>

        <View style={{ height: 16 }} />

        <Text style={styles.fieldLabel}>Hospital Email</Text>
        <TextInput
          style={styles.input}
          placeholder="dr.mooshu@hospital.ca"
          placeholderTextColor="#777"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.fieldLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="●●●●●●●●"
          placeholderTextColor="#777"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Demo login only • No real patient data
        </Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',  // dark theme stays
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#111',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  appSubtitle: {
    color: '#999',
    fontSize: 12,
  },
  screenTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
  },
  screenSubtitle: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
  },
  fieldLabel: {
    color: '#ccc',
    fontSize: 13,
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: '#fff',
  },
  loginBtn: {
    marginTop: 22,
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footerNote: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },
});

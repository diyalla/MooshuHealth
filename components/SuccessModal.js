// components/SuccessModal.js
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Props:
 *  - visible: boolean
 *  - message: string
 *  - success: boolean (true => green tick, false => warning)
 *  - onClose: function to call when Close tapped
 *  - onBackHome: optional function to call when Back to Home tapped
 */
export default function SuccessModal({ visible, message, success, onClose, onBackHome }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBg}>
        <View style={styles.modalBox}>
          <Text style={styles.icon}>{success ? '✅' : '⚠️'}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>

          {success && onBackHome && (
            <TouchableOpacity style={[styles.button, { marginTop: 8 }]} onPress={onBackHome}>
              <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBg: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)' },
  modalBox: { width: '86%', backgroundColor: '#1E1E1E', padding: 18, borderRadius: 12, alignItems: 'center' },
  icon: { fontSize: 32, marginBottom: 8 },
  message: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 12 },
  button: { backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' }
});

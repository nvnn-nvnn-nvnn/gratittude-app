import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProModal({ visible, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>

          <View style={styles.iconWrap}>
            <Ionicons name="star" size={28} color="#bb7c23" />
          </View>

          <Text style={styles.title}>Solicitous Pro</Text>
          <Text style={styles.sub}>Unlock the full experience</Text>

          <View style={styles.perks}>
            {[
              'All background themes',
              'Custom color picker',
              'Unlimited exports',
              'Custom reminder time',
              'Streak protection',
            ].map(perk => (
              <View key={perk} style={styles.perkRow}>
                <Ionicons name="checkmark" size={15} color="#bb7c23" />
                <Text style={styles.perkText}>{perk}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.85}>
            <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.dismissBtn} activeOpacity={0.6}>
            <Text style={styles.dismissText}>Maybe later</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  card: {
    backgroundColor: '#FAF6EC',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#c8bc9e',
    padding: 28,
    width: '100%',
    alignItems: 'center',
  },
  iconWrap: {
    backgroundColor: 'rgba(187,124,35,0.12)',
    borderRadius: 50,
    padding: 14,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'DancingScript_700Bold',
    fontSize: 32,
    color: '#1C3A5C',
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    color: '#8a7a5c',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  perks: {
    width: '100%',
    marginBottom: 24,
    gap: 10,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  perkText: {
    fontSize: 14,
    color: '#1C3A5C',
    fontWeight: '500',
  },
  upgradeBtn: {
    backgroundColor: '#1C3A5C',
    paddingVertical: 14,
    borderRadius: 4,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeBtnText: {
    color: '#FAF6EC',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.4,
  },
  dismissBtn: {
    paddingVertical: 6,
  },
  dismissText: {
    fontSize: 13,
    color: '#8a7a5c',
  },
});

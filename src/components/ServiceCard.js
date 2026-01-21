import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function ServiceCard({ item, isSelected, onPress }) {
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, isSelected && styles.cardSelected]}
    >
      <View style={styles.iconBox}>
        <MaterialIcons name={item.icon} size={24} color={isSelected ? COLORS.background : COLORS.textLight} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, isSelected && { color: COLORS.primary }]}>{item.title}</Text>
        <View style={styles.metaRow}>
          <MaterialIcons name="schedule" size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{item.duration} min</Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <MaterialIcons 
          name={isSelected ? "check-circle" : "radio-button-unchecked"} 
          size={24} 
          color={isSelected ? COLORS.primary : COLORS.textSecondary} 
        />
        <Text style={styles.price}>R$ {item.price}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#2a1a15',
  },
  iconBox: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: { color: COLORS.textLight, fontSize: 16, fontWeight: 'bold' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  metaText: { color: COLORS.textSecondary, fontSize: 12 },
  price: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16, marginTop: 4 },
});
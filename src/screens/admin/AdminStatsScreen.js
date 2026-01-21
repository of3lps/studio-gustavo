import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { ADMIN_STATS } from '../../data/mockData';

export default function AdminStatsScreen() {
  const StatItem = ({ label, value, icon, color }) => (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.val}>{value}</Text>
      <Text style={styles.lbl}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <Text style={styles.headerTitle}>Gestão Financeira</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
         
         <Text style={styles.month}>Outubro 2026</Text>

         <View style={styles.grid}>
            <StatItem label="Faturamento" value={`R$ ${ADMIN_STATS.monthlyRevenue}`} icon="attach-money" color="#4CAF50" />
            <StatItem label="Cortes Realizados" value={ADMIN_STATS.totalCuts} icon="content-cut" color="#FF9800" />
            <StatItem label="Ticket Médio" value={`R$ ${ADMIN_STATS.averageTicket}`} icon="trending-up" color="#2196F3" />
            <StatItem label="Serviço Top" value="Degradê" icon="star" color="#9C27B0" />
         </View>

         <View style={styles.projectionCard}>
            <Text style={styles.projTitle}>Projeção para o fim do mês</Text>
            <Text style={styles.projVal}>R$ 5.800,00</Text>
            <Text style={styles.projSub}>Baseado na sua média diária atual.</Text>
            <View style={styles.barBg}><View style={styles.barFill} /></View>
         </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: COLORS.surface },
  headerTitle: { color: COLORS.textLight, fontSize: 20, fontWeight: 'bold' },
  month: { color: COLORS.textSecondary, fontSize: 14, fontWeight: 'bold', marginBottom: 20, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  card: { width: '47%', backgroundColor: COLORS.surface, padding: 15, borderRadius: 16, marginBottom: 5 },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  val: { color: COLORS.textLight, fontSize: 18, fontWeight: 'bold' },
  lbl: { color: COLORS.textSecondary, fontSize: 12 },
  
  projectionCard: { marginTop: 20, backgroundColor: '#222', padding: 20, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  projTitle: { color: COLORS.textSecondary, fontSize: 12, textTransform: 'uppercase' },
  projVal: { color: COLORS.primary, fontSize: 28, fontWeight: 'bold', marginVertical: 5 },
  projSub: { color: '#666', fontSize: 12, marginBottom: 15 },
  barBg: { height: 6, backgroundColor: '#444', borderRadius: 3 },
  barFill: { height: 6, backgroundColor: COLORS.primary, width: '75%', borderRadius: 3 }
});
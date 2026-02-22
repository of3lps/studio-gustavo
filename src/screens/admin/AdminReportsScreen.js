import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Platform, Modal, ActivityIndicator 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { COLORS } from '../../constants/theme';
import { supabase } from '../../services/supabase';

export default function AdminReportsScreen() {
  // Estado das Datas (Padrão: Mês Atual Inteiro)
  const [startDate, setStartDate] = useState(startOfMonth(new Date())); 
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  
  // Controle do Picker (Modal de data)
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('start'); // 'start' ou 'end'

  const [loading, setLoading] = useState(true);
  const [rawAppointments, setRawAppointments] = useState([]);

  // Estado dos Cálculos
  const [stats, setStats] = useState({
    totalRevenue: 0,
    confirmedCount: 0,
    cancelledCount: 0,
    servicesCount: 0,
    topClients: [],
    topServices: []
  });

  // --- 1. BUSCA OS DADOS REAIS DO BANCO ---
  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('date', startStr)
        .lte('date', endStr);

      if (error) throw error;
      setRawAppointments(data || []);
    } catch (error) {
      console.log("Erro ao buscar relatórios:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. A MÁGICA: CÁLCULO DOS RELATÓRIOS (TOP 10) ---
  useEffect(() => {
    let revenue = 0;
    let confirmed = 0;
    let cancelled = 0;
    let servicesMap = {};
    let clientsMap = {};

    rawAppointments.forEach(item => {
      // Considera para faturamento os finalizados ou confirmados
      if (item.status === 'completed' || item.status === 'confirmed') {
        revenue += Number(item.price) || 0;
        confirmed += 1;

        // Contagem de Clientes
        const clientName = item.client_name || 'Cliente Sem Nome';
        // Ignora os "Bloqueio de Agenda" do ranking
        if (clientName !== 'Bloqueio de Agenda') {
            clientsMap[clientName] = (clientsMap[clientName] || 0) + 1;
        }

        // Contagem de Serviços (Separa "Corte + Barba" em 2 serviços)
        if (item.service_names && item.service_names !== 'Indisponível') {
            const feats = item.service_names.split('+').map(s => s.trim());
            feats.forEach(f => {
                servicesMap[f] = (servicesMap[f] || 0) + 1;
            });
        }

      } else if (item.status === 'cancelled') {
        cancelled += 1;
      }
    });

    // Ordenar Top 10 Clientes (Alterado de slice(0,3) para slice(0,10))
    const sortedClients = Object.entries(clientsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Ordenar Top 10 Serviços (Alterado de slice(0,3) para slice(0,10))
    const sortedServices = Object.entries(servicesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    setStats({
      totalRevenue: revenue,
      confirmedCount: confirmed,
      cancelledCount: cancelled,
      servicesCount: Object.values(servicesMap).reduce((a, b) => a + b, 0),
      topClients: sortedClients,
      topServices: sortedServices
    });
  }, [rawAppointments]);

  // --- FUNÇÕES DO PICKER ---
  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') {
        setShowPicker(false);
    }
    if (selectedDate) {
      if (pickerMode === 'start') setStartDate(selectedDate);
      else setEndDate(selectedDate);
    }
  };

  const openDatePicker = (mode) => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Relatórios & Performance</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* SELETOR DE DATA */}
        <View style={styles.filterContainer}>
          <TouchableOpacity onPress={() => openDatePicker('start')} style={styles.dateBtn}>
             <Text style={styles.dateLabel}>DE</Text>
             <Text style={styles.dateValue}>{formatDateDisplay(startDate)}</Text>
          </TouchableOpacity>
          <MaterialIcons name="arrow-forward" size={20} color={COLORS.textSecondary} />
          <TouchableOpacity onPress={() => openDatePicker('end')} style={styles.dateBtn}>
             <Text style={styles.dateLabel}>ATÉ</Text>
             <Text style={styles.dateValue}>{formatDateDisplay(endDate)}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}} />
        ) : (
            <>
                {/* CARDS PRINCIPAIS (FATURAMENTO) */}
                <View style={styles.revenueCard}>
                    <Text style={styles.revenueLabel}>FATURAMENTO DO PERÍODO</Text>
                    <Text style={styles.revenueValue}>R$ {stats.totalRevenue.toFixed(2).replace('.', ',')}</Text>
                </View>

                <View style={styles.grid}>
                    <View style={[styles.statBox, { backgroundColor: '#1E1E1E' }]}>
                        <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                        <Text style={styles.statNum}>{stats.confirmedCount}</Text>
                        <Text style={styles.statText}>Cortes Concluídos</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: '#1E1E1E' }]}>
                        <MaterialIcons name="content-cut" size={24} color={COLORS.primary} />
                        <Text style={styles.statNum}>{stats.servicesCount}</Text>
                        <Text style={styles.statText}>Serviços Realizados</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: '#2C1B1B' }]}>
                        <MaterialIcons name="cancel" size={24} color="#F44336" />
                        <Text style={[styles.statNum, {color: '#F44336'}]}>{stats.cancelledCount}</Text>
                        <Text style={styles.statText}>Cancelamentos</Text>
                    </View>
                </View>

                {/* TOP 10 CLIENTES */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🏆 Top 10 Clientes</Text>
                    {stats.topClients.length === 0 ? <Text style={styles.empty}>Sem dados para este período.</Text> : 
                        stats.topClients.map((c, index) => (
                        <View key={index} style={styles.rankRow}>
                            <Text style={styles.rankPos}>#{index + 1}</Text>
                            <Text style={styles.rankName}>{c.name}</Text>
                            <Text style={styles.rankValue}>{c.count} visita(s)</Text>
                        </View>
                        ))
                    }
                </View>

                {/* TOP 10 SERVIÇOS */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>✂️ Top 10 Serviços</Text>
                    {stats.topServices.length === 0 ? <Text style={styles.empty}>Sem dados para este período.</Text> : 
                        stats.topServices.map((s, index) => (
                        <View key={index} style={styles.rankRow}>
                            <View style={{flex: 1}}>
                                <Text style={styles.rankName}>{s.name}</Text>
                                <View style={{height: 6, backgroundColor: '#333', borderRadius: 3, marginTop: 4, width: '80%'}}>
                                    <View style={{height: 6, backgroundColor: COLORS.primary, borderRadius: 3, width: `${(s.count / stats.servicesCount) * 100}%`}} />
                                </View>
                            </View>
                            <Text style={styles.rankValue}>{s.count}</Text>
                        </View>
                        ))
                    }
                </View>
            </>
        )}

      </ScrollView>

      {/* COMPONENTE DO DATE PICKER (Com suporte a iOS Escuro) */}
      {showPicker && (
        Platform.OS === 'ios' ? (
            <Modal transparent={true} animationType="fade" visible={showPicker}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <DateTimePicker
                            value={pickerMode === 'start' ? startDate : endDate}
                            mode="date"
                            display="inline"
                            themeVariant="dark" 
                            onChange={onChangeDate}
                            maximumDate={new Date(2030, 11, 31)}
                        />
                        <TouchableOpacity 
                            style={styles.modalBtn} 
                            onPress={() => setShowPicker(false)}
                        >
                            <Text style={styles.modalBtnText}>CONCLUIR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        ) : (
            <DateTimePicker
                value={pickerMode === 'start' ? startDate : endDate}
                mode="date"
                display="default"
                onChange={onChangeDate}
                maximumDate={new Date(2030, 11, 31)}
            />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: COLORS.surface },
  headerTitle: { color: COLORS.textLight, fontSize: 20, fontWeight: 'bold' },
  
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 4, marginBottom: 20 },
  dateBtn: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  dateLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold' },
  dateValue: { color: COLORS.textLight, fontSize: 16, fontWeight: 'bold' },

  revenueCard: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20, elevation: 5 },
  revenueLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  revenueValue: { color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: 5 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  statBox: { width: '31%', padding: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statNum: { color: 'white', fontSize: 20, fontWeight: 'bold', marginVertical: 5 },
  statText: { color: COLORS.textSecondary, fontSize: 10, textAlign: 'center' },

  section: { marginBottom: 25 },
  sectionTitle: { color: COLORS.textLight, fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  rankRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  rankPos: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16, width: 35 },
  rankName: { color: COLORS.textLight, fontWeight: 'bold', fontSize: 14, flex: 1 },
  rankValue: { color: COLORS.textSecondary, fontWeight: 'bold', fontSize: 14 },

  empty: { color: COLORS.textSecondary, fontStyle: 'italic' },

  // --- ESTILOS DO MODAL DO CALENDÁRIO (iOS) ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1E1E1E', borderRadius: 20, padding: 20, width: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  modalBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  modalBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
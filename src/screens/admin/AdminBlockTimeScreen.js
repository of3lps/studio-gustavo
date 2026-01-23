import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { CALENDAR_AVAILABILITY } from '../../data/mockData';

// Dias para navegação (mesma lógica do app)
const DAYS = [
  { num: '14', name: 'SEG', full: 'Segunda, 14 Out' },
  { num: '15', name: 'TER', full: 'Terça, 15 Out' },
  { num: '16', name: 'QUA', full: 'Quarta, 16 Out' },
  { num: '17', name: 'QUI', full: 'Quinta, 17 Out' },
  { num: '18', name: 'SEX', full: 'Sexta, 18 Out' },
  { num: '19', name: 'SÁB', full: 'Sábado, 19 Out' },
];

export default function AdminBlockTimeScreen({ navigation }) {
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [slotsToBlock, setSlotsToBlock] = useState([]); // Array de horários selecionados para bloquear
  
  // Pega os horários disponíveis "reais" do mockData
  // Nota: Em produção, isso viria do Supabase
  const availableSlots = CALENDAR_AVAILABILITY[selectedDay.num] || [];

  const toggleSlot = (time) => {
    if (slotsToBlock.includes(time)) {
      setSlotsToBlock(slotsToBlock.filter(t => t !== time));
    } else {
      setSlotsToBlock([...slotsToBlock, time]);
    }
  };

  const handleBlockConfirm = () => {
    if (slotsToBlock.length === 0) {
      Alert.alert("Atenção", "Selecione pelo menos um horário para bloquear.");
      return;
    }

    // A MÁGICA: Removemos os horários selecionados da lista de disponibilidade
    // Como estamos importando o objeto diretamente, isso vai alterar para o app todo (simulação)
    const currentSlots = CALENDAR_AVAILABILITY[selectedDay.num];
    const newSlots = currentSlots.filter(slot => !slotsToBlock.includes(slot));
    
    // Atualiza o "Banco de Dados"
    CALENDAR_AVAILABILITY[selectedDay.num] = newSlots;

    Alert.alert(
      "Bloqueio Realizado", 
      `${slotsToBlock.length} horários foram removidos da agenda do dia ${selectedDay.num}.`,
      [
        { text: "OK", onPress: () => {
            setSlotsToBlock([]); // Limpa seleção
            navigation.goBack(); 
        }}
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BLOQUEAR AGENDA</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Seletor de Dia */}
        <View style={styles.calendarContainer}>
            <Text style={styles.sectionTitle}>Selecione o Dia</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {DAYS.map((day, index) => (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => { setSelectedDay(day); setSlotsToBlock([]); }}
                  style={[styles.dayCard, selectedDay.num === day.num && styles.dayCardSelected]}
                >
                  <Text style={[styles.dayName, selectedDay.num === day.num && {color: 'black'}]}>{day.name}</Text>
                  <Text style={[styles.dayNum, selectedDay.num === day.num && {color: 'black'}]}>{day.num}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
        </View>

        {/* Grade de Horários */}
        <View style={styles.slotsContainer}>
            <View style={styles.infoBox}>
                <MaterialIcons name="info-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.infoText}>
                    Toque nos horários livres abaixo para <Text style={{color: '#F44336', fontWeight: 'bold'}}>bloqueá-los</Text>.
                    Eles deixarão de aparecer para os clientes.
                </Text>
            </View>

            <View style={styles.grid}>
                {availableSlots.length > 0 ? (
                    availableSlots.map((time) => {
                        const isSelected = slotsToBlock.includes(time);
                        return (
                            <TouchableOpacity 
                                key={time} 
                                onPress={() => toggleSlot(time)}
                                style={[styles.slot, isSelected && styles.slotBlocked]}
                            >
                                <Text style={[styles.slotText, isSelected && styles.slotTextBlocked]}>
                                    {time}
                                </Text>
                                {isSelected && (
                                    <View style={styles.blockedBadge}>
                                        <MaterialIcons name="block" size={12} color="white" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <Text style={styles.emptyText}>Nenhum horário livre neste dia.</Text>
                )}
            </View>
        </View>

      </ScrollView>

      {/* Footer de Ação */}
      {slotsToBlock.length > 0 && (
          <View style={styles.footer}>
              <Text style={styles.footerText}>
                  Bloquear {slotsToBlock.length} horário(s) em {selectedDay.full}?
              </Text>
              <TouchableOpacity style={styles.blockBtn} onPress={handleBlockConfirm}>
                  <Text style={styles.btnText}>CONFIRMAR BLOQUEIO</Text>
              </TouchableOpacity>
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: COLORS.surface },
  headerTitle: { color: COLORS.textLight, fontSize: 16, fontWeight: 'bold' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surfaceHighlight, borderRadius: 20 },
  
  calendarContainer: { marginTop: 20 },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 14, fontWeight: 'bold', marginLeft: 20, marginBottom: 15, textTransform: 'uppercase' },
  
  dayCard: { width: 60, height: 80, borderRadius: 12, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  dayCardSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayName: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold' },
  dayNum: { color: COLORS.textLight, fontSize: 20, fontWeight: 'bold' },

  slotsContainer: { padding: 20 },
  infoBox: { flexDirection: 'row', gap: 10, marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 },
  infoText: { color: COLORS.textSecondary, fontSize: 12, flex: 1, lineHeight: 18 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  
  // Estilo do Slot Normal
  slot: { width: '30%', height: 50, borderRadius: 8, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#4CAF50' }, // Borda verde indicando livre
  slotText: { color: COLORS.textLight, fontWeight: 'bold' },

  // Estilo do Slot Selecionado para Bloqueio
  slotBlocked: { backgroundColor: 'rgba(244, 67, 54, 0.2)', borderColor: '#F44336' },
  slotTextBlocked: { color: '#F44336' },
  blockedBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#F44336', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },

  emptyText: { color: COLORS.textSecondary, width: '100%', textAlign: 'center', marginTop: 20 },

  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#1A1A1A', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, alignItems: 'center' },
  footerText: { color: COLORS.textLight, marginBottom: 15, fontWeight: 'bold' },
  blockBtn: { backgroundColor: '#F44336', width: '100%', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', letterSpacing: 1 }
});
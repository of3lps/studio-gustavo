import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { CALENDAR_AVAILABILITY, TODAY_APPOINTMENTS } from '../data/mockData';

const DAYS = [
  { num: '14', name: 'SEG', full: 'Segunda, 14 Out' },
  { num: '15', name: 'TER', full: 'Terça, 15 Out' },
  { num: '16', name: 'QUA', full: 'Quarta, 16 Out' },
  { num: '17', name: 'QUI', full: 'Quinta, 17 Out' },
  { num: '18', name: 'SEX', full: 'Sexta, 18 Out' },
  { num: '19', name: 'SÁB', full: 'Sábado, 19 Out' },
];

export default function BookingScreen({ route, navigation }) {
  // CORREÇÃO: Adicionado valor padrão vazio [] para selectedServices
  const { totalDuration, selectedServices = [] } = route.params || { totalDuration: 30, selectedServices: [] };
  
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const totalPrice = selectedServices.reduce((acc, item) => acc + item.price, 0);

  // Lógica de Disponibilidade do Dia
  const isDayAvailable = (dayNum) => {
    const slotsForThatDay = CALENDAR_AVAILABILITY[dayNum] || [];
    if (slotsForThatDay.length === 0) return false;
    const slotsNeeded = Math.ceil(totalDuration / 30);
    for (let i = 0; i < slotsForThatDay.length; i++) {
      if ((i + slotsNeeded) <= slotsForThatDay.length) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const firstAvailable = DAYS.find(d => isDayAvailable(d.num));
    if (firstAvailable) setSelectedDay(firstAvailable);
  }, []);

  // Lógica de Agrupamento de Horários
  const groupedSlots = useMemo(() => {
    if (!selectedDay) return { Morning: [], Afternoon: [], Evening: [] };

    const rawSlots = CALENDAR_AVAILABILITY[selectedDay.num] || [];
    const slotsNeeded = Math.ceil(totalDuration / 30);
    
    const validStartTimes = rawSlots.filter((slot, index) => {
      return (index + slotsNeeded) <= rawSlots.length; 
    });

    const groups = { Morning: [], Afternoon: [], Evening: [] };
    validStartTimes.forEach(time => {
      const hour = parseInt(time.split(':')[0]);
      if (hour < 12) groups.Morning.push(time);
      else if (hour < 18) groups.Afternoon.push(time);
      else groups.Evening.push(time);
    });
    return groups;
  }, [selectedDay, totalDuration]);

  const renderSlotGroup = (title, icon, slots) => {
    if (slots.length === 0) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name={icon} size={18} color={COLORS.textSecondary} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.grid}>
          {slots.map((time) => (
            <TouchableOpacity 
              key={time} 
              onPress={() => setSelectedSlot(time)}
              style={[styles.slot, selectedSlot === time && styles.slotSelected]}
            >
              <Text style={[styles.slotText, selectedSlot === time && styles.slotTextSelected]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ESCOLHER HORÁRIO</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{flex: 1}}>
        <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
          <View style={styles.calendarContainer}>
            <View style={{flexDirection:'row', justifyContent:'space-between', paddingRight: 20}}>
                <Text style={styles.monthTitle}>Outubro 2026</Text>
                <Text style={{color: COLORS.primary, fontSize: 10, fontWeight:'bold'}}>
                   RECOMENDADOS PARA {totalDuration} MIN
                </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {DAYS.map((day, index) => {
                const available = isDayAvailable(day.num);
                const isSelected = selectedDay?.num === day.num;
                return (
                  <TouchableOpacity 
                    key={index} 
                    disabled={!available}
                    onPress={() => { setSelectedDay(day); setSelectedSlot(null); }}
                    style={[
                      styles.dayCard, 
                      isSelected && styles.dayCardSelected,
                      !available && styles.dayCardDisabled
                    ]}
                  >
                    <Text style={[styles.dayName, isSelected && {color: 'black'}, !available && {color: '#444'}]}>{day.name}</Text>
                    <Text style={[styles.dayNum, isSelected && {color: 'black'}, !available && {color: '#444'}]}>{day.num}</Text>
                    {available && !isSelected && <View style={styles.availableDot} />}
                    {isSelected && <View style={styles.dot} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.slotsContainer}>
            {selectedDay ? (
                <>
                    {renderSlotGroup('Manhã', 'wb-sunny', groupedSlots.Morning)}
                    {renderSlotGroup('Tarde', 'wb-twilight', groupedSlots.Afternoon)}
                    {renderSlotGroup('Noite', 'nights-stay', groupedSlots.Evening)}
                    
                    {groupedSlots.Morning.length === 0 && groupedSlots.Afternoon.length === 0 && groupedSlots.Evening.length === 0 && (
                        <Text style={styles.emptyText}>Nenhum horário disponível neste dia.</Text>
                    )}
                </>
            ) : (
                <Text style={styles.emptyText}>Selecione um dia disponível acima.</Text>
            )}
          </View>
        </ScrollView>
      </View>

      {/* FOOTER */}
      {selectedSlot && selectedDay && (
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <View>
              <Text style={styles.footerLabel}>Agendamento para</Text>
              <Text style={styles.footerDate}>{selectedDay.full} às {selectedSlot}</Text>
              <Text style={styles.footerServices}>
                {selectedServices.length} serviços • {totalDuration} min
              </Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
               <Text style={styles.footerPriceLabel}>Total</Text>
               <Text style={styles.footerPrice}>R$ {totalPrice}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.btnConfirm}
            onPress={() => {
                const newAppointment = {
                    id: Math.random(),
                    client: "Cliente Demo",
                    service: selectedServices.map(s => s.title).join(' + '),
                    date: `2026-10-${selectedDay.num}`, // Salva a data correta para o admin
                    time: selectedSlot,
                    status: 'pending',
                    price: totalPrice
                };
                TODAY_APPOINTMENTS.push(newAppointment);
                navigation.navigate('Success');
            }}
          >
            <Text style={styles.btnConfirmText}>SOLICITAR AGENDAMENTO</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 40, paddingBottom: 10, paddingHorizontal: 20 },
  headerTitle: { color: COLORS.textLight, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surfaceHighlight, borderRadius: 20 },
  
  calendarContainer: { marginTop: 20, marginBottom: 10 },
  monthTitle: { color: COLORS.textSecondary, fontSize: 14, fontWeight: 'bold', marginLeft: 20, marginBottom: 15, textTransform: 'uppercase' },
  dayCard: { width: 65, height: 85, borderRadius: 16, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  dayCardSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayCardDisabled: { opacity: 0.3, backgroundColor: '#111', borderColor: 'transparent' },
  dayName: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  dayNum: { color: COLORS.textLight, fontSize: 22, fontWeight: 'bold' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'black', marginTop: 4 },
  availableDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.primary, marginTop: 4 },
  
  slotsContainer: { paddingHorizontal: 20, paddingTop: 10 },
  section: { marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slot: { width: '30%', paddingVertical: 12, borderRadius: 10, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  slotSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  slotText: { color: COLORS.textLight, fontWeight: '500', fontSize: 14 },
  slotTextSelected: { color: 'black', fontWeight: 'bold' },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1A1A1A', padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: {width: 0, height: -5}, shadowOpacity: 0.3, shadowRadius: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  footerLabel: { color: COLORS.textSecondary, fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold' },
  footerDate: { color: COLORS.textLight, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  footerServices: { color: COLORS.textSecondary, fontSize: 12, maxWidth: 200 },
  footerPriceLabel: { color: COLORS.textSecondary, fontSize: 10, textAlign: 'right', textTransform: 'uppercase' },
  footerPrice: { color: COLORS.primary, fontSize: 20, fontWeight: 'bold' },
  btnConfirm: { backgroundColor: COLORS.primary, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnConfirmText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, StyleSheet, 
  StatusBar, SafeAreaView, Alert, ActivityIndicator 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, 
  isSameDay, isBefore, isSunday, isMonday, parseISO 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { COLORS } from '../constants/theme';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

// --- CONFIGURAÇÕES ---
const OPENING_HOUR = 9;  
const CLOSING_HOUR = 19; 
const INTERVAL = 30;     
const WORK_ON_SUNDAY = false; 
const WORK_ON_MONDAY = true;  

export default function BookingScreen({ route, navigation }) {
  const { user, profile } = useAuth();
  
  const { 
    totalDuration = 30, 
    selectedServices = [], 
    totalAmount = 0,
    isAdminMode = false, 
    clientData = null 
  } = route.params || {};

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null); // Começa null para forçar seleção
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Armazena os agendamentos do MÊS INTEIRO para cálculo rápido
  // Formato: { "2026-10-14": ["09:00", "14:00"], ... }
  const [monthAppointments, setMonthAppointments] = useState({});
  const [loadingMonth, setLoadingMonth] = useState(true);

  // --- 1. BUSCA DADOS DO MÊS INTEIRO ---
  useEffect(() => {
    fetchMonthAvailability(currentMonth);
  }, [currentMonth]);

  const fetchMonthAvailability = async (dateRef) => {
    setLoadingMonth(true);
    try {
      const start = format(startOfMonth(dateRef), 'yyyy-MM-dd');
      const end = format(endOfMonth(dateRef), 'yyyy-MM-dd');

      // Busca tudo entre dia 1 e dia 31
      const { data, error } = await supabase
        .from('appointments')
        .select('date, time')
        .gte('date', start)
        .lte('date', end)
        .neq('status', 'cancelled');

      if (error) throw error;

      // Organiza por dia para acesso rápido
      const appointmentsByDay = {};
      data.forEach(app => {
        if (!appointmentsByDay[app.date]) {
          appointmentsByDay[app.date] = [];
        }
        appointmentsByDay[app.date].push(app.time);
      });

      setMonthAppointments(appointmentsByDay);
    } catch (error) {
      console.log("Erro ao buscar mês:", error);
    } finally {
      setLoadingMonth(false);
    }
  };

  // --- 2. VERIFICADOR DE DISPONIBILIDADE DO DIA (A MÁGICA) ---
  // Essa função retorna TRUE se o dia tiver pelo menos UM horário que caiba o serviço
  const checkDayAvailability = useCallback((date) => {
    // 1. Bloqueios Fixos (Passado, Feriado)
    const today = new Date();
    today.setHours(0,0,0,0);
    if (isBefore(date, today)) return false;
    if (!WORK_ON_SUNDAY && isSunday(date)) return false;
    if (!WORK_ON_MONDAY && isMonday(date)) return false;

    // 2. Verifica Slots
    const dateString = format(date, 'yyyy-MM-dd');
    const busySlots = monthAppointments[dateString] || [];

    const startMins = OPENING_HOUR * 60;
    const endMins = CLOSING_HOUR * 60;
    const slotsNeeded = Math.ceil(totalDuration / INTERVAL);

    // Conversores
    const minutesToTime = (mins) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    // Varre o dia simulando horários
    for (let time = startMins; time < endMins; time += INTERVAL) {
        // Se for hoje, ignora passado
        if (isSameDay(date, new Date())) {
           const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
           if (time <= nowMins) continue;
        }

        // Se horário atual já está ocupado, pula
        if (busySlots.includes(minutesToTime(time))) continue;

        // VERIFICA ENCAIXE (Duração)
        let fits = true;
        for (let i = 0; i < slotsNeeded; i++) {
            const checkTime = time + (i * INTERVAL);
            if (checkTime >= endMins || busySlots.includes(minutesToTime(checkTime))) {
                fits = false;
                break;
            }
        }

        // Se achou pelo menos UM horário que serve, o dia está LIBERADO!
        if (fits) return true;
    }

    // Se rodou o dia todo e nada serviu -> BLOQUEADO
    return false;

  }, [monthAppointments, totalDuration]);

  // --- 3. GERAÇÃO DOS SLOTS VISÍVEIS (Quando clica no dia) ---
  const availableSlotsForSelectedDay = useMemo(() => {
    if (!selectedDate) return { Morning: [], Afternoon: [], Evening: [] };
    
    // Reutiliza a lógica, mas agora para retornar a lista
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const busySlots = monthAppointments[dateString] || [];
    
    const slots = [];
    const startMins = OPENING_HOUR * 60;
    const endMins = CLOSING_HOUR * 60;
    const slotsNeeded = Math.ceil(totalDuration / INTERVAL);

    const minutesToTime = (mins) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    for (let time = startMins; time < endMins; time += INTERVAL) {
        if (isSameDay(selectedDate, new Date())) {
           const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
           if (time <= nowMins) continue;
        }

        if (busySlots.includes(minutesToTime(time))) continue;

        let fits = true;
        for (let i = 0; i < slotsNeeded; i++) {
            const checkTime = time + (i * INTERVAL);
            if (checkTime >= endMins || busySlots.includes(minutesToTime(checkTime))) {
                fits = false;
                break;
            }
        }

        if (fits) slots.push(minutesToTime(time));
    }

    const groups = { Morning: [], Afternoon: [], Evening: [] };
    slots.forEach(t => {
      const h = parseInt(t.split(':')[0]);
      if (h < 12) groups.Morning.push(t);
      else if (h < 18) groups.Afternoon.push(t);
      else groups.Evening.push(t);
    });

    return groups;
  }, [selectedDate, monthAppointments, totalDuration]);

  // --- RENDERS ---
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot) return;
    try {
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        const serviceNames = selectedServices.map(s => s.title).join(' + ');
        const userIdToSave = isAdminMode && clientData ? clientData.id : user.id;
        const clientNameToSave = isAdminMode && clientData ? clientData.name : profile?.full_name;

        const { error } = await supabase.from('appointments').insert({
            user_id: userIdToSave,
            client_name: clientNameToSave,
            service_names: serviceNames,
            date: dateString,
            time: selectedSlot,
            price: totalAmount,
            status: 'confirmed', 
            payment_method: 'local'
        });

        if (error) throw error;

        if (isAdminMode) {
            Alert.alert("Sucesso", "Agendamento realizado!", [
                { text: "OK", onPress: () => navigation.navigate('AdminDashboard') }
            ]);
        } else {
            navigation.navigate('Success');
        }
    } catch (error) {
        Alert.alert("Erro", "Falha ao agendar.");
    }
  };

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
              <Text style={[styles.slotText, selectedSlot === time && styles.slotTextSelected]}>{time}</Text>
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
          <MaterialIcons name="arrow-back-ios" size={20} color={COLORS.textLight} style={{marginLeft: 6}} />
        </TouchableOpacity>
        <View style={{alignItems: 'center'}}>
            <Text style={styles.headerTitle}>ESCOLHER DATA</Text>
            {isAdminMode && <Text style={styles.adminLabel}>Para: {clientData?.name}</Text>}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        
        {/* CALENDÁRIO */}
        <View style={styles.calendarContainer}>
            <View style={styles.monthHeader}>
                <TouchableOpacity onPress={() => setCurrentMonth(subMonths(currentMonth, 1))} style={styles.monthArrow}>
                    <MaterialIcons name="chevron-left" size={28} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.monthTitle}>
                    {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                </Text>
                <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, 1))} style={styles.monthArrow}>
                    <MaterialIcons name="chevron-right" size={28} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.weekDaysRow}>
                {['D','S','T','Q','Q','S','S'].map((day, i) => (
                    <Text key={i} style={styles.weekDayText}>{day}</Text>
                ))}
            </View>

            {loadingMonth ? (
                <View style={{padding: 20}}>
                    <ActivityIndicator color={COLORS.primary} />
                </View>
            ) : (
                <View style={styles.daysGrid}>
                    {calendarDays.map((date, index) => {
                        const isSelected = selectedDate && isSameDay(selectedDate, date);
                        const isCurrentMonth = isSameMonth(date, currentMonth);
                        
                        // VERIFICA SE O DIA ESTÁ DISPONÍVEL USANDO A LÓGICA DE ENCAIXE
                        const isAvailable = checkDayAvailability(date);

                        return (
                            <TouchableOpacity 
                                key={index}
                                disabled={!isAvailable} // Bloqueia o clique
                                onPress={() => { setSelectedDate(date); setSelectedSlot(null); }}
                                style={[
                                    styles.dayCell,
                                    isSelected && styles.dayCellSelected,
                                    !isCurrentMonth && { opacity: 0 },
                                    !isAvailable && isCurrentMonth && styles.dayCellDisabled // Estilo visual bloqueado
                                ]}
                            >
                                <Text style={[
                                    styles.dayText,
                                    isSelected && { color: '#000', fontWeight: 'bold' },
                                    !isAvailable && isCurrentMonth && styles.dayTextDisabled
                                ]}>
                                    {format(date, 'd')}
                                </Text>
                                {isSelected && <View style={styles.selectedDot} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </View>

        {/* LISTA DE HORÁRIOS */}
        {selectedDate && (
            <View style={styles.slotsContainer}>
                <Text style={styles.dateLabel}>
                    Horários para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </Text>

                {availableSlotsForSelectedDay.Morning.length === 0 && 
                 availableSlotsForSelectedDay.Afternoon.length === 0 && 
                 availableSlotsForSelectedDay.Evening.length === 0 ? (
                    <Text style={styles.emptyText}>Sem horários disponíveis.</Text>
                ) : (
                    <>
                        {renderSlotGroup('Manhã', 'wb-sunny', availableSlotsForSelectedDay.Morning)}
                        {renderSlotGroup('Tarde', 'wb-twilight', availableSlotsForSelectedDay.Afternoon)}
                        {renderSlotGroup('Noite', 'nights-stay', availableSlotsForSelectedDay.Evening)}
                    </>
                )}
            </View>
        )}
      </ScrollView>

      {/* FOOTER */}
      {selectedSlot && (
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <View>
              <Text style={styles.footerLabel}>Agendamento para</Text>
              <Text style={styles.footerDate}>
                  {format(selectedDate, "dd 'de' MMM", { locale: ptBR })} às {selectedSlot}
              </Text>
              <Text style={styles.footerServices}>
                R$ {totalAmount} • {totalDuration} min
              </Text>
            </View>
            <TouchableOpacity 
                style={[styles.btnConfirm, isAdminMode && {backgroundColor: '#4CAF50'}]} 
                onPress={handleConfirm}
            >
                <Text style={styles.btnConfirmText}>CONFIRMAR</Text>
                <MaterialIcons name="check" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 40, paddingBottom: 10, paddingHorizontal: 20 },
  headerTitle: { color: COLORS.textLight, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  adminLabel: { color: '#4CAF50', fontSize: 12, fontWeight: 'bold' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surfaceHighlight, borderRadius: 20 },
  
  calendarContainer: { margin: 20, backgroundColor: COLORS.surface, borderRadius: 16, padding: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  monthTitle: { color: COLORS.textLight, fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize' },
  monthArrow: { padding: 5 },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  weekDayText: { color: COLORS.textSecondary, width: 40, textAlign: 'center', fontWeight: 'bold', fontSize: 12 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  
  dayCell: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 5, borderRadius: 20 },
  dayCellSelected: { backgroundColor: COLORS.primary },
  // ESTILO DE BLOQUEIO VISUAL
  dayCellDisabled: { backgroundColor: 'transparent', opacity: 0.3 }, 
  dayText: { color: COLORS.textLight, fontSize: 14 },
  dayTextDisabled: { color: '#666', textDecorationLine: 'line-through' },
  
  selectedDot: { width: 4, height: 4, backgroundColor: 'black', borderRadius: 2, position: 'absolute', bottom: 5 },

  slotsContainer: { paddingHorizontal: 20 },
  dateLabel: { color: COLORS.textLight, fontSize: 18, fontWeight: 'bold', marginBottom: 20, textTransform: 'capitalize' },
  section: { marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slot: { width: '30%', paddingVertical: 12, borderRadius: 10, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  slotSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  slotText: { color: COLORS.textLight, fontWeight: '500', fontSize: 14 },
  slotTextSelected: { color: 'black', fontWeight: 'bold' },

  emptyText: { color: COLORS.textSecondary, fontStyle: 'italic', marginTop: 10 },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1A1A1A', padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: {width: 0, height: -5}, shadowOpacity: 0.5, elevation: 20, borderTopWidth: 1, borderColor: '#333' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLabel: { color: COLORS.textSecondary, fontSize: 10, textTransform: 'uppercase' },
  footerDate: { color: COLORS.textLight, fontSize: 14, fontWeight: 'bold', textTransform: 'capitalize' },
  footerServices: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold' },
  btnConfirm: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnConfirmText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14, letterSpacing: 1 }
});
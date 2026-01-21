import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { SERVICES } from '../data/mockData';
import ServiceCard from '../components/ServiceCard';

export default function ServiceSelectionScreen({ navigation }) {
  const [selectedServices, setSelectedServices] = useState([]);

  const toggleService = (service) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const totalAmount = selectedServices.reduce((acc, item) => acc + item.price, 0);
  const totalDuration = selectedServices.reduce((acc, item) => acc + item.duration, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>SELECIONAR SERVIÇOS</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={SERVICES}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ServiceCard 
            item={item} 
            isSelected={!!selectedServices.find(s => s.id === item.id)}
            onPress={() => toggleService(item)}
          />
        )}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      {selectedServices.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
             <View>
                <Text style={styles.label}>TOTAL</Text>
                <Text style={styles.value}>R$ {totalAmount},00</Text>
             </View>
             <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.label}>DURAÇÃO</Text>
                <Text style={styles.value}>{totalDuration} min</Text>
             </View>
          </View>
          
          <TouchableOpacity 
            style={styles.btn}
            onPress={() => navigation.navigate('Booking', { 
              totalDuration: totalDuration, 
              selectedServices: selectedServices // <--- CORREÇÃO AQUI: Enviando a lista!
            })}
          >
            <Text style={styles.btnText}>ENCONTRAR HORÁRIOS</Text>
            <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 60, 
    paddingBottom: 20, 
    paddingHorizontal: 20, 
    backgroundColor: COLORS.background 
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: { color: COLORS.textLight, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#181818', padding: 24, borderTopWidth: 1, borderColor: '#333' },
  footerInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  label: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold' },
  value: { color: COLORS.textLight, fontSize: 20, fontWeight: 'bold' },
  btn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  btnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
});
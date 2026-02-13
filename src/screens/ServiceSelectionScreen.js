import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  StatusBar, ActivityIndicator, Alert 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { supabase } from '../services/supabase';

export default function ServiceSelectionScreen({ route, navigation }) {
  const { isAdminMode, clientData } = route.params || {};

  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]); // Array que pode ter repetidos

  // --- 1. BUSCA SERVIÇOS ---
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      setServicesList(data || []);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os serviços.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. LÓGICA DE QUANTIDADE (+ / -) ---
  
  // Conta quantos deste serviço já foram selecionados
  const getQuantity = (serviceId) => {
    return selectedServices.filter(s => s.id === serviceId).length;
  };

  const increment = (service) => {
    // Adiciona uma cópia do serviço ao array
    setSelectedServices([...selectedServices, service]);
  };

  const decrement = (service) => {
    // Remove APENAS UMA instância desse serviço
    const index = selectedServices.findIndex(s => s.id === service.id);
    if (index !== -1) {
      const newArray = [...selectedServices];
      newArray.splice(index, 1); // Remove 1 item no índice encontrado
      setSelectedServices(newArray);
    }
  };

  // --- 3. CÁLCULOS TOTAIS ---
  const totalAmount = selectedServices.reduce((acc, item) => acc + Number(item.price), 0);
  const totalDuration = selectedServices.reduce((acc, item) => acc + item.duration, 0);

  // --- RENDERIZAÇÃO DO CARD ---
  const renderItem = ({ item }) => {
    const quantity = getQuantity(item.id);
    const isSelected = quantity > 0;

    return (
      <View 
        style={[
          styles.card, 
          isSelected && { borderColor: COLORS.primary, backgroundColor: 'rgba(212, 163, 115, 0.05)' }
        ]} 
      >
        {/* Ícone e Textos (Clicar aqui também aumenta) */}
        <TouchableOpacity 
            style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}
            onPress={() => increment(item)}
            activeOpacity={0.7}
        >
            <View style={styles.cardIcon}>
                <MaterialIcons name={item.icon || 'content-cut'} size={24} color={isSelected ? COLORS.primary : COLORS.textSecondary} />
            </View>
            <View style={{flex: 1}}>
                <Text style={[styles.cardTitle, isSelected && {color: COLORS.primary}]}>{item.title}</Text>
                <Text style={styles.cardSub}>{item.duration} min • {item.category || 'Geral'}</Text>
            </View>
            <Text style={[styles.cardPrice, isSelected && {color: COLORS.primary}]}>R$ {item.price}</Text>
        </TouchableOpacity>
        
        {/* CONTROLE DE QUANTIDADE (- 0 +) */}
        {isSelected ? (
            <View style={styles.counterContainer}>
                <TouchableOpacity onPress={() => decrement(item)} style={styles.counterBtn}>
                    <MaterialIcons name="remove" size={16} color="white" />
                </TouchableOpacity>
                
                <Text style={styles.counterText}>{quantity}</Text>
                
                <TouchableOpacity onPress={() => increment(item)} style={[styles.counterBtn, {backgroundColor: COLORS.primary}]}>
                    <MaterialIcons name="add" size={16} color="white" />
                </TouchableOpacity>
            </View>
        ) : (
            // Se for 0, mostra botão de adicionar simples
            <TouchableOpacity onPress={() => increment(item)} style={styles.addBtn}>
                 <MaterialIcons name="add" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={COLORS.textLight} style={{marginLeft: 6}} />
        </TouchableOpacity>
        
        <View style={{alignItems: 'center'}}>
            <Text style={styles.headerTitle}>SELECIONAR SERVIÇOS</Text>
            {isAdminMode && (
                <Text style={styles.adminLabel}>Cliente: {clientData?.name}</Text>
            )}
        </View>
        
        <View style={{ width: 40 }} />
      </View>

      {/* LISTA */}
      {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}} />
      ) : (
          <FlatList
            data={servicesList}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={{color: '#666', textAlign: 'center'}}>Nenhum serviço encontrado.</Text>}
          />
      )}

      {/* FOOTER FLUTUANTE */}
      {selectedServices.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerRow}>
             <View>
                <Text style={styles.footerLabel}>SERVIÇOS</Text>
                <Text style={styles.footerValue}>{selectedServices.length} iten(s)</Text>
             </View>
             <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.footerLabel}>TEMPO TOTAL</Text>
                <Text style={styles.footerValue}>{totalDuration} min</Text>
             </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.footerTotalRow}>
              <Text style={styles.totalLabel}>Total a Pagar</Text>
              <Text style={styles.totalValue}>R$ {totalAmount},00</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.btn, isAdminMode && {backgroundColor: '#4CAF50'}]}
            onPress={() => navigation.navigate('Booking', { 
              totalDuration, 
              selectedServices,
              totalAmount,
              isAdminMode,
              clientData
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: COLORS.background 
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  headerTitle: { color: COLORS.textLight, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  adminLabel: { color: '#4CAF50', fontSize: 12, fontWeight: 'bold', marginTop: 2 },

  // Estilos do Card
  card: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', 
    padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#333',
    height: 70
  },
  cardIcon: { width: 40, alignItems: 'center' },
  cardTitle: { color: COLORS.textLight, fontSize: 15, fontWeight: 'bold' },
  cardSub: { color: COLORS.textSecondary, fontSize: 11, marginTop: 1 },
  cardPrice: { color: COLORS.textLight, fontSize: 15, fontWeight: 'bold', marginRight: 15 },
  
  // Botão Simples (+)
  addBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },

  // Controle de Quantidade (- 1 +)
  counterContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#333', borderRadius: 20, padding: 2 },
  counterBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#444', justifyContent: 'center', alignItems: 'center' },
  counterText: { color: 'white', fontWeight: 'bold', marginHorizontal: 10, minWidth: 10, textAlign: 'center' },

  // Footer
  footer: { 
    position: 'absolute', bottom: 0, width: '100%', 
    backgroundColor: '#181818', padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 20,
    borderTopWidth: 1, borderColor: '#333'
  },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  footerLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  footerValue: { color: COLORS.textLight, fontSize: 14, fontWeight: 'bold' },
  
  divider: { height: 1, backgroundColor: '#333', marginBottom: 15 },
  
  footerTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { color: COLORS.textLight, fontSize: 18, fontWeight: 'bold' },
  totalValue: { color: COLORS.primary, fontSize: 24, fontWeight: 'bold' },

  btn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  btnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});
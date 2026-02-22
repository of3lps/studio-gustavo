import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  StatusBar, ActivityIndicator, Alert, Modal, TextInput,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS } from '../../constants/theme';
import { supabase } from '../../services/supabase';

export default function AdminStatsScreen({ navigation }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Controle do Modal de Edição/Criação
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Estados do Formulário
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formPoints, setFormPoints] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.log("Erro ao buscar serviços:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchServices();
    }, [])
  );

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service.id);
      setFormTitle(service.title);
      setFormPrice(service.price.toString());
      setFormDuration(service.duration.toString());
      setFormPoints(service.points ? service.points.toString() : '10');
    } else {
      setEditingService(null);
      setFormTitle('');
      setFormPrice('');
      setFormDuration('30'); 
      setFormPoints('10');   
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingService(null);
    Keyboard.dismiss(); // Garante que o teclado feche se cancelar
  };

  const handleSave = async () => {
    if (!formTitle || !formPrice || !formDuration || !formPoints) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    Keyboard.dismiss(); // Fecha o teclado ao salvar

    const serviceData = {
      title: formTitle,
      price: parseFloat(formPrice.replace(',', '.')),
      duration: parseInt(formDuration, 10),
      points: parseInt(formPoints, 10),
      icon: 'content-cut' 
    };

    try {
      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);
        if (error) throw error;
      }

      closeModal();
      fetchServices(); 
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar o serviço. Verifique as permissões do banco.");
      console.log(error);
    }
  };

  const handleDelete = (id, title) => {
    Alert.alert(
      "Excluir Serviço",
      `Tem certeza que deseja remover "${title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('services').delete().eq('id', id);
              if (error) throw error;
              fetchServices();
            } catch (error) {
              Alert.alert("Erro", "Falha ao excluir o serviço.");
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
            <Text style={styles.headerTitle}>Gestão de Serviços</Text>
            <Text style={styles.headerSub}>Adicione ou edite o menu da barbearia</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
            <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : services.length === 0 ? (
            <View style={styles.emptyState}>
                <MaterialIcons name="receipt-long" size={60} color="#333" />
                <Text style={styles.emptyText}>Nenhum serviço cadastrado.</Text>
            </View>
        ) : (
            services.map(item => (
                <View key={item.id} style={styles.serviceCard}>
                    <View style={styles.serviceInfo}>
                        <View style={styles.titleRow}>
                            <MaterialIcons name={item.icon || 'content-cut'} size={20} color={COLORS.primary} />
                            <Text style={styles.serviceTitle}>{item.title}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.priceText}>R$ {item.price}</Text>
                            <Text style={styles.dot}>•</Text>
                            <Text style={styles.detailText}>{item.duration} min</Text>
                            <Text style={styles.dot}>•</Text>
                            <Text style={styles.pointsText}>+{item.points || 0} pts</Text>
                        </View>
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => openModal(item)}>
                            <MaterialIcons name="edit" size={20} color={COLORS.textLight} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconBtn, {backgroundColor: 'rgba(244, 67, 54, 0.1)'}]} onPress={() => handleDelete(item.id, item.title)}>
                            <MaterialIcons name="delete-outline" size={20} color="#F44336" />
                        </TouchableOpacity>
                    </View>
                </View>
            ))
        )}
      </ScrollView>

      {/* MODAL DE FORMULÁRIO COM PROTEÇÃO DE TECLADO */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        {/* O KeyboardAvoidingView empurra a tela para cima */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* O TouchableWithoutFeedback escuta toques na tela inteira para fechar o teclado */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              
              {/* O conteúdo do modal */}
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{editingService ? 'Editar Serviço' : 'Novo Serviço'}</Text>
                        <TouchableOpacity onPress={closeModal}>
                            <MaterialIcons name="close" size={24} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Nome do Serviço</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Ex: Corte Degradê" 
                        placeholderTextColor="#555"
                        value={formTitle}
                        onChangeText={setFormTitle}
                    />

                    <View style={styles.row}>
                        <View style={{flex: 1, marginRight: 10}}>
                            <Text style={styles.label}>Valor (R$)</Text>
                            <TextInput 
                                style={styles.input} 
                                placeholder="45.00" 
                                placeholderTextColor="#555"
                                keyboardType="numeric"
                                value={formPrice}
                                onChangeText={setFormPrice}
                            />
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={styles.label}>Tempo (Minutos)</Text>
                            <TextInput 
                                style={styles.input} 
                                placeholder="30" 
                                placeholderTextColor="#555"
                                keyboardType="numeric"
                                value={formDuration}
                                onChangeText={setFormDuration}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Pontos de Fidelidade (Ganho)</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="10" 
                        placeholderTextColor="#555"
                        keyboardType="numeric"
                        value={formPoints}
                        onChangeText={setFormPoints}
                    />

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>SALVAR SERVIÇO</Text>
                    </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: COLORS.surface },
  headerTitle: { color: COLORS.textLight, fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 5 },
  
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: COLORS.textSecondary, marginTop: 15 },

  serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  serviceInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  serviceTitle: { color: COLORS.textLight, fontSize: 16, fontWeight: 'bold' },
  
  detailsRow: { flexDirection: 'row', alignItems: 'center' },
  priceText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },
  dot: { color: '#555', marginHorizontal: 8 },
  detailText: { color: COLORS.textSecondary, fontSize: 12 },
  pointsText: { color: '#4CAF50', fontSize: 12, fontWeight: 'bold' },

  actionButtons: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E1E1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { color: COLORS.textLight, fontSize: 18, fontWeight: 'bold' },
  
  label: { color: COLORS.textSecondary, fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: COLORS.background, color: COLORS.textLight, height: 50, borderRadius: 10, paddingHorizontal: 15, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  row: { flexDirection: 'row' },
  
  saveBtn: { backgroundColor: COLORS.primary, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: 'white', fontWeight: 'bold', letterSpacing: 1 }
});
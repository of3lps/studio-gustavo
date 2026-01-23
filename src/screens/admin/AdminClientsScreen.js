import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image, Linking, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { CLIENTS } from '../../data/mockData';

export default function AdminClientsScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [list, setList] = useState(CLIENTS);

  // Função de Pesquisa Poderosa (Nome, Email ou Telefone)
  const handleSearch = (text) => {
    setSearchText(text);
    if (text === '') {
      setList(CLIENTS);
    } else {
      const lowerText = text.toLowerCase();
      const filtered = CLIENTS.filter(client => 
        client.name.toLowerCase().includes(lowerText) ||
        client.email.toLowerCase().includes(lowerText) ||
        client.phone.includes(text)
      );
      setList(filtered);
    }
  };

  const openWhatsApp = (phone) => {
    // Remove caracteres não numéricos
    const number = phone.replace(/\D/g, '');
    const url = `https://wa.me/55${number}`;
    Linking.openURL(url).catch(() => Alert.alert("Erro", "Não foi possível abrir o WhatsApp"));
  };

  // Renderiza cada cliente
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.info}><MaterialIcons name="phone" size={12} /> {item.phone}</Text>
          <Text style={styles.info}><MaterialIcons name="email" size={12} /> {item.email}</Text>
        </View>
        <TouchableOpacity onPress={() => openWhatsApp(item.phone)} style={styles.zapBtn}>
           <MaterialIcons name="chat" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View>
             <Text style={styles.label}>Última Visita</Text>
             <Text style={styles.value}>{item.lastVisit}</Text>
        </View>
        
        {/* BOTÃO MÁGICO: AGENDAR PARA O CLIENTE */}
        <TouchableOpacity 
          style={styles.bookBtn}
          onPress={() => {
            // Navega para a seleção de serviço, mas avisa que é ADMIN agendando para ESTE cliente
            navigation.navigate('ServiceSelection', { 
              isAdminMode: true, 
              clientData: item 
            });
          }}
        >
          <Text style={styles.bookBtnText}>Novo Agendamento</Text>
          <MaterialIcons name="add-circle" size={16} color="white" />
        </TouchableOpacity>
      </View>
      
      {item.notes ? (
        <View style={styles.notesContainer}>
            <MaterialIcons name="sticky-note-2" size={14} color={COLORS.primary} />
            <Text style={styles.noteText}>{item.notes}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestão de Clientes</Text>
      </View>
      
      {/* Barra de Pesquisa */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color={COLORS.textSecondary} />
        <TextInput 
          placeholder="Buscar por nome, telefone ou email..." 
          placeholderTextColor={COLORS.textSecondary}
          style={styles.input}
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText !== '' && (
            <TouchableOpacity onPress={() => handleSearch('')}>
                <MaterialIcons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
        )}
      </View>

      <FlatList 
        data={list}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum cliente encontrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: COLORS.surface },
  headerTitle: { color: COLORS.textLight, fontSize: 20, fontWeight: 'bold' },
  
  searchContainer: { flexDirection: 'row', backgroundColor: COLORS.surface, margin: 20, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  input: { flex: 1, color: COLORS.textLight, marginLeft: 10, fontSize: 16 },
  
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#333' },
  name: { color: COLORS.textLight, fontSize: 18, fontWeight: 'bold' },
  info: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  
  zapBtn: { backgroundColor: '#25D366', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 12 },
  
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: COLORS.textSecondary, fontSize: 10, textTransform: 'uppercase' },
  value: { color: COLORS.textLight, fontSize: 14, fontWeight: 'bold' },
  
  bookBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', gap: 6 },
  bookBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

  notesContainer: { marginTop: 12, flexDirection: 'row', gap: 6, backgroundColor: 'rgba(212, 163, 115, 0.1)', padding: 8, borderRadius: 8 },
  noteText: { color: COLORS.primary, fontSize: 12, fontStyle: 'italic', flex: 1 },

  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 }
});
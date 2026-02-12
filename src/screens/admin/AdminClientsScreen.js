import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image, Linking, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { CLIENTS } from '../../data/mockData';

export default function AdminClientsScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [list, setList] = useState(CLIENTS);

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
    const number = phone.replace(/\D/g, '');
    const url = `https://wa.me/55${number}`;
    Linking.openURL(url).catch(() => Alert.alert("Erro", "Não foi possível abrir o WhatsApp"));
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* CABEÇALHO DO CARD */}
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

      {/* --- NOVO: SE TIVER AGENDAMENTO FUTURO, MOSTRA ISSO --- */}
      {item.upcomingAppt && (
        <View style={styles.upcomingBadge}>
            <MaterialIcons name="event" size={14} color="#155724" />
            <Text style={styles.upcomingText}>
                Agendado: <Text style={{fontWeight:'bold'}}>{item.upcomingAppt}</Text>
            </Text>
        </View>
      )}

      {/* --- NOVO: NOTAS (Movi para cá para ficar organizado) --- */}
      {item.notes ? (
        <View style={styles.notesContainer}>
            <MaterialIcons name="sticky-note-2" size={14} color={COLORS.primary} />
            <Text style={styles.noteText}>{item.notes}</Text>
        </View>
      ) : null}

      <View style={styles.divider} />

      {/* RODAPÉ COM ESTATÍSTICAS */}
      <View style={styles.footer}>
        
        {/* Lado Esquerdo: Estatísticas */}
        <View style={styles.statsRow}>
            <View style={{marginRight: 15}}>
                <Text style={styles.label}>Total Cortes</Text>
                <Text style={styles.value}>{item.totalVisits || 0}</Text>
            </View>
            <View>
                <Text style={styles.label}>Última Visita</Text>
                <Text style={styles.value}>{item.lastVisit}</Text>
            </View>
        </View>
        
        {/* Lado Direito: Botão Agendar */}
        <TouchableOpacity 
          style={styles.bookBtn}
          onPress={() => {
            navigation.navigate('ServiceSelection', { 
              isAdminMode: true, 
              clientData: item 
            });
          }}
        >
          <Text style={styles.bookBtnText}>Agendar</Text>
          <MaterialIcons name="add-circle" size={16} color="white" />
        </TouchableOpacity>
      </View>
      
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestão de Clientes</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color={COLORS.textSecondary} />
        <TextInput 
          placeholder="Buscar cliente..." 
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
  
  // Estilo novo para o badge de agendamento futuro
  upcomingBadge: { 
      marginTop: 12, 
      backgroundColor: '#D4EDDA', // Fundo verde claro
      paddingVertical: 6, 
      paddingHorizontal: 10, 
      borderRadius: 8, 
      flexDirection: 'row', 
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start' // Não estica a linha toda
  },
  upcomingText: { color: '#155724', fontSize: 12 },

  notesContainer: { marginTop: 8, flexDirection: 'row', gap: 6, paddingLeft: 4 },
  noteText: { color: COLORS.primary, fontSize: 12, fontStyle: 'italic', flex: 1 },

  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 12 },
  
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statsRow: { flexDirection: 'row' }, // Agrupa as estatísticas
  
  label: { color: COLORS.textSecondary, fontSize: 10, textTransform: 'uppercase' },
  value: { color: COLORS.textLight, fontSize: 14, fontWeight: 'bold' },
  
  bookBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignItems: 'center', gap: 6 },
  bookBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 }
});
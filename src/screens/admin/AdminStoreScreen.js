import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { PRODUCTS } from '../../data/mockData';

export default function AdminStoreScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <Text style={styles.headerTitle}>Estoque da Loja</Text>
         <TouchableOpacity style={styles.addBtn}>
            <MaterialIcons name="add" size={24} color="white" />
         </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
         {PRODUCTS.map(prod => (
            <View key={prod.id} style={styles.prodRow}>
               <Image source={{ uri: prod.img }} style={styles.thumb} />
               <View style={{ flex: 1, paddingHorizontal: 12 }}>
                  <Text style={styles.prodName}>{prod.title}</Text>
                  <Text style={styles.prodCat}>{prod.category}</Text>
                  <Text style={styles.prodPrice}>R$ {prod.price}</Text>
               </View>
               <TouchableOpacity style={styles.editBtn}>
                  <MaterialIcons name="edit" size={20} color={COLORS.textSecondary} />
               </TouchableOpacity>
            </View>
         ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: COLORS.surface, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: COLORS.textLight, fontSize: 20, fontWeight: 'bold' },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  
  prodRow: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 10, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
  thumb: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#000' },
  prodName: { color: COLORS.textLight, fontWeight: 'bold', fontSize: 16 },
  prodCat: { color: COLORS.textSecondary, fontSize: 12 },
  prodPrice: { color: COLORS.primary, fontWeight: 'bold', marginTop: 4 },
  editBtn: { padding: 10 }
});
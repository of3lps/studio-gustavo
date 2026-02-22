import React, { useState, useCallback } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, 
  ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, 
  TouchableWithoutFeedback, Keyboard, Platform, StatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy'; // Ajuda a processar a imagem nativa
import { decode } from 'base64-arraybuffer'; // Transforma a foto para o formato do Supabase

import { COLORS } from '../../constants/theme';
import { supabase } from '../../services/supabase';

export default function AdminStoreScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // NOVO: Controle de loading da foto

  // Controle do Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Estados do Formulário
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formImg, setFormImg] = useState(''); // Guarda a foto (seja link antigo ou foto nova do celular)
  const [formStock, setFormStock] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.log("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const openModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod.id);
      setFormTitle(prod.title);
      setFormCategory(prod.category);
      setFormPrice(prod.price.toString());
      setFormImg(prod.img || '');
      setFormStock(prod.stock ? prod.stock.toString() : '0');
    } else {
      setEditingProduct(null);
      setFormTitle('');
      setFormCategory('');
      setFormPrice('');
      setFormImg('');
      setFormStock('10');
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
    Keyboard.dismiss();
  };

  // --- NOVO: FUNÇÃO DE ESCOLHER IMAGEM ---
  const pickImage = async () => {
    // Pede permissão e abre a galeria
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Força a ser quadrado
      quality: 0.5, // Reduz o peso da imagem (bom para a nuvem)
    });

    if (!result.canceled) {
      setFormImg(result.assets[0].uri); // Salva o link provisório do celular
    }
  };

  // --- NOVO: FUNÇÃO PARA SUBIR A IMAGEM PRO SUPABASE ---
  const uploadImageToSupabase = async (uri) => {
    try {
      // Se já for um link http, significa que ele não alterou a foto antiga
      if (uri.startsWith('http')) return uri;

      // 1. Pega a foto do celular e converte em Base64
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      
      // 2. Cria um nome único para o arquivo
      const filePath = `produto_${Date.now()}.jpg`;

      // 3. Envia para o Storage do Supabase (bucket 'produtos')
      const { data, error } = await supabase.storage
        .from('produtos')
        .upload(filePath, decode(base64), { contentType: 'image/jpeg' });

      if (error) throw error;

      // 4. Pega a URL pública final que a internet consegue acessar
      const { data: publicUrlData } = supabase.storage
        .from('produtos')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.log("Erro no upload:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!formTitle || !formCategory || !formPrice || !formStock) {
      Alert.alert("Atenção", "Preencha Nome, Categoria, Preço e Estoque.");
      return;
    }

    Keyboard.dismiss();
    setUploading(true);

    try {
      // Se ele escolheu uma foto nova, sobe pro Supabase primeiro
      let finalImageUrl = formImg;
      if (formImg && !formImg.startsWith('http')) {
         finalImageUrl = await uploadImageToSupabase(formImg);
      }

      const productData = {
        title: formTitle,
        category: formCategory,
        price: parseFloat(formPrice.replace(',', '.')),
        img: finalImageUrl || 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&q=80',
        stock: parseInt(formStock, 10)
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
      }

      closeModal();
      fetchProducts();
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar produto. Verifique as permissões do Storage.");
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id, title) => {
    Alert.alert(
      "Excluir Produto",
      `Tem certeza que deseja remover "${title}" do estoque?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('products').delete().eq('id', id);
              if (error) throw error;
              fetchProducts();
            } catch (error) {
              Alert.alert("Erro", "Falha ao excluir o produto.");
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />

      <View style={styles.header}>
         <View>
            <Text style={styles.headerTitle}>Estoque da Loja</Text>
            <Text style={styles.headerSub}>Gerencie seus produtos e preços</Text>
         </View>
         <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
            <MaterialIcons name="add" size={24} color="white" />
         </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : products.length === 0 ? (
            <View style={styles.emptyState}>
                <MaterialIcons name="inventory" size={60} color="#333" />
                <Text style={styles.emptyText}>Nenhum produto em estoque.</Text>
            </View>
        ) : (
            products.map(prod => (
                <View key={prod.id} style={styles.prodRow}>
                    <Image source={{ uri: prod.img }} style={styles.thumb} />
                    <View style={{ flex: 1, paddingHorizontal: 12 }}>
                        <Text style={styles.prodName}>{prod.title}</Text>
                        <Text style={styles.prodCat}>{prod.category}</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.prodPrice}>R$ {prod.price}</Text>
                            <Text style={styles.dot}>•</Text>
                            <Text style={styles.prodStock}>Estoque: {prod.stock}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.actionsBox}>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => openModal(prod)}>
                            <MaterialIcons name="edit" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(prod.id, prod.title)}>
                            <MaterialIcons name="delete-outline" size={20} color="#F44336" />
                        </TouchableOpacity>
                    </View>
                </View>
            ))
        )}
      </ScrollView>

      {/* MODAL DE PRODUTO */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</Text>
                        <TouchableOpacity onPress={closeModal} disabled={uploading}>
                            <MaterialIcons name="close" size={24} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* FOTO DO PRODUTO (NOVO) */}
                    <View style={styles.imagePickerContainer}>
                        <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage} disabled={uploading}>
                            {formImg ? (
                                <Image source={{ uri: formImg }} style={styles.previewImg} />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <MaterialIcons name="add-a-photo" size={32} color={COLORS.primary} />
                                    <Text style={styles.imagePlaceholderText}>Adicionar Foto</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Nome do Produto</Text>
                    <TextInput style={styles.input} placeholder="Ex: Pomada Efeito Matte" placeholderTextColor="#555" value={formTitle} onChangeText={setFormTitle} editable={!uploading} />

                    <View style={styles.row}>
                        <View style={{flex: 1, marginRight: 10}}>
                            <Text style={styles.label}>Categoria</Text>
                            <TextInput style={styles.input} placeholder="Ex: Cabelo" placeholderTextColor="#555" value={formCategory} onChangeText={setFormCategory} editable={!uploading} />
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={styles.label}>Estoque</Text>
                            <TextInput style={styles.input} placeholder="10" placeholderTextColor="#555" keyboardType="numeric" value={formStock} onChangeText={setFormStock} editable={!uploading} />
                        </View>
                    </View>

                    <Text style={styles.label}>Valor (R$)</Text>
                    <TextInput style={styles.input} placeholder="45.00" placeholderTextColor="#555" keyboardType="numeric" value={formPrice} onChangeText={setFormPrice} editable={!uploading} />

                    <TouchableOpacity style={[styles.saveBtn, uploading && {opacity: 0.7}]} onPress={handleSave} disabled={uploading}>
                        {uploading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.saveBtnText}>SALVAR PRODUTO</Text>
                        )}
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
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: COLORS.surface, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: COLORS.textLight, fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 5 },
  
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: COLORS.textSecondary, marginTop: 15 },

  prodRow: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 10, borderRadius: 12, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  thumb: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#1E1E1E' },
  prodName: { color: COLORS.textLight, fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  prodCat: { color: COLORS.textSecondary, fontSize: 11, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 6 },
  
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  prodPrice: { color: COLORS.primary, fontWeight: 'bold' },
  dot: { color: '#555', marginHorizontal: 8 },
  prodStock: { color: COLORS.textSecondary, fontSize: 12 },

  actionsBox: { flexDirection: 'row', gap: 5 },
  iconBtn: { padding: 10 },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E1E1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { color: COLORS.textLight, fontSize: 18, fontWeight: 'bold' },
  
  // FOTO
  imagePickerContainer: { alignItems: 'center', marginBottom: 20 },
  imagePickerBtn: { width: 100, height: 100, borderRadius: 12, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed', overflow: 'hidden' },
  previewImg: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imagePlaceholderText: { color: COLORS.textSecondary, fontSize: 10, marginTop: 5, fontWeight: 'bold' },

  label: { color: COLORS.textSecondary, fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: COLORS.background, color: COLORS.textLight, height: 50, borderRadius: 10, paddingHorizontal: 15, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  row: { flexDirection: 'row' },
  
  saveBtn: { backgroundColor: COLORS.primary, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: 'white', fontWeight: 'bold', letterSpacing: 1 }
});
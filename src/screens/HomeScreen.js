import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';
import { PRODUCTS } from '../data/mockData'; 

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* HERO SECTION */}
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80' }} 
          style={styles.hero}
        >
          <LinearGradient colors={['rgba(18,18,18,0.1)', '#121212']} style={styles.heroGradient}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                 <Text style={styles.logoText}>STUDIO</Text>
                 <Text style={[styles.logoText, {color: COLORS.primary}]}>GUSTAVO</Text>
              </View>
              <TouchableOpacity style={styles.iconBtn}>
                <MaterialIcons name="notifications" size={28} color={COLORS.textLight} />
                <View style={styles.badge} />
              </TouchableOpacity>
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.estText}>Est. 2024 • Gustavo Barber</Text>
              <Text style={styles.welcomeTitle}>A ARTE DO <Text style={{ color: COLORS.primary }}>CORTE</Text></Text>
              <Text style={styles.subText}>Exclusividade, técnica e um ambiente pensado para você.</Text>
              <View style={styles.heroActions}>
                <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('ServiceSelection')}>
                  <Text style={styles.btnText}>AGENDAR AGORA</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* SEÇÃO: PERFIL DO BARBEIRO (SOLO) */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80' }} 
              style={styles.profileImg} 
            />
            <View style={styles.profileContent}>
              <Text style={styles.profileLabel}>O ESPECIALISTA</Text>
              <Text style={styles.profileName}>Gustavo Silva</Text>
              <Text style={styles.profileBio}>
                Master Barber com 10 anos de experiência. Especialista em visagismo e cortes clássicos modernos.
              </Text>
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={16} color={COLORS.primary} />
                <Text style={styles.ratingText}>5.0 (580 avaliações)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SEÇÃO: GUSTAVO STORE */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}]}>
            <Text style={styles.sectionTitle}>Gustavo Store</Text>
            <TouchableOpacity><Text style={styles.linkText}>Ver tudo</Text></TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 20 }}>
            {PRODUCTS.map((product) => (
              <TouchableOpacity key={product.id} style={styles.productCard}>
                <Image source={{ uri: product.img }} style={styles.productImg} />
                <View style={styles.productContent}>
                  <Text style={styles.productCategory}>{product.category}</Text>
                  <Text numberOfLines={1} style={styles.productTitle}>{product.title}</Text>
                  <Text style={styles.productPrice}>R$ {product.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <MaterialIcons name="home" size={28} color={COLORS.primary} />
        <TouchableOpacity style={styles.fabBtn} onPress={() => navigation.navigate('ServiceSelection')}>
          <MaterialIcons name="content-cut" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <View style={{position: 'relative'}}>
            <MaterialIcons name="shopping-bag" size={24} color={COLORS.textSecondary} />
            <View style={{position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary}} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hero: { height: 400, width: '100%' },
  heroGradient: { flex: 1, justifyContent: 'space-between', paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, paddingHorizontal: 20 },
  iconBtn: { padding: 4 },
  badge: { width: 10, height: 10, backgroundColor: COLORS.primary, borderRadius: 5, position: 'absolute', top: 2, right: 2, borderWidth: 2, borderColor: '#000' },
  logoContainer: { alignItems: 'flex-start' },
  logoText: { color: COLORS.textLight, fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  heroContent: { paddingHorizontal: 20 },
  estText: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' },
  welcomeTitle: { color: COLORS.textLight, fontSize: 42, fontWeight: 'bold', lineHeight: 42, textTransform: 'uppercase' },
  subText: { color: COLORS.textSecondary, marginTop: 10, fontSize: 14, lineHeight: 20, maxWidth: '70%' },
  heroActions: { marginTop: 25 },
  btnPrimary: { backgroundColor: COLORS.primary, height: 50, width: 180, borderRadius: 8, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 10 },
  btnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  
  section: { marginTop: 30 },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { color: COLORS.textLight, fontSize: 20, fontWeight: 'bold' },
  linkText: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold' },

  // Profile Card
  profileCard: { marginHorizontal: 20, backgroundColor: COLORS.surface, borderRadius: 16, overflow: 'hidden', flexDirection: 'row', height: 140 },
  profileImg: { width: 110, height: '100%' },
  profileContent: { flex: 1, padding: 15, justifyContent: 'center' },
  profileLabel: { color: COLORS.primary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  profileName: { color: COLORS.textLight, fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  profileBio: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 16, marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: COLORS.textLight, fontSize: 11, fontWeight: 'bold' },

  // Product Card
  productCard: { width: 140, backgroundColor: COLORS.surface, borderRadius: 12, marginRight: 15, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  productImg: { width: '100%', height: 100, borderRadius: 8, marginBottom: 10, backgroundColor: '#000' },
  productContent: { gap: 2 },
  productCategory: { fontSize: 9, color: COLORS.textSecondary, textTransform: 'uppercase', fontWeight: 'bold' },
  productTitle: { color: COLORS.textLight, fontSize: 14, fontWeight: 'bold' },
  productPrice: { color: COLORS.primary, fontSize: 14, fontWeight: 'bold', marginTop: 2 },

  bottomNav: { position: 'absolute', bottom: 20, left: 20, right: 20, height: 70, backgroundColor: 'rgba(30,30,30,0.95)', borderRadius: 20, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', shadowColor: '#000', shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.5, shadowRadius: 20 },
  fabBtn: { top: -25, backgroundColor: COLORS.primary, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: COLORS.background, shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 10 }
});
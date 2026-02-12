// src/data/mockData.js

// --- DADOS DO CLIENTE (SERVIÇOS E HORÁRIOS) ---

export const SERVICES = [
  { id: '1', title: "Corte Clássico", price: 45, duration: 30, icon: "content-cut", category: "Cabelo" },
  { id: '2', title: "Corte Infantil", price: 40, duration: 45, icon: "face", category: "Cabelo" },
  { id: '3', title: "Degradê Navalhado", price: 60, duration: 45, icon: "content-cut", category: "Cabelo" },
  { id: '4', title: "Barba Navalhada", price: 40, duration: 35, icon: "content-cut", category: "Barba" },
  { id: '5', title: "Barboterapia", price: 55, duration: 45, icon: "spa", category: "Barba" },
  { id: '6', title: "Combo (Cabelo + Barba)", price: 95, duration: 90, icon: "star", category: "Combos" },
];

export const AVAILABLE_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", 
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "18:00", "19:00"
];

export const BARBERS = [
  { id: 1, name: 'Gustavo', role: 'Master Barber', img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=150&q=80' },
  { id: 2, name: 'Marcus', role: 'Estilista', img: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&w=150&q=80' },
  { id: 3, name: 'Felipe', role: 'Barbeiro', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
];

// --- DADOS DO ADMINISTRADOR (DASHBOARD) ---

// ... (Mantenha SERVICES, AVAILABLE_SLOTS, CALENDAR_AVAILABILITY, PRODUCTS)

export const ADMIN_STATS = {
  monthlyRevenue: 4250.00,
  totalCuts: 85,
  dailyRevenue: 450.00,
  averageTicket: 50.00, // Novo dado interessante
  bestService: 'Degradê Navalhado'
};

// Adicionamos o campo 'date' e 'dateLabel' para ficar claro
export const TODAY_APPOINTMENTS = [
  { id: 1, client: "João Silva", service: "Corte Clássico", date: '2026-10-14', time: "09:00", status: "confirmed", price: 45 },
  { id: 2, client: "Pedro Santos", service: "Barba + Corte", date: '2026-10-14', time: "10:00", status: "confirmed", price: 80 },
  { id: 3, client: "Lucas M.", service: "Degradê", date: '2026-10-15', time: "14:00", status: "pending", price: 50 }, // Data Futura
  { id: 4, client: "Matheus O.", service: "Barboterapia", date: '2026-10-14', time: "14:00", status: "pending", price: 55 }, // Hoje
];

// ... (Mantenha todo o código anterior de SERVICES, AVAILABLE_SLOTS, BARBERS, ETC)

// --- DADOS DA LOJA (GUSTAVO STORE) ---
export const PRODUCTS = [
  { 
    id: 1, 
    title: 'iPhone 12 Pro', 
    price: 2800.00, 
    img: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=200&q=80',
    category: 'Eletrônicos'
  },
  { 
    id: 2, 
    title: 'AirPods Pro', 
    price: 1200.00, 
    img: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=200&q=80',
    category: 'Acessórios'
  },
  { 
    id: 3, 
    title: 'Sauvage Dior', 
    price: 650.00, 
    img: 'https://images.unsplash.com/photo-1594035910387-fea4779426e9?auto=format&fit=crop&w=200&q=80',
    category: 'Perfumes'
  },
  { 
    id: 4, 
    title: 'JBL Flip 6', 
    price: 600.00, 
    img: 'https://images.unsplash.com/photo-1612444530582-fc66183b16f7?auto=format&fit=crop&w=200&q=80',
    category: 'Áudio'
  },
];

// ... (Mantenha o código anterior de SERVICES, PRODUCTS, ETC)

// Dicionário de Agendas: A chave é o dia (ex: '14'), o valor são os slots livres
export const CALENDAR_AVAILABILITY = {
  '14': ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "15:00"], // Dia livre
  '15': ["18:00", "18:30"], // Dia quase cheio (só final do dia)
  '16': ["09:00", "15:00"], // Dia cheio de buracos (ruim para serviços longos)
  '17': ["09:00", "09:30", "10:00", "13:00", "13:30", "14:00", "14:30", "15:00"], // Dia ótimo
  '18': [], // Barbeiro de folga (Vazio)
  '19': ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"] // Sábado manhã livre
};
// ... (Mantenha todo o resto igual)

export const CLIENTS = [
  { 
    id: 'u1', 
    name: 'João Silva', 
    phone: '11 99999-1111', 
    email: 'joao@email.com', 
    avatar: 'https://ui-avatars.com/api/?name=Joao+Silva&background=D4A373&color=fff',
    lastVisit: '10/10/2026',
    totalVisits: 12, // <--- NOVO: Quantidade total
    upcomingAppt: '24/10 às 14:00', // <--- NOVO: Tem agendamento futuro
    notes: 'Gosta da lateral bem baixa (Zero).'
  },
  { 
    id: 'u2', 
    name: 'Pedro Santos', 
    phone: '11 98888-2222', 
    email: 'pedro.s@email.com',
    avatar: 'https://ui-avatars.com/api/?name=Pedro+Santos&background=4CAF50&color=fff', 
    lastVisit: '05/10/2026',
    totalVisits: 3, // <--- NOVO
    upcomingAppt: null, // <--- NOVO: Não tem agendamento
    notes: 'Alergia a lâmina, usar shaver.'
  },
  { 
    id: 'u3', 
    name: 'João Silva', // Nome duplicado propositalmente para teste
    phone: '11 97777-3333', 
    email: 'joao.junior@email.com',
    avatar: 'https://ui-avatars.com/api/?name=Joao+Junior&background=2196F3&color=fff',
    lastVisit: 'Nunca veio',
    notes: 'Novo cliente.'
  },
  { 
    id: 'u4', 
    name: 'Lucas Mendes', 
    phone: '21 96666-4444', 
    email: 'lucas@email.com',
    avatar: 'https://ui-avatars.com/api/?name=Lucas+Mendes&background=9C27B0&color=fff',
    lastVisit: '12/10/2026',
    notes: ''
  },
];
// ... (Mantenha o resto igual)

// DADOS PARA TESTE DE RELATÓRIO (Histórico de 30 dias atrás)
export const HISTORY_APPOINTMENTS = [
    { id: 'h1', date: '2026-09-10', price: 50, status: 'confirmed', service: 'Corte Clássico', client: 'João Silva' },
    { id: 'h2', date: '2026-09-12', price: 90, status: 'confirmed', service: 'Corte + Barba', client: 'Pedro Santos' },
    { id: 'h3', date: '2026-09-15', price: 50, status: 'cancelled', service: 'Corte Clássico', client: 'Lucas Mendes' },
    { id: 'h4', date: '2026-10-01', price: 45, status: 'confirmed', service: 'Barba', client: 'João Silva' },
    { id: 'h5', date: '2026-10-02', price: 120, status: 'confirmed', service: 'Platinado', client: 'Marcos Paulo' },
    { id: 'h6', date: '2026-10-05', price: 50, status: 'confirmed', service: 'Corte Clássico', client: 'Pedro Santos' },
    { id: 'h7', date: '2026-10-05', price: 50, status: 'confirmed', service: 'Corte Clássico', client: 'André Luiz' },
  // ... adicione mais se quiser brincar
];
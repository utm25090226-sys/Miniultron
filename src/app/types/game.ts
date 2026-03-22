export interface ClothingItem {
  id: string;
  name: string;
  type: "hat" | "shirt" | "shoes" | "accessory";
  cost: number;
  icon: string;
}

export interface RobotStats {
  clothing: string[]; // IDs de las prendas equipadas
}

export interface GameState {
  coins: number;
  stats: RobotStats;
  missionsCompleted: number;
  lastPlayedTime: number;
  purchasedClothing: string[]; // IDs de todas las prendas compradas
}

export const CLOTHING_ITEMS: ClothingItem[] = [
  // Sombreros
  { id: "hat1", name: "Gorra Básica", type: "hat", cost: 100, icon: "🧢" },
  { id: "hat2", name: "Sombrero de Copa", type: "hat", cost: 200, icon: "🎩" },
  { id: "hat3", name: "Corona Real", type: "hat", cost: 500, icon: "👑" },
  { id: "hat4", name: "Casco Espacial", type: "hat", cost: 800, icon: "🪖" },
  
  // Camisas
  { id: "shirt1", name: "Camiseta Deportiva", type: "shirt", cost: 150, icon: "👕" },
  { id: "shirt2", name: "Camisa Elegante", type: "shirt", cost: 300, icon: "👔" },
  { id: "shirt3", name: "Armadura Básica", type: "shirt", cost: 600, icon: "🦺" },
  { id: "shirt4", name: "Traje de Súper Héroe", type: "shirt", cost: 1000, icon: "🦸" },
  
  // Zapatos
  { id: "shoes1", name: "Zapatillas Básicas", type: "shoes", cost: 120, icon: "👟" },
  { id: "shoes2", name: "Botas de Trabajo", type: "shoes", cost: 250, icon: "🥾" },
  { id: "shoes3", name: "Zapatos de Lujo", type: "shoes", cost: 450, icon: "👞" },
  { id: "shoes4", name: "Botas Cohete", type: "shoes", cost: 900, icon: "🚀" },
  
  // Accesorios
  { id: "acc1", name: "Gafas de Sol", type: "accessory", cost: 180, icon: "🕶️" },
  { id: "acc2", name: "Reloj Inteligente", type: "accessory", cost: 350, icon: "⌚" },
  { id: "acc3", name: "Mochila Jet", type: "accessory", cost: 700, icon: "🎒" },
  { id: "acc4", name: "Alas de Energía", type: "accessory", cost: 1200, icon: "🪽" },
];

export const INITIAL_STATE: GameState = {
  coins: 0,
  stats: {
    clothing: [],
  },
  missionsCompleted: 0,
  lastPlayedTime: Date.now(),
  purchasedClothing: [],
};
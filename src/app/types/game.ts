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
  { id: "hat5", name: "Sombrero de Vaquero", type: "hat", cost: 350, icon: "🤠" },
  { id: "hat6", name: "Gorro de Santa", type: "hat", cost: 400, icon: "🎅" },
  { id: "hat7", name: "Sombrero de Mago", type: "hat", cost: 600, icon: "🧙" },
  { id: "hat8", name: "Casco de Ninja", type: "hat", cost: 750, icon: "🥷" },

  // Camisas
  { id: "shirt1", name: "Camiseta Deportiva", type: "shirt", cost: 150, icon: "👕" },
  { id: "shirt2", name: "Camisa Elegante", type: "shirt", cost: 300, icon: "👔" },
  { id: "shirt3", name: "Armadura Básica", type: "shirt", cost: 600, icon: "🦺" },
  { id: "shirt4", name: "Traje de Súper Héroe", type: "shirt", cost: 1000, icon: "🦸" },
  { id: "shirt5", name: "Chaleco Formal", type: "shirt", cost: 450, icon: "🤵" },
  { id: "shirt6", name: "Traje de Astronauta", type: "shirt", cost: 950, icon: "🧑‍🚀" },
  { id: "shirt7", name: "Kimono Ninja", type: "shirt", cost: 800, icon: "🥋" },
  { id: "shirt8", name: "Camiseta de Pirata", type: "shirt", cost: 550, icon: "🏴‍☠️" },

  // Zapatos
  { id: "shoes1", name: "Zapatillas Básicas", type: "shoes", cost: 120, icon: "👟" },
  { id: "shoes2", name: "Botas de Trabajo", type: "shoes", cost: 250, icon: "🥾" },
  { id: "shoes3", name: "Zapatos de Lujo", type: "shoes", cost: 450, icon: "👞" },
  { id: "shoes4", name: "Botas Cohete", type: "shoes", cost: 900, icon: "🚀" },
  { id: "shoes5", name: "Sandalias", type: "shoes", cost: 80, icon: "🩴" },
  { id: "shoes6", name: "Botas de Vaquero", type: "shoes", cost: 400, icon: "🤠" },
  { id: "shoes7", name: "Zapatos Deportivos", type: "shoes", cost: 320, icon: "⚽" },
  { id: "shoes8", name: "Botas de Nieve", type: "shoes", cost: 500, icon: "⛷️" },

  // Accesorios
  { id: "acc1", name: "Gafas de Sol", type: "accessory", cost: 180, icon: "🕶️" },
  { id: "acc2", name: "Reloj Inteligente", type: "accessory", cost: 350, icon: "⌚" },
  { id: "acc3", name: "Mochila Jet", type: "accessory", cost: 700, icon: "🎒" },
  { id: "acc4", name: "Alas de Energía", type: "accessory", cost: 1200, icon: "🪽" },
  { id: "acc5", name: "Collar de Diamantes", type: "accessory", cost: 850, icon: "💎" },
  { id: "acc6", name: "Audífonos Gaming", type: "accessory", cost: 420, icon: "🎧" },
  { id: "acc7", name: "Espada Láser", type: "accessory", cost: 1100, icon: "⚔️" },
  { id: "acc8", name: "Escudo Energético", type: "accessory", cost: 950, icon: "🛡️" },
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
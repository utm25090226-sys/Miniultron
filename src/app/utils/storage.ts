import { GameState, INITIAL_STATE } from "../types/game";

const STORAGE_KEY = "miniultron_game_state";

export const loadGameState = (): GameState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading game state:", error);
  }
  return INITIAL_STATE;
};

export const saveGameState = (state: GameState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving game state:", error);
  }
};

export const addCoins = (amount: number): void => {
  const state = loadGameState();
  state.coins += amount;
  state.missionsCompleted += 1;
  state.lastPlayedTime = Date.now();
  saveGameState(state);
};

export const purchaseClothing = (itemId: string, cost: number): boolean => {
  const state = loadGameState();
  if (state.coins >= cost && !state.purchasedClothing.includes(itemId)) {
    state.coins -= cost;
    state.purchasedClothing.push(itemId);
    saveGameState(state);
    return true;
  }
  return false;
};

export const equipClothing = (itemId: string): void => {
  const state = loadGameState();
  if (state.purchasedClothing.includes(itemId)) {
    if (!state.stats.clothing.includes(itemId)) {
      state.stats.clothing.push(itemId);
    }
    saveGameState(state);
  }
};

export const unequipClothing = (itemId: string): void => {
  const state = loadGameState();
  state.stats.clothing = state.stats.clothing.filter(id => id !== itemId);
  saveGameState(state);
};
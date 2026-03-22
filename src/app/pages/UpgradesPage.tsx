import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { RobotDisplay } from "../components/RobotDisplay";
import { loadGameState, purchaseClothing, equipClothing, unequipClothing, saveGameState } from "../utils/storage";
import { GameState, CLOTHING_ITEMS, ClothingItem } from "../types/game";
import { Home, Coins, ShoppingBag, Check } from "lucide-react";

export default function UpgradesPage() {
  const [gameState, setGameState] = useState<GameState>(loadGameState());
  const [selectedTab, setSelectedTab] = useState<"hat" | "shirt" | "shoes" | "accessory">("hat");
  const navigate = useNavigate();

  useEffect(() => {
    setGameState(loadGameState());
  }, []);

  const handlePurchase = (item: ClothingItem) => {
    if (purchaseClothing(item.id, item.cost)) {
      equipClothing(item.id);
      setGameState(loadGameState());
    }
  };

  const handleToggleEquip = (itemId: string) => {
    const state = loadGameState();
    if (state.stats.clothing.includes(itemId)) {
      unequipClothing(itemId);
    } else {
      // Desequipar cualquier otra prenda del mismo tipo
      const item = CLOTHING_ITEMS.find(i => i.id === itemId);
      if (item) {
        const sameTypeItems = CLOTHING_ITEMS.filter(i => i.type === item.type);
        sameTypeItems.forEach(i => {
          if (state.stats.clothing.includes(i.id)) {
            unequipClothing(i.id);
          }
        });
      }
      equipClothing(itemId);
    }
    setGameState(loadGameState());
  };

  const tabs = [
    { id: "hat" as const, name: "Sombreros", icon: "🎩" },
    { id: "shirt" as const, name: "Camisas", icon: "👕" },
    { id: "shoes" as const, name: "Zapatos", icon: "👟" },
    { id: "accessory" as const, name: "Accesorios", icon: "🕶️" },
  ];

  const itemsForTab = CLOTHING_ITEMS.filter(item => item.type === selectedTab);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-300 to-emerald-200 flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur rounded-3xl p-4 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate("/")}
              className="bg-slate-200 hover:bg-slate-300 rounded-full p-3 transition-colors"
            >
              <Home className="size-5" />
            </button>
            <div className="text-center">
              <div className="font-bold text-xl">Tienda de Ropa</div>
            </div>
            <div className="size-11" />
          </div>

          <div className="flex items-center justify-center gap-2 bg-yellow-100 rounded-2xl p-3">
            <Coins className="size-6 text-yellow-600" />
            <span className="font-bold text-2xl">{gameState.coins}</span>
            <span className="text-sm text-slate-600">monedas</span>
          </div>
        </div>

        {/* Robot Preview */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white/50 backdrop-blur rounded-3xl p-6 mb-6 shadow-xl"
        >
          <RobotDisplay stats={gameState.stats} isHappy={true} />
          <div className="text-center mt-4">
            <p className="text-sm text-slate-600">
              {gameState.stats.clothing.length} prendas equipadas
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTab(tab.id)}
              className={`rounded-2xl p-3 font-bold transition-all ${
                selectedTab === tab.id
                  ? "bg-white shadow-lg"
                  : "bg-white/50"
              }`}
            >
              <div className="text-2xl mb-1">{tab.icon}</div>
              <div className="text-xs">{tab.name}</div>
            </motion.button>
          ))}
        </div>

        {/* Items List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {itemsForTab.map((item, index) => {
            const isPurchased = gameState.purchasedClothing.includes(item.id);
            const isEquipped = gameState.stats.clothing.includes(item.id);
            const canAfford = gameState.coins >= item.cost;

            return (
              <motion.div
                key={item.id}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg ${
                  isEquipped ? "ring-2 ring-green-500" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="text-5xl">{item.icon}</div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="font-bold text-lg mb-1">{item.name}</div>
                    
                    {isPurchased ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleToggleEquip(item.id)}
                        className={`w-full rounded-xl px-4 py-2 font-bold flex items-center justify-center gap-2 ${
                          isEquipped
                            ? "bg-green-500 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="size-5" />
                            Equipado
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="size-5" />
                            Equipar
                          </>
                        )}
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: canAfford ? 1.02 : 1 }}
                        whileTap={{ scale: canAfford ? 0.98 : 1 }}
                        onClick={() => handlePurchase(item)}
                        disabled={!canAfford}
                        className={`w-full rounded-xl px-4 py-2 font-bold flex items-center justify-center gap-2 ${
                          canAfford
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <Coins className="size-5" />
                        <span>{item.cost}</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Info card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-white/80 backdrop-blur rounded-2xl p-4 shadow-lg text-center"
        >
          <p className="text-sm text-slate-600">
            Completa misiones para ganar monedas y comprar ropa para MiniUltron
          </p>
        </motion.div>
      </div>
    </div>
  );
}

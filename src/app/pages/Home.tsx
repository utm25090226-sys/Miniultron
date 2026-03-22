import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { RobotDisplay } from "../components/RobotDisplay";
import { loadGameState } from "../utils/storage";
import { GameState } from "../types/game";
import { Gamepad2, TrendingUp, Coins, Puzzle, Zap, Bird, Grid3x3, Skull, Blocks, Lightbulb, Sparkles } from "lucide-react";

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(loadGameState());
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(loadGameState());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const missions = [
    {
      name: "Puzzle de Memoria",
      icon: Puzzle,
      reward: 50,
      path: "/puzzle",
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
    {
      name: "Esquivar Objetos",
      icon: Zap,
      reward: 75,
      path: "/dodge",
      color: "bg-gradient-to-br from-orange-500 to-red-500",
    },
    {
      name: "Flappy Bird",
      icon: Bird,
      reward: 80,
      path: "/flappy",
      color: "bg-gradient-to-br from-sky-500 to-blue-500",
    },
    {
      name: "3 en Línea",
      icon: Grid3x3,
      reward: 60,
      path: "/tictactoe",
      color: "bg-gradient-to-br from-indigo-500 to-purple-500",
    },
    {
      name: "Snake",
      icon: Skull,
      reward: 70,
      path: "/snake",
      color: "bg-gradient-to-br from-green-500 to-emerald-500",
    },
    {
      name: "Breakout",
      icon: Blocks,
      reward: 90,
      path: "/breakout",
      color: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
    },
    {
      name: "Simon Dice",
      icon: Lightbulb,
      reward: 100,
      path: "/simon",
      color: "bg-gradient-to-br from-rose-500 to-pink-500",
    },
    {
      name: "Atrapa Estrellas",
      icon: Sparkles,
      reward: 85,
      path: "/catch",
      color: "bg-gradient-to-br from-cyan-500 to-blue-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-blue-300 to-blue-200 flex flex-col items-center p-4">
      {/* Header con stats */}
      <div className="w-full max-w-md">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur rounded-3xl p-4 shadow-lg mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="size-6 text-yellow-500" />
              <span className="font-bold text-2xl">{gameState.coins}</span>
            </div>
            <div className="text-sm text-slate-600">
              Misiones: {gameState.missionsCompleted}
            </div>
          </div>
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-4xl font-bold text-center mb-6 text-white drop-shadow-lg"
        >
          MiniUltron
        </motion.h1>

        {/* Robot Display */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/50 backdrop-blur rounded-3xl p-8 mb-6 shadow-xl"
        >
          <RobotDisplay stats={gameState.stats} />
          <div className="text-center mt-4">
            <p className="text-sm text-slate-600">
              {gameState.stats.clothing.length} prendas equipadas
            </p>
          </div>
        </motion.div>

        {/* Botones de acción */}
        <div className="space-y-3">
          {missions.map((mission, index) => (
            <motion.button
              key={mission.path}
              initial={{ x: index % 2 === 0 ? -100 : 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(mission.path)}
              className={`w-full ${mission.color} text-white rounded-2xl p-4 shadow-lg flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <mission.icon className="size-8" />
                <div className="text-left">
                  <div className="font-bold">{mission.name}</div>
                  <div className="text-sm opacity-90">+{mission.reward} monedas</div>
                </div>
              </div>
              <Gamepad2 className="size-6" />
            </motion.button>
          ))}

          <motion.button
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/upgrades")}
            className="w-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="size-8" />
              <div className="text-left">
                <div className="font-bold">Tienda de Ropa</div>
                <div className="text-sm opacity-90">Personaliza a tu oso</div>
              </div>
            </div>
            <Coins className="size-6" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
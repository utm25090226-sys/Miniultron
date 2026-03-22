import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { addCoins } from "../utils/storage";
import { Home, Trophy } from "lucide-react";

type Color = "red" | "blue" | "green" | "yellow";

const COLORS: Color[] = ["red", "blue", "green", "yellow"];

const COLOR_STYLES = {
  red: "bg-red-500 hover:bg-red-600 active:bg-red-700",
  blue: "bg-blue-500 hover:bg-blue-600 active:bg-blue-700",
  green: "bg-green-500 hover:bg-green-600 active:bg-green-700",
  yellow: "bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600",
};

const COLOR_GLOW = {
  red: "shadow-[0_0_30px_rgba(239,68,68,0.8)]",
  blue: "shadow-[0_0_30px_rgba(59,130,246,0.8)]",
  green: "shadow-[0_0_30px_rgba(34,197,94,0.8)]",
  yellow: "shadow-[0_0_30px_rgba(250,204,21,0.8)]",
};

export default function SimonGame() {
  const navigate = useNavigate();
  const [sequence, setSequence] = useState<Color[]>([]);
  const [playerSequence, setPlayerSequence] = useState<Color[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeColor, setActiveColor] = useState<Color | null>(null);
  const [round, setRound] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [canClick, setCanClick] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Crear contexto de audio para sonidos
    audioContextRef.current = new AudioContext();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playSound = (color: Color) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const frequencies = {
      red: 329.63,
      blue: 261.63,
      green: 392.0,
      yellow: 440.0,
    };

    oscillator.frequency.value = frequencies[color];
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  };

  const startGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setRound(0);
    setIsGameOver(false);
    setIsPlaying(true);
    nextRound([]);
  };

  const nextRound = (currentSequence: Color[]) => {
    const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newSequence = [...currentSequence, newColor];
    setSequence(newSequence);
    setPlayerSequence([]);
    setRound(newSequence.length);
    showSequence(newSequence);
  };

  const showSequence = async (seq: Color[]) => {
    setIsShowingSequence(true);
    setCanClick(false);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    for (let i = 0; i < seq.length; i++) {
      const color = seq[i];
      setActiveColor(color);
      playSound(color);
      await new Promise((resolve) => setTimeout(resolve, 400));
      setActiveColor(null);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    setIsShowingSequence(false);
    setCanClick(true);
  };

  const handleColorClick = (color: Color) => {
    if (!canClick || isShowingSequence) return;

    setActiveColor(color);
    playSound(color);
    setTimeout(() => setActiveColor(null), 300);

    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);

    const currentIndex = newPlayerSequence.length - 1;

    if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
      // Error!
      endGame();
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      // Ronda completada!
      setCanClick(false);
      setTimeout(() => {
        nextRound(sequence);
      }, 1000);
    }
  };

  const endGame = () => {
    setIsPlaying(false);
    setIsGameOver(true);
    setCanClick(false);
    const reward = (round - 1) * 20;
    addCoins(reward);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur rounded-3xl p-4 shadow-lg mb-6 flex justify-between items-center">
          <button
            onClick={() => {
              if (isPlaying) {
                const reward = (round - 1) * 20;
                addCoins(reward);
              }
              navigate("/");
            }}
            className="bg-slate-200 hover:bg-slate-300 rounded-full p-3 transition-colors"
          >
            <Home className="size-5" />
          </button>
          <div className="text-center">
            <div className="font-bold text-xl">Simon Dice</div>
            <div className="text-sm text-slate-600">Nivel: {round}</div>
          </div>
          <div className="size-11" />
        </div>

        {/* Game Board */}
        <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl mb-4">
          {/* Status */}
          <div className="text-center mb-6">
            {isShowingSequence ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white text-lg font-bold"
              >
                Observa la secuencia...
              </motion.p>
            ) : canClick ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-400 text-lg font-bold"
              >
                ¡Tu turno!
              </motion.p>
            ) : (
              <p className="text-slate-400 text-lg">Simon Dice...</p>
            )}
          </div>

          {/* Color Grid */}
          <div className="grid grid-cols-2 gap-4">
            {COLORS.map((color) => (
              <motion.button
                key={color}
                whileTap={{ scale: canClick ? 0.95 : 1 }}
                onClick={() => handleColorClick(color)}
                disabled={!canClick}
                className={`aspect-square rounded-3xl ${COLOR_STYLES[color]} transition-all duration-150 ${
                  activeColor === color ? `${COLOR_GLOW[color]} scale-95` : "shadow-xl"
                }`}
              />
            ))}
          </div>

          {/* Progress indicator */}
          <div className="mt-6 flex gap-1 justify-center">
            {sequence.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index < playerSequence.length
                    ? "w-3 bg-green-400"
                    : "w-2 bg-slate-600"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Start Button */}
        {!isPlaying && !isGameOver && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-4 font-bold shadow-lg"
          >
            Comenzar Juego
          </motion.button>
        )}

        {/* Instructions */}
        {!isPlaying && !isGameOver && (
          <div className="mt-4 bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
            <p className="text-white text-sm">
              Memoriza la secuencia de colores y repítela correctamente
            </p>
          </div>
        )}
      </div>

      {/* Modal de Game Over */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <Trophy className="size-20 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">¡Juego Terminado!</h2>
              <p className="text-slate-600 mb-2">Llegaste al nivel: {round}</p>
              <p className="text-2xl font-bold text-green-500 mb-6">
                +{(round - 1) * 20} monedas
              </p>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsGameOver(false);
                    startGame();
                  }}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-4 font-bold shadow-lg"
                >
                  Jugar de Nuevo
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/")}
                  className="w-full bg-slate-200 text-slate-700 rounded-2xl p-4 font-bold"
                >
                  Volver a Casa
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

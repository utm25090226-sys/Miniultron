import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { addCoins } from "../utils/storage";
import { Home, Trophy, Heart } from "lucide-react";

interface FallingItem {
  id: number;
  x: number;
  y: number;
  type: "good" | "bad";
  icon: string;
}

const GAME_WIDTH = 320;
const GAME_HEIGHT = 500;
const PLAYER_SIZE = 50;
const ITEM_SIZE = 30;
const GOOD_ITEMS = ["⭐", "💎", "🌟", "✨", "💫", "🔮"];
const BAD_ITEMS = ["💣", "☠️", "⚠️", "💥"];

export default function CatchGame() {
  const navigate = useNavigate();
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_SIZE / 2);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [speed, setSpeed] = useState(200);

  const gameLoopRef = useRef<number>();
  const itemCounterRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const spawnTimerRef = useRef(0);
  const speedIncreaseTimerRef = useRef(0);

  useEffect(() => {
    if (isPlaying && !isGameOver) {
      startGameLoop();
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, isGameOver]);

  const startGame = () => {
    setPlayerX(GAME_WIDTH / 2 - PLAYER_SIZE / 2);
    setItems([]);
    setScore(0);
    setLives(3);
    setSpeed(200);
    setIsPlaying(true);
    setIsGameOver(false);
    itemCounterRef.current = 0;
    lastTimeRef.current = Date.now();
    spawnTimerRef.current = 0;
    speedIncreaseTimerRef.current = 0;
  };

  const startGameLoop = () => {
    const loop = () => {
      if (!isPlaying || isGameOver) return;

      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Aumentar velocidad gradualmente cada 5 segundos
      speedIncreaseTimerRef.current += deltaTime;
      if (speedIncreaseTimerRef.current > 5) {
        speedIncreaseTimerRef.current = 0;
        setSpeed((s) => Math.min(s + 50, 600));
      }

      // Spawn items
      spawnTimerRef.current += deltaTime;
      const spawnRate = Math.max(0.3, 0.9 - score * 0.01);

      if (spawnTimerRef.current > spawnRate) {
        spawnTimerRef.current = 0;
        const isGood = Math.random() > 0.25; // 75% buenos, 25% malos
        const newItem: FallingItem = {
          id: itemCounterRef.current++,
          x: Math.random() * (GAME_WIDTH - ITEM_SIZE),
          y: -ITEM_SIZE,
          type: isGood ? "good" : "bad",
          icon: isGood
            ? GOOD_ITEMS[Math.floor(Math.random() * GOOD_ITEMS.length)]
            : BAD_ITEMS[Math.floor(Math.random() * BAD_ITEMS.length)],
        };
        setItems((prev) => [...prev, newItem]);
      }

      // Actualizar posición de items y verificar colisiones
      setItems((prevItems) => {
        const playerCenterX = playerX + PLAYER_SIZE / 2;
        const playerY = GAME_HEIGHT - PLAYER_SIZE - 10;

        const itemsToKeep: FallingItem[] = [];

        for (const item of prevItems) {
          // Actualizar posición Y
          const newY = item.y + speed * deltaTime;

          // Si el item salió de la pantalla, no lo mantenemos
          if (newY > GAME_HEIGHT) {
            continue;
          }

          const itemCenterX = item.x + ITEM_SIZE / 2;
          const itemCenterY = newY + ITEM_SIZE / 2;

          const distance = Math.sqrt(
            Math.pow(playerCenterX - itemCenterX, 2) +
              Math.pow(playerY + PLAYER_SIZE / 2 - itemCenterY, 2)
          );

          // Colisión más generosa
          if (distance < (PLAYER_SIZE + ITEM_SIZE) / 1.8) {
            if (item.type === "good") {
              setScore((s) => s + 1);
            } else {
              setLives((l) => {
                const newLives = l - 1;
                if (newLives <= 0) {
                  endGame();
                }
                return newLives;
              });
            }
            // No agregar este item (fue capturado)
          } else {
            // Mantener items que no fueron capturados y están en pantalla
            itemsToKeep.push({ ...item, y: newY });
          }
        }

        return itemsToKeep;
      });

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
  };

  const endGame = () => {
    setIsPlaying(false);
    setIsGameOver(true);
    const reward = Math.floor(score * 6);
    addCoins(reward);
  };

  const movePlayer = (clientX: number) => {
    const rect = document.getElementById("game-area")?.getBoundingClientRect();
    if (!rect) return;

    const x = clientX - rect.left;
    const newX = Math.max(0, Math.min(GAME_WIDTH - PLAYER_SIZE, x - PLAYER_SIZE / 2));
    setPlayerX(newX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPlaying) {
      movePlayer(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPlaying && e.touches[0]) {
      e.preventDefault();
      movePlayer(e.touches[0].clientX);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-400 via-blue-300 to-cyan-200 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur rounded-3xl p-4 shadow-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => navigate("/")}
              className="bg-slate-200 hover:bg-slate-300 rounded-full p-3 transition-colors"
            >
              <Home className="size-5" />
            </button>
            <div className="text-center">
              <div className="font-bold text-xl">Atrapa Estrellas</div>
              <div className="text-sm text-slate-600">Puntos: {score}</div>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: lives }).map((_, i) => (
                <Heart key={i} className="size-5 text-red-500 fill-red-500" />
              ))}
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div
          id="game-area"
          className="relative bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 rounded-3xl shadow-lg overflow-hidden cursor-none touch-none"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
        >
          {/* Estrellas de fondo */}
          <div className="absolute inset-0">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  opacity: Math.random() * 0.5 + 0.3,
                }}
              />
            ))}
          </div>

          {/* Items cayendo */}
          {items.map((item) => (
            <motion.div
              key={item.id}
              className="absolute text-2xl pointer-events-none"
              style={{
                left: item.x,
                top: item.y,
                width: ITEM_SIZE,
                height: ITEM_SIZE,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              {item.icon}
            </motion.div>
          ))}

          {/* Jugador */}
          <motion.div
            className="absolute rounded-full flex items-center justify-center text-3xl shadow-lg"
            style={{
              left: playerX,
              bottom: 10,
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
            animate={{
              y: isPlaying ? [0, -5, 0] : 0,
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🤖
          </motion.div>

          {/* Overlay de inicio */}
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl px-8 py-4 font-bold text-xl shadow-lg mb-4"
                >
                  Comenzar
                </motion.button>
                <p className="text-white text-sm px-4">
                  Atrapa ⭐ buenas, evita 💣 malas
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-lg">
          <p className="text-sm text-slate-600">
            Velocidad: x{(speed / 200).toFixed(1)} • Atrapa estrellas y evita bombas
          </p>
        </div>
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
              <p className="text-slate-600 mb-2">Estrellas atrapadas: {score}</p>
              <p className="text-2xl font-bold text-green-500 mb-6">
                +{Math.floor(score * 6)} monedas
              </p>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsGameOver(false);
                    startGame();
                  }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl p-4 font-bold shadow-lg"
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

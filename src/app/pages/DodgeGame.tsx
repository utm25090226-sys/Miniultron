import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { addCoins } from "../utils/storage";
import { Home, Trophy, Heart } from "lucide-react";

interface FallingObject {
  id: number;
  x: number;
  y: number;
  type: string;
}

const GAME_WIDTH = 320;
const GAME_HEIGHT = 500;
const PLAYER_SIZE = 40;
const OBJECT_SIZE = 30;
const MAX_SCORE = 10000;
const OBJECTS = ["⚠️", "💥", "🔥", "⚡", "🌩️", "💣", "☄️", "🧨"];
const MAX_LIVES = 3;
const HIT_COOLDOWN = 1.5; // 1.5 segundos de invencibilidad

export default function DodgeGame() {
  const navigate = useNavigate();
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_SIZE / 2);
  const [objects, setObjects] = useState<FallingObject[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [speed, setSpeed] = useState(150);
  const [isInvincible, setIsInvincible] = useState(false);
  
  const gameLoopRef = useRef<number>();
  const objectCounterRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const spawnTimerRef = useRef(0);
  const speedIncreaseTimerRef = useRef(0);
  const invincibilityTimerRef = useRef(0);
  
  // Refs para sincronización
  const playerXRef = useRef(playerX);
  const livesRef = useRef(MAX_LIVES);
  const isInvincibleRef = useRef(false);

  useEffect(() => {
    playerXRef.current = playerX;
  }, [playerX]);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  useEffect(() => {
    isInvincibleRef.current = isInvincible;
  }, [isInvincible]);

  useEffect(() => {
    if (isPlaying) {
      startGameLoop();
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying]);

  const startGame = () => {
    setPlayerX(GAME_WIDTH / 2 - PLAYER_SIZE / 2);
    setObjects([]);
    setScore(0);
    setLives(MAX_LIVES);
    setSpeed(150);
    setIsPlaying(true);
    setIsGameOver(false);
    setIsVictory(false);
    setIsInvincible(false);
    objectCounterRef.current = 0;
    lastTimeRef.current = Date.now();
    spawnTimerRef.current = 0;
    speedIncreaseTimerRef.current = 0;
    invincibilityTimerRef.current = 0;
  };

  const startGameLoop = () => {
    const loop = () => {
      if (!isPlaying || isGameOver) return;

      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Manejar cooldown de invencibilidad
      if (isInvincibleRef.current) {
        invincibilityTimerRef.current += deltaTime;
        if (invincibilityTimerRef.current >= HIT_COOLDOWN) {
          setIsInvincible(false);
          invincibilityTimerRef.current = 0;
        }
      }

      // Aumentar velocidad gradualmente cada 3 segundos
      speedIncreaseTimerRef.current += deltaTime;
      if (speedIncreaseTimerRef.current > 3) {
        speedIncreaseTimerRef.current = 0;
        setSpeed((s) => Math.min(s + 30, 600));
      }

      // Spawn objetos
      spawnTimerRef.current += deltaTime;
      const spawnRate = Math.max(0.2, 1.0 - score * 0.001);
      
      if (spawnTimerRef.current > spawnRate) {
        spawnTimerRef.current = 0;
        const newObject: FallingObject = {
          id: objectCounterRef.current++,
          x: Math.random() * (GAME_WIDTH - OBJECT_SIZE),
          y: -OBJECT_SIZE,
          type: OBJECTS[Math.floor(Math.random() * OBJECTS.length)],
        };
        setObjects((prev) => [...prev, newObject]);
      }

      // Actualizar posición de objetos
      setObjects((prev) => {
        const updated = prev.map((obj) => ({
          ...obj,
          y: obj.y + speed * deltaTime,
        }));

        // Verificar colisiones solo si NO es invencible
        if (!isInvincibleRef.current) {
          const playerCenterX = playerXRef.current + PLAYER_SIZE / 2;
          const playerCenterY = GAME_HEIGHT - PLAYER_SIZE - 10 + PLAYER_SIZE / 2;

          for (const obj of updated) {
            const objCenterX = obj.x + OBJECT_SIZE / 2;
            const objCenterY = obj.y + OBJECT_SIZE / 2;

            const distance = Math.sqrt(
              Math.pow(playerCenterX - objCenterX, 2) +
                Math.pow(playerCenterY - objCenterY, 2)
            );

            if (distance < (PLAYER_SIZE + OBJECT_SIZE) / 2.2) {
              // ¡GOLPEADO! Pero NO muere inmediatamente
              const newLives = livesRef.current - 1;
              setLives(newLives);
              setIsInvincible(true);
              invincibilityTimerRef.current = 0;

              if (newLives <= 0) {
                endGame();
                return prev;
              }
              break; // Solo un golpe por frame
            }
          }
        }

        // Remover objetos fuera de pantalla y aumentar score
        const filtered = updated.filter((obj) => {
          if (obj.y > GAME_HEIGHT) {
            setScore((prev) => {
              const newScore = prev + 1;
              if (newScore >= MAX_SCORE) {
                setIsPlaying(false);
                setIsVictory(true);
                const reward = Math.floor(newScore * 10);
                addCoins(reward);
              }
              return newScore;
            });
            return false;
          }
          return true;
        });

        return filtered;
      });

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
  };

  const endGame = () => {
    setIsPlaying(false);
    setIsGameOver(true);
    const reward = Math.floor(score * 5);
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
    <div className="min-h-screen bg-gradient-to-b from-orange-400 via-red-300 to-orange-200 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur rounded-3xl p-4 shadow-lg mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="bg-slate-200 hover:bg-slate-300 rounded-full p-3 transition-colors"
          >
            <Home className="size-5" />
          </button>
          <div className="text-center">
            <div className="font-bold text-xl">Esquivar Objetos</div>
            <div className="text-sm text-slate-600">Puntos: {score}</div>
            <div className="flex gap-1 justify-center mt-1">
              {Array.from({ length: lives }).map((_, i) => (
                <Heart key={i} className="size-4 text-red-500 fill-red-500" />
              ))}
            </div>
          </div>
          <div className="text-xs bg-red-500 text-white px-3 py-2 rounded-full font-bold">
            x{(speed / 150).toFixed(1)}
          </div>
        </div>

        {/* Game Area */}
        <div
          id="game-area"
          className="relative bg-gradient-to-b from-sky-300 to-sky-100 rounded-3xl shadow-lg overflow-hidden cursor-none touch-none"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
        >
          {/* Objetos cayendo */}
          {objects.map((obj) => (
            <div
              key={obj.id}
              className="absolute text-2xl pointer-events-none"
              style={{
                left: obj.x,
                top: obj.y,
                width: OBJECT_SIZE,
                height: OBJECT_SIZE,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {obj.type}
            </div>
          ))}

          {/* Jugador */}
          <motion.div
            className="absolute rounded-full flex items-center justify-center text-2xl shadow-lg"
            style={{
              left: playerX,
              bottom: 10,
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
              background: isInvincible 
                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' 
                : 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
              border: isInvincible ? '3px solid #fbbf24' : '3px solid #10b981',
              opacity: isInvincible ? 0.7 : 1,
            }}
            animate={{
              y: isPlaying ? [0, -5, 0] : 0,
              scale: isInvincible ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🤖
          </motion.div>

          {/* Overlay de inicio */}
          {!isPlaying && !isGameOver && !isVictory && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl px-8 py-4 font-bold text-xl shadow-lg mb-4"
                >
                  Comenzar
                </motion.button>
                <p className="text-white text-sm px-4">
                  Mueve el cursor o tu dedo para esquivar
                </p>
                <p className="text-yellow-300 text-xs mt-2">
                  Tienes {MAX_LIVES} vidas! ❤️❤️❤️
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Instrucciones */}
        <div className="mt-4 bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-lg">
          <p className="text-sm text-slate-600">
            ¡Tienes 3 vidas! {isInvincible && "🛡️ INVENCIBLE"}
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
            onClick={() => navigate("/")}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <Trophy className="size-20 text-yellow-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">¡Juego Terminado!</h2>
              <p className="text-slate-600 mb-2">Puntos: {score}</p>
              <p className="text-2xl font-bold text-green-500 mb-6">
                +{Math.floor(score * 5)} monedas
              </p>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsGameOver(false);
                    startGame();
                  }}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-4 font-bold shadow-lg"
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

      {/* Modal de Victoria */}
      <AnimatePresence>
        {isVictory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Trophy className="size-24 text-white mx-auto mb-4" />
              </motion.div>
              <h2 className="text-4xl font-bold mb-2 text-white">¡VICTORIA!</h2>
              <p className="text-white text-lg mb-2">¡Llegaste a {MAX_SCORE} puntos!</p>
              <p className="text-3xl font-bold text-yellow-200 mb-6">
                +{Math.floor(score * 10)} monedas 🎉
              </p>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsVictory(false);
                    startGame();
                  }}
                  className="w-full bg-white text-orange-600 rounded-2xl p-4 font-bold shadow-lg"
                >
                  Jugar de Nuevo
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/")}
                  className="w-full bg-slate-800 text-white rounded-2xl p-4 font-bold"
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

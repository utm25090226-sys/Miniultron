import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { addCoins } from "../utils/storage";
import { Home, Trophy } from "lucide-react";

interface Pipe {
  id: number;
  x: number;
  gapY: number;
  scored?: boolean;
}

const GAME_WIDTH = 320;
const GAME_HEIGHT = 500;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 50;
const GAP_SIZE = 200; // Gap MUY GRANDE para que sea más fácil
const GRAVITY = 500; // Menos gravedad
const JUMP_VELOCITY = -250; // Salto más suave
const PIPE_SPEED = 100; // Más lento

export default function FlappyBirdGame() {
  const navigate = useNavigate();
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const gameLoopRef = useRef<number>();
  const pipeCounterRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const spawnTimerRef = useRef(0);
  
  const birdYRef = useRef(GAME_HEIGHT / 2);
  const birdVelocityRef = useRef(0);

  useEffect(() => {
    birdYRef.current = birdY;
  }, [birdY]);

  useEffect(() => {
    birdVelocityRef.current = birdVelocity;
  }, [birdVelocity]);

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
    setBirdY(GAME_HEIGHT / 2);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setIsPlaying(true);
    setIsGameOver(false);
    pipeCounterRef.current = 0;
    lastTimeRef.current = Date.now();
    spawnTimerRef.current = 0;
  };

  const jump = () => {
    if (isPlaying && !isGameOver) {
      setBirdVelocity(JUMP_VELOCITY);
    }
  };

  const startGameLoop = () => {
    const loop = () => {
      if (!isPlaying || isGameOver) return;

      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Actualizar pájaro
      let newVelocity = birdVelocityRef.current + GRAVITY * deltaTime;
      let newBirdY = birdYRef.current + newVelocity * deltaTime;

      // INFINITO: El pájaro puede tocar techo/suelo SIN MORIR - solo rebota
      if (newBirdY <= 0) {
        newVelocity = 50; // Rebote suave hacia abajo
        newBirdY = 0;
      }
      if (newBirdY >= GAME_HEIGHT - BIRD_SIZE) {
        newVelocity = -50; // Rebote suave hacia arriba
        newBirdY = GAME_HEIGHT - BIRD_SIZE;
      }

      setBirdY(newBirdY);
      setBirdVelocity(newVelocity);

      // Spawn pipes - MÁS ESPACIADOS
      spawnTimerRef.current += deltaTime;
      if (spawnTimerRef.current > 2.5) {
        spawnTimerRef.current = 0;
        const gapY = Math.random() * (GAME_HEIGHT - GAP_SIZE - 100) + 50;
        setPipes((prev) => [...prev, {
          id: pipeCounterRef.current++,
          x: GAME_WIDTH,
          gapY,
        }]);
      }

      // Actualizar pipes
      setPipes((prev) => {
        const updated = prev.map((pipe) => ({
          ...pipe,
          x: pipe.x - PIPE_SPEED * deltaTime,
        }));

        // Verificar colisiones CON PIPES VERDES
        const birdX = 50;
        for (const pipe of updated) {
          if (
            birdX + BIRD_SIZE > pipe.x &&
            birdX < pipe.x + PIPE_WIDTH
          ) {
            // Verificar si el pájaro está fuera del hueco (TOCA LOS PIPES VERDES)
            if (newBirdY < pipe.gapY || newBirdY + BIRD_SIZE > pipe.gapY + GAP_SIZE) {
              gameOver();
              return prev; // Detener actualización
            }
          }

          // Aumentar score cuando pasa el pipe
          if (!pipe.scored && pipe.x + PIPE_WIDTH < birdX) {
            setScore((s) => s + 1);
            pipe.scored = true;
          }
        }

        return updated.filter((pipe) => pipe.x > -PIPE_WIDTH);
      });

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
  };

  const gameOver = () => {
    setIsPlaying(false);
    setIsGameOver(true);
    const reward = Math.floor(score * 10);
    addCoins(reward);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-green-200 flex flex-col items-center justify-center p-4">
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
            <div className="font-bold text-xl">Flappy Bird</div>
            <div className="text-sm text-slate-600">Puntos: {score}</div>
          </div>
          <div className="size-11" />
        </div>

        {/* Game Area */}
        <div
          className="relative bg-gradient-to-b from-sky-300 to-sky-100 rounded-3xl shadow-lg overflow-hidden cursor-pointer"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          onClick={jump}
        >
          {/* Pájaro */}
          <motion.div
            className="absolute bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-orange-500"
            style={{
              left: 50,
              top: birdY,
              width: BIRD_SIZE,
              height: BIRD_SIZE,
            }}
            animate={{
              rotate: Math.min(Math.max(birdVelocity / 10, -30), 30),
            }}
            transition={{ duration: 0.1 }}
          >
            <div className="text-xs">🐦</div>
          </motion.div>

          {/* Pipes VERDES */}
          {pipes.map((pipe) => (
            <div key={pipe.id}>
              {/* Pipe superior VERDE */}
              <div
                className="absolute bg-gradient-to-r from-green-600 to-green-500 border-2 border-green-700"
                style={{
                  left: pipe.x,
                  top: 0,
                  width: PIPE_WIDTH,
                  height: pipe.gapY,
                }}
              />
              {/* Pipe inferior VERDE */}
              <div
                className="absolute bg-gradient-to-r from-green-600 to-green-500 border-2 border-green-700"
                style={{
                  left: pipe.x,
                  top: pipe.gapY + GAP_SIZE,
                  width: PIPE_WIDTH,
                  height: GAME_HEIGHT - pipe.gapY - GAP_SIZE,
                }}
              />
            </div>
          ))}

          {/* Overlay de inicio */}
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl px-8 py-4 font-bold text-xl shadow-lg mb-4"
                >
                  Comenzar
                </motion.button>
                <p className="text-white text-sm">Toca para volar</p>
                <p className="text-yellow-300 text-xs mt-2">Solo mueres si tocas los pipes verdes!</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-lg">
          <p className="text-sm text-slate-600">
            ¡Juego infinito! Solo mueres si tocas los pipes verdes
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
              <p className="text-slate-600 mb-2">Puntos: {score}</p>
              <p className="text-2xl font-bold text-green-500 mb-6">
                +{Math.floor(score * 10)} monedas
              </p>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsGameOver(false);
                    startGame();
                  }}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl p-4 font-bold shadow-lg"
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

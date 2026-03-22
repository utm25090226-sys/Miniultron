import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { addCoins } from "../utils/storage";
import { Home, Trophy } from "lucide-react";

interface Brick {
  id: number;
  x: number;
  y: number;
  hits: number;
  color: string;
}

const GAME_WIDTH = 320;
const GAME_HEIGHT = 500;
const PADDLE_WIDTH = 60;
const PADDLE_HEIGHT = 12;
const BALL_SIZE = 10;
const BRICK_WIDTH = 35;
const BRICK_HEIGHT = 18;

export default function BreakoutGame() {
  const navigate = useNavigate();
  const [paddleX, setPaddleX] = useState(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [ballX, setBallX] = useState(GAME_WIDTH / 2);
  const [ballY, setBallY] = useState(GAME_HEIGHT - 100);
  const [ballVelocityX, setBallVelocityX] = useState(150);
  const [ballVelocityY, setBallVelocityY] = useState(-200);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef(Date.now());
  
  // Refs para valores actuales
  const ballXRef = useRef(GAME_WIDTH / 2);
  const ballYRef = useRef(GAME_HEIGHT - 100);
  const ballVelocityXRef = useRef(150);
  const ballVelocityYRef = useRef(-200);
  const paddleXRef = useRef(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
  const bricksRef = useRef<Brick[]>([]);

  useEffect(() => {
    ballXRef.current = ballX;
  }, [ballX]);

  useEffect(() => {
    ballYRef.current = ballY;
  }, [ballY]);

  useEffect(() => {
    ballVelocityXRef.current = ballVelocityX;
  }, [ballVelocityX]);

  useEffect(() => {
    ballVelocityYRef.current = ballVelocityY;
  }, [ballVelocityY]);

  useEffect(() => {
    paddleXRef.current = paddleX;
  }, [paddleX]);

  useEffect(() => {
    bricksRef.current = bricks;
  }, [bricks]);

  useEffect(() => {
    initializeLevel(level);
  }, []);

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

  const initializeLevel = (currentLevel: number) => {
    const rows = Math.min(3 + currentLevel, 8);
    const cols = 8;
    const newBricks: Brick[] = [];
    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        newBricks.push({
          id: row * cols + col,
          x: col * (BRICK_WIDTH + 5) + 10,
          y: row * (BRICK_HEIGHT + 5) + 30,
          hits: Math.min(Math.floor(currentLevel / 2) + 1, 3),
          color: colors[row % colors.length],
        });
      }
    }

    setBricks(newBricks);
    setBallX(GAME_WIDTH / 2);
    setBallY(GAME_HEIGHT - 100);
    setBallVelocityX(150 + currentLevel * 20);
    setBallVelocityY(-200 - currentLevel * 20);
    setPaddleX(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
    setIsLevelComplete(false);
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    lastTimeRef.current = Date.now();
  };

  const startGameLoop = () => {
    const loop = () => {
      if (!isPlaying || isGameOver) return;

      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Actualizar posición de la bola usando refs
      let newBallX = ballXRef.current + ballVelocityXRef.current * deltaTime;
      let newBallY = ballYRef.current + ballVelocityYRef.current * deltaTime;
      let newVelX = ballVelocityXRef.current;
      let newVelY = ballVelocityYRef.current;

      // Rebotar en paredes laterales
      if (newBallX <= BALL_SIZE / 2 || newBallX >= GAME_WIDTH - BALL_SIZE / 2) {
        newVelX = -newVelX;
        newBallX = Math.max(BALL_SIZE / 2, Math.min(GAME_WIDTH - BALL_SIZE / 2, newBallX));
      }

      // Rebotar en techo
      if (newBallY <= BALL_SIZE / 2) {
        newVelY = -newVelY;
        newBallY = BALL_SIZE / 2;
      }

      // Verificar colisión con paddle
      if (
        newBallY >= GAME_HEIGHT - 50 - BALL_SIZE / 2 &&
        newBallY <= GAME_HEIGHT - 50 + PADDLE_HEIGHT &&
        newBallX >= paddleXRef.current &&
        newBallX <= paddleXRef.current + PADDLE_WIDTH
      ) {
        newVelY = -Math.abs(newVelY);
        const hitPos = (newBallX - paddleXRef.current) / PADDLE_WIDTH - 0.5;
        newVelX = newVelX + hitPos * 200;
        newBallY = GAME_HEIGHT - 50 - BALL_SIZE / 2;
      }

      // Game over si cae
      if (newBallY >= GAME_HEIGHT) {
        endGame();
        return;
      }

      // Verificar colisión con ladrillos
      let hitBrick = false;
      const updatedBricks = bricksRef.current.map((brick) => {
        if (hitBrick) return brick;

        const ballLeft = newBallX - BALL_SIZE / 2;
        const ballRight = newBallX + BALL_SIZE / 2;
        const ballTop = newBallY - BALL_SIZE / 2;
        const ballBottom = newBallY + BALL_SIZE / 2;

        const brickLeft = brick.x;
        const brickRight = brick.x + BRICK_WIDTH;
        const brickTop = brick.y;
        const brickBottom = brick.y + BRICK_HEIGHT;

        // Verificar si hay superposición
        if (
          ballRight >= brickLeft &&
          ballLeft <= brickRight &&
          ballBottom >= brickTop &&
          ballTop <= brickBottom
        ) {
          hitBrick = true;
          setScore((s) => s + 10);

          // Determinar desde qué lado golpeó la pelota
          const overlapLeft = ballRight - brickLeft;
          const overlapRight = brickRight - ballLeft;
          const overlapTop = ballBottom - brickTop;
          const overlapBottom = brickBottom - ballTop;

          const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

          // Rebotar según el lado con menor superposición
          if (minOverlap === overlapTop || minOverlap === overlapBottom) {
            newVelY = -newVelY;
          } else {
            newVelX = -newVelX;
          }

          return { ...brick, hits: brick.hits - 1 };
        }
        return brick;
      });

      const remainingBricks = updatedBricks.filter((b) => b.hits > 0);

      if (remainingBricks.length === 0 && bricksRef.current.length > 0) {
        setIsPlaying(false);
        setIsLevelComplete(true);
        return;
      }

      // Actualizar estados
      setBallX(newBallX);
      setBallY(newBallY);
      setBallVelocityX(newVelX);
      setBallVelocityY(newVelY);
      setBricks(remainingBricks);

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
  };

  const endGame = () => {
    setIsPlaying(false);
    setIsGameOver(true);
    addCoins(score);
  };

  const nextLevel = () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    initializeLevel(newLevel);
    startGame();
  };

  const movePaddle = (clientX: number) => {
    const rect = document.getElementById("game-area")?.getBoundingClientRect();
    if (!rect) return;

    const x = clientX - rect.left;
    const newX = Math.max(0, Math.min(GAME_WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2));
    setPaddleX(newX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPlaying) {
      movePaddle(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPlaying && e.touches[0]) {
      e.preventDefault();
      movePaddle(e.touches[0].clientX);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-400 via-fuchsia-300 to-violet-200 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur rounded-3xl p-4 shadow-lg mb-6 flex justify-between items-center">
          <button
            onClick={() => {
              addCoins(score);
              navigate("/");
            }}
            className="bg-slate-200 hover:bg-slate-300 rounded-full p-3 transition-colors"
          >
            <Home className="size-5" />
          </button>
          <div className="text-center">
            <div className="font-bold text-xl">Breakout - Nivel {level}</div>
            <div className="text-sm text-slate-600">Puntos: {score}</div>
          </div>
          <div className="size-11" />
        </div>

        {/* Game Area */}
        <div
          id="game-area"
          className="relative bg-gradient-to-b from-indigo-900 to-purple-900 rounded-3xl shadow-lg overflow-hidden touch-none"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
        >
          {/* Ladrillos */}
          {bricks.map((brick) => (
            <motion.div
              key={brick.id}
              className="absolute rounded shadow-lg border-2 border-white"
              style={{
                left: brick.x,
                top: brick.y,
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
                backgroundColor: brick.color,
                opacity: 1,
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                {brick.hits > 1 && brick.hits}
              </div>
            </motion.div>
          ))}

          {/* Bola */}
          <motion.div
            className="absolute bg-white rounded-full shadow-lg"
            style={{
              left: ballX - BALL_SIZE / 2,
              top: ballY - BALL_SIZE / 2,
              width: BALL_SIZE,
              height: BALL_SIZE,
            }}
          />

          {/* Paddle */}
          <div
            className="absolute bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-lg"
            style={{
              left: paddleX,
              bottom: 50,
              width: PADDLE_WIDTH,
              height: PADDLE_HEIGHT,
            }}
          />

          {/* Overlay de inicio */}
          {!isPlaying && !isGameOver && !isLevelComplete && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-2xl px-8 py-4 font-bold text-xl shadow-lg"
              >
                Comenzar Nivel {level}
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de nivel completado */}
      <AnimatePresence>
        {isLevelComplete && (
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
              <h2 className="text-3xl font-bold mb-2">¡Nivel {level} Completado!</h2>
              <p className="text-2xl font-bold text-violet-500 mb-6">
                Puntos: {score}
              </p>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextLevel}
                  className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-2xl p-4 font-bold shadow-lg"
                >
                  Siguiente Nivel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    addCoins(score);
                    navigate("/");
                  }}
                  className="w-full bg-slate-200 text-slate-700 rounded-2xl p-4 font-bold"
                >
                  Terminar ({score} monedas)
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <p className="text-slate-600 mb-2">Nivel: {level}</p>
              <p className="text-2xl font-bold text-green-500 mb-6">
                +{score} monedas
              </p>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setScore(0);
                    setLevel(1);
                    setIsGameOver(false);
                    initializeLevel(1);
                  }}
                  className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-2xl p-4 font-bold shadow-lg"
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

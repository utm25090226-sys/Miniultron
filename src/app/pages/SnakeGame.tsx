import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { addCoins } from "../utils/storage";
import { Home, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

interface Position {
  x: number;
  y: number;
}

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

const GRID_SIZE = 20;
const CELL_SIZE = 15;
const INITIAL_SPEED = 200; // Más lento al inicio

export default function SnakeGame() {
  const navigate = useNavigate();
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [nextDirection, setNextDirection] = useState<Direction>("RIGHT");
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const gameLoopRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      // Prevenir scroll con las flechas
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
          if (direction !== "DOWN") setNextDirection("UP");
          break;
        case "arrowdown":
        case "s":
          if (direction !== "UP") setNextDirection("DOWN");
          break;
        case "arrowleft":
        case "a":
          if (direction !== "RIGHT") setNextDirection("LEFT");
          break;
        case "arrowright":
        case "d":
          if (direction !== "LEFT") setNextDirection("RIGHT");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [direction, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      gameLoopRef.current = setInterval(gameLoop, speed);
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying, snake, direction, nextDirection, food, speed]);

  const startGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood([{ x: 10, y: 10 }]));
    setDirection("RIGHT");
    setNextDirection("RIGHT");
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPlaying(true);
    setIsGameOver(false);
  };

  const generateFood = (snakeBody: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snakeBody.some((segment) => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  };

  const gameLoop = () => {
    setDirection(nextDirection);

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      let newHead: Position;

      switch (nextDirection) {
        case "UP":
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case "DOWN":
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case "LEFT":
          newHead = { x: head.x - 1, y: head.y };
          break;
        case "RIGHT":
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Verificar colisión con paredes
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        endGame();
        return prevSnake;
      }

      // Verificar colisión consigo misma
      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        endGame();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Verificar si comió
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 1);
        setFood(generateFood(newSnake));
        // Aumentar velocidad gradualmente
        setSpeed((s) => Math.max(50, s - 5));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  };

  const endGame = () => {
    setIsPlaying(false);
    setIsGameOver(true);
    const reward = Math.floor(score * 8);
    addCoins(reward);
  };

  const handleDirectionClick = (dir: Direction) => {
    if (!isPlaying) return;
    
    if (dir === "UP" && direction !== "DOWN") setNextDirection(dir);
    if (dir === "DOWN" && direction !== "UP") setNextDirection(dir);
    if (dir === "LEFT" && direction !== "RIGHT") setNextDirection(dir);
    if (dir === "RIGHT" && direction !== "LEFT") setNextDirection(dir);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 via-emerald-300 to-teal-200 flex flex-col items-center justify-center p-4">
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
            <div className="font-bold text-xl">Snake</div>
            <div className="text-sm text-slate-600">Puntos: {score}</div>
          </div>
          <div className="size-11" />
        </div>

        {/* Game Board */}
        <div className="bg-white/80 backdrop-blur rounded-3xl p-4 shadow-lg mb-4">
          <div
            className="bg-slate-900 rounded-2xl relative mx-auto"
            style={{
              width: GRID_SIZE * CELL_SIZE,
              height: GRID_SIZE * CELL_SIZE,
            }}
          >
            {/* Grid */}
            <div className="absolute inset-0 grid opacity-10"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                <div key={i} className="border border-slate-700" />
              ))}
            </div>

            {/* Snake */}
            {snake.map((segment, index) => (
              <motion.div
                key={index}
                className={`absolute rounded-sm ${
                  index === 0 ? "bg-green-400" : "bg-green-500"
                }`}
                style={{
                  left: segment.x * CELL_SIZE,
                  top: segment.y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.1 }}
              />
            ))}

            {/* Food */}
            <motion.div
              className="absolute bg-red-500 rounded-full"
              style={{
                left: food.x * CELL_SIZE,
                top: food.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }}
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
              }}
            />

            {/* Overlay de inicio */}
            {!isPlaying && !isGameOver && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-2xl">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl px-8 py-4 font-bold text-xl shadow-lg"
                >
                  Comenzar
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-2">
          <div />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDirectionClick("UP")}
            className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-lg flex items-center justify-center"
          >
            <ArrowUp className="size-8" />
          </motion.button>
          <div />
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDirectionClick("LEFT")}
            className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-lg flex items-center justify-center"
          >
            <ArrowLeft className="size-8" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDirectionClick("DOWN")}
            className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-lg flex items-center justify-center"
          >
            <ArrowDown className="size-8" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDirectionClick("RIGHT")}
            className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-lg flex items-center justify-center"
          >
            <ArrowRight className="size-8" />
          </motion.button>
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
                +{Math.floor(score * 8)} monedas
              </p>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsGameOver(false);
                    startGame();
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-4 font-bold shadow-lg"
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
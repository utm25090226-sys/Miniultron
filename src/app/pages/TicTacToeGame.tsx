import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { addCoins } from "../utils/storage";
import { Home, Trophy, X as XIcon, Circle } from "lucide-react";

type Player = "X" | "O" | null;

export default function TicTacToeGame() {
  const navigate = useNavigate();
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | "draw">(null);
  const [wins, setWins] = useState(0);
  const [difficulty, setDifficulty] = useState(1); // Nivel de dificultad de la IA

  const checkWinner = (squares: Player[]): Player | "draw" | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    if (squares.every((square) => square !== null)) {
      return "draw";
    }

    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || !isPlayerTurn || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setIsPlayerTurn(false);

    const result = checkWinner(newBoard);
    if (result) {
      endGame(result);
      return;
    }

    // Turno de la computadora
    setTimeout(() => {
      makeComputerMove(newBoard);
    }, 500);
  };

  const makeComputerMove = (currentBoard: Player[]) => {
    const emptySquares = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((val) => val !== null) as number[];

    if (emptySquares.length === 0) return;

    // IA simple: buscar ganar, luego bloquear, luego random
    let move = findWinningMove(currentBoard, "O");
    if (move === -1) {
      move = findWinningMove(currentBoard, "X");
    }
    if (move === -1) {
      // Preferir el centro
      if (currentBoard[4] === null) {
        move = 4;
      } else {
        move = emptySquares[Math.floor(Math.random() * emptySquares.length)];
      }
    }

    const newBoard = [...currentBoard];
    newBoard[move] = "O";
    setBoard(newBoard);
    setIsPlayerTurn(true);

    const result = checkWinner(newBoard);
    if (result) {
      endGame(result);
    }
  };

  const findWinningMove = (squares: Player[], player: Player): number => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      const line = [squares[a], squares[b], squares[c]];
      if (line.filter((s) => s === player).length === 2 && line.includes(null)) {
        if (squares[a] === null) return a;
        if (squares[b] === null) return b;
        if (squares[c] === null) return c;
      }
    }

    return -1;
  };

  const endGame = (result: Player | "draw") => {
    setGameOver(true);
    setWinner(result);
    if (result === "X") {
      setWins((w) => w + 1);
      const reward = 60;
      addCoins(reward);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-400 via-purple-300 to-pink-200 flex flex-col items-center justify-center p-4">
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
            <div className="font-bold text-xl">3 en Línea</div>
            <div className="text-sm text-slate-600">Victorias: {wins}</div>
          </div>
          <div className="size-11" />
        </div>

        {/* Game Board */}
        <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg mb-4">
          <div className="grid grid-cols-3 gap-3">
            {board.map((cell, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: !cell && isPlayerTurn && !gameOver ? 1.05 : 1 }}
                whileTap={{ scale: !cell && isPlayerTurn && !gameOver ? 0.95 : 1 }}
                onClick={() => handleClick(index)}
                className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-md flex items-center justify-center text-5xl font-bold"
              >
                <AnimatePresence>
                  {cell === "X" && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="text-blue-500"
                    >
                      <XIcon className="size-16 stroke-[3]" />
                    </motion.div>
                  )}
                  {cell === "O" && (
                    <motion.div
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="text-red-500"
                    >
                      <Circle className="size-16 stroke-[3]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          {/* Indicador de turno */}
          <div className="mt-4 text-center">
            {!gameOver && (
              <motion.p
                key={isPlayerTurn ? "player" : "computer"}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-bold text-slate-700"
              >
                {isPlayerTurn ? "Tu turno (X)" : "Turno del robot (O)"}
              </motion.p>
            )}
          </div>
        </div>

        {/* Reset Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="w-full bg-white/80 backdrop-blur rounded-2xl p-4 shadow-lg font-bold"
        >
          Nuevo Juego
        </motion.button>
      </div>

      {/* Modal de resultado */}
      <AnimatePresence>
        {gameOver && (
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
              {winner === "X" ? (
                <>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                  >
                    <Trophy className="size-20 text-yellow-500 mx-auto mb-4" />
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-2">¡Ganaste!</h2>
                  <p className="text-2xl font-bold text-green-500 mb-6">+60 monedas</p>
                </>
              ) : winner === "O" ? (
                <>
                  <div className="text-6xl mb-4">😢</div>
                  <h2 className="text-3xl font-bold mb-2">Perdiste</h2>
                  <p className="text-slate-600 mb-6">¡Inténtalo de nuevo!</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">🤝</div>
                  <h2 className="text-3xl font-bold mb-2">¡Empate!</h2>
                  <p className="text-slate-600 mb-6">Bien jugado</p>
                </>
              )}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl p-4 font-bold shadow-lg"
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
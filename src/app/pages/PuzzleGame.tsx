import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { addCoins } from "../utils/storage";
import { Home, Trophy, X, Star } from "lucide-react";

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ALL_EMOJIS = [
  "🔧", "⚙️", "🔩", "💡", "🔋", "🤖", "⚡", "🎯", 
  "🚀", "🌟", "💎", "🔮", "🎨", "🎭", "🎪", "🎬",
  "🎮", "🎯", "🎲", "🧩", "🎰", "🎸", "🎹", "🎺"
];

export default function PuzzleGame() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [canFlip, setCanFlip] = useState(true);
  const [isLevelComplete, setIsLevelComplete] = useState(false);

  useEffect(() => {
    initializeLevel(level);
  }, []);

  const initializeLevel = (currentLevel: number) => {
    // Más pares a medida que aumenta el nivel (mínimo 4, máximo 12)
    const pairsCount = Math.min(4 + currentLevel, 12);
    const selectedEmojis = [...ALL_EMOJIS]
      .sort(() => Math.random() - 0.5)
      .slice(0, pairsCount);

    const shuffled = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffled);
    setFlippedCards([]);
    setCanFlip(true);
    setIsLevelComplete(false);
  };

  const handleCardClick = (id: number) => {
    if (!canFlip) return;
    if (flippedCards.includes(id)) return;
    if (cards[id].isMatched) return;

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    const newCards = cards.map((card) =>
      card.id === id ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      setCanFlip(false);

      const [firstId, secondId] = newFlipped;
      if (cards[firstId].value === cards[secondId].value) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, isMatched: true }
                : card
            )
          );
          setFlippedCards([]);
          setCanFlip(true);

          // Verificar si se completó el nivel
          const allMatched = newCards.every(
            (card) => card.id === firstId || card.id === secondId || card.isMatched
          );
          if (allMatched) {
            const levelScore = Math.max(100 - moves * 3, 30);
            setScore(score + levelScore);
            setIsLevelComplete(true);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
          setCanFlip(true);
        }, 1000);
      }
    }
  };

  const nextLevel = () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    setMoves(0);
    initializeLevel(newLevel);
  };

  const endGame = () => {
    addCoins(score);
    navigate("/");
  };

  const gridCols = cards.length <= 16 ? "grid-cols-4" : "grid-cols-6";

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 via-pink-300 to-purple-200 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur rounded-3xl p-4 shadow-lg mb-6 flex justify-between items-center">
          <button
            onClick={endGame}
            className="bg-slate-200 hover:bg-slate-300 rounded-full p-3 transition-colors"
          >
            <Home className="size-5" />
          </button>
          <div className="text-center">
            <div className="font-bold text-xl">Nivel {level}</div>
            <div className="text-sm text-slate-600">Movimientos: {moves}</div>
          </div>
          <div className="flex items-center gap-1 bg-yellow-100 rounded-full px-3 py-2">
            <Star className="size-4 text-yellow-600" />
            <span className="text-sm font-bold">{score}</span>
          </div>
        </div>

        {/* Game Board */}
        <div className={`grid ${gridCols} gap-3 mb-6`}>
          {cards.map((card) => (
            <motion.button
              key={card.id}
              whileHover={{ scale: !card.isMatched && !card.isFlipped ? 1.05 : 1 }}
              whileTap={{ scale: !card.isMatched && !card.isFlipped ? 0.95 : 1 }}
              onClick={() => handleCardClick(card.id)}
              className="relative aspect-square"
            >
              <motion.div
                className="w-full h-full"
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Parte trasera */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="text-3xl">❓</div>
                </div>

                {/* Parte frontal */}
                <div
                  className={`absolute inset-0 rounded-2xl shadow-lg flex items-center justify-center ${
                    card.isMatched
                      ? "bg-gradient-to-br from-green-400 to-emerald-500"
                      : "bg-white"
                  }`}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="text-4xl">{card.value}</div>
                </div>
              </motion.div>
            </motion.button>
          ))}
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
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <Trophy className="size-20 text-yellow-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">¡Nivel {level} Completado!</h2>
              <p className="text-slate-600 mb-2">Movimientos: {moves}</p>
              <p className="text-2xl font-bold text-purple-500 mb-6">
                +{Math.max(100 - moves * 3, 30)} puntos
              </p>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextLevel}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-4 font-bold shadow-lg"
                >
                  Siguiente Nivel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={endGame}
                  className="w-full bg-slate-200 text-slate-700 rounded-2xl p-4 font-bold"
                >
                  Terminar ({score} monedas)
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

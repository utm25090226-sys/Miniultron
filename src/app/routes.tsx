import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import PuzzleGame from "./pages/PuzzleGame";
import DodgeGame from "./pages/DodgeGame";
import FlappyBirdGame from "./pages/FlappyBirdGame";
import TicTacToeGame from "./pages/TicTacToeGame";
import SnakeGame from "./pages/SnakeGame";
import BreakoutGame from "./pages/BreakoutGame";
import SimonGame from "./pages/SimonGame";
import CatchGame from "./pages/CatchGame";
import UpgradesPage from "./pages/UpgradesPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/puzzle",
    Component: PuzzleGame,
  },
  {
    path: "/dodge",
    Component: DodgeGame,
  },
  {
    path: "/flappy",
    Component: FlappyBirdGame,
  },
  {
    path: "/tictactoe",
    Component: TicTacToeGame,
  },
  {
    path: "/snake",
    Component: SnakeGame,
  },
  {
    path: "/breakout",
    Component: BreakoutGame,
  },
  {
    path: "/simon",
    Component: SimonGame,
  },
  {
    path: "/catch",
    Component: CatchGame,
  },
  {
    path: "/upgrades",
    Component: UpgradesPage,
  },
]);
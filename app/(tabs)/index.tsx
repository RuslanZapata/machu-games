import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useGameStorage } from '@/hooks/useGameStorage';
import GameHeader from '@/components/GameHeader';
import GameControls from '@/components/GameControls';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };

interface Position {
  x: number;
  y: number;
}

export default function SnakeGame() {
  const { width } = Dimensions.get('window');
  const gameSize = Math.min(width - 40, 400);
  const cellSize = gameSize / GRID_SIZE;

  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const {
    bestScore,
    currentScore,
    updateCurrentScore,
    resetCurrentScore,
    saveBestScore,
  } = useGameStorage('snake');

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    setFood(newFood);
  }, []);

  const checkCollision = useCallback((head: Position, snakeBody: Position[]) => {
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    
    // Self collision
    return snakeBody.some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  const moveSnake = useCallback(() => {
    if (!isPlaying || gameOver) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      if (checkCollision(head, newSnake)) {
        setGameOver(true);
        setIsPlaying(false);
        saveBestScore(currentScore);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check if food is eaten
      if (head.x === food.x && head.y === food.y) {
        updateCurrentScore(currentScore + 10);
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [isPlaying, gameOver, direction, food, currentScore, checkCollision, generateFood, updateCurrentScore, saveBestScore]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, 150);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  const handleDirectionChange = (newDirection: Position) => {
    // Prevent reverse direction
    if (direction.x === -newDirection.x && direction.y === -newDirection.y) {
      return;
    }
    setDirection(newDirection);
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood({ x: 15, y: 15 });
    setGameOver(false);
    setIsPlaying(false);
    resetCurrentScore();
  };

  const togglePlay = () => {
    if (gameOver) {
      resetGame();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <View className="flex-1 bg-retro-dark">
      <GameHeader
        title="SNAKE"
        currentScore={currentScore}
        bestScore={bestScore}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onReset={resetGame}
      />

      <View className="flex-1 justify-center items-center p-5">
        <View
          className="border-2 border-retro-green bg-black"
          style={{
            width: gameSize,
            height: gameSize,
          }}
        >
          {/* Snake segments */}
          {snake.map((segment, index) => (
            <View
              key={index}
              className={`absolute ${index === 0 ? 'bg-retro-green' : 'bg-retro-cyan'}`}
              style={{
                left: segment.x * cellSize,
                top: segment.y * cellSize,
                width: cellSize - 1,
                height: cellSize - 1,
              }}
            />
          ))}
          
          {/* Food */}
          <View
            className="absolute bg-retro-orange"
            style={{
              left: food.x * cellSize,
              top: food.y * cellSize,
              width: cellSize - 1,
              height: cellSize - 1,
            }}
          />
        </View>

        {gameOver && (
          <View className="absolute inset-0 bg-black bg-opacity-80 justify-center items-center">
            <Text className="text-retro-green text-3xl font-retro-bold mb-4">
              GAME OVER
            </Text>
            <Text className="text-white text-lg font-retro">
              Final Score: {currentScore}
            </Text>
          </View>
        )}
      </View>

      <GameControls
        onUp={() => handleDirectionChange({ x: 0, y: -1 })}
        onDown={() => handleDirectionChange({ x: 0, y: 1 })}
        onLeft={() => handleDirectionChange({ x: -1, y: 0 })}
        onRight={() => handleDirectionChange({ x: 1, y: 0 })}
      />
    </View>
  );
}
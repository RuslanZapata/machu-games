import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useGameStorage } from '@/hooks/useGameStorage';
import GameHeader from '@/components/GameHeader';

const GAME_WIDTH = 300;
const GAME_HEIGHT = 400;
const BALL_SIZE = 12;
const PADDLE_WIDTH = 60;
const PADDLE_HEIGHT = 8;
const BRICK_WIDTH = 30;
const BRICK_HEIGHT = 15;
const BRICKS_PER_ROW = 10;
const BRICK_ROWS = 6;

interface Position {
  x: number;
  y: number;
}

interface Ball extends Position {
  vx: number;
  vy: number;
}

interface Brick extends Position {
  id: number;
  destroyed: boolean;
}

export default function BounceGame() {
  const [ball, setBall] = useState<Ball>({
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 100,
    vx: 3,
    vy: -3,
  });
  const [paddleX, setPaddleX] = useState(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const {
    bestScore,
    currentScore,
    updateCurrentScore,
    resetCurrentScore,
    saveBestScore,
  } = useGameStorage('bounce');

  const initializeBricks = useCallback(() => {
    const newBricks: Brick[] = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICKS_PER_ROW; col++) {
        newBricks.push({
          id: row * BRICKS_PER_ROW + col,
          x: col * BRICK_WIDTH,
          y: row * BRICK_HEIGHT + 50,
          destroyed: false,
        });
      }
    }
    setBricks(newBricks);
  }, []);

  const checkCollision = useCallback((rect1: Position & { width: number; height: number }, rect2: Position & { width: number; height: number }) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }, []);

  const moveBall = useCallback(() => {
    if (!isPlaying || gameOver || gameWon) return;

    setBall(prevBall => {
      let newBall = { ...prevBall };
      
      // Move ball
      newBall.x += newBall.vx;
      newBall.y += newBall.vy;

      // Wall collisions
      if (newBall.x <= 0 || newBall.x >= GAME_WIDTH - BALL_SIZE) {
        newBall.vx = -newBall.vx;
      }
      if (newBall.y <= 0) {
        newBall.vy = -newBall.vy;
      }

      // Paddle collision
      const paddleRect = {
        x: paddleX,
        y: GAME_HEIGHT - PADDLE_HEIGHT - 10,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
      };
      
      const ballRect = {
        x: newBall.x,
        y: newBall.y,
        width: BALL_SIZE,
        height: BALL_SIZE,
      };

      if (checkCollision(ballRect, paddleRect)) {
        newBall.vy = -Math.abs(newBall.vy);
        // Add some angle based on where the ball hits the paddle
        const hitPos = (newBall.x - paddleX) / PADDLE_WIDTH;
        newBall.vx = (hitPos - 0.5) * 6;
      }

      // Brick collisions
      setBricks(prevBricks => {
        const newBricks = [...prevBricks];
        
        for (let i = 0; i < newBricks.length; i++) {
          const brick = newBricks[i];
          if (brick.destroyed) continue;

          const brickRect = {
            x: brick.x,
            y: brick.y,
            width: BRICK_WIDTH,
            height: BRICK_HEIGHT,
          };

          if (checkCollision(ballRect, brickRect)) {
            newBricks[i] = { ...brick, destroyed: true };
            newBall.vy = -newBall.vy;
            updateCurrentScore(currentScore + 10);
            break;
          }
        }

        // Check if all bricks are destroyed
        const remainingBricks = newBricks.filter(brick => !brick.destroyed);
        if (remainingBricks.length === 0) {
          setGameWon(true);
          setIsPlaying(false);
          saveBestScore(currentScore + 1000); // Bonus for winning
        }

        return newBricks;
      });

      // Game over if ball goes below paddle
      if (newBall.y > GAME_HEIGHT) {
        setGameOver(true);
        setIsPlaying(false);
        saveBestScore(currentScore);
      }

      return newBall;
    });
  }, [isPlaying, gameOver, gameWon, paddleX, checkCollision, currentScore, updateCurrentScore, saveBestScore]);

  const movePaddle = useCallback((direction: 'left' | 'right') => {
    if (!isPlaying || gameOver || gameWon) return;
    
    setPaddleX(prev => {
      const newX = direction === 'left' ? prev - 30 : prev + 30;
      return Math.max(0, Math.min(GAME_WIDTH - PADDLE_WIDTH, newX));
    });
  }, [isPlaying, gameOver, gameWon]);

  useEffect(() => {
    const gameLoop = setInterval(moveBall, 16);
    return () => clearInterval(gameLoop);
  }, [moveBall]);

  useEffect(() => {
    initializeBricks();
  }, [initializeBricks]);

  const resetGame = () => {
    setBall({
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT - 100,
      vx: 3,
      vy: -3,
    });
    setPaddleX(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
    setGameOver(false);
    setGameWon(false);
    setIsPlaying(false);
    resetCurrentScore();
    initializeBricks();
  };

  const togglePlay = () => {
    if (gameOver || gameWon) {
      resetGame();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <View className="flex-1 bg-retro-dark">
      <GameHeader
        title="BOUNCE BALL"
        currentScore={currentScore}
        bestScore={bestScore}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onReset={resetGame}
      />

      <View className="flex-1 justify-center items-center p-5">
        <View
          className="border-2 border-retro-orange bg-black relative"
          style={{
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
          }}
        >
          {/* Ball */}
          <View
            className="absolute bg-retro-green rounded-full"
            style={{
              left: ball.x,
              top: ball.y,
              width: BALL_SIZE,
              height: BALL_SIZE,
            }}
          />

          {/* Paddle */}
          <View
            className="absolute bg-retro-cyan"
            style={{
              left: paddleX,
              bottom: 10,
              width: PADDLE_WIDTH,
              height: PADDLE_HEIGHT,
            }}
          />

          {/* Bricks */}
          {bricks.map(brick => (
            !brick.destroyed && (
              <View
                key={brick.id}
                className="absolute bg-retro-purple border border-retro-orange"
                style={{
                  left: brick.x,
                  top: brick.y,
                  width: BRICK_WIDTH - 1,
                  height: BRICK_HEIGHT - 1,
                }}
              />
            )
          ))}

          {gameOver && (
            <View className="absolute inset-0 bg-black bg-opacity-80 justify-center items-center">
              <Text className="text-retro-orange text-3xl font-retro-bold mb-4">
                GAME OVER
              </Text>
              <Text className="text-white text-lg font-retro">
                Final Score: {currentScore}
              </Text>
            </View>
          )}

          {gameWon && (
            <View className="absolute inset-0 bg-black bg-opacity-80 justify-center items-center">
              <Text className="text-retro-green text-3xl font-retro-bold mb-4">
                YOU WIN!
              </Text>
              <Text className="text-white text-lg font-retro">
                Final Score: {currentScore}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="bg-retro-dark p-6">
        <View className="flex-row justify-center space-x-8">
          <TouchableOpacity
            onPress={() => movePaddle('left')}
            className="bg-retro-gray px-8 py-4 rounded"
          >
            <Text className="text-retro-orange font-retro-bold">LEFT</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => movePaddle('right')}
            className="bg-retro-gray px-8 py-4 rounded"
          >
            <Text className="text-retro-orange font-retro-bold">RIGHT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
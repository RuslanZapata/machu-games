import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useGameStorage } from '@/hooks/useGameStorage';
import GameHeader from '@/components/GameHeader';

const GAME_WIDTH = 300;
const GAME_HEIGHT = 400;
const PLAYER_SIZE = 20;
const BULLET_SIZE = 4;
const ENEMY_SIZE = 16;

interface Position {
  x: number;
  y: number;
}

interface Bullet extends Position {
  id: number;
}

interface Enemy extends Position {
  id: number;
}

export default function ShooterGame() {
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_SIZE / 2);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [bulletId, setBulletId] = useState(0);
  const [enemyId, setEnemyId] = useState(0);

  const {
    bestScore,
    currentScore,
    updateCurrentScore,
    resetCurrentScore,
    saveBestScore,
  } = useGameStorage('shooter');

  const shoot = useCallback(() => {
    if (!isPlaying || gameOver) return;
    
    setBullets(prev => [...prev, {
      id: bulletId,
      x: playerX + PLAYER_SIZE / 2 - BULLET_SIZE / 2,
      y: GAME_HEIGHT - PLAYER_SIZE - 10,
    }]);
    setBulletId(prev => prev + 1);
  }, [isPlaying, gameOver, playerX, bulletId]);

  const movePlayer = useCallback((direction: 'left' | 'right') => {
    if (!isPlaying || gameOver) return;
    
    setPlayerX(prev => {
      const newX = direction === 'left' ? prev - 20 : prev + 20;
      return Math.max(0, Math.min(GAME_WIDTH - PLAYER_SIZE, newX));
    });
  }, [isPlaying, gameOver]);

  const spawnEnemy = useCallback(() => {
    if (!isPlaying || gameOver) return;
    
    setEnemies(prev => [...prev, {
      id: enemyId,
      x: Math.random() * (GAME_WIDTH - ENEMY_SIZE),
      y: -ENEMY_SIZE,
    }]);
    setEnemyId(prev => prev + 1);
  }, [isPlaying, gameOver, enemyId]);

  const checkCollisions = useCallback(() => {
    // Bullet-enemy collisions
    setBullets(prevBullets => {
      const remainingBullets = [...prevBullets];
      
      setEnemies(prevEnemies => {
        const remainingEnemies = [...prevEnemies];
        
        for (let i = remainingBullets.length - 1; i >= 0; i--) {
          const bullet = remainingBullets[i];
          
          for (let j = remainingEnemies.length - 1; j >= 0; j--) {
            const enemy = remainingEnemies[j];
            
            if (
              bullet.x < enemy.x + ENEMY_SIZE &&
              bullet.x + BULLET_SIZE > enemy.x &&
              bullet.y < enemy.y + ENEMY_SIZE &&
              bullet.y + BULLET_SIZE > enemy.y
            ) {
              remainingBullets.splice(i, 1);
              remainingEnemies.splice(j, 1);
              updateCurrentScore(currentScore + 100);
              break;
            }
          }
        }
        
        return remainingEnemies;
      });
      
      return remainingBullets;
    });

    // Player-enemy collisions
    setEnemies(prevEnemies => {
      const playerHit = prevEnemies.some(enemy => 
        enemy.x < playerX + PLAYER_SIZE &&
        enemy.x + ENEMY_SIZE > playerX &&
        enemy.y < GAME_HEIGHT - PLAYER_SIZE + PLAYER_SIZE &&
        enemy.y + ENEMY_SIZE > GAME_HEIGHT - PLAYER_SIZE
      );
      
      if (playerHit) {
        setGameOver(true);
        setIsPlaying(false);
        saveBestScore(currentScore);
      }
      
      return prevEnemies;
    });
  }, [playerX, currentScore, updateCurrentScore, saveBestScore]);

  const gameLoop = useCallback(() => {
    if (!isPlaying || gameOver) return;

    // Move bullets
    setBullets(prev => prev
      .map(bullet => ({ ...bullet, y: bullet.y - 5 }))
      .filter(bullet => bullet.y > -BULLET_SIZE)
    );

    // Move enemies
    setEnemies(prev => {
      const movedEnemies = prev
        .map(enemy => ({ ...enemy, y: enemy.y + 2 }))
        .filter(enemy => enemy.y < GAME_HEIGHT + ENEMY_SIZE);
      
      // Check if any enemy reached the bottom
      const reachedBottom = prev.some(enemy => enemy.y >= GAME_HEIGHT);
      if (reachedBottom) {
        setGameOver(true);
        setIsPlaying(false);
        saveBestScore(currentScore);
      }
      
      return movedEnemies;
    });

    checkCollisions();
  }, [isPlaying, gameOver, checkCollisions, currentScore, saveBestScore]);

  useEffect(() => {
    const gameInterval = setInterval(gameLoop, 50);
    return () => clearInterval(gameInterval);
  }, [gameLoop]);

  useEffect(() => {
    const enemyInterval = setInterval(spawnEnemy, 2000);
    return () => clearInterval(enemyInterval);
  }, [spawnEnemy]);

  const resetGame = () => {
    setPlayerX(GAME_WIDTH / 2 - PLAYER_SIZE / 2);
    setBullets([]);
    setEnemies([]);
    setGameOver(false);
    setIsPlaying(false);
    setBulletId(0);
    setEnemyId(0);
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
        title="SPACE SHOOTER"
        currentScore={currentScore}
        bestScore={bestScore}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onReset={resetGame}
      />

      <View className="flex-1 justify-center items-center p-5">
        <View
          className="border-2 border-retro-cyan bg-black relative"
          style={{
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
          }}
        >
          {/* Player */}
          <View
            className="absolute bg-retro-green"
            style={{
              left: playerX,
              bottom: 0,
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
            }}
          />

          {/* Bullets */}
          {bullets.map(bullet => (
            <View
              key={bullet.id}
              className="absolute bg-retro-orange"
              style={{
                left: bullet.x,
                top: bullet.y,
                width: BULLET_SIZE,
                height: BULLET_SIZE * 2,
              }}
            />
          ))}

          {/* Enemies */}
          {enemies.map(enemy => (
            <View
              key={enemy.id}
              className="absolute bg-retro-purple"
              style={{
                left: enemy.x,
                top: enemy.y,
                width: ENEMY_SIZE,
                height: ENEMY_SIZE,
              }}
            />
          ))}

          {gameOver && (
            <View className="absolute inset-0 bg-black bg-opacity-80 justify-center items-center">
              <Text className="text-retro-cyan text-3xl font-retro-bold mb-4">
                GAME OVER
              </Text>
              <Text className="text-white text-lg font-retro">
                Final Score: {currentScore}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="bg-retro-dark p-6">
        <View className="flex-row justify-center space-x-4">
          <TouchableOpacity
            onPress={() => movePlayer('left')}
            className="bg-retro-gray px-6 py-3 rounded"
          >
            <Text className="text-retro-cyan font-retro-bold">LEFT</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={shoot}
            className="bg-retro-orange px-6 py-3 rounded"
          >
            <Text className="text-retro-dark font-retro-bold">SHOOT</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => movePlayer('right')}
            className="bg-retro-gray px-6 py-3 rounded"
          >
            <Text className="text-retro-cyan font-retro-bold">RIGHT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
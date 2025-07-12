import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useGameStorage } from '@/hooks/useGameStorage';
import GameHeader from '@/components/GameHeader';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 20;

interface Position {
  x: number;
  y: number;
}

interface Piece {
  shape: number[][];
  x: number;
  y: number;
  color: string;
}

const PIECES = [
  {
    shape: [[1, 1, 1, 1]], // I-piece
    color: 'bg-retro-cyan',
  },
  {
    shape: [[1, 1], [1, 1]], // O-piece
    color: 'bg-retro-orange',
  },
  {
    shape: [[0, 1, 0], [1, 1, 1]], // T-piece
    color: 'bg-retro-purple',
  },
  {
    shape: [[1, 1, 0], [0, 1, 1]], // S-piece
    color: 'bg-retro-green',
  },
  {
    shape: [[0, 1, 1], [1, 1, 0]], // Z-piece
    color: 'bg-red-500',
  },
];

export default function PuzzleGame() {
  const [board, setBoard] = useState<(string | null)[][]>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [linesCleared, setLinesCleared] = useState(0);

  const {
    bestScore,
    currentScore,
    updateCurrentScore,
    resetCurrentScore,
    saveBestScore,
  } = useGameStorage('puzzle');

  const getRandomPiece = useCallback((): Piece => {
    const pieceTemplate = PIECES[Math.floor(Math.random() * PIECES.length)];
    return {
      shape: pieceTemplate.shape,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(pieceTemplate.shape[0].length / 2),
      y: 0,
      color: pieceTemplate.color,
    };
  }, []);

  const isValidPosition = useCallback((piece: Piece, newX: number, newY: number): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;
          
          if (
            boardX < 0 || 
            boardX >= BOARD_WIDTH || 
            boardY >= BOARD_HEIGHT ||
            (boardY >= 0 && board[boardY][boardX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, [board]);

  const placePiece = useCallback((piece: Piece) => {
    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }
    
    setBoard(newBoard);
    
    // Check for completed lines
    const completedLines: number[] = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (newBoard[y].every(cell => cell !== null)) {
        completedLines.push(y);
      }
    }
    
    if (completedLines.length > 0) {
      // Remove completed lines
      const finalBoard = newBoard.filter((_, index) => !completedLines.includes(index));
      // Add empty lines at the top
      while (finalBoard.length < BOARD_HEIGHT) {
        finalBoard.unshift(Array(BOARD_WIDTH).fill(null));
      }
      setBoard(finalBoard);
      
      const newLinesCleared = linesCleared + completedLines.length;
      setLinesCleared(newLinesCleared);
      updateCurrentScore(currentScore + completedLines.length * 100);
    }
  }, [board, linesCleared, currentScore, updateCurrentScore]);

  const rotatePiece = useCallback((piece: Piece): number[][] => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    return rotated;
  }, []);

  const movePiece = useCallback((direction: 'left' | 'right' | 'down' | 'rotate') => {
    if (!currentPiece || !isPlaying || gameOver) return;

    let newX = currentPiece.x;
    let newY = currentPiece.y;
    let newShape = currentPiece.shape;

    switch (direction) {
      case 'left':
        newX -= 1;
        break;
      case 'right':
        newX += 1;
        break;
      case 'down':
        newY += 1;
        break;
      case 'rotate':
        newShape = rotatePiece(currentPiece);
        break;
    }

    const testPiece = { ...currentPiece, x: newX, y: newY, shape: newShape };

    if (isValidPosition(testPiece, newX, newY)) {
      setCurrentPiece(testPiece);
    } else if (direction === 'down') {
      // Piece can't move down, place it
      placePiece(currentPiece);
      
      // Check for game over
      const newPiece = getRandomPiece();
      if (!isValidPosition(newPiece, newPiece.x, newPiece.y)) {
        setGameOver(true);
        setIsPlaying(false);
        saveBestScore(currentScore);
      } else {
        setCurrentPiece(newPiece);
      }
    }
  }, [currentPiece, isPlaying, gameOver, isValidPosition, placePiece, getRandomPiece, rotatePiece, saveBestScore, currentScore]);

  const dropPiece = useCallback(() => {
    if (!isPlaying || gameOver) return;
    movePiece('down');
  }, [isPlaying, gameOver, movePiece]);

  useEffect(() => {
    const gameLoop = setInterval(dropPiece, 1000);
    return () => clearInterval(gameLoop);
  }, [dropPiece]);

  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
    setCurrentPiece(null);
    setGameOver(false);
    setIsPlaying(false);
    setLinesCleared(0);
    resetCurrentScore();
  };

  const togglePlay = () => {
    if (gameOver) {
      resetGame();
    } else {
      setIsPlaying(!isPlaying);
      if (!isPlaying && !currentPiece) {
        setCurrentPiece(getRandomPiece());
      }
    }
  };

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // Add current piece to display
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPiece.y + y;
            const boardX = currentPiece.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }

    return displayBoard.map((row, y) => (
      <View key={y} className="flex-row">
        {row.map((cell, x) => (
          <View
            key={`${y}-${x}`}
            className={`border border-retro-gray ${cell || 'bg-black'}`}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          />
        ))}
      </View>
    ));
  };

  return (
    <View className="flex-1 bg-retro-dark">
      <GameHeader
        title="BLOCK PUZZLE"
        currentScore={currentScore}
        bestScore={bestScore}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onReset={resetGame}
      />

      <View className="flex-1 justify-center items-center p-5">
        <View className="border-2 border-retro-purple mb-4">
          {renderBoard()}
        </View>

        <Text className="text-retro-green text-lg font-retro mb-4">
          Lines: {linesCleared}
        </Text>

        {gameOver && (
          <View className="absolute inset-0 bg-black bg-opacity-80 justify-center items-center">
            <Text className="text-retro-purple text-3xl font-retro-bold mb-4">
              GAME OVER
            </Text>
            <Text className="text-white text-lg font-retro">
              Final Score: {currentScore}
            </Text>
          </View>
        )}
      </View>

      <View className="bg-retro-dark p-6">
        <View className="flex-row justify-center space-x-2 mb-4">
          <TouchableOpacity
            onPress={() => movePiece('left')}
            className="bg-retro-gray px-4 py-2 rounded"
          >
            <Text className="text-retro-purple font-retro-bold">LEFT</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => movePiece('rotate')}
            className="bg-retro-orange px-4 py-2 rounded"
          >
            <Text className="text-retro-dark font-retro-bold">ROTATE</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => movePiece('right')}
            className="bg-retro-gray px-4 py-2 rounded"
          >
            <Text className="text-retro-purple font-retro-bold">RIGHT</Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-row justify-center">
          <TouchableOpacity
            onPress={() => movePiece('down')}
            className="bg-retro-green px-6 py-3 rounded"
          >
            <Text className="text-retro-dark font-retro-bold">DROP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
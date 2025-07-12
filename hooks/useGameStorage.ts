import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export function useGameStorage(gameKey: string) {
  const [bestScore, setBestScore] = useState<number>(0);
  const [currentScore, setCurrentScore] = useState<number>(0);

  useEffect(() => {
    loadBestScore();
  }, []);

  const loadBestScore = async () => {
    try {
      const saved = await AsyncStorage.getItem(`best_score_${gameKey}`);
      if (saved) {
        setBestScore(parseInt(saved));
      }
    } catch (error) {
      console.error('Error loading best score:', error);
    }
  };

  const saveBestScore = async (score: number) => {
    try {
      if (score > bestScore) {
        setBestScore(score);
        await AsyncStorage.setItem(`best_score_${gameKey}`, score.toString());
      }
    } catch (error) {
      console.error('Error saving best score:', error);
    }
  };

  const updateCurrentScore = (score: number) => {
    setCurrentScore(score);
  };

  const resetCurrentScore = () => {
    setCurrentScore(0);
  };

  return {
    bestScore,
    currentScore,
    updateCurrentScore,
    resetCurrentScore,
    saveBestScore,
  };
}
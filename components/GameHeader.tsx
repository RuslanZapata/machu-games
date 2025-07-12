import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Play, Pause, RotateCcw } from 'lucide-react-native';

interface GameHeaderProps {
  title: string;
  currentScore: number;
  bestScore: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
}

export default function GameHeader({
  title,
  currentScore,
  bestScore,
  isPlaying,
  onTogglePlay,
  onReset,
}: GameHeaderProps) {
  return (
    <View className="bg-retro-dark p-4 border-b border-retro-gray">
      <Text className="text-retro-green text-2xl font-retro-bold text-center mb-4">
        {title}
      </Text>
      
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-1">
          <Text className="text-retro-cyan text-sm font-retro">Score</Text>
          <Text className="text-white text-xl font-retro-bold">{currentScore}</Text>
        </View>
        
        <View className="flex-1 items-center">
          <Text className="text-retro-purple text-sm font-retro">Best</Text>
          <Text className="text-white text-xl font-retro-bold">{bestScore}</Text>
        </View>
        
        <View className="flex-1 items-end">
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={onTogglePlay}
              className="bg-retro-green p-2 rounded"
            >
              {isPlaying ? (
                <Pause size={20} color="#1a1a1a" />
              ) : (
                <Play size={20} color="#1a1a1a" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={onReset}
              className="bg-retro-orange p-2 rounded"
            >
              <RotateCcw size={20} color="#1a1a1a" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
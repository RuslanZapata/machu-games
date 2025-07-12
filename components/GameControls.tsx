import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';

interface GameControlsProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
}

export default function GameControls({ onUp, onDown, onLeft, onRight }: GameControlsProps) {
  return (
    <View className="bg-retro-dark p-6">
      <View className="items-center">
        <TouchableOpacity
          onPress={onUp}
          className="bg-retro-gray p-4 rounded-full mb-2"
        >
          <ChevronUp size={24} color="#00ff00" />
        </TouchableOpacity>
        
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity
            onPress={onLeft}
            className="bg-retro-gray p-4 rounded-full"
          >
            <ChevronLeft size={24} color="#00ff00" />
          </TouchableOpacity>
          
          <View className="w-16 h-16" />
          
          <TouchableOpacity
            onPress={onRight}
            className="bg-retro-gray p-4 rounded-full"
          >
            <ChevronRight size={24} color="#00ff00" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          onPress={onDown}
          className="bg-retro-gray p-4 rounded-full mt-2"
        >
          <ChevronDown size={24} color="#00ff00" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
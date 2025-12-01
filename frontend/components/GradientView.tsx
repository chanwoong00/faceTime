import React from 'react';
import { View, ViewStyle, StyleProp, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientViewProps {
  colors: string[];
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export function GradientView({ colors, style, children, start, end }: GradientViewProps) {
  if (Platform.OS === 'web') {
    // 웹에서는 단순 배경색 사용
    const primaryColor = colors[0];
    return (
      <View style={[{ backgroundColor: primaryColor }, style]}>
        {children}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={colors}
      style={style}
      start={start || { x: 0, y: 0 }}
      end={end || { x: 1, y: 0 }}
    >
      {children}
    </LinearGradient>
  );
}


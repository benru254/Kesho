// A pressable that shrinks slightly when touched and gives a light haptic tick.
// Use it for anything that should feel physical. `style` works exactly like on a View.

import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { tap } from '../core/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Tappable({ onPress, disabled, style, children, haptic = true, hitSlop }) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  return (
    <AnimatedPressable
      disabled={disabled}
      hitSlop={hitSlop}
      onPressIn={() => to(0.96)}
      onPressOut={() => to(1)}
      onPress={() => {
        if (haptic) tap();
        if (onPress) onPress();
      }}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}

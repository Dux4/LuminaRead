import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { AppleColors } from '../theme/colors';

interface AppleRingProps {
  progress: number; // 0.0 to 1.0 (or > 1.0 for overflow)
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  valueText?: string;
  icon?: string;
}

export const AppleRing: React.FC<AppleRingProps> = ({
  progress,
  size = 110,
  strokeWidth = 12,
  color = AppleColors.ringTime,
  backgroundColor = 'rgba(255, 45, 85, 0.15)',
  label,
  valueText,
}) => {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference - clampedProgress * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Background circle track */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress ring */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </G>
      </Svg>

      <View style={styles.centerContent}>
        {valueText ? (
          <Text style={[styles.valueText, { color }]}>{valueText}</Text>
        ) : null}
        {label ? <Text style={styles.labelText}>{label}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'System',
  },
  labelText: {
    fontSize: 11,
    color: AppleColors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Flame, Zap, Award, Target } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { AppleColors } from '../theme/colors';

export const Header: React.FC = () => {
  const { gamification, setActiveView } = useApp();

  const xpForNextLevel = gamification.level * 200;
  const currentLevelXP = gamification.xp % 200;
  const xpPercent = Math.min(100, Math.round((currentLevelXP / 200) * 100));

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        <Text style={styles.logoText}>Lumina<Text style={styles.logoAccent}>Read</Text></Text>
        <Text style={styles.subtitle}>Mente Focada, Sem Doomscrolling</Text>
      </View>

      <View style={styles.rightSection}>
        {/* Streak 🔥 Counter */}
        <TouchableOpacity
          style={styles.statBadge}
          onPress={() => setActiveView('gamification')}
          activeOpacity={0.7}
        >
          <Flame size={18} color={AppleColors.orange} fill={AppleColors.orange} />
          <Text style={styles.streakText}>{gamification.streakDays}d</Text>
        </TouchableOpacity>

        {/* Level Badge */}
        <TouchableOpacity
          style={[styles.statBadge, styles.levelBadge]}
          onPress={() => setActiveView('gamification')}
          activeOpacity={0.7}
        >
          <Zap size={16} color={AppleColors.yellow} fill={AppleColors.yellow} />
          <Text style={styles.levelText}>Nív {gamification.level}</Text>

          {/* Mini XP progress bar */}
          <View style={styles.miniXpTrack}>
            <View style={[styles.miniXpFill, { width: `${xpPercent}%` }]} />
          </View>
        </TouchableOpacity>

        {/* Anti-TikTok Time Saved */}
        <View style={styles.statBadge}>
          <Target size={16} color={AppleColors.green} />
          <Text style={styles.tiktokText}>+{gamification.totalReadingMinutes * 3}m Reels Evitados</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(11, 11, 14, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: AppleColors.surfaceBorder,
    zIndex: 10,
  },
  leftSection: {
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: AppleColors.textPrimary,
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: AppleColors.blue,
  },
  subtitle: {
    fontSize: 12,
    color: AppleColors.textSecondary,
    marginTop: 2,
    fontWeight: '400',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelBadge: {
    borderColor: 'rgba(255, 214, 10, 0.3)',
  },
  streakText: {
    color: AppleColors.orange,
    fontWeight: '700',
    fontSize: 14,
  },
  levelText: {
    color: AppleColors.yellow,
    fontWeight: '700',
    fontSize: 13,
  },
  miniXpTrack: {
    width: 28,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
    marginLeft: 2,
  },
  miniXpFill: {
    height: '100%',
    backgroundColor: AppleColors.yellow,
  },
  tiktokText: {
    color: AppleColors.green,
    fontWeight: '600',
    fontSize: 12,
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import {
  Trophy,
  Flame,
  Zap,
  Lock,
  Award,
  Calendar,
  Sparkles,
  Smartphone,
  BrainCircuit,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { AppleColors } from '../theme/colors';

export const GamificationView: React.FC = () => {
  const { gamification } = useApp();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const xpCurrent = gamification.xp % 200;
  const xpPercent = Math.min(100, Math.round((xpCurrent / 200) * 100));
  const tiktokTimeSaved = gamification.totalReadingMinutes * 3;
  const reelsAvoided = Math.round((gamification.totalReadingMinutes * 60) / 30);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Level Header Banner */}
      <GlassCard style={styles.levelCard}>
        <View style={styles.levelHeaderRow}>
          <View style={styles.levelTitleGroup}>
            <View style={styles.zapIconCircle}>
              <Zap size={24} color={AppleColors.yellow} fill={AppleColors.yellow} />
            </View>
            <View>
              <Text style={styles.levelTitle}>Nível {gamification.level}: Sabedoria Elevada</Text>
              <Text style={styles.levelSubtitle}>
                {200 - xpCurrent} XP necessários para o próximo nível
              </Text>
            </View>
          </View>

          <View style={styles.totalXpChip}>
            <Text style={styles.totalXpText}>{gamification.xp} XP Total</Text>
          </View>
        </View>

        {/* Level XP Progress bar */}
        <View style={styles.xpBarTrack}>
          <View style={[styles.xpBarFill, { width: `${xpPercent}%` }]} />
        </View>
      </GlassCard>

      {/* Grid: Anti-TikTok Impact & Streak History */}
      <View style={isDesktop ? styles.twoColRow : styles.oneColRow}>
        {/* Anti-TikTok Impact Report */}
        <GlassCard style={styles.impactCard}>
          <View style={styles.cardTitleRow}>
            <Smartphone size={20} color={AppleColors.green} />
            <Text style={styles.cardTitleText}>IMPACTO ANTI-MÍDIA SOCIAL</Text>
          </View>

          <View style={styles.impactGrid}>
            <View style={styles.impactBox}>
              <Text style={styles.impactVal}>{tiktokTimeSaved}m</Text>
              <Text style={styles.impactLab}>Tempo Reclamado</Text>
            </View>

            <View style={styles.impactBox}>
              <Text style={styles.impactVal}>~{reelsAvoided}</Text>
              <Text style={styles.impactLab}>Reels Não Assistidos</Text>
            </View>

            <View style={styles.impactBox}>
              <Text style={styles.impactVal}>{gamification.totalReadingMinutes}m</Text>
              <Text style={styles.impactLab}>Foco em Leitura</Text>
            </View>
          </View>

          <View style={styles.brainNoticeBox}>
            <BrainCircuit size={18} color={AppleColors.blue} />
            <Text style={styles.brainNoticeText}>
              Sua capacidade de atenção sustentada aumentou <Text style={{ color: AppleColors.blue, fontWeight: '700' }}>+34%</Text> ao substituir o algoritmo pela leitura.
            </Text>
          </View>
        </GlassCard>

        {/* Streak & Flame Tracker */}
        <GlassCard style={styles.streakCard}>
          <View style={styles.cardTitleRow}>
            <Flame size={20} color={AppleColors.orange} fill={AppleColors.orange} />
            <Text style={styles.cardTitleText}>OFENSIVA DE LEITURA (STREAK)</Text>
          </View>

          <View style={styles.streakBigRow}>
            <Text style={styles.streakBigNum}>{gamification.streakDays}</Text>
            <View>
              <Text style={styles.streakBigUnit}>Dias Seguidos</Text>
              <Text style={styles.streakSubtitle}>Mantenha a chama viva lendo hoje!</Text>
            </View>
          </View>

          <View style={styles.daysRow}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, idx) => {
              const active = idx < gamification.streakDays;
              return (
                <View key={day} style={styles.dayCol}>
                  <View style={[styles.dayDot, active && styles.dayDotActive]}>
                    {active ? (
                      <Flame size={12} color="#FFF" fill="#FFF" />
                    ) : (
                      <Calendar size={12} color={AppleColors.textTertiary} />
                    )}
                  </View>
                  <Text style={styles.dayLabel}>{day}</Text>
                </View>
              );
            })}
          </View>
        </GlassCard>
      </View>

      {/* Badges & Trophies Grid */}
      <GlassCard style={styles.badgesSection}>
        <View style={styles.cardTitleRow}>
          <Trophy size={20} color={AppleColors.purple} />
          <Text style={styles.cardTitleText}>GALERIA DE TROFÉUS E CONQUISTAS</Text>
        </View>

        <View style={styles.badgesGrid}>
          {gamification.badges.map(badge => {
            const isUnlocked = badge.unlockedAt !== null;

            return (
              <View
                key={badge.id}
                style={[
                  styles.badgeCard,
                  isUnlocked ? styles.badgeUnlocked : styles.badgeLocked,
                ]}
              >
                <View style={[styles.badgeIconWrapper, isUnlocked && styles.badgeIconUnlocked]}>
                  {isUnlocked ? (
                    <Award size={24} color={AppleColors.yellow} />
                  ) : (
                    <Lock size={20} color={AppleColors.textTertiary} />
                  )}
                </View>

                <Text style={[styles.badgeTitle, !isUnlocked && styles.badgeTitleLocked]}>
                  {badge.title}
                </Text>
                <Text style={styles.badgeDesc} numberOfLines={2}>
                  {badge.description}
                </Text>

                {isUnlocked ? (
                  <View style={styles.unlockedTag}>
                    <Sparkles size={10} color={AppleColors.green} />
                    <Text style={styles.unlockedTagText}>Desbloqueado</Text>
                  </View>
                ) : (
                  <Text style={styles.lockedRequirementText}>Requisito: {badge.requirementValue}</Text>
                )}
              </View>
            );
          })}
        </View>
      </GlassCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 20,
  },
  levelCard: {
    gap: 16,
    backgroundColor: 'rgba(94, 92, 230, 0.12)',
    borderColor: 'rgba(94, 92, 230, 0.3)',
  },
  levelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  zapIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 214, 10, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AppleColors.textPrimary,
  },
  levelSubtitle: {
    fontSize: 12,
    color: AppleColors.textSecondary,
    marginTop: 2,
  },
  totalXpChip: {
    backgroundColor: 'rgba(255, 214, 10, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  totalXpText: {
    color: AppleColors.yellow,
    fontSize: 13,
    fontWeight: '700',
  },
  xpBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: AppleColors.yellow,
  },

  twoColRow: {
    flexDirection: 'row',
    gap: 20,
  },
  oneColRow: {
    flexDirection: 'column',
    gap: 20,
  },
  impactCard: {
    flex: 1,
    gap: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitleText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppleColors.textSecondary,
    letterSpacing: 0.8,
  },
  impactGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  impactBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  impactVal: {
    fontSize: 18,
    fontWeight: '800',
    color: AppleColors.green,
  },
  impactLab: {
    fontSize: 10,
    color: AppleColors.textTertiary,
    marginTop: 2,
    textAlign: 'center',
  },
  brainNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
  },
  brainNoticeText: {
    flex: 1,
    fontSize: 12,
    color: AppleColors.textSecondary,
    lineHeight: 16,
  },

  streakCard: {
    flex: 1,
    gap: 14,
  },
  streakBigRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  streakBigNum: {
    fontSize: 48,
    fontWeight: '900',
    color: AppleColors.orange,
  },
  streakBigUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: AppleColors.textPrimary,
  },
  streakSubtitle: {
    fontSize: 12,
    color: AppleColors.textSecondary,
    marginTop: 2,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  dayCol: {
    alignItems: 'center',
    gap: 4,
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotActive: {
    backgroundColor: AppleColors.orange,
  },
  dayLabel: {
    fontSize: 10,
    color: AppleColors.textTertiary,
  },

  badgesSection: {
    gap: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  badgeCard: {
    minWidth: 150,
    flex: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
  },
  badgeUnlocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 214, 10, 0.3)',
  },
  badgeLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    opacity: 0.6,
  },
  badgeIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIconUnlocked: {
    backgroundColor: 'rgba(255, 214, 10, 0.15)',
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppleColors.textPrimary,
  },
  badgeTitleLocked: {
    color: AppleColors.textSecondary,
  },
  badgeDesc: {
    fontSize: 11,
    color: AppleColors.textSecondary,
    lineHeight: 14,
  },
  unlockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  unlockedTagText: {
    fontSize: 10,
    color: AppleColors.green,
    fontWeight: '700',
  },
  lockedRequirementText: {
    fontSize: 10,
    color: AppleColors.textTertiary,
    marginTop: 4,
  },
});

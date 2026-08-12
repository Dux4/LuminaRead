import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {
  BookOpen,
  Flame,
  Zap,
  Target,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { AppleRing } from '../components/AppleRing';
import { AppleColors } from '../theme/colors';

export const HomeView: React.FC = () => {
  const { gamification, activeBook, selectBook, setActiveView } = useApp();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const timeProgress = Math.min(1, gamification.todayReadingMinutes / gamification.dailyTargetMinutes);
  const pagesProgress = Math.min(1, gamification.todayPagesRead / 20);
  const tiktokTimeSavedMins = gamification.todayReadingMinutes * 3; // 1 min read = 3 min TikTok saved
  const tiktokProgress = Math.min(1, tiktokTimeSavedMins / 60);

  const videosAvoided = Math.round((gamification.totalReadingMinutes * 60) / 30); // ~30s videos skipped

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome & Motivational Banner */}
      <View style={styles.welcomeBanner}>
        <View style={styles.welcomeLeft}>
          <Text style={styles.greetingTitle}>Sua Mente em Foco ✨</Text>
          <Text style={styles.greetingSubtitle}>
            Você já evitou <Text style={styles.highlightText}>~{videosAvoided} vídeos curtos</Text> escolhendo a leitura hoje.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.actionHeaderBtn}
          onPress={() => setActiveView('gamification')}
        >
          <Sparkles size={16} color="#FFF" />
          <Text style={styles.actionHeaderBtnText}>Ver Troféus</Text>
        </TouchableOpacity>
      </View>

      {/* Apple Activity Rings Overview */}
      <GlassCard style={styles.ringsCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardSectionTitle}>ANÉIS DE ATIVIDADE DIÁRIA</Text>
          <Text style={styles.targetStatusText}>
            {gamification.todayReadingMinutes} / {gamification.dailyTargetMinutes} min
          </Text>
        </View>

        <View style={isDesktop ? styles.ringsRowDesktop : styles.ringsRowMobile}>
          {/* Ring 1: Reading Time */}
          <View style={styles.ringItem}>
            <AppleRing
              progress={timeProgress}
              color={AppleColors.ringTime}
              backgroundColor="rgba(255, 45, 85, 0.15)"
              valueText={`${gamification.todayReadingMinutes}m`}
              label="Tempo Lido"
              size={110}
            />
            <Text style={styles.ringDetailText}>Meta: {gamification.dailyTargetMinutes}m</Text>
          </View>

          {/* Ring 2: Pages Read */}
          <View style={styles.ringItem}>
            <AppleRing
              progress={pagesProgress}
              color={AppleColors.ringPages}
              backgroundColor="rgba(88, 86, 214, 0.15)"
              valueText={`${gamification.todayPagesRead}`}
              label="Páginas"
              size={110}
            />
            <Text style={styles.ringDetailText}>Meta: 20 págs</Text>
          </View>

          {/* Ring 3: Anti-TikTok Time Saved */}
          <View style={styles.ringItem}>
            <AppleRing
              progress={tiktokProgress}
              color={AppleColors.ringAntiSocial}
              backgroundColor="rgba(52, 199, 89, 0.15)"
              valueText={`${tiktokTimeSavedMins}m`}
              label="Reels Evitados"
              size={110}
            />
            <Text style={styles.ringDetailText}>Foco Restaurado</Text>
          </View>
        </View>
      </GlassCard>

      {/* Grid Row: Quick Resume Book & Anti-TikTok Counter */}
      <View style={isDesktop ? styles.gridTwoCol : styles.gridOneCol}>
        {/* Quick Resume Reading */}
        {activeBook ? (
          <GlassCard style={styles.resumeCard}>
            <View style={styles.resumeHeaderRow}>
              <View style={[styles.bookBadge, { backgroundColor: activeBook.coverColor }]}>
                <BookOpen size={16} color="#FFF" />
              </View>
              <View style={styles.resumeInfoFlex}>
                <Text style={styles.continueLabel}>CONTINUAR LEITURA</Text>
                <Text style={styles.bookTitle} numberOfLines={1}>
                  {activeBook.title}
                </Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>
                  {activeBook.author}
                </Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressRow}>
                <Text style={styles.progressSubtext}>Progresso total</Text>
                <Text style={styles.progressPercent}>{activeBook.currentProgressPercent}%</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${activeBook.currentProgressPercent}%` },
                  ]}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.resumeButton}
              onPress={() => selectBook(activeBook.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.resumeButtonText}>Continuar Capítulo</Text>
              <ArrowRight size={18} color="#FFF" />
            </TouchableOpacity>
          </GlassCard>
        ) : null}

        {/* Anti-TikTok Counter Badge */}
        <GlassCard style={styles.antiSocialCard}>
          <View style={styles.antiSocialHeader}>
            <ShieldAlert size={24} color={AppleColors.green} />
            <Text style={styles.antiSocialTitle}>Impacto Anti-Doomscroll</Text>
          </View>

          <Text style={styles.antiSocialBigValue}>
            {gamification.totalReadingMinutes * 3} <Text style={styles.unitText}>minutos</Text>
          </Text>
          <Text style={styles.antiSocialDesc}>
            Salvos do consumo passivo do TikTok, Instagram Reels e Shorts.
          </Text>

          <View style={styles.statRowMini}>
            <View style={styles.miniStatBox}>
              <Flame size={16} color={AppleColors.orange} />
              <Text style={styles.miniStatVal}>{gamification.streakDays} dias</Text>
              <Text style={styles.miniStatLab}>Ofensiva</Text>
            </View>

            <View style={styles.miniStatBox}>
              <Zap size={16} color={AppleColors.yellow} />
              <Text style={styles.miniStatVal}>{gamification.xp} XP</Text>
              <Text style={styles.miniStatLab}>Acumulado</Text>
            </View>
          </View>
        </GlassCard>
      </View>

      {/* Daily Quests List */}
      <GlassCard style={styles.questsCard}>
        <View style={styles.questsHeader}>
          <Target size={20} color={AppleColors.purple} />
          <Text style={styles.cardSectionTitle}>MISSÕES DIÁRIAS</Text>
        </View>

        {gamification.quests.map(quest => (
          <View key={quest.id} style={styles.questItem}>
            <View style={styles.questLeft}>
              {quest.completed ? (
                <CheckCircle2 size={22} color={AppleColors.green} />
              ) : (
                <Clock size={22} color={AppleColors.textSecondary} />
              )}
              <View style={styles.questInfo}>
                <Text style={styles.questTitle}>{quest.title}</Text>
                <Text style={styles.questProgressText}>
                  {quest.currentMinutes} / {quest.targetMinutes} concluído
                </Text>
              </View>
            </View>

            <View style={styles.rewardChip}>
              <Text style={styles.rewardChipText}>+{quest.rewardXP} XP</Text>
            </View>
          </View>
        ))}
      </GlassCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 20,
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(10, 132, 255, 0.12)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  welcomeLeft: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: AppleColors.textPrimary,
  },
  greetingSubtitle: {
    fontSize: 13,
    color: AppleColors.textSecondary,
    marginTop: 4,
  },
  highlightText: {
    color: AppleColors.blue,
    fontWeight: '700',
  },
  actionHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppleColors.blue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  actionHeaderBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },

  ringsCard: {
    gap: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AppleColors.textSecondary,
    letterSpacing: 0.8,
  },
  targetStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppleColors.blue,
  },
  ringsRowDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  ringsRowMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 10,
  },
  ringItem: {
    alignItems: 'center',
    gap: 8,
  },
  ringDetailText: {
    fontSize: 12,
    color: AppleColors.textTertiary,
    fontWeight: '500',
  },

  gridTwoCol: {
    flexDirection: 'row',
    gap: 20,
  },
  gridOneCol: {
    flexDirection: 'column',
    gap: 20,
  },
  resumeCard: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 16,
  },
  resumeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookBadge: {
    width: 44,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeInfoFlex: {
    flex: 1,
  },
  continueLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: AppleColors.textTertiary,
    letterSpacing: 0.8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppleColors.textPrimary,
    marginTop: 2,
  },
  bookAuthor: {
    fontSize: 12,
    color: AppleColors.textSecondary,
    marginTop: 1,
  },
  progressContainer: {
    gap: 6,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressSubtext: {
    fontSize: 12,
    color: AppleColors.textSecondary,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: AppleColors.blue,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: AppleColors.blue,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AppleColors.blue,
    paddingVertical: 12,
    borderRadius: 14,
  },
  resumeButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },

  antiSocialCard: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 12,
  },
  antiSocialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  antiSocialTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppleColors.green,
  },
  antiSocialBigValue: {
    fontSize: 32,
    fontWeight: '800',
    color: AppleColors.textPrimary,
  },
  unitText: {
    fontSize: 16,
    color: AppleColors.textSecondary,
    fontWeight: '400',
  },
  antiSocialDesc: {
    fontSize: 12,
    color: AppleColors.textSecondary,
    lineHeight: 16,
  },
  statRowMini: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  miniStatBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 2,
  },
  miniStatVal: {
    fontSize: 13,
    fontWeight: '700',
    color: AppleColors.textPrimary,
  },
  miniStatLab: {
    fontSize: 10,
    color: AppleColors.textTertiary,
  },

  questsCard: {
    gap: 14,
  },
  questsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 14,
    borderRadius: 14,
  },
  questLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppleColors.textPrimary,
  },
  questProgressText: {
    fontSize: 12,
    color: AppleColors.textSecondary,
    marginTop: 2,
  },
  rewardChip: {
    backgroundColor: 'rgba(191, 90, 242, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(191, 90, 242, 0.4)',
  },
  rewardChipText: {
    color: AppleColors.purple,
    fontSize: 12,
    fontWeight: '700',
  },
});

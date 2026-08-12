import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import {
  Settings as SettingsIcon,
  Target,
  RefreshCw,
  Trash2,
  BookOpen,
  Info,
  ShieldCheck,
  Check,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { AppleColors } from '../theme/colors';

export const SettingsView: React.FC = () => {
  const {
    gamification,
    resetAllData,
    restoreSampleBooks,
    updateSettings,
    settings,
  } = useApp();

  const [showConfirmResetModal, setShowConfirmResetModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRestoreSamples = () => {
    restoreSampleBooks();
    triggerToast('Livros clássicos restaurados com sucesso! 📚');
  };

  const handleConfirmReset = () => {
    resetAllData();
    setShowConfirmResetModal(false);
    triggerToast('Todos os dados foram resetados.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {toastMessage ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}

      <View style={styles.header}>
        <Text style={styles.viewTitle}>Ajustes & Preferências</Text>
        <Text style={styles.viewSubtitle}>Configure suas metas de leitura e gerencie seu armazenamento.</Text>
      </View>

      {/* Daily Goal Target Selector */}
      <GlassCard style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Target size={20} color={AppleColors.blue} />
          <Text style={styles.sectionTitle}>META DE LEITURA DIÁRIA</Text>
        </View>

        <Text style={styles.settingDescription}>
          Escolha quantos minutos por dia você deseja dedicar à leitura para completar o anel de atividades.
        </Text>

        <View style={styles.targetPillsRow}>
          {[10, 15, 20, 30, 45, 60].map(mins => {
            const isSelected = gamification.dailyTargetMinutes === mins;
            return (
              <TouchableOpacity
                key={mins}
                style={[styles.targetPill, isSelected && styles.targetPillActive]}
                onPress={() => {
                  // update target
                  gamification.dailyTargetMinutes = mins;
                  triggerToast(`Meta diária alterada para ${mins} minutos! 🎯`);
                }}
              >
                <Text style={[styles.targetPillText, isSelected && styles.targetPillTextActive]}>
                  {mins} min
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </GlassCard>

      {/* Storage & Library Management */}
      <GlassCard style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <BookOpen size={20} color={AppleColors.purple} />
          <Text style={styles.sectionTitle}>GERENCIAMENTO DE ARMAZENAMENTO</Text>
        </View>

        <TouchableOpacity
          style={styles.actionRowBtn}
          onPress={handleRestoreSamples}
          activeOpacity={0.7}
        >
          <RefreshCw size={18} color={AppleColors.blue} />
          <View style={styles.actionBtnTextFlex}>
            <Text style={styles.actionBtnTitle}>Restaurar Livros Exemplares</Text>
            <Text style={styles.actionBtnSub}>Recuperar Machado de Assis, Sun Tzu e clássicos.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionRowBtn, styles.dangerActionBtn]}
          onPress={() => setShowConfirmResetModal(true)}
          activeOpacity={0.7}
        >
          <Trash2 size={18} color={AppleColors.red} />
          <View style={styles.actionBtnTextFlex}>
            <Text style={[styles.actionBtnTitle, { color: AppleColors.red }]}>Resetar Todos os Dados</Text>
            <Text style={styles.actionBtnSub}>Limpar histórico, livros importados e progresso de XP.</Text>
          </View>
        </TouchableOpacity>
      </GlassCard>

      {/* App Mission & Anti-Doomscroll Guarantee */}
      <GlassCard style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <ShieldCheck size={20} color={AppleColors.green} />
          <Text style={styles.sectionTitle}>SOBRE O LUMINAREAD</Text>
        </View>

        <Text style={styles.aboutText}>
          O LuminaRead foi desenhado com base na linguagem estética da Apple para ser um refúgio da hiper-estimulação dos algoritmos sociais.
          Ao focar na leitura diária e acompanhar a redução de doomscrolling, você treina seu cérebro para manter o foco profundo.
        </Text>

        <View style={styles.versionBadge}>
          <Info size={14} color={AppleColors.textTertiary} />
          <Text style={styles.versionText}>LuminaRead v1.0.0 • React Native Expo Cross-Platform</Text>
        </View>
      </GlassCard>

      {/* Reset Confirmation Modal */}
      <Modal visible={showConfirmResetModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Resetar Todos os Dados?</Text>
            <Text style={styles.confirmSub}>
              Esta ação apagará permanentemente seu histórico de leitura, livros importados e pontos de XP acumulados.
            </Text>

            <View style={styles.confirmActionsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowConfirmResetModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={handleConfirmReset}
              >
                <Text style={styles.deleteConfirmText}>Sim, Apagar Tudo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 20,
  },
  toast: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 100,
  },
  toastText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    marginBottom: 4,
  },
  viewTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: AppleColors.textPrimary,
    letterSpacing: -0.5,
  },
  viewSubtitle: {
    fontSize: 13,
    color: AppleColors.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    gap: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: AppleColors.textSecondary,
    letterSpacing: 0.8,
  },
  settingDescription: {
    fontSize: 13,
    color: AppleColors.textSecondary,
    lineHeight: 18,
  },
  targetPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  targetPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  targetPillActive: {
    backgroundColor: AppleColors.blue,
    borderColor: AppleColors.blue,
  },
  targetPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppleColors.textSecondary,
  },
  targetPillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },

  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  dangerActionBtn: {
    borderColor: 'rgba(255, 69, 58, 0.2)',
    backgroundColor: 'rgba(255, 69, 58, 0.05)',
  },
  actionBtnTextFlex: {
    flex: 1,
  },
  actionBtnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppleColors.textPrimary,
  },
  actionBtnSub: {
    fontSize: 12,
    color: AppleColors.textSecondary,
    marginTop: 2,
  },

  aboutText: {
    fontSize: 13,
    color: AppleColors.textSecondary,
    lineHeight: 20,
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  versionText: {
    fontSize: 11,
    color: AppleColors.textTertiary,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmBox: {
    maxWidth: 400,
    width: '100%',
    backgroundColor: AppleColors.surface,
    borderRadius: 20,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: AppleColors.surfaceBorder,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AppleColors.textPrimary,
  },
  confirmSub: {
    fontSize: 13,
    color: AppleColors.textSecondary,
    lineHeight: 18,
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cancelBtnText: {
    color: AppleColors.textPrimary,
    fontWeight: '600',
  },
  deleteConfirmBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: AppleColors.red,
  },
  deleteConfirmText: {
    color: '#FFF',
    fontWeight: '700',
  },
});

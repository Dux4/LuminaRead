import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  List,
  Bookmark as BookmarkIcon,
  Settings as SettingsIcon,
  Type,
  Sun,
  Moon,
  Zap,
  Check,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { AppleColors } from '../../theme/colors';
import { ReaderTheme, ReaderFontFamily } from '../../types';

export const ReaderEngine: React.FC = () => {
  const {
    activeBook,
    updateReadingProgress,
    addBookmark,
    recordReadingTime,
    settings,
    updateSettings,
    setActiveView,
  } = useApp();

  const [showTocModal, setShowTocModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  // Active reading timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds(prev => {
        const next = prev + 1;
        // Every 30 seconds, record progress to Context (granting XP & saving streak)
        if (next % 30 === 0) {
          recordReadingTime(30);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [recordReadingTime]);

  if (!activeBook || !activeBook.chapters || activeBook.chapters.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Nenhum livro selecionado</Text>
        <Text style={styles.emptySubtitle}>Escolha um livro da biblioteca para começar sua leitura.</Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => setActiveView('library')}
        >
          <Text style={styles.browseButtonText}>Ir para Biblioteca</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentChapterIndex = activeBook.currentChapterIndex || 0;
  const currentChapter = activeBook.chapters[currentChapterIndex] || activeBook.chapters[0];
  const totalChapters = activeBook.chapters.length;

  const currentTheme = AppleColors.readerThemes[settings.theme] || AppleColors.readerThemes.sepia;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < totalChapters - 1) {
      const nextIndex = currentChapterIndex + 1;
      const percent = Math.round(((nextIndex + 1) / totalChapters) * 100);
      updateReadingProgress(activeBook.id, nextIndex, percent, nextIndex + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      const prevIndex = currentChapterIndex - 1;
      const percent = Math.round(((prevIndex + 1) / totalChapters) * 100);
      updateReadingProgress(activeBook.id, prevIndex, percent, prevIndex + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleSelectChapter = (index: number) => {
    const percent = Math.round(((index + 1) / totalChapters) * 100);
    updateReadingProgress(activeBook.id, index, percent, index + 1);
    setShowTocModal(false);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleAddBookmark = () => {
    const snippet = currentChapter.content.slice(0, 100) + '...';
    addBookmark(activeBook.id, snippet);
    triggerToast('Bookmark adicionado com sucesso! 🔖');
  };

  const getFontFamilyStyle = () => {
    if (settings.fontFamily === 'Serif') return Platform.OS === 'web' ? 'Georgia, serif' : 'serif';
    if (settings.fontFamily === 'Monospace') return Platform.OS === 'web' ? 'Courier New, monospace' : 'monospace';
    return Platform.OS === 'web' ? 'system-ui, -apple-system, sans-serif' : 'sans-serif';
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.bg }]}>
      {/* Toast Notification */}
      {toastMessage ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}

      {/* Reader Top Controls */}
      <View style={[styles.topBar, { backgroundColor: currentTheme.uiBg, borderColor: 'rgba(0,0,0,0.06)' }]}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setActiveView('library')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={22} color={currentTheme.uiText} />
        </TouchableOpacity>

        <View style={styles.titleSection}>
          <Text style={[styles.bookTitleHeader, { color: currentTheme.uiText }]} numberOfLines={1}>
            {activeBook.title}
          </Text>
          <Text style={[styles.chapterTitleHeader, { color: currentTheme.subtext }]} numberOfLines={1}>
            {currentChapter.title}
          </Text>
        </View>

        <View style={styles.topRightActions}>
          {/* Active session timer & XP indicator */}
          <View style={[styles.xpSessionBadge, { backgroundColor: currentTheme.bg }]}>
            <Zap size={14} color={AppleColors.yellow} fill={AppleColors.yellow} />
            <Text style={[styles.xpSessionText, { color: currentTheme.uiText }]}>
              {Math.floor(sessionSeconds / 60)}m ({Math.round(sessionSeconds * 0.25)} XP)
            </Text>
          </View>

          <TouchableOpacity style={styles.iconButton} onPress={handleAddBookmark}>
            <BookmarkIcon size={20} color={currentTheme.uiText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => setShowTocModal(true)}>
            <List size={20} color={currentTheme.uiText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => setShowSettingsModal(true)}>
            <SettingsIcon size={20} color={currentTheme.uiText} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Reading Canvas */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.readerPaper}>
          <Text style={[styles.chapterHeading, { color: currentTheme.text, fontFamily: getFontFamilyStyle() }]}>
            {currentChapter.title}
          </Text>

          <Text
            style={[
              styles.chapterBodyText,
              {
                color: currentTheme.text,
                fontSize: settings.fontSize,
                lineHeight: settings.fontSize * settings.lineHeight,
                fontFamily: getFontFamilyStyle(),
              },
            ]}
          >
            {currentChapter.content}
          </Text>

          {/* End of chapter pagination buttons */}
          <View style={styles.chapterNavigationRow}>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentChapterIndex === 0 && styles.navButtonDisabled,
                { backgroundColor: currentTheme.uiBg },
              ]}
              onPress={handlePrevChapter}
              disabled={currentChapterIndex === 0}
            >
              <ChevronLeft size={20} color={currentTheme.uiText} />
              <Text style={[styles.navButtonText, { color: currentTheme.uiText }]}>Capítulo Anterior</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navButton,
                currentChapterIndex === totalChapters - 1 && styles.navButtonDisabled,
                { backgroundColor: AppleColors.blue },
              ]}
              onPress={handleNextChapter}
              disabled={currentChapterIndex === totalChapters - 1}
            >
              <Text style={[styles.navButtonText, { color: '#FFF' }]}>Próximo Capítulo</Text>
              <ChevronRight size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Progress Bar */}
      <View style={[styles.bottomBar, { backgroundColor: currentTheme.uiBg }]}>
        <Text style={[styles.progressLabel, { color: currentTheme.subtext }]}>
          Cap. {currentChapterIndex + 1} de {totalChapters}
        </Text>

        <View style={styles.progressTrackContainer}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.round(((currentChapterIndex + 1) / totalChapters) * 100)}%`,
                backgroundColor: currentTheme.activeBorder,
              },
            ]}
          />
        </View>

        <Text style={[styles.progressPercentText, { color: currentTheme.uiText }]}>
          {Math.round(((currentChapterIndex + 1) / totalChapters) * 100)}%
        </Text>
      </View>

      {/* Table of Contents Modal */}
      <Modal visible={showTocModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.uiBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.uiText }]}>Índice do Livro</Text>
              <TouchableOpacity onPress={() => setShowTocModal(false)}>
                <Text style={{ color: AppleColors.blue, fontWeight: '700' }}>Fechar</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={activeBook.chapters}
              keyExtractor={item => item.id}
              renderItem={({ item, index }) => {
                const isCurrent = index === currentChapterIndex;
                return (
                  <TouchableOpacity
                    style={[
                      styles.tocItem,
                      isCurrent && { backgroundColor: 'rgba(10, 132, 255, 0.15)' },
                    ]}
                    onPress={() => handleSelectChapter(index)}
                  >
                    <Text
                      style={[
                        styles.tocItemText,
                        { color: isCurrent ? AppleColors.blue : currentTheme.uiText },
                        isCurrent && { fontWeight: '700' },
                      ]}
                    >
                      {item.title}
                    </Text>
                    {isCurrent ? <Check size={18} color={AppleColors.blue} /> : null}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Reader Settings Sheet Modal */}
      <Modal visible={showSettingsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.uiBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.uiText }]}>Ajustes de Leitura</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Text style={{ color: AppleColors.blue, fontWeight: '700' }}>Concluído</Text>
              </TouchableOpacity>
            </View>

            {/* Font Size controls */}
            <Text style={[styles.settingSectionLabel, { color: currentTheme.subtext }]}>TAMANHO DA FONTE</Text>
            <View style={styles.fontSizeRow}>
              <TouchableOpacity
                style={[styles.fontSizeBtn, { backgroundColor: currentTheme.bg }]}
                onPress={() => updateSettings({ fontSize: Math.max(14, settings.fontSize - 2) })}
              >
                <Text style={[styles.fontSizeBtnText, { color: currentTheme.uiText, fontSize: 14 }]}>A-</Text>
              </TouchableOpacity>

              <Text style={[styles.fontSizeVal, { color: currentTheme.uiText }]}>{settings.fontSize}px</Text>

              <TouchableOpacity
                style={[styles.fontSizeBtn, { backgroundColor: currentTheme.bg }]}
                onPress={() => updateSettings({ fontSize: Math.min(32, settings.fontSize + 2) })}
              >
                <Text style={[styles.fontSizeBtnText, { color: currentTheme.uiText, fontSize: 20 }]}>A+</Text>
              </TouchableOpacity>
            </View>

            {/* Font Family selector */}
            <Text style={[styles.settingSectionLabel, { color: currentTheme.subtext, marginTop: 16 }]}>TIPOGRAFIA</Text>
            <View style={styles.fontFamilyRow}>
              {(['Serif', 'Sans', 'Monospace'] as ReaderFontFamily[]).map(ff => (
                <TouchableOpacity
                  key={ff}
                  style={[
                    styles.fontFamilyChip,
                    { backgroundColor: currentTheme.bg },
                    settings.fontFamily === ff && { borderColor: AppleColors.blue, borderWidth: 2 },
                  ]}
                  onPress={() => updateSettings({ fontFamily: ff })}
                >
                  <Text style={[styles.fontFamilyText, { color: currentTheme.uiText }]}>{ff}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Theme selector */}
            <Text style={[styles.settingSectionLabel, { color: currentTheme.subtext, marginTop: 16 }]}>TEMA DE CORES</Text>
            <View style={styles.themeGrid}>
              {[
                { key: 'light', label: 'Apple Light', bg: '#FAF8F5', text: '#2C2C2E' },
                { key: 'sepia', label: 'Papel Sepia', bg: '#F4ECD8', text: '#5B4636' },
                { key: 'dark', label: 'Onyx Dark', bg: '#1C1C1E', text: '#E5E5EA' },
                { key: 'pitchBlack', label: 'Pitch Black', bg: '#000000', text: '#D1D1D6' },
              ].map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    styles.themeOptionCard,
                    { backgroundColor: t.bg },
                    settings.theme === t.key && { borderColor: AppleColors.blue, borderWidth: 2 },
                  ]}
                  onPress={() => updateSettings({ theme: t.key as ReaderTheme })}
                >
                  <Text style={[styles.themeOptionLabel, { color: t.text }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: AppleColors.background,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: AppleColors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: AppleColors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  browseButton: {
    marginTop: 20,
    backgroundColor: AppleColors.blue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  browseButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },

  toast: {
    position: 'absolute',
    top: 70,
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

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconButton: {
    padding: 6,
  },
  titleSection: {
    flex: 1,
    marginHorizontal: 12,
  },
  bookTitleHeader: {
    fontSize: 14,
    fontWeight: '700',
  },
  chapterTitleHeader: {
    fontSize: 12,
    marginTop: 1,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpSessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpSessionText: {
    fontSize: 11,
    fontWeight: '700',
  },

  scrollContent: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  readerPaper: {
    maxWidth: 720,
    width: '100%',
  },
  chapterHeading: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  chapterBodyText: {
    textAlign: 'justify',
  },

  chapterNavigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  progressLabel: {
    fontSize: 12,
  },
  progressTrackContainer: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  tocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tocItemText: {
    fontSize: 14,
  },
  settingSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  fontSizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  fontSizeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  fontSizeBtnText: {
    fontWeight: '700',
  },
  fontSizeVal: {
    fontSize: 16,
    fontWeight: '700',
  },
  fontFamilyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fontFamilyChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  fontFamilyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeOptionCard: {
    width: '47%',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  themeOptionLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
});

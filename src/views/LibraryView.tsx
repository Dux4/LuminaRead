import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import {
  Plus,
  Search,
  BookOpen,
  Trash2,
  FileText,
  Bookmark as BookmarkIcon,
  X,
  UploadCloud,
  CheckCircle,
  FolderPlus,
  Sparkles,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { AppleColors } from '../theme/colors';
import { BookFormat, Book } from '../types';
import { parseUploadedFile, base64ToArrayBuffer } from '../services/bookParser';

export const LibraryView: React.FC = () => {
  const { books, selectBook, deleteBook, addBook } = useApp();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFormatFilter, setSelectedFormatFilter] = useState<BookFormat | 'ALL'>('ALL');
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);

  // Manual file input state
  const [pastedTitle, setPastedTitle] = useState<string>('');
  const [pastedAuthor, setPastedAuthor] = useState<string>('');
  const [pastedContent, setPastedContent] = useState<string>('');
  const [selectedPastedFormat, setSelectedPastedFormat] = useState<BookFormat>('TXT');

  const filteredBooks = books.filter(b => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = selectedFormatFilter === 'ALL' || b.format === selectedFormatFilter;
    return matchesSearch && matchesFormat;
  });

  // Browser file picker for Web
  const handleWebFileUpload = async (event: any) => {
    try {
      const file = event.target?.files?.[0];
      if (!file) return;

      setIsParsing(true);
      const reader = new FileReader();

      reader.onload = async e => {
        const result = e.target?.result;
        if (result) {
          const parsed = await parseUploadedFile(file.name, result);
          const newBook: Book = {
            id: `user-book-${Date.now()}`,
            title: parsed.title,
            author: parsed.author,
            coverColor: parsed.coverColor,
            format: parsed.format,
            chapters: parsed.chapters,
            currentChapterIndex: 0,
            currentProgressPercent: 0,
            totalPages: parsed.chapters.length * 10,
            currentPage: 1,
            bookmarks: [],
            addedAt: new Date().toISOString(),
            fileSize: `${Math.round(file.size / 1024)} KB`,
          };

          addBook(newBook);
          setIsParsing(false);
          setShowImportModal(false);
        }
      };

      if (file.name.endsWith('.epub') || file.name.endsWith('.pdf')) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    } catch (err) {
      console.error('Web file import error:', err);
      setIsParsing(false);
    }
  };

  // Native Mobile File Picker for Android / iOS devices
  const handlePickDocumentMobile = async () => {
    try {
      setIsParsing(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Accepts EPUB, PDF, TXT, MD
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.name;
        const fileUri = asset.uri;

        let fileContent: string | ArrayBuffer = '';
        if (fileName.endsWith('.epub') || fileName.endsWith('.pdf')) {
          const base64Str = await FileSystem.readAsStringAsync(fileUri, {
            encoding: 'base64',
          });
          fileContent = base64ToArrayBuffer(base64Str);
        } else {
          fileContent = await FileSystem.readAsStringAsync(fileUri, {
            encoding: 'utf8',
          });
        }

        const parsed = await parseUploadedFile(fileName, fileContent);
        const newBook: Book = {
          id: `user-book-${Date.now()}`,
          title: parsed.title,
          author: parsed.author,
          coverColor: parsed.coverColor,
          format: parsed.format,
          chapters: parsed.chapters,
          currentChapterIndex: 0,
          currentProgressPercent: 0,
          totalPages: parsed.chapters.length * 10,
          currentPage: 1,
          bookmarks: [],
          addedAt: new Date().toISOString(),
          fileSize: `${Math.round((asset.size || 2048) / 1024)} KB`,
        };

        addBook(newBook);
        setIsParsing(false);
        setShowImportModal(false);
      } else {
        setIsParsing(false);
      }
    } catch (err) {
      console.error('Mobile Document Picker error:', err);
      setIsParsing(false);
    }
  };

  const handleManualAddBook = () => {
    if (!pastedTitle.trim() || !pastedContent.trim()) return;

    const chapters = pastedContent.split(/(?=\nCapítulo|\nChapter|\n#{1,3}\s)/i).map((chunk, idx) => ({
      id: `manual-ch-${idx + 1}`,
      title: `Capítulo ${idx + 1}`,
      content: chunk.trim(),
    }));

    const newBook: Book = {
      id: `user-book-${Date.now()}`,
      title: pastedTitle.trim(),
      author: pastedAuthor.trim() || 'Desconhecido',
      coverColor: '#0A84FF',
      format: selectedPastedFormat,
      chapters: chapters.length > 0 ? chapters : [{ id: 'm-1', title: 'Início', content: pastedContent }],
      currentChapterIndex: 0,
      currentProgressPercent: 0,
      totalPages: 20,
      currentPage: 1,
      bookmarks: [],
      addedAt: new Date().toISOString(),
    };

    addBook(newBook);
    setPastedTitle('');
    setPastedAuthor('');
    setPastedContent('');
    setShowImportModal(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Header & Search Bar */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.viewTitle}>Sua Biblioteca</Text>
          <Text style={styles.viewSubtitle}>{books.length} livros salvos no seu dispositivo</Text>
        </View>

        <TouchableOpacity
          style={styles.importBtn}
          onPress={() => setShowImportModal(true)}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#FFF" />
          <Text style={styles.importBtnText}>Adicionar Livro</Text>
        </TouchableOpacity>
      </View>

      {/* Search & Filter Row */}
      <View style={styles.filterRow}>
        <View style={styles.searchBox}>
          <Search size={18} color={AppleColors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por título ou autor..."
            placeholderTextColor={AppleColors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={AppleColors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Format Pill Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsContainer}>
          {(['ALL', 'EPUB', 'PDF', 'TXT'] as const).map(fmt => {
            const isActive = selectedFormatFilter === fmt;
            return (
              <TouchableOpacity
                key={fmt}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setSelectedFormatFilter(fmt)}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {fmt === 'ALL' ? 'Todos' : fmt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Bookshelf Grid */}
      <View style={isDesktop ? styles.booksGridDesktop : styles.booksGridMobile}>
        {filteredBooks.map(book => (
          <GlassCard key={book.id} style={styles.bookCard}>
            <View style={styles.bookCardTop}>
              <View style={[styles.bookCover, { backgroundColor: book.coverColor }]}>
                <BookOpen size={24} color="#FFF" />
                <View style={styles.formatChip}>
                  <Text style={styles.formatChipText}>{book.format}</Text>
                </View>
              </View>

              <View style={styles.bookDetailsFlex}>
                <Text style={styles.bookTitle} numberOfLines={2}>
                  {book.title}
                </Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>
                  {book.author}
                </Text>
                <Text style={styles.chaptersCount}>
                  {book.chapters.length} capítulos ({book.bookmarks.length} 🔖)
                </Text>

                {/* Progress bar */}
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${book.currentProgressPercent}%`, backgroundColor: book.coverColor },
                      ]}
                    />
                  </View>
                  <Text style={styles.percentText}>{book.currentProgressPercent}%</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardActionRow}>
              <TouchableOpacity
                style={[styles.readNowBtn, { backgroundColor: book.coverColor }]}
                onPress={() => selectBook(book.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.readNowText}>
                  {book.currentProgressPercent > 0 ? 'Continuar Lendo' : 'Iniciar Leitura'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteBook(book.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={16} color={AppleColors.red} />
              </TouchableOpacity>
            </View>
          </GlassCard>
        ))}
      </View>

      {/* Import Modal */}
      <Modal visible={showImportModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalSheetHeader}>
              <Text style={styles.modalSheetTitle}>Importar Livro (EPUB, PDF, TXT)</Text>
              <TouchableOpacity onPress={() => setShowImportModal(false)}>
                <X size={20} color={AppleColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Document Picker Box */}
            <View style={styles.uploadArea}>
              <UploadCloud size={40} color={AppleColors.blue} />
              <Text style={styles.uploadTitle}>Selecione um arquivo do celular ou computador</Text>
              <Text style={styles.uploadSub}>Suporta extensões .epub, .pdf, .txt e .md</Text>

              {Platform.OS === 'web' ? (
                <input
                  type="file"
                  accept=".epub,.pdf,.txt,.md"
                  onChange={handleWebFileUpload}
                  style={styles.webFileInput as any}
                />
              ) : (
                <TouchableOpacity
                  style={styles.nativePickBtn}
                  onPress={handlePickDocumentMobile}
                  activeOpacity={0.8}
                >
                  <FolderPlus size={18} color="#FFF" />
                  <Text style={styles.nativePickText}>Abrir Arquivos do Celular</Text>
                </TouchableOpacity>
              )}

              {isParsing ? (
                <View style={styles.parsingRow}>
                  <ActivityIndicator color={AppleColors.blue} size="small" />
                  <Text style={styles.parsingText}>Processando e organizando capítulos...</Text>
                </View>
              ) : null}
            </View>

            {/* Manual Paste Text Alternative */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU COLE O TEXTO DIRETO</Text>
              <View style={styles.dividerLine} />
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Título do Livro"
              placeholderTextColor={AppleColors.textTertiary}
              value={pastedTitle}
              onChangeText={setPastedTitle}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Autor (Opcional)"
              placeholderTextColor={AppleColors.textTertiary}
              value={pastedAuthor}
              onChangeText={setPastedAuthor}
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Cole o texto ou capítulos aqui..."
              placeholderTextColor={AppleColors.textTertiary}
              multiline
              numberOfLines={5}
              value={pastedContent}
              onChangeText={setPastedContent}
            />

            <TouchableOpacity
              style={styles.submitBookBtn}
              onPress={handleManualAddBook}
              activeOpacity={0.8}
            >
              <CheckCircle size={18} color="#FFF" />
              <Text style={styles.submitBookBtnText}>Salvar Livro na Biblioteca</Text>
            </TouchableOpacity>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppleColors.blue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  importBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },

  filterRow: {
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    color: AppleColors.textPrimary,
    fontSize: 14,
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterPillActive: {
    backgroundColor: AppleColors.blue,
    borderColor: AppleColors.blue,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppleColors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFF',
  },

  booksGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  booksGridMobile: {
    flexDirection: 'column',
    gap: 16,
  },
  bookCard: {
    minWidth: 300,
    flex: 1,
    justifyContent: 'space-between',
    gap: 14,
  },
  bookCardTop: {
    flexDirection: 'row',
    gap: 14,
  },
  bookCover: {
    width: 60,
    height: 84,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  formatChip: {
    position: 'absolute',
    bottom: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  formatChipText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '800',
  },
  bookDetailsFlex: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppleColors.textPrimary,
  },
  bookAuthor: {
    fontSize: 12,
    color: AppleColors.textSecondary,
    marginTop: 2,
  },
  chaptersCount: {
    fontSize: 11,
    color: AppleColors.textTertiary,
    marginTop: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  percentText: {
    fontSize: 10,
    fontWeight: '700',
    color: AppleColors.textSecondary,
  },

  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  readNowBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
  },
  readNowText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 69, 58, 0.12)',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalSheet: {
    maxWidth: 520,
    width: '100%',
    backgroundColor: AppleColors.surface,
    borderRadius: 24,
    padding: 24,
    gap: 14,
    borderWidth: 1,
    borderColor: AppleColors.surfaceBorder,
  },
  modalSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalSheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AppleColors.textPrimary,
  },
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(10, 132, 255, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    backgroundColor: 'rgba(10, 132, 255, 0.05)',
    position: 'relative',
    overflow: 'hidden',
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppleColors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  uploadSub: {
    fontSize: 12,
    color: AppleColors.textSecondary,
    marginTop: 2,
  },
  webFileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
  },
  nativePickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    backgroundColor: AppleColors.blue,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: AppleColors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nativePickText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  parsingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  parsingText: {
    fontSize: 12,
    color: AppleColors.blue,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: AppleColors.textTertiary,
    letterSpacing: 0.8,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: AppleColors.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTextArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  submitBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AppleColors.green,
    paddingVertical: 12,
    borderRadius: 14,
  },
  submitBookBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

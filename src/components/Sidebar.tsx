import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { LayoutDashboard, BookOpen, Trophy, Settings as SettingsIcon, Book } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { AppleColors } from '../theme/colors';

interface NavItem {
  key: 'home' | 'library' | 'reader' | 'gamification' | 'settings';
  label: string;
  icon: any;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, activeBook } = useApp();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const navItems: NavItem[] = [
    { key: 'home', label: 'Início', icon: LayoutDashboard },
    { key: 'library', label: 'Biblioteca', icon: BookOpen },
    { key: 'reader', label: 'Leitor Pro', icon: Book, badge: activeBook ? 'Ativo' : undefined },
    { key: 'gamification', label: 'Conquistas', icon: Trophy },
    { key: 'settings', label: 'Ajustes', icon: SettingsIcon },
  ];

  if (isDesktop) {
    // Desktop Sidebar View
    return (
      <View style={styles.sidebarContainer}>
        <View style={styles.navGroup}>
          <Text style={styles.navSectionTitle}>NAVEGAÇÃO</Text>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.desktopNavItem, isActive && styles.desktopNavItemActive]}
                onPress={() => setActiveView(item.key)}
                activeOpacity={0.7}
              >
                <Icon
                  size={20}
                  color={isActive ? AppleColors.blue : AppleColors.textSecondary}
                />
                <Text
                  style={[
                    styles.desktopNavLabel,
                    isActive && styles.desktopNavLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
                {item.badge ? (
                  <View style={styles.activeBookBadge}>
                    <Text style={styles.activeBookBadgeText}>{item.badge}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {activeBook ? (
          <View style={styles.miniActiveBookCard}>
            <Text style={styles.miniActiveTitle} numberOfLines={1}>
              {activeBook.title}
            </Text>
            <Text style={styles.miniActiveAuthor} numberOfLines={1}>
              {activeBook.author}
            </Text>
            <View style={styles.miniProgressTrack}>
              <View
                style={[
                  styles.miniProgressFill,
                  { width: `${activeBook.currentProgressPercent}%` },
                ]}
              />
            </View>
            <Text style={styles.miniPercentText}>{activeBook.currentProgressPercent}% lido</Text>
          </View>
        ) : null}
      </View>
    );
  }

  // Mobile Bottom Bar View
  return (
    <View style={styles.bottomBarContainer}>
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeView === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.mobileNavItem}
            onPress={() => setActiveView(item.key)}
            activeOpacity={0.7}
          >
            <Icon
              size={22}
              color={isActive ? AppleColors.blue : AppleColors.textSecondary}
            />
            <Text
              style={[
                styles.mobileNavLabel,
                isActive && styles.mobileNavLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  // Desktop Sidebar
  sidebarContainer: {
    width: 240,
    backgroundColor: 'rgba(22, 22, 30, 0.7)',
    borderRightWidth: 1,
    borderRightColor: AppleColors.surfaceBorder,
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    height: '100%',
  },
  navGroup: {
    gap: 6,
  },
  navSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: AppleColors.textTertiary,
    marginBottom: 8,
    paddingLeft: 12,
    letterSpacing: 0.8,
  },
  desktopNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 12,
  },
  desktopNavItemActive: {
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  desktopNavLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: AppleColors.textSecondary,
    flex: 1,
  },
  desktopNavLabelActive: {
    color: AppleColors.textPrimary,
    fontWeight: '600',
  },
  activeBookBadge: {
    backgroundColor: AppleColors.blue,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBookBadgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '700',
  },
  miniActiveBookCard: {
    marginTop: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  miniActiveTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AppleColors.textPrimary,
  },
  miniActiveAuthor: {
    fontSize: 11,
    color: AppleColors.textSecondary,
    marginTop: 2,
  },
  miniProgressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 10,
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: AppleColors.blue,
  },
  miniPercentText: {
    fontSize: 10,
    color: AppleColors.textTertiary,
    marginTop: 4,
    textAlign: 'right',
  },

  // Mobile Bottom Bar
  bottomBarContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(18, 18, 24, 0.98)',
    borderTopWidth: 1,
    borderTopColor: AppleColors.surfaceBorder,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 26 : 16,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
  },
  mobileNavItem: {
    alignItems: 'center',
    gap: 4,
  },
  mobileNavLabel: {
    fontSize: 10,
    color: AppleColors.textSecondary,
    fontWeight: '500',
  },
  mobileNavLabelActive: {
    color: AppleColors.blue,
    fontWeight: '700',
  },
});

import React from 'react';
import { StyleSheet, View, SafeAreaView, useWindowDimensions, StatusBar, Platform } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { Header } from './src/components/Header';
import { Sidebar } from './src/components/Sidebar';
import { HomeView } from './src/views/HomeView';
import { LibraryView } from './src/views/LibraryView';
import { ReaderView } from './src/views/ReaderView';
import { GamificationView } from './src/views/GamificationView';
import { SettingsView } from './src/views/SettingsView';
import { AppleColors } from './src/theme/colors';

const MainLayout: React.FC = () => {
  const { activeView } = useApp();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'library':
        return <LibraryView />;
      case 'reader':
        return <ReaderView />;
      case 'gamification':
        return <GamificationView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={AppleColors.background} translucent={false} />
      {/* Header bar (Not shown in reader mode for full immersion) */}
      {activeView !== 'reader' ? <Header /> : null}

      <View style={isDesktop ? styles.desktopMainRow : styles.mobileMainCol}>
        {/* Desktop Sidebar on left */}
        {isDesktop ? <Sidebar /> : null}

        {/* Content View Container */}
        <View style={styles.contentContainer}>{renderActiveView()}</View>
      </View>

      {/* Mobile Bottom Navigation Bar */}
      {!isDesktop ? <Sidebar /> : null}
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppleColors.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  desktopMainRow: {
    flex: 1,
    flexDirection: 'row',
  },
  mobileMainCol: {
    flex: 1,
    flexDirection: 'column',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: AppleColors.background,
  },
});

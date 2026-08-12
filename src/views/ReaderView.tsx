import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ReaderEngine } from '../components/Reader/ReaderEngine';

export const ReaderView: React.FC = () => {
  return (
    <View style={styles.container}>
      <ReaderEngine />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

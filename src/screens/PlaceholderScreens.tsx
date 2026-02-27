import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

export const AnalysisScreen = () => (
    <SafeAreaView style={styles.container}>
        <Text style={styles.text}>Analysis Screen - Coming Soon</Text>
    </SafeAreaView>
);

export const ContentScreen = () => (
    <SafeAreaView style={styles.container}>
        <Text style={styles.text}>Content Screen - Coming Soon</Text>
    </SafeAreaView>
);

import { useCycle } from '../context/CycleContext';

export const TrackScreen = () => {
    const { isDarkMode } = useCycle();
    const bgColor = isDarkMode ? '#000000' : '#F2F2F7';
    const textColor = isDarkMode ? '#FFF' : '#1C1C1E';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
            <Text style={[styles.text, { color: textColor }]}>Track Screen - Modal Placeholder</Text>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
    },
    text: {
        fontSize: 18,
        color: COLORS.text,
    }
});

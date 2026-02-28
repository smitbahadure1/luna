import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import CycleDial from '../components/CycleDial';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { useCycle } from '../context/CycleContext';
import * as Haptics from 'expo-haptics';
import { getCurrentCycleDay } from '../utils/cycleLogic';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

import { useNavigation, NavigationProp } from '@react-navigation/native';



// Reusable Glass Card Component
const GlassCard = ({ children, style, isDarkMode }: any) => {
    // Very subtle border
    const border = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.3)';

    return (
        <View style={[styles.glassCard, { borderColor: border, elevation: 0 }, style]}>
            <BlurView
                intensity={Platform.OS === 'ios' ? 25 : 15}
                tint={isDarkMode ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
            />
            <LinearGradient
                colors={isDarkMode ?
                    ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'] :
                    ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.02)'] // Drastically reduced for 'invisible' glass
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            {children}
        </View>
    );
};

import { PhaseTimeline, HormoneFluctuations } from '../components/CycleDiagrams';

// ... (existing imports)

const HomeScreen = () => {
    const today = new Date();
    const navigation = useNavigation<NavigationProp<any>>();
    const { isDarkMode, lastPeriodDate, userName, cycleLength, periodLength } = useCycle(); // Added cycleLength, periodLength



    const currentDay = lastPeriodDate ? getCurrentCycleDay(lastPeriodDate) : 1;
    // Removed getPhaseInsight call

    // Liquid Theme Colors
    const textColor = isDarkMode ? '#FFFFFF' : '#1C1C1E';
    const subTextColor = isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';

    // Background Gradients
    const bgColors = isDarkMode
        ? ['#0F0F13', '#1A1A24', '#0F0F13']
        : ['#F6F8FF', '#F0F4FF', '#FFFFFF'];

    // Removed ActionButton component definition as it is no longer used

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            {/* Ambient Background Orbs/Gradients */}
            <LinearGradient
                colors={bgColors as [string, string, ...string[]]}
                style={StyleSheet.absoluteFill}
            />

            {/* Decoration Orbs (blurred) */}
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
                <View style={{
                    position: 'absolute', top: -80, left: -40, width: 340, height: 340,
                    borderRadius: 170, backgroundColor: COLORS.primaryRed, opacity: 0.15
                }} />
                <View style={{
                    position: 'absolute', top: 120, right: -120, width: 380, height: 380,
                    borderRadius: 190, backgroundColor: COLORS.primaryTeal, opacity: 0.12
                }} />
            </View>

            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.dateText, { color: subTextColor }]}>{format(today, 'EEEE, MMM d').toUpperCase()}</Text>
                        <Text style={[styles.appTitle, { color: textColor }]}>Hello, {userName}</Text>
                    </View>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Main Visualization - Floating Glass Dial */}
                    <CycleDial />

                    {/* NEW: Cycle Phase Timeline */}
                    <GlassCard isDarkMode={isDarkMode} style={styles.cardContainer}>
                        <PhaseTimeline
                            currentDay={currentDay}
                            cycleLength={cycleLength}
                            periodLength={periodLength}
                            isDarkMode={isDarkMode}
                        />
                    </GlassCard>

                    {/* NEW: Hormone Fluctuation Diagram */}
                    <GlassCard isDarkMode={isDarkMode} style={styles.cardContainer}>
                        <HormoneFluctuations
                            currentDay={currentDay}
                            cycleLength={cycleLength}
                            periodLength={periodLength}
                            isDarkMode={isDarkMode}
                        />
                    </GlassCard>

                    {/* Quick Access to Full Log (Smaller button) */}
                    <TouchableOpacity
                        style={[styles.fullLogBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)' }]}
                        onPress={() => navigation.navigate('LogDetails')}
                    >
                        <Text style={[styles.fullLogText, { color: textColor }]}>Log Symptoms</Text>
                        <Ionicons name="arrow-forward" size={20} color={textColor} />
                    </TouchableOpacity>

                    {/* Bottom padding */}
                    <View style={{ height: 100 }} />

                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 5,
    },
    dateText: {
        fontSize: 13,
        fontFamily: FONTS.semiBold,
        marginBottom: 4,
        letterSpacing: 1,
        opacity: 0.8,
    },
    appTitle: {
        fontSize: 32, // Slightly smaller for elegance
        fontFamily: FONTS.bold,
        letterSpacing: -0.5,
    },
    profileButton: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
        overflow: 'hidden',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 10,
    },
    glassCard: {
        borderRadius: 28,
        padding: 24, // Generous padding
        marginBottom: 20,
        borderWidth: 1,
        overflow: 'hidden',
        // Smooth shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05, // Reduced shadow for cleaner look
        shadowRadius: 15,
        // elevation: 5, // Removed to avoid solid shadow on Android
    },
    cardContainer: {
        // Handled by glassCard mostly
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        letterSpacing: 0.3,
        marginBottom: 16,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    linkText: {
        fontSize: 14,
        color: COLORS.primaryTeal,
        fontFamily: FONTS.semiBold,
    },
    divider: {
        height: 1,
        width: '100%',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionBtn: {
        alignItems: 'center',
        width: 70,
    },
    actionIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30, // Perfectly round
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        borderWidth: 1,
        overflow: 'hidden',
    },
    actionLabel: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        opacity: 0.9,
    },
    insightBody: {
        fontSize: 16,
        lineHeight: 24,
        fontFamily: FONTS.regular,
        opacity: 0.9,
    },
    fullLogBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginHorizontal: 4,
        marginTop: 10,
        borderRadius: 20,
        gap: 10,
    },
    fullLogText: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    }
});

export default HomeScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useCycle } from '../context/CycleContext';
import { format, subDays } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

// Reusable Glass Card
const GlassPanel = ({ children, style, isDarkMode }: any) => {
    return (
        <View style={[styles.glassPanel, style, {
            borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
            shadowColor: isDarkMode ? '#000' : '#888',
        }]}>
            <BlurView intensity={Platform.OS === 'ios' ? 30 : 100} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
            <LinearGradient
                colors={isDarkMode ? ['rgba(255,255,255,0.03)', 'transparent'] : ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)']}
                style={StyleSheet.absoluteFill}
            />
            {children}
        </View>
    );
};

const TrackScreen = () => {
    const { isDarkMode, logs, saveLog } = useCycle();

    // State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [flow, setFlow] = useState<string | null>(null);
    const [mood, setMood] = useState<string | null>(null);
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [sleep, setSleep] = useState<string | null>(null);

    // Dynamic Styles
    const textColor = isDarkMode ? '#FFF' : '#1C1C1E';
    const subTextColor = isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
    const bgColors = isDarkMode ? ['#050505', '#121212', '#080808'] : ['#F2F4F7', '#FFF', '#F7F2F4'];

    // Calendar Strip Data
    const dates = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 3 - i));

    // Load Data Effect
    useEffect(() => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const log = logs[dateStr];
        if (log) {
            setFlow(log.flow || null);
            setMood(log.mood || null);
            setSymptoms(log.symptoms || []);
            setSleep(log.sleep || null);
        } else {
            setFlow(null);
            setMood(null);
            setSymptoms([]);
            setSleep(null);
        }
    }, [selectedDate, logs]);

    // Save Helper (Auto-save)
    const saveData = (key: string, value: any) => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Optimistic update
        if (key === 'flow') setFlow(value);
        if (key === 'mood') setMood(value);
        if (key === 'symptoms') setSymptoms(value);
        if (key === 'sleep') setSleep(value);

        // Save to context
        saveLog(dateStr, { [key]: value });
    };

    const toggleSymptom = (label: string) => {
        const newSymptoms = symptoms.includes(label)
            ? symptoms.filter(s => s !== label)
            : [...symptoms, label];
        saveData('symptoms', newSymptoms);
    };

    // --- Components ---
    const SectionHeader = ({ title, icon, color }: any) => (
        <View style={styles.sectionHeader}>
            <View style={[styles.iconContainer,
            { backgroundColor: color, shadowColor: color, shadowOpacity: 0.4 }
            ]}>
                <Ionicons name={icon} size={18} color="#FFF" />
            </View>
            <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
        </View>
    );

    const OptionChip = ({ label, icon, isSelected, onPress, color = COLORS.primaryTeal }: any) => (
        <TouchableOpacity
            style={[
                styles.chip,
                isSelected
                    ? { backgroundColor: color, borderColor: color, transform: [{ scale: 1.02 }] }
                    : { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Ionicons
                name={isSelected ? icon : `${icon}-outline` as any}
                size={20}
                color={isSelected ? '#FFF' : (isDarkMode ? '#8E8E93' : '#666')}
            />
            <Text style={[
                styles.chipLabel,
                { color: isSelected ? '#FFF' : (isDarkMode ? '#AAA' : '#555') }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const DateItem = ({ date }: { date: Date }) => {
        const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
        return (
            <TouchableOpacity
                onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedDate(date);
                }}
                style={[
                    styles.dateItem,
                    isSelected
                        ? { backgroundColor: COLORS.primaryRed, transform: [{ scale: 1.1 }], shadowColor: COLORS.primaryRed, shadowOpacity: 0.4 }
                        : { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)' }
                ]}
            >
                <Text style={[styles.dateDay, { color: isSelected ? '#FFF' : subTextColor }]}>
                    {format(date, 'EEE')}
                </Text>
                <Text style={[styles.dateNum, { color: isSelected ? '#FFF' : textColor }]}>
                    {format(date, 'd')}
                </Text>
                {isSelected && <View style={styles.activeDot} />}
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.mainContainer}>
            {/* Background Layers */}
            <LinearGradient colors={bgColors as [string, string, ...string[]]} style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
                <View style={{
                    position: 'absolute', top: -100, left: -50, width: 300, height: 300,
                    borderRadius: 150, backgroundColor: COLORS.primaryTeal, opacity: 0.06
                }} />
                <View style={{
                    position: 'absolute', top: 200, right: -100, width: 400, height: 400,
                    borderRadius: 200, backgroundColor: COLORS.primaryRed, opacity: 0.05
                }} />
            </View>

            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: textColor }]}>Daily Log</Text>
                    <Text style={[styles.subTitle, { color: subTextColor }]}>
                        {format(selectedDate, 'MMMM d, yyyy')}
                    </Text>
                </View>

                {/* Date Strip */}
                <View style={[styles.calendarStrip]}>
                    {dates.map((date, index) => (
                        <DateItem key={index} date={date} />
                    ))}
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* 1. Flow Section */}
                    <GlassPanel isDarkMode={isDarkMode} style={styles.card}>
                        <SectionHeader title="Menstruation" icon="water" color={COLORS.primaryRed} />
                        <View style={styles.rowWrap}>
                            {['Spotting', 'Light', 'Medium', 'Heavy'].map((level) => (
                                <OptionChip
                                    key={level}
                                    label={level}
                                    icon="water"
                                    color={COLORS.primaryRed}
                                    isSelected={flow === level}
                                    onPress={() => saveData('flow', flow === level ? null : level)}
                                />
                            ))}
                        </View>
                    </GlassPanel>

                    {/* 2. Mood Section */}
                    <GlassPanel isDarkMode={isDarkMode} style={styles.card}>
                        <SectionHeader title="Mood" icon="happy" color={COLORS.orange} />
                        <View style={styles.rowWrap}>
                            {[
                                { l: 'Happy', i: 'happy' }, { l: 'Calm', i: 'leaf' },
                                { l: 'Sad', i: 'sad' }, { l: 'Anxious', i: 'alert-circle' },
                                { l: 'Energetic', i: 'flash' }, { l: 'Tired', i: 'battery-dead' }
                            ].map((m) => (
                                <OptionChip
                                    key={m.l}
                                    label={m.l}
                                    icon={m.i}
                                    color={COLORS.orange}
                                    isSelected={mood === m.l}
                                    onPress={() => saveData('mood', mood === m.l ? null : m.l)}
                                />
                            ))}
                        </View>
                    </GlassPanel>

                    {/* 3. Symptoms Section */}
                    <GlassPanel isDarkMode={isDarkMode} style={styles.card}>
                        <SectionHeader title="Symptoms" icon="medkit" color={COLORS.primaryTeal} />
                        <View style={styles.rowWrap}>
                            {[
                                { l: 'Cramps', i: 'medkit' }, { l: 'Headache', i: 'pulse' },
                                { l: 'Bloating', i: 'cloud' }, { l: 'Acne', i: 'water' },
                                { l: 'Backache', i: 'body' }, { l: 'Nausea', i: 'medical' }
                            ].map((s) => (
                                <OptionChip
                                    key={s.l}
                                    label={s.l}
                                    icon={s.i}
                                    color={COLORS.primaryTeal}
                                    isSelected={symptoms.includes(s.l)}
                                    onPress={() => toggleSymptom(s.l)}
                                />
                            ))}
                        </View>
                    </GlassPanel>

                    {/* 4. Sleep Section */}
                    <GlassPanel isDarkMode={isDarkMode} style={[styles.card, { marginBottom: 120 }]}>
                        <SectionHeader title="Sleep" icon="moon" color="#5856D6" />
                        <View style={styles.rowWrap}>
                            {['Good', 'Average', 'Poor', 'Insomnia'].map((s) => (
                                <OptionChip
                                    key={s}
                                    label={s}
                                    icon="moon"
                                    color="#5856D6"
                                    isSelected={sleep === s}
                                    onPress={() => saveData('sleep', sleep === s ? null : s)}
                                />
                            ))}
                        </View>
                    </GlassPanel>

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
        paddingHorizontal: 24,
        paddingBottom: 20,
        paddingTop: 10,
    },
    title: {
        fontSize: 34,
        fontFamily: FONTS.bold,
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    subTitle: {
        fontSize: 16,
        fontFamily: FONTS.medium,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    calendarStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    dateItem: {
        width: (width - 40) / 7 - 6,
        paddingVertical: 14,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    dateDay: {
        fontSize: 11,
        fontFamily: FONTS.bold,
        marginBottom: 6,
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    dateNum: {
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#FFF',
        position: 'absolute',
        bottom: 6,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    glassPanel: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    card: {
        // Used for marginBottom reference mainly
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    rowWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        minWidth: '46%',
        flexGrow: 1,
        justifyContent: 'center',
        gap: 8,
    },
    chipLabel: {
        fontSize: 14,
        fontFamily: FONTS.bold,
    },
});

export default TrackScreen;

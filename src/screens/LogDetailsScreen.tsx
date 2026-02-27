import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCycle } from '../context/CycleContext';
import { format, parseISO } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

// Reusable Glass Card (Local)
// Reusable Glass Panel (Local) - Updated to match Home Screen's new ultra-transparent style
const GlassPanel = ({ children, style, isDarkMode }: any) => {
    return (
        <View style={[styles.glassPanel, style, {
            borderColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.3)',
            // Removed shadow/elevation for cleaner glass look
        }]}>
            <BlurView
                intensity={Platform.OS === 'ios' ? 25 : 15}
                tint={isDarkMode ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
            />
            <LinearGradient
                colors={isDarkMode ?
                    ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'] :
                    ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.02)']
                }
                style={StyleSheet.absoluteFill}
            />
            {children}
        </View>
    );
};

const LogDetailsScreen = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const route = useRoute();
    const params = route.params || {};
    const paramDate = (params as any)?.date;
    const { isDarkMode, saveLog, logs } = useCycle();

    // Determine the date to log for
    const logDate = paramDate || format(new Date(), 'yyyy-MM-dd');

    // State for selections
    const [flow, setFlow] = useState<string | null>(null);
    const [mood, setMood] = useState<string | null>(null);
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [sleep, setSleep] = useState<string | null>(null);

    // Initial Load
    useEffect(() => {
        if (logs[logDate]) {
            const entry = logs[logDate];
            if (entry.flow) setFlow(entry.flow);
            if (entry.mood) setMood(entry.mood);
            if (entry.symptoms) setSymptoms(entry.symptoms);
            if (entry.sleep) setSleep(entry.sleep);
        }
    }, [logDate, logs]);

    const handleSave = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const dataToSave: any = {};
        dataToSave.flow = flow;
        dataToSave.mood = mood;
        dataToSave.symptoms = symptoms;
        dataToSave.sleep = sleep;

        saveLog(logDate, dataToSave);
        navigation.goBack();
    };

    const toggleSymptom = (label: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (symptoms.includes(label)) {
            setSymptoms(symptoms.filter(s => s !== label));
        } else {
            setSymptoms([...symptoms, label]);
        }
    };

    // --- Components ---

    const SectionHeader = ({ title, icon, color }: any) => (
        <View style={styles.sectionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: color, shadowColor: color }]}>
                <Ionicons name={icon} size={18} color="#FFF" />
            </View>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#1C1C1E' }]}>{title}</Text>
        </View>
    );

    const OptionChip = ({ label, icon, isSelected, onPress, color = COLORS.primaryTeal }: any) => {
        // Dynamic background for selected state (solid color) vs unselected (glass)
        const bgStyle = isSelected ? {
            backgroundColor: color,
            borderColor: color,
            shadowColor: color,
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4
        } : {
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.2)',
            borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)',
        };

        return (
            <TouchableOpacity
                style={[styles.chip, bgStyle]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={isSelected ? icon : `${icon}-outline` as any}
                    size={20}
                    color={isSelected ? '#FFF' : (isDarkMode ? '#AAA' : '#555')}
                />
                <Text style={[
                    styles.chipLabel,
                    { color: isSelected ? '#FFF' : (isDarkMode ? '#CCC' : '#444') }
                ]}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    // --- Render ---
    const formattedDate = format(parseISO(logDate), 'EEEE, MMMM d');

    return (
        <View style={styles.container}>
            {/* Background Layers */}
            <LinearGradient
                colors={isDarkMode ? ['#050505', '#121212', '#080808'] : ['#F2F4F7', '#FFF', '#F7F2F4']}
                style={StyleSheet.absoluteFill}
            />
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
                <View style={{
                    position: 'absolute', top: -50, right: -50, width: 300, height: 300,
                    borderRadius: 150, backgroundColor: COLORS.primaryRed, opacity: 0.05
                }} />
            </View>

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[styles.closeBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                    >
                        <Ionicons name="close" size={24} color={isDarkMode ? '#FFF' : '#000'} />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>Daily Log</Text>
                        <Text style={styles.headerSubtitle}>{formattedDate}</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >

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
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setFlow(flow === level ? null : level);
                                    }}
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
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setMood(mood === m.l ? null : m.l);
                                    }}
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
                        <SectionHeader title="Sleep Quality" icon="moon" color="#5856D6" />
                        <View style={styles.rowWrap}>
                            {['Good', 'Average', 'Poor', 'Insomnia'].map((s) => (
                                <OptionChip
                                    key={s}
                                    label={s}
                                    icon="moon"
                                    color="#5856D6"
                                    isSelected={sleep === s}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setSleep(sleep === s ? null : s);
                                    }}
                                />
                            ))}
                        </View>
                    </GlassPanel>

                </ScrollView>

                {/* Floating Save Button */}
                <View style={styles.footerWrapper}>
                    <BlurView intensity={20} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <LinearGradient
                                colors={[COLORS.primaryTeal, COLORS.secondaryTeal]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.saveGradient}
                            >
                                <Text style={styles.saveBtnText}>Save Entry</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        zIndex: 10,
    },
    glassPanel: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    closeBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontFamily: FONTS.bold,
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#8E8E93',
        fontFamily: FONTS.medium,
        marginTop: 2,
    },
    scrollContent: {
        padding: 20,
    },
    card: {
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    rowWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 30, // Fully rounded pills
        borderWidth: 1,
        // minWidth: '45%', // Removed to allow natural width or flex wrap
        marginBottom: 8,
        marginRight: 8,
        justifyContent: 'center',
        gap: 8,
    },
    chipLabel: {
        fontSize: 14,
        fontFamily: FONTS.bold,
    },
    footerWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
        backgroundColor: 'rgba(255,255,255,0.1)', // Subtle tint on glass
    },
    saveBtn: {
        shadowColor: COLORS.primaryTeal,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    saveGradient: {
        paddingVertical: 18,
        borderRadius: 25,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: FONTS.bold,
    }

});

export default LogDetailsScreen;

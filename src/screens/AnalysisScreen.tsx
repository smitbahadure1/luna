import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useCycle } from '../context/CycleContext';
import { LinearGradient } from 'expo-linear-gradient';
import { format, differenceInDays, parseISO, addDays } from 'date-fns';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const getIconForSymptom = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('cramp')) return 'flash-outline';
    if (n.includes('head')) return 'pulse-outline';
    if (n.includes('bloat')) return 'cloud-outline';
    if (n.includes('mood')) return 'happy-outline';
    if (n.includes('sleep') || n.includes('tired')) return 'bed-outline';
    return 'alert-circle-outline';
};

// Reusable Glass Panel (Local)
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

const AnalysisScreen = () => {
    const { cycleLength: settingCycleLen, periodLength: settingPeriodLen, lastPeriodDate, isDarkMode, logs, periodHistory } = useCycle();

    // Dynamic Styles
    const textColor = isDarkMode ? '#FFF' : '#1C1C1E';
    const subTextColor = isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
    const bgColors = isDarkMode ? ['#050505', '#121212', '#080808'] : ['#F2F4F7', '#FFF', '#F7F2F4'];
    const trackColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    // --- Data Processing (Memoized) ---
    const { avgCycle, avgPeriod, variationText, historyChartData, symptomList } = useMemo(() => {
        const sortedDates = [...periodHistory].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        let chartData: any[] = [];
        let cycleDiffs: number[] = [];
        let periodLens: number[] = [];

        if (sortedDates.length >= 2) {
            for (let i = 0; i < sortedDates.length - 1; i++) {
                const startDate = parseISO(sortedDates[i]);
                const nextDate = parseISO(sortedDates[i + 1]);
                const length = differenceInDays(nextDate, startDate);

                if (length > 10 && length < 100) {
                    cycleDiffs.push(length);
                    chartData.push({
                        month: format(nextDate, 'MMM'),
                        cycle: length,
                        period: settingPeriodLen // Default visual
                    });
                }
            }
        }

        // Calculate Period Lengths from Logs
        sortedDates.forEach((startDateStr) => {
            let duration = 0;
            let pDate = parseISO(startDateStr);
            for (let d = 0; d < 15; d++) {
                const checkDateStr = format(addDays(pDate, d), 'yyyy-MM-dd');
                if (logs[checkDateStr] && logs[checkDateStr].flow) {
                    duration++;
                } else if (d > 0) { // Gap means end
                    break;
                }
            }
            if (duration > 0) periodLens.push(duration);
        });

        // Averages
        const ac = cycleDiffs.length > 0
            ? Math.round(cycleDiffs.reduce((a, b) => a + b, 0) / cycleDiffs.length)
            : settingCycleLen;

        const ap = periodLens.length > 0
            ? Math.round(periodLens.reduce((a, b) => a + b, 0) / periodLens.length)
            : settingPeriodLen;

        // Variation
        let vt = "Regular";
        if (cycleDiffs.length >= 2) {
            const mean = cycleDiffs.reduce((a, b) => a + b, 0) / cycleDiffs.length;
            const variance = cycleDiffs.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / cycleDiffs.length;
            const stdDev = Math.sqrt(variance);
            if (stdDev < 2.5) vt = "Regular";
            else if (stdDev < 5) vt = "+/- " + Math.round(stdDev) + " days";
            else vt = "Irregular";
        }

        // Symptoms
        const counts: Record<string, number> = {};
        Object.values(logs).forEach(log => {
            if (log.symptoms) {
                log.symptoms.forEach(sym => {
                    counts[sym] = (counts[sym] || 0) + 1;
                });
            }
        });
        const sList = Object.keys(counts).map(key => ({
            name: key,
            count: counts[key],
            icon: getIconForSymptom(key)
        })).sort((a, b) => b.count - a.count).slice(0, 5);

        return { avgCycle: ac, avgPeriod: ap, variationText: vt, historyChartData: chartData, symptomList: sList };
    }, [periodHistory, logs, settingCycleLen, settingPeriodLen]);


    const renderChart = () => {
        if (historyChartData.length === 0) {
            return (
                <View style={[styles.chartContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="stats-chart" size={32} color={subTextColor} style={{ opacity: 0.5, marginBottom: 8 }} />
                    <Text style={{ color: subTextColor, fontFamily: FONTS.medium }}>Not enough history</Text>
                    <Text style={{ color: subTextColor, fontSize: 13, marginTop: 4 }}>Log 2+ periods to see trends</Text>
                </View>
            );
        }

        const maxCycleHeight = 45;

        return (
            <View style={styles.chartContainer}>
                <View style={[styles.chartGrid, { borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    {historyChartData.slice(-5).map((item, index) => {
                        const cycleHeight = Math.min((item.cycle / maxCycleHeight) * 150, 150);
                        const periodHeight = Math.min((item.period / maxCycleHeight) * 150, 150);

                        return (
                            <View key={index} style={styles.barGroup}>
                                <View style={[styles.barTrack, { backgroundColor: trackColor }]}>
                                    <View style={[styles.bar, { height: cycleHeight, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
                                    <LinearGradient
                                        colors={[COLORS.primaryRed, COLORS.primaryRed]}
                                        style={[styles.periodBar, { height: periodHeight }]}
                                    />
                                </View>
                                <Text style={styles.barLabel}>{item.month}</Text>
                            </View>
                        );
                    })}
                </View>
                <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }]} />
                        <Text style={[styles.legendText, { color: subTextColor }]}>Cycle Length</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: COLORS.primaryRed }]} />
                        <Text style={[styles.legendText, { color: subTextColor }]}>Period</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.mainContainer}>
            {/* Background Layers */}
            <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
                <View style={{
                    position: 'absolute', top: -100, left: -50, width: 300, height: 300,
                    borderRadius: 150, backgroundColor: COLORS.primaryRed, opacity: 0.05
                }} />
                <View style={{
                    position: 'absolute', bottom: 100, right: -50, width: 400, height: 400,
                    borderRadius: 200, backgroundColor: COLORS.primaryTeal, opacity: 0.05
                }} />
            </View>

            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.appTitle, { color: textColor }]}>Cycle Insights</Text>
                </View>

                {/* Empty State Check */}
                {!lastPeriodDate && (
                    <View style={styles.emptyStateContainer}>
                        <View style={[styles.emptyIconCircle, { backgroundColor: trackColor }]}>
                            <Ionicons name="analytics" size={48} color={COLORS.primaryTeal} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: textColor }]}>No Data Yet</Text>
                        <Text style={styles.emptyText}>Track your first period to unlock insights.</Text>
                    </View>
                )}

                {lastPeriodDate && (
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Top Stats Row */}
                        <View style={styles.statsRow}>
                            <GlassPanel isDarkMode={isDarkMode} style={styles.statCard}>
                                <View style={[styles.iconBadge, { backgroundColor: COLORS.primaryRed + '20' }]}>
                                    <Ionicons name="refresh" size={18} color={COLORS.primaryRed} />
                                </View>
                                <Text style={[styles.statValue, { color: textColor }]}>{avgCycle}</Text>
                                <Text style={styles.statLabel}>Avg Cycle</Text>
                            </GlassPanel>

                            <GlassPanel isDarkMode={isDarkMode} style={styles.statCard}>
                                <View style={[styles.iconBadge, { backgroundColor: COLORS.primaryTeal + '20' }]}>
                                    <Ionicons name="water" size={18} color={COLORS.primaryTeal} />
                                </View>
                                <Text style={[styles.statValue, { color: textColor }]}>{avgPeriod}</Text>
                                <Text style={styles.statLabel}>Avg Period</Text>
                            </GlassPanel>
                        </View>

                        {/* Regularity Card */}
                        <GlassPanel isDarkMode={isDarkMode} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View>
                                <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 4, fontSize: 16 }]}>Regularity</Text>
                                <Text style={{ color: subTextColor, fontSize: 13, fontFamily: FONTS.medium }}>Based on last 6 months</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ fontSize: 18, fontFamily: FONTS.bold, color: variationText === 'Regular' ? COLORS.primaryTeal : COLORS.orange }}>
                                    {variationText}
                                </Text>
                            </View>
                        </GlassPanel>

                        {/* Chart Card */}
                        <GlassPanel isDarkMode={isDarkMode} style={{}}>
                            <Text style={[styles.sectionTitle, { color: textColor }]}>Cycle History</Text>
                            {renderChart()}
                        </GlassPanel>

                        {/* Symptoms Card */}
                        <GlassPanel isDarkMode={isDarkMode} style={{}}>
                            <Text style={[styles.sectionTitle, { color: textColor }]}>Common Symptoms</Text>
                            {symptomList.length > 0 ? (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.symptomsScroll}>
                                    {symptomList.map((symptom, index) => (
                                        <View key={index} style={[styles.symptomChip, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                                            <Ionicons name={symptom.icon as any} size={20} color={COLORS.primaryRed} style={{ marginRight: 8 }} />
                                            <View>
                                                <Text style={[styles.symptomName, { color: textColor }]}>{symptom.name}</Text>
                                                <Text style={styles.countText}>{symptom.count} logs</Text>
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>
                            ) : (
                                <Text style={{ color: subTextColor, fontStyle: 'italic', fontFamily: FONTS.medium }}>No symptoms logged yet.</Text>
                            )}
                        </GlassPanel>

                        {/* Did you know? */}
                        <GlassPanel isDarkMode={isDarkMode} style={{}}>
                            <View style={styles.insightIconRow}>
                                <Ionicons name="bulb" size={20} color={COLORS.orange} />
                                <Text style={[styles.insightCategory, { color: COLORS.orange }]}>DID YOU KNOW?</Text>
                            </View>
                            <Text style={[styles.insightBody, { color: textColor }]}>
                                {variationText === 'Regular'
                                    ? "A regular cycle often indicates consistant hormonal health. Keep it up!"
                                    : "Cycle variations are normal and can be caused by stress, sleep, or diet changes."}
                            </Text>
                        </GlassPanel>

                        <View style={{ height: 100 }} />
                    </ScrollView>
                )}
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
        paddingTop: 10,
        paddingBottom: 20,
    },
    appTitle: {
        fontSize: 34,
        fontFamily: FONTS.bold,
        letterSpacing: -0.5,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    glassPanel: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 15,
    },
    statCard: {
        flex: 1,
        borderRadius: 24,
        padding: 20,
        alignItems: 'flex-start',
    },
    iconBadge: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 28,
        fontFamily: FONTS.bold,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#8E8E93',
        fontFamily: FONTS.medium,
    },
    chartContainer: {
        height: 200,
    },
    chartGrid: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        marginBottom: 15,
        borderBottomWidth: 1,
        paddingBottom: 10,
    },
    barGroup: {
        alignItems: 'center',
        width: 40,
    },
    barTrack: {
        width: 10,
        height: 150,
        justifyContent: 'flex-end',
        borderRadius: 5,
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    bar: {
        width: '100%',
        borderRadius: 5,
    },
    periodBar: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    barLabel: {
        marginTop: 8,
        fontSize: 12,
        color: '#8E8E93',
        fontFamily: FONTS.medium,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
        fontFamily: FONTS.medium,
    },
    symptomsScroll: {
        overflow: 'visible',
    },
    symptomChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginRight: 10,
    },
    symptomName: {
        fontSize: 14,
        fontFamily: FONTS.semiBold,
    },
    countText: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: '#8E8E93',
    },
    insightIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    insightCategory: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        marginLeft: 8,
        letterSpacing: 1,
    },
    insightBody: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: FONTS.regular,
        opacity: 0.8,
    },
    emptyStateContainer: {
        alignItems: 'center',
        padding: 40,
        marginTop: 40,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        marginBottom: 12,
    },
    emptyText: {
        textAlign: 'center',
        color: '#8E8E93',
        fontSize: 16,
        lineHeight: 24,
        fontFamily: FONTS.regular,
    },
});

export default AnalysisScreen;

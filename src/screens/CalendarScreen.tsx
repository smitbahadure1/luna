import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { CalendarList, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useCycle } from '../context/CycleContext';
import { getProjectedCycles } from '../utils/cycleLogic';
import { addDays, format, parseISO, differenceInDays } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const DAY_SIZE = (width - 32) / 7;

const CalendarScreen = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const { lastPeriodDate, cycleLength, periodLength, isDarkMode, logs, periodHistory } = useCycle();
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // --- Dynamic Theme Colors ---
    const bgColors = isDarkMode ? ['#050505', '#121212', '#000000'] : ['#F9F9FB', '#FFFFFF', '#F0F2F5'];
    const textColor = isDarkMode ? '#FFFFFF' : '#1C1C1E';
    const subTextColor = isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
    const calBg = 'transparent';

    // --- Logic & Marking ---
    const markedDates = useMemo(() => {
        const marks: any = {};

        // 1. Historical Data
        periodHistory.forEach(startDate => {
            let curr = parseISO(startDate);
            for (let i = 0; i < periodLength; i++) {
                const dateStr = format(curr, 'yyyy-MM-dd');
                const isStart = i === 0;
                const isEnd = i === periodLength - 1;
                marks[dateStr] = { ...marks[dateStr], isPeriod: true, isHistorical: true, isStart, isEnd };
                curr = addDays(curr, 1);
            }
        });

        // 2. Projections
        if (lastPeriodDate) {
            const projections = getProjectedCycles(lastPeriodDate, 12, cycleLength, periodLength);
            projections.forEach(cycle => {
                // Period
                let pCurr = parseISO(cycle.startDate);
                const pEnd = parseISO(cycle.endDate);
                const pTotal = differenceInDays(pEnd, pCurr) + 1;
                let i = 0;
                while (pCurr <= pEnd) {
                    const d = format(pCurr, 'yyyy-MM-dd');
                    const isStart = i === 0;
                    const isEnd = i === pTotal - 1;
                    marks[d] = { ...marks[d], isPeriod: true, isProjected: true, isStart, isEnd };
                    pCurr = addDays(pCurr, 1);
                    i++;
                }
                // Fertile
                let fCurr = parseISO(cycle.fertileStart);
                const fEnd = parseISO(cycle.fertileEnd);
                while (fCurr <= fEnd) {
                    const d = format(fCurr, 'yyyy-MM-dd');
                    const isOvulation = d === format(addDays(parseISO(cycle.fertileStart), 4), 'yyyy-MM-dd');
                    marks[d] = { ...marks[d], isFertile: true, isOvulation };
                    fCurr = addDays(fCurr, 1);
                }
            });
        }

        // 3. Logs
        Object.keys(logs).forEach(date => {
            if (logs[date].flow || logs[date].mood || (logs[date].symptoms && logs[date].symptoms?.length > 0)) {
                marks[date] = { ...marks[date], hasLog: true };
            }
        });

        // 4. Selection
        if (!marks[selectedDate]) marks[selectedDate] = {};
        marks[selectedDate] = { ...marks[selectedDate], isSelected: true };

        return marks;
    }, [lastPeriodDate, cycleLength, periodLength, logs, periodHistory, selectedDate]);


    // --- Custom Day Renderer ---
    const CustomDay = ({ date, state, marking = {} }: { date?: DateData, state?: string, marking?: any }) => {
        if (!date) return <View />;

        const isToday = state === 'today';
        const isSelected = marking?.isSelected;
        const isPeriod = marking?.isPeriod;
        const isProjected = marking?.isProjected;
        const isFertile = marking?.isFertile;
        const isOvulation = marking?.isOvulation;
        const hasLog = marking?.hasLog;

        const handlePress = () => {
            if (date) {
                Haptics.selectionAsync();
                setSelectedDate(date.dateString);
            }
        };

        const handleLongPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('LogDetails', { category: 'Flow', date: date.dateString });
        }

        // --- Liquid Style Logic ---

        // Base Content (Text)
        let textC = textColor;
        let fontWeight: any = '400';

        if (state === 'disabled') {
            textC = isDarkMode ? '#333' : '#E0E0E0';
        } else if (isPeriod && !isProjected) {
            textC = '#FFF';
            fontWeight = '700';
        } else if (isPeriod && isProjected) {
            textC = COLORS.primaryRed;
            fontWeight = '600';
        } else if (isOvulation) {
            textC = COLORS.primaryTeal;
            fontWeight = '700';
        }

        // Background / shape
        let bgElement = null;

        if (isPeriod) {
            if (isProjected) {
                // Ghost/Glass Period
                bgElement = (
                    <View style={[StyleSheet.absoluteFill, {
                        backgroundColor: COLORS.primaryRed, opacity: 0.15,
                        borderRadius: 8, margin: 2
                    }]} />
                );
            } else {
                // Solid Liquid Period
                bgElement = (
                    <LinearGradient
                        colors={[COLORS.primaryRed, '#D32F2F']}
                        style={[StyleSheet.absoluteFill, { borderRadius: 12, margin: 2 }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                );
            }
        } else if (isFertile) {
            if (isOvulation) {
                // Glowing Ring for Ovulation
                bgElement = (
                    <View style={[StyleSheet.absoluteFill, {
                        borderWidth: 2, borderColor: COLORS.primaryTeal,
                        borderRadius: 25, margin: 2,
                        backgroundColor: 'rgba(0,150,136,0.1)'
                    }]} />
                );
            } else {
                bgElement = (
                    <View style={[StyleSheet.absoluteFill, {
                        backgroundColor: COLORS.primaryTeal, opacity: 0.12,
                        borderRadius: 20, margin: 4
                    }]} />
                );
            }
        }

        // Selection "Glass Lens" Overlay
        const selectionElement = isSelected ? (
            <LinearGradient
                colors={isDarkMode ? ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)'] : ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.02)']}
                style={[StyleSheet.absoluteFill, {
                    borderRadius: 14, borderWidth: 1.5, borderColor: isDarkMode ? '#FFF' : '#000'
                }]}
            />
        ) : null;

        return (
            <TouchableOpacity
                onPress={handlePress}
                onLongPress={handleLongPress}
                activeOpacity={0.7}
                style={[styles.dayContainer]}
            >
                {/* Background Layer */}
                {bgElement}

                {/* Selection Layer */}
                {selectionElement}

                {/* Log Dot (Floating above bg) */}
                {hasLog && !isPeriod && (
                    <View style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 4, height: 4, borderRadius: 2,
                        backgroundColor: isDarkMode ? '#FFF' : '#333', opacity: 0.6
                    }} />
                )}

                {/* Day Text */}
                <Text style={{ fontSize: 15, fontFamily: FONTS.medium, color: textC, fontWeight }}>{date.day}</Text>

                {/* Today Indicator (Underline or Glow) */}
                {isToday && !isPeriod && (
                    <View style={{
                        position: 'absolute', bottom: 6,
                        width: 4, height: 4, borderRadius: 2,
                        backgroundColor: textC
                    }} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Ambient Background */}
            <LinearGradient colors={bgColors as [string, string, ...string[]]} style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
                <View style={{
                    position: 'absolute', top: -100, right: -20, width: 300, height: 300,
                    borderRadius: 150, backgroundColor: COLORS.primaryRed, opacity: 0.08
                }} />
                <View style={{
                    position: 'absolute', bottom: 200, left: -50, width: 350, height: 350,
                    borderRadius: 175, backgroundColor: COLORS.primaryTeal, opacity: 0.08
                }} />
            </View>

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* 1. Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.headerTitle, { color: textColor }]}>Cycle Calendar</Text>
                        <Text style={[styles.headerSubtitle, { color: subTextColor }]}>
                            {lastPeriodDate ? `Cycle Day ${differenceInDays(new Date(), parseISO(lastPeriodDate)) + 1}` : 'Tracking Paused'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.todayButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
                        }}
                    >
                        <Text style={[styles.todayBtnText, { color: textColor }]}>Today</Text>
                    </TouchableOpacity>
                </View>

                {/* 2. Calendar */}
                <View style={{ flex: 1 }}>
                    <CalendarList
                        current={selectedDate}
                        key={isDarkMode ? 'dark' : 'light'}
                        pastScrollRange={24}
                        futureScrollRange={24}
                        scrollEnabled={true}
                        showScrollIndicator={false}
                        horizontal={true}
                        pagingEnabled={true}
                        calendarWidth={width}
                        dayComponent={CustomDay}
                        markedDates={markedDates}
                        theme={{
                            calendarBackground: 'transparent',
                            textSectionTitleColor: subTextColor,
                            textSectionTitleDisabledColor: '#d9e1e8',
                            selectedDayBackgroundColor: 'transparent',
                            todayTextColor: COLORS.primaryTeal,
                            dayTextColor: textColor,
                            textDisabledColor: '#d9e1e8',
                            monthTextColor: textColor,
                            textDayFontFamily: FONTS.medium,
                            textMonthFontFamily: FONTS.bold,
                            textDayHeaderFontFamily: FONTS.semiBold,
                            textMonthFontSize: 24,
                            textDayHeaderFontSize: 13,
                        }}
                    />
                </View>

                {/* 3. Glass Footer */}
                <View style={styles.footerWrapper}>
                    <BlurView intensity={30} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                    {/* Glass Surface - Reduced opacity for cleaner look */}
                    <View style={[styles.footerGlass, { backgroundColor: isDarkMode ? 'rgba(20,20,20,0.5)' : 'rgba(255,255,255,0.4)', borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)' }]} />

                    <View style={styles.footerContent}>
                        <View style={styles.legendContainer}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: COLORS.primaryRed }]} />
                                <Text style={[styles.legendText, { color: subTextColor }]}>Period</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: COLORS.primaryTeal }]} />
                                <Text style={[styles.legendText, { color: subTextColor }]}>Fertile</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: COLORS.primaryTeal, opacity: 0.3 }]} />
                                <Text style={[styles.legendText, { color: subTextColor }]}>Predicted</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.floatingAction}
                            onPress={() => navigation.navigate('LogDetails', { category: 'Flow', date: selectedDate })}
                        >
                            <LinearGradient
                                colors={[COLORS.primaryRed, '#FF8A80']}
                                style={styles.fabGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name="add" size={28} color="#FFF" />
                                <Text style={styles.fabText}>Add Log</Text>
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
        paddingHorizontal: 24,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 32,
        fontFamily: FONTS.bold,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 15,
        fontFamily: FONTS.medium,
        marginTop: 4,
    },
    todayButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    todayBtnText: {
        fontFamily: FONTS.bold,
        fontSize: 13,
    },
    // Day Component
    dayContainer: {
        width: DAY_SIZE,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Footer
    footerWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 160,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    footerGlass: {
        ...StyleSheet.absoluteFillObject,
        borderTopWidth: 1,
    },
    footerContent: {
        paddingHorizontal: 24,
        paddingTop: 24,
        alignItems: 'center',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
        gap: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 13,
        fontFamily: FONTS.semiBold,
    },
    floatingAction: {
        width: '100%',
        shadowColor: COLORS.primaryRed,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
    },
    fabGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 24,
        gap: 10,
    },
    fabText: {
        fontSize: 17,
        fontFamily: FONTS.bold,
        color: '#FFF',
    }
});

export default CalendarScreen;

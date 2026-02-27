import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS, FONTS } from '../constants/theme';
import { useCycle } from '../context/CycleContext';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { calculateNextPeriod, getCurrentCycleDay, calculateFertileWindow } from '../utils/cycleLogic';
import { format, parseISO } from 'date-fns';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withRepeat, withSequence } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const SIZE = width * 0.82;
const STROKE_WIDTH = 32;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Animated Components
const AnimatedView = Animated.createAnimatedComponent(View);

const CycleDial = () => {
    const { lastPeriodDate, cycleLength, periodLength, logNewPeriod, isDarkMode } = useCycle();
    const [today] = useState(new Date());

    // --- Derived Data ---
    const currentDay = lastPeriodDate ? getCurrentCycleDay(lastPeriodDate) : 1;
    const nextPeriodDate = lastPeriodDate ? calculateNextPeriod(lastPeriodDate, cycleLength) : null;

    // Phase Calculation
    const todayStr = lastPeriodDate ? format(today, 'yyyy-MM-dd') : '';
    const fertileWindow = lastPeriodDate ? calculateFertileWindow(lastPeriodDate, cycleLength) : null;
    const isFertile = fertileWindow ? (todayStr >= fertileWindow.start && todayStr <= fertileWindow.end) : false;
    const isOvulation = fertileWindow ? (todayStr === fertileWindow.end) : false;

    // Period arc length calculation
    const periodAnglePercent = periodLength / cycleLength;
    const periodArcLength = CIRCUMFERENCE * periodAnglePercent;

    // Animation Shared Values
    const progressValue = useSharedValue(0);
    const pulse = useSharedValue(1);

    // Dynamic Colors for "Liquid" Theme
    const trackColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
    const textColor = isDarkMode ? '#FFFFFF' : '#1C1C1E';

    // Animation
    useEffect(() => {
        // 1. Progress Animation
        if (lastPeriodDate) {
            const targetProgress = (Math.max(0, currentDay - 1)) / cycleLength;
            progressValue.value = withTiming(targetProgress, {
                duration: 2000,
                easing: Easing.out(Easing.cubic),
            });
        }

        // 2. Continuous Pulse Animation (Infinite)
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1, // Infinite loops
            true // Reverse
        );
    }, [lastPeriodDate, currentDay, cycleLength]);

    // Knob Animation Style - Orbiting "Liquid Drop"
    const knobStyle = useAnimatedStyle(() => {
        const angle = progressValue.value * 2 * Math.PI - Math.PI / 2; // -90 deg start
        const translateX = RADIUS * Math.cos(angle);
        const translateY = RADIUS * Math.sin(angle);

        return {
            transform: [
                { translateX: translateX },
                { translateY: translateY },
                { scale: pulse.value === 1 ? 1 : 1 + (pulse.value - 1) * 0.5 } // Subtle pulse integration
            ] as any
        };
    });

    const animatedGlowStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }]
    }));

    return (
        <View style={styles.container}>
            {/* 1. Underlying Glow */}
            <AnimatedView style={[{
                position: 'absolute',
                width: SIZE * 0.6,
                height: SIZE * 0.6,
                borderRadius: SIZE * 0.3,
                backgroundColor: isOvulation ? COLORS.primaryTeal : COLORS.primaryRed,
                opacity: 0.15,
            }, animatedGlowStyle]} />

            <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: 'absolute' }}>
                    <Defs>
                        <LinearGradient id="gradRed" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#FF5252" />
                            <Stop offset="100%" stopColor="#C21807" />
                        </LinearGradient>
                        <LinearGradient id="gradTeal" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#4DB6AC" />
                            <Stop offset="100%" stopColor="#00695C" />
                        </LinearGradient>
                    </Defs>

                    {/* 1. Base Glass Track - Darker/More Visible */}
                    <Circle
                        cx={CENTER}
                        cy={CENTER}
                        r={RADIUS}
                        stroke={isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}
                        strokeWidth={STROKE_WIDTH}
                        fill="none"
                    />

                    {/* 2. Period Segment - Glowing Liquid Arc - Much More Vivid */}
                    {lastPeriodDate && (
                        <>
                            {/* Inner glow layer */}
                            <Circle
                                cx={CENTER}
                                cy={CENTER}
                                r={RADIUS}
                                stroke={COLORS.primaryRed}
                                strokeWidth={STROKE_WIDTH + 4}
                                strokeOpacity={0.4}
                                fill="none"
                                strokeDasharray={`${periodArcLength} ${CIRCUMFERENCE}`}
                                strokeLinecap="round"
                                rotation="-90"
                                origin={`${CENTER}, ${CENTER}`}
                            />
                            {/* Core layer - Full Opacity */}
                            <Circle
                                cx={CENTER}
                                cy={CENTER}
                                r={RADIUS}
                                stroke="url(#gradRed)"
                                strokeWidth={STROKE_WIDTH}
                                strokeOpacity={1.0}
                                fill="none"
                                strokeDasharray={`${periodArcLength} ${CIRCUMFERENCE}`}
                                strokeLinecap="round"
                                rotation="-90"
                                origin={`${CENTER}, ${CENTER}`}
                            />
                        </>
                    )}

                    {/* 3. Fertile Window - Glowing Liquid Arc */}
                    {lastPeriodDate && (
                        <Circle
                            cx={CENTER}
                            cy={CENTER}
                            r={RADIUS}
                            stroke="url(#gradTeal)"
                            strokeWidth={STROKE_WIDTH}
                            fill="none"
                            strokeDasharray={`${(CIRCUMFERENCE * (6 / cycleLength))} ${CIRCUMFERENCE}`}
                            strokeDashoffset={-((CIRCUMFERENCE * ((cycleLength - 19) / cycleLength)))}
                            strokeLinecap="round"
                            rotation="-90"
                            origin={`${CENTER}, ${CENTER}`}
                        />
                    )}

                    {/* 4. Days Markers (Subtle Glass Indents) */}
                    {Array.from({ length: cycleLength }).map((_, i) => {
                        const angle = (i * 360) / cycleLength - 90;
                        return (
                            <Circle
                                key={i}
                                cx={CENTER + RADIUS * Math.cos(angle * Math.PI / 180)}
                                cy={CENTER + RADIUS * Math.sin(angle * Math.PI / 180)}
                                r={1.5}
                                fill={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
                            />
                        )
                    })}
                </Svg>

                {/* 5. Liquid Drop Knob */}
                {lastPeriodDate && (
                    <AnimatedView style={[styles.knobContainer, knobStyle]}>
                        {/* Drop Effect */}
                        <View style={[styles.knobBubble, {
                            shadowColor: isOvulation ? COLORS.primaryTeal : COLORS.primaryRed,
                            backgroundColor: isDarkMode ? '#FFF' : '#FFF'
                        }]}>
                            <View style={styles.knobGlint} />
                            <Text style={[styles.knobText, {
                                color: isOvulation ? COLORS.primaryTeal : COLORS.primaryRed
                            }]}>{currentDay}</Text>
                        </View>
                    </AnimatedView>
                )}

                {/* Central Glass Hub */}
                <View style={[styles.glassHubBase, { borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)' }]}>
                    <BlurView intensity={20} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill}>
                        <View style={{ flex: 1, backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' }} />
                    </BlurView>

                    <View style={styles.hubContent}>
                        {lastPeriodDate ? (
                            <>
                                <Text style={[styles.dateText, { color: textColor }]}>
                                    Today, {format(today, 'MMM d')}
                                </Text>

                                {currentDay <= periodLength ? (
                                    <>
                                        <Text style={[styles.mainPrediction, { color: COLORS.primaryRed }]}>
                                            Period Lead
                                        </Text>
                                        <Text style={[styles.statusText, { color: textColor, opacity: 0.7 }]}>
                                            Day {currentDay} of Cycle
                                        </Text>
                                    </>
                                ) : isOvulation ? (
                                    <>
                                        <Text style={[styles.mainPrediction, { color: COLORS.primaryTeal }]}>
                                            Peak Fertility
                                        </Text>
                                        <Text style={[styles.statusText, { color: textColor, opacity: 0.7 }]}>
                                            Ovulation Day
                                        </Text>
                                    </>
                                ) : isFertile ? (
                                    <>
                                        <Text style={[styles.mainPrediction, { color: COLORS.primaryTeal }]}>
                                            Fertile
                                        </Text>
                                        <Text style={[styles.statusText, { color: textColor, opacity: 0.7 }]}>
                                            High Chance
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={[styles.mainPrediction, { color: textColor }]}>
                                            {nextPeriodDate ? Math.max(0, Math.ceil((parseISO(nextPeriodDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : '--'} Days
                                        </Text>
                                        <Text style={[styles.statusText, { color: COLORS.primaryTeal }]}>
                                            until Period
                                        </Text>
                                    </>
                                )}
                            </>
                        ) : (
                            <TouchableOpacity
                                style={styles.startBtn}
                                onPress={() => logNewPeriod(format(new Date(), 'yyyy-MM-dd'))}
                            >
                                <Text style={styles.startBtnText}>Start Tracking</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        height: SIZE + 20,
    },
    // Center Glass Hub
    glassHubBase: {
        position: 'absolute',
        width: SIZE - STROKE_WIDTH * 3.5,
        height: SIZE - STROKE_WIDTH * 3.5,
        borderRadius: (SIZE - STROKE_WIDTH * 3.5) / 2,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
    },
    hubContent: {
        alignItems: 'center',
        zIndex: 10,
    },
    // Knob Styles
    knobContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    knobBubble: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    knobGlint: {
        position: 'absolute',
        top: 8,
        right: 10,
        width: 10,
        height: 6,
        borderRadius: 4,
        backgroundColor: 'white',
        opacity: 0.8,
        transform: [{ rotate: '45deg' }]
    },
    knobText: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    dateText: {
        fontSize: 14,
        fontFamily: FONTS.semiBold,
        marginBottom: 8,
        letterSpacing: 0.5,
        opacity: 0.6,
        textTransform: 'uppercase',
    },
    mainPrediction: {
        fontSize: 32,
        fontFamily: FONTS.bold,
        textAlign: 'center',
        marginBottom: 2,
    },
    statusText: {
        fontSize: 15,
        fontFamily: FONTS.medium,
    },
    startBtn: {
        backgroundColor: COLORS.primaryRed,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
    },
    startBtnText: {
        color: '#FFF',
        fontFamily: FONTS.bold,
    }
});

export default CycleDial;

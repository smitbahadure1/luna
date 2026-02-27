import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Rect, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS, FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_PADDING = 24;
const GRAPH_WIDTH = width - (CARD_PADDING * 2) - 48; // Width inside the card

// --- Types ---
interface CycleDiagramProps {
    currentDay: number;
    cycleLength: number;
    periodLength: number;
    isDarkMode: boolean;
}

// --- Component 1: Phase Timeline ---
export const PhaseTimeline = ({ currentDay, cycleLength, periodLength, isDarkMode }: CycleDiagramProps) => {
    // Medical Standard: Luteal phase is consistent (approx 14 days).
    const lutealLength = 14;
    const ovulationDay = cycleLength - lutealLength;

    // Bounds
    const menstrualEnd = periodLength;
    const follicularEnd = ovulationDay - 2;
    const ovulationEnd = ovulationDay + 2;

    // Normalizing width for segments
    const totalUnits = cycleLength;
    const unitWidth = GRAPH_WIDTH / totalUnits;

    const getSegmentWidth = (start: number, end: number) => {
        return Math.max(0, (end - start + 1) * unitWidth);
    };

    const menstrualWidth = getSegmentWidth(1, menstrualEnd);
    const follicularWidth = getSegmentWidth(menstrualEnd + 1, follicularEnd);
    const ovulationWidth = getSegmentWidth(follicularEnd + 1, ovulationEnd);
    const lutealWidth = getSegmentWidth(ovulationEnd + 1, cycleLength);

    const cursorX = (currentDay - 1) * unitWidth + (unitWidth / 2);

    const textColor = isDarkMode ? '#FFF' : '#333';
    const subTextColor = isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';

    // Determine current phase label
    let phaseLabel = "";
    if (currentDay <= menstrualEnd) phaseLabel = "Menstrual Phase";
    else if (currentDay <= follicularEnd) phaseLabel = "Follicular Phase";
    else if (currentDay <= ovulationEnd) phaseLabel = "Ovulation Phase";
    else phaseLabel = "Luteal Phase";

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View>
                    <Text style={[styles.title, { color: textColor }]}>Cycle Phase</Text>
                    <Text style={[styles.subtitle, { color: COLORS.primaryTeal, marginTop: 2, fontFamily: FONTS.bold, fontSize: 14 }]}>{phaseLabel}</Text>
                </View>
                <Text style={[styles.subtitle, { color: subTextColor }]}>Day {currentDay}</Text>
            </View>

            <View style={{ height: 60, justifyContent: 'center' }}>
                <Svg width={GRAPH_WIDTH} height={40}>
                    {/* Tracks - Medically Accurate Widths - Increased Opacity for Darker Look */}
                    <Rect x={0} y={15} width={Math.max(0, menstrualWidth - 1)} height={10} rx={5} fill={COLORS.primaryRed} opacity={0.8} />
                    <Rect x={menstrualWidth} y={15} width={Math.max(0, follicularWidth - 1)} height={10} rx={5} fill={COLORS.primaryTeal} opacity={0.6} />
                    <Rect x={menstrualWidth + follicularWidth} y={15} width={Math.max(0, ovulationWidth - 1)} height={10} rx={5} fill={COLORS.orange} opacity={0.8} />
                    <Rect x={menstrualWidth + follicularWidth + ovulationWidth} y={15} width={Math.max(0, lutealWidth)} height={10} rx={5} fill="#5C6BC0" opacity={0.6} />

                    {/* Progress Indicator */}
                    <Circle cx={Math.min(Math.max(cursorX, 10), GRAPH_WIDTH - 10)} cy={20} r={8} fill={isDarkMode ? '#FFF' : '#333'} stroke="rgba(255,255,255,0.2)" strokeWidth={4} />
                </Svg>

                {/* Labels */}
                <View style={styles.labelRow}>
                    <Text style={[styles.phaseLabel, { width: menstrualWidth, color: COLORS.primaryRed }]}>M</Text>
                    <Text style={[styles.phaseLabel, { width: follicularWidth, color: COLORS.primaryTeal }]}>F</Text>
                    <Text style={[styles.phaseLabel, { width: ovulationWidth, color: COLORS.orange }]}>O</Text>
                    <Text style={[styles.phaseLabel, { width: lutealWidth, color: '#5C6BC0' }]}>L</Text>
                </View>
            </View>
        </View>
    );
};

// --- Component 2: Hormone Waves ---
export const HormoneFluctuations = ({ currentDay, cycleLength, isDarkMode }: CycleDiagramProps) => {
    const height = 100;
    const width = GRAPH_WIDTH;
    const lutealLength = 14;
    const ovulationDay = cycleLength - lutealLength;
    const ovulationRatio = ovulationDay / cycleLength;

    // Logic to determine bio-status
    const progress = currentDay / cycleLength;
    let statusText = "";

    // Medically aligned status based on ovulation timing
    if (progress < (ovulationRatio - 0.15)) statusText = "Estrogen Rising";
    else if (progress < ovulationRatio) statusText = "Peak Estrogen";
    else if (progress < (ovulationRatio + 0.1)) statusText = "Ovulation Drop";
    else if (progress < 0.85) statusText = "Progesterone High";
    else statusText = "Hormones Resetting";

    // Generate paths based on ovulation timing
    const generatePath = (type: 'estrogen' | 'progesterone') => {
        let path = `M 0 ${height - 20} `;
        for (let i = 0; i <= cycleLength; i++) {
            const x = (i / cycleLength) * width;
            let y = height / 2;
            const p = i / cycleLength; // 0 to 1

            if (type === 'estrogen') {
                // Estrogen peaks JUST before ovulation
                if (p <= ovulationRatio) {
                    // Rise to peak at ovulationRatio
                    // Normalize p to 0-1 within this pre-ovulation window
                    const subP = p / ovulationRatio;
                    const peakVal = Math.sin(subP * Math.PI) * 40;
                    // Only use the END specific sine part to make it peak at the end
                    // Actually, simple sine 0 to PI peaks at 0.5. We want peak at 1.0 of this window?
                    // No, Estrogen peaks ~24h before ovulation.
                    // Let's use a shifted sine.
                    // Let's assume peak is at 0.9 of ovulationRatio.
                    y = height - 20 - (Math.sin(subP * Math.PI) * 40);
                } else {
                    // Post ovulation: Dip then smaller plateau
                    const postOvRatio = (p - ovulationRatio) / (1 - ovulationRatio);
                    y = height - 20 - (Math.sin(postOvRatio * Math.PI) * 20);
                }
            } else {
                // Progesterone: Low until ovulation, then high dome
                if (p <= ovulationRatio) {
                    y = height - 10;
                } else {
                    const postOvRatio = (p - ovulationRatio) / (1 - ovulationRatio);
                    y = height - 10 - (Math.sin(postOvRatio * Math.PI) * 35);
                }
            }
            path += `L ${x} ${y} `;
        }
        return path;
    };

    const estrogenPath = generatePath('estrogen');
    const progesteronePath = generatePath('progesterone');
    const cursorX = (currentDay / cycleLength) * width;

    const textColor = isDarkMode ? '#FFF' : '#333';

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View>
                    <Text style={[styles.title, { color: textColor }]}>Hormones</Text>
                    <Text style={[styles.subtitle, { color: '#5C6BC0', marginTop: 2, fontFamily: FONTS.bold, fontSize: 14 }]}>{statusText}</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primaryTeal }} />
                        <Text style={[styles.legend, { color: textColor }]}>Est</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#5C6BC0' }} />
                        <Text style={[styles.legend, { color: textColor }]}>Prog</Text>
                    </View>
                </View>
            </View>

            <Svg width={width} height={height}>
                <Defs>
                    <LinearGradient id="gradEst" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={COLORS.primaryTeal} stopOpacity="0.4" />
                        <Stop offset="1" stopColor={COLORS.primaryTeal} stopOpacity="0" />
                    </LinearGradient>
                    <LinearGradient id="gradProg" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#5C6BC0" stopOpacity="0.4" />
                        <Stop offset="1" stopColor="#5C6BC0" stopOpacity="0" />
                    </LinearGradient>
                </Defs>

                {/* Estrogen */}
                <Path d={estrogenPath} stroke={COLORS.primaryTeal} strokeWidth={3} fill="none" />
                <Path d={`${estrogenPath} L ${width} ${height} L 0 ${height} Z`} fill="url(#gradEst)" opacity={0.6} />

                {/* Progesterone */}
                <Path d={progesteronePath} stroke="#5C6BC0" strokeWidth={3} fill="none" />
                <Path d={`${progesteronePath} L ${width} ${height} L 0 ${height} Z`} fill="url(#gradProg)" opacity={0.6} />

                {/* Cursor Line */}
                <Line x1={cursorX} y1={0} x2={cursorX} y2={height} stroke={textColor} strokeWidth={2} strokeDasharray="4 4" opacity={0.8} />
                <Circle cx={cursorX} cy={height - 5} r={4} fill={textColor} />
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: FONTS.medium,
    },
    labelRow: {
        flexDirection: 'row',
        marginTop: 5,
    },
    phaseLabel: {
        textAlign: 'center',
        fontSize: 10,
        fontFamily: FONTS.bold,
    },
    legend: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        opacity: 0.7
    }
});

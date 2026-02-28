import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing, Image, Platform, StatusBar, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '../constants/theme';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Calendar } from 'react-native-calendars';
import { useCycle } from '../context/CycleContext';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
    const navigation = useNavigation<any>();
    const { setUserName, setCycleLength, setPeriodLength, setLastPeriodDate, logNewPeriod, completeOnboarding } = useCycle();
    // Force light mode for welcome/onboarding screen
    const isDarkMode = false;

    // Steps: 0=Intro, 1=Name, 2=CycleLengths, 3=LastPeriod
    const [step, setStep] = useState(0);

    // Form Data
    const [name, setNameInput] = useState('');
    const [cLength, setCLength] = useState(28);
    const [pLength, setPLength] = useState(5);
    const [selectedDate, setSelectedDate] = useState('');

    // Animations
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const orb1Anim = useRef(new Animated.Value(0)).current;
    const orb2Anim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Theme Colors
    const bgColors = isDarkMode
        ? ['#050508', '#0F0F16', '#050508']
        : ['#FFFFFF', '#F0F4FF', '#FFFFFF'];
    const textColor = isDarkMode ? '#FFFFFF' : '#1C1C1E';
    const subTextColor = isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
    const inputBg = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
    const glassBorder = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    useEffect(() => {
        // Continuous Orb Animations
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(orb1Anim, { toValue: 20, duration: 5000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(orb1Anim, { toValue: 0, duration: 5000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(orb2Anim, { toValue: -30, duration: 6000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(orb2Anim, { toValue: 0, duration: 6000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
            ])
        ).start();
    }, []);

    const animateTransition = (nextStep: number) => {
        Haptics.selectionAsync();
        Animated.sequence([
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: -20, duration: 300, useNativeDriver: true })
            ]),
            Animated.timing(slideAnim, { toValue: 20, duration: 0, useNativeDriver: true })
        ]).start(() => {
            setStep(nextStep);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true })
            ]).start();
        });
    };

    const handleNext = () => {
        if (step === 0) animateTransition(1);
        else if (step === 1) {
            if (name.trim().length > 0) animateTransition(2);
            else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        else if (step === 2) animateTransition(3);
        else if (step === 3) {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (step > 0) animateTransition(step - 1);
    };

    const handleComplete = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Save Data
        setUserName(name);
        setCycleLength(cLength);
        setPeriodLength(pLength);
        if (selectedDate) {
            logNewPeriod(selectedDate);
            setLastPeriodDate(selectedDate);
        }

        completeOnboarding(); // Mark onboarding as done

        navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
        });
    };

    // --- Components ---

    const GlassCounter = ({ label, value, setValue, min, max }: any) => (
        <View style={{ marginBottom: 25 }}>
            <Text style={[styles.inputLabel, { color: subTextColor }]}>{label}</Text>
            <View style={[styles.glassCounter, { backgroundColor: inputBg, borderColor: glassBorder }]}>
                <TouchableOpacity
                    onPress={() => {
                        Haptics.selectionAsync();
                        setValue(Math.max(min, value - 1));
                    }}
                    style={styles.counterBtn}
                >
                    <Text style={[styles.counterBtnText, { color: textColor }]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.counterValue, { color: textColor }]}>{value}</Text>
                <TouchableOpacity
                    onPress={() => {
                        Haptics.selectionAsync();
                        setValue(Math.min(max, value + 1));
                    }}
                    style={styles.counterBtn}
                >
                    <Text style={[styles.counterBtnText, { color: textColor }]}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderContent = () => {
        switch (step) {
            case 0: // Intro
                return (
                    <View style={styles.centerContent}>
                        <View style={styles.heroContainer}>
                            <Animated.View style={[styles.glassDiscContainer, { transform: [{ scale: pulseAnim }] }]}>
                                <LinearGradient colors={['rgba(255,255,255,0.1)', 'transparent']} style={styles.outerRing} />
                                <View style={[styles.innerGlass, { borderColor: glassBorder, backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)' }]}>
                                    <Image source={require('../../assets/icon.png')} style={styles.logoImage} resizeMode="contain" />
                                </View>
                            </Animated.View>
                        </View>
                        <Text style={[styles.mainHeading, { color: textColor, textAlign: 'center' }]}>Sync with your{'\n'}inner rhythm</Text>
                        <Text style={[styles.subHeading, { color: subTextColor, textAlign: 'center' }]}>Holistic tracking for body & mind.</Text>
                    </View>
                );
            case 1: // Name
                return (
                    <View style={styles.formContainer}>
                        <Text style={[styles.stepTitle, { color: textColor }]}>What should we call you?</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: inputBg, borderColor: glassBorder, color: textColor }]}
                            placeholder="Your Name"
                            placeholderTextColor={subTextColor}
                            value={name}
                            onChangeText={setNameInput}
                            autoFocus
                        />
                    </View>
                );
            case 2: // Cycle Settings
                return (
                    <View style={styles.formContainer}>
                        <Text style={[styles.stepTitle, { color: textColor }]}>How does your cycle usually look?</Text>
                        <Text style={[styles.stepSubtitle, { color: subTextColor }]}>Don't worry, these are just averages.</Text>

                        <View style={{ marginTop: 30 }}>
                            <GlassCounter label="Cycle Length (Days)" value={cLength} setValue={setCLength} min={20} max={45} />
                            <GlassCounter label="Period Length (Days)" value={pLength} setValue={setPLength} min={2} max={10} />
                        </View>
                    </View>
                );
            case 3: // Last Period
                return (
                    <View style={styles.formContainer}>
                        <Text style={[styles.stepTitle, { color: textColor }]}>When was your last period?</Text>
                        <View style={{ marginTop: 20, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: glassBorder }}>
                            <BlurView intensity={20} tint={isDarkMode ? 'dark' : 'light'}>
                                <Calendar
                                    onDayPress={(day: any) => {
                                        Haptics.selectionAsync();
                                        setSelectedDate(day.dateString);
                                    }}
                                    markedDates={{
                                        [selectedDate]: { selected: true, selectedColor: COLORS.primaryRed }
                                    }}
                                    theme={{
                                        calendarBackground: 'transparent',
                                        textSectionTitleColor: subTextColor,
                                        dayTextColor: textColor,
                                        todayTextColor: COLORS.primaryTeal,
                                        selectedDayTextColor: '#FFF',
                                        monthTextColor: textColor,
                                        arrowColor: COLORS.primaryRed,
                                        textDisabledColor: isDarkMode ? '#333' : '#DDD',
                                    }}
                                />
                            </BlurView>
                        </View>
                    </View>
                );
            default: return null;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#FFF' }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            {/* Background Gradient */}
            <LinearGradient colors={bgColors as [string, string, ...string[]]} style={StyleSheet.absoluteFill} />

            {/* Ambient Orbs */}
            <Animated.View style={{
                position: 'absolute', top: -100, right: -80, width: 400, height: 400,
                borderRadius: 200, backgroundColor: COLORS.primaryRed, opacity: 0.08,
                transform: [{ translateY: orb1Anim }, { scale: pulseAnim }],
            }} />
            <Animated.View style={{
                position: 'absolute', bottom: 0, left: -60, width: 450, height: 450,
                borderRadius: 225, backgroundColor: COLORS.primaryTeal, opacity: 0.06,
                transform: [{ translateY: orb2Anim }, { scale: pulseAnim }],
            }} />

            <BlurView intensity={Platform.OS === 'ios' ? 30 : 10} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header (Back button) */}
                <View style={styles.header}>
                    {step > 0 && (
                        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                            <Ionicons name="chevron-back" size={24} color={textColor} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Main Content Area */}
                <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    {renderContent()}
                </Animated.View>

                {/* Footer / Action Button */}
                <View style={styles.footer}>
                    <TouchableOpacity activeOpacity={0.8} onPress={handleNext}>
                        <LinearGradient
                            colors={[COLORS.primaryRed, COLORS.primaryRed + 'CC']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.btnGradient}
                        >
                            <Text style={styles.btnText}>{step === 0 ? "Get Started" : step === 3 ? "Complete" : "Next"}</Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Progress Dots (Optional, only steps > 0) */}
                    {step > 0 && (
                        <View style={styles.dotsContainer}>
                            {[1, 2, 3].map(i => (
                                <View key={i} style={[styles.dot, {
                                    backgroundColor: i === step ? COLORS.primaryRed : subTextColor,
                                    opacity: i === step ? 1 : 0.3
                                }]} />
                            ))}
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1, justifyContent: 'space-between' },
    header: { height: 60, justifyContent: 'center', paddingHorizontal: 20 },
    backBtn: { padding: 10 },
    contentContainer: { flex: 1, justifyContent: 'center' },
    centerContent: { alignItems: 'center', paddingHorizontal: 30 },
    formContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },

    // Components
    heroContainer: { marginBottom: 40, alignItems: 'center' },
    glassDiscContainer: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
    outerRing: { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    innerGlass: { width: 140, height: 140, borderRadius: 70, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    logoImage: { width: 80, height: 80, opacity: 0.9 },

    mainHeading: { fontSize: 36, fontFamily: FONTS.bold, marginBottom: 10 },
    subHeading: { fontSize: 16, fontFamily: FONTS.medium },
    stepTitle: { fontSize: 32, fontFamily: FONTS.bold, marginBottom: 10 },
    stepSubtitle: { fontSize: 16, fontFamily: FONTS.medium, marginBottom: 20 },

    // Inputs
    input: { height: 60, borderRadius: 16, borderWidth: 1, paddingHorizontal: 20, fontSize: 20, fontFamily: FONTS.medium },
    inputLabel: { fontSize: 14, fontFamily: FONTS.bold, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
    glassCounter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60, borderRadius: 16, borderWidth: 1 },
    counterBtn: { width: 60, height: '100%', alignItems: 'center', justifyContent: 'center' },
    counterBtnText: { fontSize: 24, fontFamily: FONTS.medium },
    counterValue: { fontSize: 20, fontFamily: FONTS.bold },

    // Footer
    footer: { paddingHorizontal: 30, paddingBottom: 40 },
    btnGradient: { height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primaryRed, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    btnText: { color: '#FFF', fontSize: 18, fontFamily: FONTS.bold, marginRight: 10 },
    dotsContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 8 },
    dot: { width: 8, height: 8, borderRadius: 4 }
});

export default WelcomeScreen;

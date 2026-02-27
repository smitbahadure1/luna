import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TrackScreen from '../screens/TrackScreen';
import { useCycle } from '../context/CycleContext';
import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();

const GlassTabBarBackground = () => {
    const { isDarkMode } = useCycle();

    // "Liquid Glass" Configuration
    const tint = isDarkMode ? "systemThinMaterialDark" : "systemThinMaterialLight";
    const intensity = 70; // High intensity for rich blur

    // Colors
    // More transparent base to let the blur do the work
    const bgBase = isDarkMode ? 'rgba(10, 10, 10, 0.45)' : 'rgba(240, 240, 255, 0.45)';

    // Top highlight (Specular Reflection) - brighter
    const topSheenColor = isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.65)';

    // Bottom glow (Caustics/Internal Reflection)
    const bottomGlowColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.25)';

    // Border colors for crisp definition
    const borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.35)';
    const borderTopColor = isDarkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.8)'; // Stronger top rim

    const transparent = 'rgba(255, 255, 255, 0)';

    return (
        <View style={styles.glassContainer}>
            {/* 1. Underlying Blur Layer */}
            {Platform.OS === 'ios' ? (
                <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
            ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: isDarkMode ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.95)' }]} />
            )}

            {/* 2. Base Tint */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: bgBase }]} />

            {/* 3. Top Specular Highlight (Liquid Sheen) */}
            <LinearGradient
                colors={[topSheenColor, transparent]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.35 }}
                style={StyleSheet.absoluteFill}
            />

            {/* 4. Bottom Internal Reflection/Haze */}
            <LinearGradient
                colors={[transparent, bottomGlowColor]}
                start={{ x: 0.5, y: 0.6 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* 5. Glass Border with brighter top edge */}
            <View style={[styles.glassBorder, {
                borderColor: borderColor,
                borderTopColor: borderTopColor
            }]} />
        </View>
    );
};

const CustomTabIcon = ({ name, focused, color, size }) => {
    // Simple icon without complex styling
    return (
        <Ionicons
            name={name}
            size={size}
            color={color}
        />
    );
};

const TabNavigator = () => {
    const { isDarkMode, userAvatar } = useCycle();
    
    console.log('TabNavigator render:', { isDarkMode, userAvatar });

    // Elegant colors
    const activeColor = COLORS.primaryRed;
    const inactiveColor = isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(60, 60, 67, 0.6)';

    return (
        <Tab.Navigator
            screenListeners={{
                tabPress: () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                },
            }}
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 25,
                    left: 20,
                    right: 20,
                    height: 70,
                    elevation: 0,
                    borderTopWidth: 0,
                    backgroundColor: '#fff',
                    borderRadius: 40,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.25,
                    shadowRadius: 20,
                },
            }}
        >
            <Tab.Screen
                name="Cycle"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <CustomTabIcon
                            name={focused ? 'water' : 'water-outline'}
                            focused={focused}
                            color={focused ? activeColor : inactiveColor}
                            size={24}
                        />
                    )
                }}
            />
            <Tab.Screen
                name="Calendar"
                component={CalendarScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <CustomTabIcon
                            name={focused ? 'calendar' : 'calendar-outline'}
                            focused={focused}
                            color={focused ? activeColor : inactiveColor}
                            size={24}
                        />
                    )
                }}
            />
            <Tab.Screen
                name="Track"
                component={TrackScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        // Larger center button slightly elevated appearance
                        <View style={{
                            marginTop: -12, // Minimal lift
                        }}>
                            <CustomTabIcon
                                name={focused ? 'add-circle' : 'add-circle-outline'}
                                focused={focused}
                                color={focused ? activeColor : inactiveColor}
                                size={36}
                            />
                        </View>
                    )
                }}
            />
            <Tab.Screen
                name="Analysis"
                component={AnalysisScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <CustomTabIcon
                            name={focused ? 'stats-chart' : 'stats-chart-outline'}
                            focused={focused}
                            color={focused ? activeColor : inactiveColor}
                            size={24}
                        />
                    )
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        userAvatar ? (
                            <View style={[
                                styles.tabAvatarContainer,
                                focused && { borderColor: activeColor, borderWidth: 2 }
                            ]}>
                                <Image
                                    source={{ uri: userAvatar }}
                                    style={styles.tabAvatarImage}
                                />
                            </View>
                        ) : (
                            <CustomTabIcon
                                name={focused ? 'person' : 'person-outline'}
                                focused={focused}
                                color={focused ? activeColor : inactiveColor}
                                size={24}
                            />
                        )
                    )
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        height: 70,
        elevation: 0,
        borderTopWidth: 0,
        backgroundColor: 'transparent',
        borderRadius: 40, // More rounded for pill shape
        // Floating shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
    },
    glassContainer: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 40,
        overflow: 'hidden',
    },
    glassBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 40,
        borderWidth: 1.2,
        zIndex: 10,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
    },
    iconContainerFocused: {

    },
    activeIconGlow: {
        position: 'absolute',
        width: 45,
        height: 45,
        borderRadius: 22.5,
        zIndex: -1,
    },
    iconShadow: {
        // Optional subtle drop shadow for icons to separate from glass
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3
    },
    tabAvatarContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabAvatarImage: {
        width: '100%',
        height: '100%',
    }
});

export default TabNavigator;

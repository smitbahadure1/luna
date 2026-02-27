import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar, TextInput, Alert, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useCycle } from '../context/CycleContext';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

import { BlurView } from 'expo-blur';

// Reusable Glass Card (Local Definition)
const GlassCard = ({ children, style, isDarkMode }: any) => {
    const border = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)';
    const shadow = isDarkMode ? '#000' : '#888';

    return (
        <View style={[styles.glassCard, { borderColor: border, shadowColor: shadow }, style]}>
            <BlurView intensity={Platform.OS === 'ios' ? 30 : 100} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
            <LinearGradient
                colors={[isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />
            {children}
        </View>
    );
};

const ProfileScreen = ({ navigation }: any) => {
    const { user, logout } = useAuth();
    const userEmail = user?.email?.trim()?.toLowerCase();
    const isAdmin = userEmail === 'patilpranjal0410@gmail.com' || userEmail === 'patilpranjal04108@gmail.com';
    const {
        cycleLength,
        periodLength,
        userName,
        userAvatar,
        isDarkMode,
        setCycleLength,
        setPeriodLength,
        setUserName,
        setUserAvatar,
        toggleDarkMode
    } = useCycle();

    const [notifications, setNotifications] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Local state for editing
    const [tempName, setTempName] = useState(userName);
    const [tempCycleLength, setTempCycleLength] = useState(cycleLength.toString());
    const [tempPeriodLength, setTempPeriodLength] = useState(periodLength.toString());

    // Liquid Theme Values
    const textColor = isDarkMode ? '#FFF' : '#1C1C1E';
    const subTextColor = isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
    const dividerColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

    // Background Gradients
    const bgColors = isDarkMode
        ? ['#0F0F13', '#1A1A24', '#0F0F13']
        : ['#F6F8FF', '#F0F4FF', '#FFFFFF'];

    const handleEditToggle = () => {
        if (isEditing) {
            if (tempName.trim().length > 0) setUserName(tempName);
            const newCycle = parseInt(tempCycleLength);
            const newPeriod = parseInt(tempPeriodLength);

            if (!isNaN(newCycle) && newCycle > 10 && newCycle < 60) {
                setCycleLength(newCycle);
            } else {
                Alert.alert("Invalid Cycle Length", "Please enter a value between 10 and 60.");
                return;
            }

            if (!isNaN(newPeriod) && newPeriod > 2 && newPeriod < 15) {
                setPeriodLength(newPeriod);
            } else {
                Alert.alert("Invalid Period Length", "Please enter a value between 2 and 15.");
                return;
            }
            setIsEditing(false);
        } else {
            setTempName(userName);
            setTempCycleLength(cycleLength.toString());
            setTempPeriodLength(periodLength.toString());
            setIsEditing(true);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            console.log('Logged out successfully');
                        } catch (error: any) {
                            Alert.alert('Error', 'Failed to logout: ' + error.message);
                        }
                    }
                }
            ]
        );
    };

    const handlePickImage = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert("Permission Required", "We need access to your photos to set a profile picture.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setUserAvatar(result.assets[0].uri);
            // Auto-enable edit mode if not already on, so they see the change in context of "editing"
            if (!isEditing) {
                // Optional: setIsEditing(true); 
                // actually, let's just let them set it. It auto-saves via Context.
            }
        }
    };

    const SettingItem = ({ icon, label, type, value, onValueChange, color = '#1C1C1E', isEditable = false, numeric = false }: any) => (
        <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: color }]}>
                    <Ionicons name={icon} size={16} color="#FFF" />
                </View>
                <Text style={[styles.settingLabel, { color: textColor }]}>{label}</Text>
            </View>

            {type === 'switch' ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: isDarkMode ? '#333' : '#E9E9EA', true: COLORS.primaryTeal }}
                    thumbColor={'#fff'}
                    ios_backgroundColor={isDarkMode ? '#333' : '#E9E9EA'}
                />
            ) : (
                <View style={styles.settingRight}>
                    {isEditing && isEditable ? (
                        <TextInput
                            style={[styles.inputField, { width: numeric ? 50 : 150, textAlign: 'right', color: textColor, borderBottomColor: COLORS.primaryTeal }]}
                            value={value}
                            onChangeText={onValueChange}
                            keyboardType={numeric ? 'numeric' : 'default'}
                            autoFocus={false}
                            placeholderTextColor={subTextColor}
                            returnKeyType="done"
                        />
                    ) : (
                        <Text style={[styles.valueText, { color: subTextColor }]}>{value}</Text>
                    )}
                    {!isEditing && <Ionicons name="chevron-forward" size={16} color={subTextColor} style={{ marginLeft: 4, opacity: 0.5 }} />}
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            {/* Background Layers */}
            <LinearGradient
                colors={bgColors}
                style={StyleSheet.absoluteFill}
            />
            {/* Decoration Orbs */}
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
                <View style={{
                    position: 'absolute', top: -50, right: -50, width: 300, height: 300,
                    borderRadius: 150, backgroundColor: COLORS.primaryTeal, opacity: 0.1
                }} />
                <View style={{
                    position: 'absolute', bottom: 100, left: -100, width: 400, height: 400,
                    borderRadius: 200, backgroundColor: COLORS.primaryRed, opacity: 0.08
                }} />
            </View>

            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.appTitle, { color: textColor }]}>My Profile</Text>
                    <TouchableOpacity
                        style={[styles.saveButton, isEditing && { backgroundColor: COLORS.primaryTeal + '20' }]}
                        onPress={handleEditToggle}
                    >
                        <Text style={[styles.saveButtonText, { color: isEditing ? COLORS.primaryTeal : COLORS.primaryRed }]}>
                            {isEditing ? 'Done' : 'Edit'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Avatar Section */}
                    <View style={styles.profileSection}>
                        <TouchableOpacity
                            style={styles.avatarWrapper}
                            onPress={handlePickImage}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={[COLORS.primaryTeal, '#26A69A']}
                                style={styles.avatarCircle}
                            >
                                {userAvatar ? (
                                    <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
                                ) : (
                                    <Text style={styles.avatarInitials}>
                                        {isEditing ? (tempName.charAt(0).toUpperCase() || "U") : (userName.charAt(0).toUpperCase() || "U")}
                                    </Text>
                                )}
                            </LinearGradient>

                            {/* Halo Glow */}
                            <View style={[StyleSheet.absoluteFill, {
                                zIndex: -1, borderRadius: 60, backgroundColor: COLORS.primaryTeal, opacity: 0.3, transform: [{ scale: 1.15 }]
                            }]} />

                            <View style={styles.editBadge}>
                                <Ionicons name="camera" size={14} color="#FFF" />
                            </View>
                        </TouchableOpacity>

                        {isEditing ? (
                            <TextInput
                                style={[styles.nameInput, { color: textColor, borderBottomColor: dividerColor }]}
                                value={tempName}
                                onChangeText={setTempName}
                                placeholder="Name"
                                placeholderTextColor={subTextColor}
                            />
                        ) : (
                            <Text style={[styles.userName, { color: textColor }]}>{userName}</Text>
                        )}
                        <Text style={styles.userStatus}>Premium Member</Text>
                    </View>

                    {/* Settings Groups */}

                    <Text style={styles.sectionHeader}>CYCLE</Text>
                    <GlassCard isDarkMode={isDarkMode} style={styles.cardLayout}>
                        <SettingItem
                            icon="sync"
                            label="Cycle Length"
                            value={isEditing ? tempCycleLength : `${cycleLength} Days`}
                            onValueChange={setTempCycleLength}
                            color="#FF2D55"
                            isEditable={true}
                            numeric={true}
                        />
                        <View style={[styles.divider, { backgroundColor: dividerColor }]} />
                        <SettingItem
                            icon="water"
                            label="Period Length"
                            value={isEditing ? tempPeriodLength : `${periodLength} Days`}
                            onValueChange={setTempPeriodLength}
                            color="#AF52DE"
                            isEditable={true}
                            numeric={true}
                        />
                    </GlassCard>

                    <Text style={styles.sectionHeader}>APP SETTINGS</Text>
                    <GlassCard isDarkMode={isDarkMode} style={styles.cardLayout}>
                        <SettingItem
                            icon="notifications"
                            label="Notifications"
                            type="switch"
                            value={notifications}
                            onValueChange={setNotifications}
                            color="#FF9500"
                        />
                        <View style={[styles.divider, { backgroundColor: dividerColor }]} />
                        <SettingItem
                            icon="moon"
                            label="Dark Mode"
                            type="switch"
                            value={isDarkMode}
                            onValueChange={toggleDarkMode}
                            color="#5856D6"
                        />
                        <View style={[styles.divider, { backgroundColor: dividerColor }]} />
                        <SettingItem
                            icon="lock-closed"
                            label="Privacy"
                            value=""
                            color="#34C759"
                        />
                    </GlassCard>

                    <Text style={styles.sectionHeader}>SUPPORT</Text>
                    <GlassCard isDarkMode={isDarkMode} style={styles.cardLayout}>
                        <SettingItem
                            icon="heart"
                            label="Rate App"
                            value=""
                            color="#FF3B30"
                        />
                        <View style={[styles.divider, { backgroundColor: dividerColor }]} />
                        <SettingItem
                            icon="mail"
                            label="Contact Us"
                            value=""
                            color="#007AFF"
                        />
                    </GlassCard>

                    {isAdmin && (
                        <>
                            <Text style={styles.sectionHeader}>ADMIN</Text>
                            <GlassCard isDarkMode={isDarkMode} style={styles.cardLayout}>
                                <TouchableOpacity onPress={() => navigation.navigate('Admin')} style={styles.settingItem}>
                                    <View style={styles.settingLeft}>
                                        <View style={[styles.iconContainer, { backgroundColor: '#8B4513' }]}>
                                            <Ionicons name="shield-checkmark" size={16} color="#FFF" />
                                        </View>
                                        <Text style={[styles.settingLabel, { color: textColor }]}>Admin Dashboard</Text>
                                    </View>
                                    <View style={styles.settingRight}>
                                        <Ionicons name="chevron-forward" size={16} color={subTextColor} style={{ marginLeft: 4, opacity: 0.5 }} />
                                    </View>
                                </TouchableOpacity>
                            </GlassCard>
                        </>
                    )}

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>

                    <Text style={styles.versionText}>Version 1.0.0 (Liquid Glass)</Text>
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
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    appTitle: {
        fontSize: 34,
        fontFamily: FONTS.bold,
        letterSpacing: 0.35,
    },
    saveButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    saveButtonText: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    avatarWrapper: {
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: 120,
        height: 120,
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2, // Softer shadow
        shadowRadius: 15,
        elevation: 10,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    avatarInitials: {
        fontSize: 40,
        fontFamily: FONTS.bold,
        color: '#FFF',
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: COLORS.primaryTeal,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    userName: {
        fontSize: 26,
        fontFamily: FONTS.bold,
        marginBottom: 4,
    },
    nameInput: {
        fontSize: 26,
        fontFamily: FONTS.bold,
        marginBottom: 4,
        borderBottomWidth: 1,
        minWidth: 150,
        textAlign: 'center',
        paddingVertical: 2,
    },
    userStatus: {
        fontSize: 14,
        color: '#8E8E93',
        fontFamily: FONTS.medium,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    sectionHeader: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        color: '#8E8E93',
        marginBottom: 10,
        marginLeft: 16,
        marginTop: 12,
        opacity: 0.8,
    },
    glassCard: {
        borderRadius: 22,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
    },
    cardLayout: {
        // Just used for type reference if needed, styles merged in glassCard
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        minHeight: 56,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    settingLabel: {
        fontSize: 16,
        fontFamily: FONTS.medium,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    valueText: {
        fontSize: 16,
        fontFamily: FONTS.regular,
    },
    inputField: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        borderBottomWidth: 1,
        paddingVertical: 0,
    },
    divider: {
        height: 1,
        marginLeft: 60,
    },
    logoutButton: {
        marginTop: 10,
        alignItems: 'center',
        padding: 15,
    },
    logoutText: {
        fontSize: 16,
        color: COLORS.primaryRed,
        fontFamily: FONTS.bold,
    },
    versionText: {
        textAlign: 'center',
        color: '#C7C7CC',
        fontSize: 12,
        marginBottom: 20,
        opacity: 0.6
    }
});

export default ProfileScreen;

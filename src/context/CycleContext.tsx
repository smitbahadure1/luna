import React, { createContext, useState, useContext, useEffect } from 'react';
import { CycleData, DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH } from '../utils/cycleLogic';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define Log Types
export interface DailyLog {
    flow?: string | null;
    mood?: string | null;
    symptoms?: string[];
    sleep?: string | null;
}

export interface PeriodHistoryItem {
    startDate: string;
    cycleLength: number;
}

interface CycleContextType {
    lastPeriodDate: string | null;
    cycleLength: number;
    periodLength: number;
    userName: string;
    userAvatar: string | null;
    isDarkMode: boolean;
    isOnboarded: boolean;

    // Data
    logs: Record<string, DailyLog>;
    periodHistory: string[]; // List of period start dates

    setLastPeriodDate: (date: string | null) => void;
    setCycleLength: (length: number) => void;
    setPeriodLength: (length: number) => void;
    setUserName: (name: string) => void;
    setUserAvatar: (uri: string | null) => void;
    toggleDarkMode: () => void;
    completeOnboarding: () => void;
    logNewPeriod: (date: string) => void;

    saveLog: (date: string, data: DailyLog) => void;
    isLoaded: boolean;
}

const CycleContext = createContext<CycleContextType>({
    lastPeriodDate: null,
    cycleLength: DEFAULT_CYCLE_LENGTH,
    periodLength: DEFAULT_PERIOD_LENGTH,
    userName: "User",
    userAvatar: null,
    isDarkMode: false,
    isOnboarded: false,

    logs: {},
    periodHistory: [],

    setLastPeriodDate: () => { },
    setCycleLength: () => { },
    setPeriodLength: () => { },
    setUserName: () => { },
    setUserAvatar: () => { },
    toggleDarkMode: () => { },
    completeOnboarding: () => { },
    logNewPeriod: () => { },
    saveLog: () => { },
    isLoaded: false,
});

export const CycleProvider = ({ children }: { children: React.ReactNode }) => {
    // Cycle state
    const [lastPeriodDate, setLastPeriodDate] = useState<string | null>(null);
    const [cycleLength, setCycleLength] = useState(DEFAULT_CYCLE_LENGTH);
    const [periodLength, setPeriodLength] = useState(DEFAULT_PERIOD_LENGTH);
    const [userName, setUserName] = useState("User");
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isOnboarded, setIsOnboarded] = useState(false);

    // Data State
    const [logs, setLogs] = useState<Record<string, DailyLog>>({});
    const [periodHistory, setPeriodHistory] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            try {
                const settingsJson = await AsyncStorage.getItem('@period_tracker_settings');
                const logsJson = await AsyncStorage.getItem('@period_tracker_logs');
                const historyJson = await AsyncStorage.getItem('@period_tracker_history');

                if (settingsJson) {
                    const settings = JSON.parse(settingsJson);
                    if (settings.lastPeriodDate) setLastPeriodDate(settings.lastPeriodDate);
                    if (settings.cycleLength) setCycleLength(settings.cycleLength);
                    if (settings.periodLength) setPeriodLength(settings.periodLength);
                    if (settings.userName) setUserName(settings.userName);
                    if (settings.userAvatar) setUserAvatar(settings.userAvatar);
                    if (settings.isDarkMode !== undefined) setIsDarkMode(settings.isDarkMode);
                    if (settings.isOnboarded !== undefined) setIsOnboarded(settings.isOnboarded);
                }

                if (logsJson) {
                    setLogs(JSON.parse(logsJson));
                }

                if (historyJson) {
                    setPeriodHistory(JSON.parse(historyJson));
                }
            } catch (e) {
                console.error("Failed to load data", e);
            } finally {
                setIsLoaded(true);
            }
        };

        loadData();
    }, []);

    // Save Settings
    useEffect(() => {
        if (!isLoaded) return;
        const saveData = async () => {
            try {
                const settings = {
                    lastPeriodDate,
                    cycleLength,
                    periodLength,
                    userName,
                    userAvatar,
                    isDarkMode,
                    isOnboarded
                };
                await AsyncStorage.setItem('@period_tracker_settings', JSON.stringify(settings));
            } catch (e) {
                console.error("Failed to save settings", e);
            }
        };
        saveData();
    }, [lastPeriodDate, cycleLength, periodLength, userName, userAvatar, isDarkMode, isOnboarded, isLoaded]);

    // Save Logs
    useEffect(() => {
        if (!isLoaded) return;
        const saveLogs = async () => {
            try {
                await AsyncStorage.setItem('@period_tracker_logs', JSON.stringify(logs));
            } catch (e) {
                console.error("Failed to save logs", e);
            }
        };
        saveLogs();
    }, [logs, isLoaded]);

    // Save History
    useEffect(() => {
        if (!isLoaded) return;
        const saveHistory = async () => {
            try {
                await AsyncStorage.setItem('@period_tracker_history', JSON.stringify(periodHistory));
            } catch (e) {
                console.error("Failed to save history", e);
            }
        };
        saveHistory();
    }, [periodHistory, isLoaded]);


    const logNewPeriod = (date: string) => {
        setLastPeriodDate(date);
        setPeriodHistory(prev => {
            // Avoid duplicates
            if (prev.includes(date)) return prev;
            // Add new date and sort descending (newest first)
            const newHistory = [...prev, date].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
            return newHistory;
        });
    };

    const saveLog = (date: string, data: DailyLog) => {
        setLogs(prev => ({
            ...prev,
            [date]: { ...prev[date], ...data }
        }));
    };

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);
    const completeOnboarding = () => setIsOnboarded(true);

    return (
        <CycleContext.Provider
            value={{
                lastPeriodDate,
                cycleLength,
                periodLength,
                userName,
                userAvatar,
                isDarkMode,
                isOnboarded,
                logs,
                periodHistory,
                setLastPeriodDate,
                setCycleLength,
                setPeriodLength,
                setUserName,
                setUserAvatar,
                toggleDarkMode,
                completeOnboarding,
                logNewPeriod,
                saveLog,
                isLoaded,
            }}
        >
            {children}
        </CycleContext.Provider>
    );
};

export const useCycle = () => useContext(CycleContext);

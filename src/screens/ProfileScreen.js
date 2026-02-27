import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCycle } from '../context/CycleContext';
import { getCycleData, getPeriodEntries } from '../services/firebaseService';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { userAvatar } = useCycle();
  const [cycleData, setCycleData] = useState(null);
  const [periodEntries, setPeriodEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin (both email variations)
  const userEmail = user?.email?.trim()?.toLowerCase();
  const isAdmin = userEmail === 'patilpranjal0410@gmail.com' || userEmail === 'patilpranjal04108@gmail.com';

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const [cycle, entries] = await Promise.all([
        getCycleData(user.uid),
        getPeriodEntries(user.uid)
      ]);
      
      setCycleData(cycle);
      setPeriodEntries(entries);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Set default values when offline
      setCycleData({
        averageCycleLength: 28,
        averagePeriodLength: 5,
        lastPeriod: null,
        nextPeriod: null
      });
      setPeriodEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('ProfileScreen handleLogout called');
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            console.log('User confirmed logout');
            try {
              await logout();
              console.log('Logout completed, navigation should handle redirect');
              Alert.alert('Success', 'Logged out successfully!');
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Error', 'Failed to logout: ' + error.message);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cycle Statistics</Text>
        {cycleData ? (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Average Cycle Length</Text>
              <Text style={styles.statValue}>{cycleData.averageCycleLength || 28} days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Average Period Length</Text>
              <Text style={styles.statValue}>{cycleData.averagePeriodLength || 5} days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Period Entries</Text>
              <Text style={styles.statValue}>{periodEntries.length}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noDataText}>No cycle data available</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.menuItemText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('DataManagement')}
        >
          <Text style={styles.menuItemText}>Data Management</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Help')}
        >
          <Text style={styles.menuItemText}>Help & Support</Text>
        </TouchableOpacity>
      </View>

      {isAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Panel</Text>
          <TouchableOpacity 
            style={styles.adminButton}
            onPress={() => navigation.navigate('Admin')}
          >
            <Text style={styles.adminButtonText}>🔐 Admin Dashboard</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#008080',
    padding: 30,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#008080',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsContainer: {
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#008080',
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  adminButton: {
    backgroundColor: '#8B4513',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D2691E',
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;

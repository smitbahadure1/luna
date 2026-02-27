import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getDocs, collection, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const AdminScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  // Security check - only allow admin email (both variations)
  const adminEmails = ['patilpranjal0410@gmail.com', 'patilpranjal04108@gmail.com'];

  useEffect(() => {
    const userEmail = user?.email?.trim()?.toLowerCase();
    if (!adminEmails.includes(userEmail)) {
      Alert.alert('Access Denied', 'You do not have permission to access this area.');
      navigation.goBack();
      return;
    }
    loadUsers();
  }, [user]);

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', userId));
              setUsers(prev => prev.filter(u => u.id !== userId));
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Loading admin data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔐 Admin Dashboard</Text>
        <Text style={styles.subtitle}>Manage Users & System</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {users.filter(u => u.cycleData).length}
          </Text>
          <Text style={styles.statLabel}>Active Users</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔍 Search Users</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by email or name..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 All Users</Text>
        {filteredUsers.length === 0 ? (
          <Text style={styles.noUsersText}>No users found</Text>
        ) : (
          filteredUsers.map((userItem) => (
            <View key={userItem.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userItem.displayName || 'Unknown'}</Text>
                <Text style={styles.userEmail}>{userItem.email}</Text>
                <Text style={styles.userDate}>
                  Joined: {new Date(userItem.createdAt).toLocaleDateString()}
                </Text>
                {userItem.cycleData && (
                  <Text style={styles.userStats}>
                    Cycle: {userItem.cycleData.averageCycleLength || 28} days
                  </Text>
                )}
              </View>
              <View style={styles.userActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => Alert.alert('User Info', `UID: ${userItem.id}`)}
                >
                  <Text style={styles.actionButtonText}>👁️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteUser(userItem.id)}
                >
                  <Text style={styles.actionButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ System Actions</Text>
        <TouchableOpacity
          style={styles.systemButton}
          onPress={() => Alert.alert('System', 'System maintenance features coming soon')}
        >
          <Text style={styles.systemButtonText}>🔧 System Maintenance</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.systemButton}
          onPress={() => Alert.alert('Analytics', 'User analytics dashboard coming soon')}
        >
          <Text style={styles.systemButtonText}>📊 View Analytics</Text>
        </TouchableOpacity>
      </View>
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
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    backgroundColor: '#8B4513',
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
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
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  noUsersText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userDate: {
    fontSize: 12,
    color: '#999',
  },
  userStats: {
    fontSize: 12,
    color: '#8B4513',
    marginTop: 2,
  },
  userActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
  },
  actionButtonText: {
    fontSize: 16,
  },
  systemButton: {
    backgroundColor: '#8B4513',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  systemButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminScreen;

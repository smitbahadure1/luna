import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '../config/firebase';

// Enable network access
try {
  enableNetwork(db);
} catch (error) {
  console.log('Network already enabled');
}

export const saveCycleData = async (userId, cycleData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      cycleData: cycleData,
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving cycle data:', error);
    // If offline, store locally for later sync
    return false;
  }
};

export const getCycleData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().cycleData;
    }
    return null;
  } catch (error) {
    console.error('Error getting cycle data:', error);
    if (error.code === 'unavailable' || error.message.includes('offline')) {
      console.log('App is offline, using local data');
      // Return null to indicate offline - app will use AsyncStorage fallback
    }
    return null;
  }
};

export const savePeriodEntry = async (userId, entry) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      periodEntries: arrayUnion({
        ...entry,
        timestamp: new Date().toISOString()
      }),
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving period entry:', error);
    return false;
  }
};

export const getPeriodEntries = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().periodEntries || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting period entries:', error);
    if (error.code === 'unavailable' || error.message.includes('offline')) {
      console.log('App is offline, using local data');
    }
    return [];
  }
};

export const deletePeriodEntry = async (userId, entryId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const entries = userDoc.data().periodEntries || [];
      const updatedEntries = entries.filter(entry => entry.id !== entryId);
      
      await updateDoc(userRef, {
        periodEntries: updatedEntries,
        lastUpdated: new Date().toISOString()
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting period entry:', error);
    return false;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...profileData,
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

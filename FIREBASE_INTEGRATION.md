# Firebase Integration for Luna Period Tracker

This document outlines the Firebase integration implemented for the Luna Period Tracker app.

## Features Implemented

### 1. Authentication
- **Email/Password Authentication**: Users can sign up and sign in with email and password
- **User Profile Management**: Display name and email storage
- **Secure Session Management**: Automatic token handling and session persistence

### 2. Backend Database (Firestore)
- **User Data Storage**: Cycle preferences, settings, and user profile
- **Period Entries**: All period logs and symptoms tracking
- **Real-time Sync**: Data synchronization between devices
- **Offline Support**: Local storage with Firebase sync when online

### 3. Data Synchronization
- **Automatic Sync**: Data automatically syncs to Firebase when user is authenticated
- **Local Backup**: AsyncStorage maintains local copy for offline access
- **Conflict Resolution**: Firebase data takes precedence when syncing

## File Structure

### Core Firebase Files
- `src/config/firebase.js` - Firebase configuration and initialization
- `src/context/AuthContext.js` - Authentication state management
- `src/context/FirebaseCycleContext.tsx` - Firebase-integrated cycle data management
- `src/services/firebaseService.js` - Firebase database operations

### UI Components
- `src/screens/AuthScreen.js` - Login and signup interface
- `src/screens/ProfileScreen.js` - User profile and account management

## Firebase Configuration

The Firebase configuration is stored in `src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD-G9mKz8I6CwYUGpt0D7qC06RWpTDkpDU",
  authDomain: "luna-5dac7.firebaseapp.com",
  projectId: "luna-5dac7",
  storageBucket: "luna-5dac7.firebasestorage.app",
  messagingSenderId: "763951716900",
  appId: "1:763951716900:web:347744c43da40bc58996b1",
  measurementId: "G-R79KBY5NV7"
};
```

## Firestore Database Structure

### Users Collection
```
users/{userId}
{
  uid: string,
  email: string,
  displayName: string,
  createdAt: timestamp,
  lastUpdated: timestamp,
  cycleData: {
    averageCycleLength: number,
    averagePeriodLength: number,
    lastPeriod: string,
    nextPeriod: string,
    userName: string,
    userAvatar: string,
    isDarkMode: boolean,
    isOnboarded: boolean
  },
  periodEntries: [
    {
      date: string,
      flow: string,
      mood: string,
      symptoms: array,
      sleep: string,
      timestamp: string
    }
  ]
}
```

## Authentication Flow

1. **Initial State**: App shows authentication screen
2. **Sign Up**: New users create account with email/password
3. **Sign In**: Existing users authenticate with credentials
4. **Auto-sync**: Upon successful authentication, data syncs with Firebase
5. **Session Persistence**: Users remain logged in across app restarts

## Data Sync Logic

### On App Start
1. Load data from AsyncStorage (fast local access)
2. If user is authenticated, sync with Firebase
3. Merge Firebase data with local data (Firebase takes precedence)

### During App Usage
1. All data changes saved to AsyncStorage immediately
2. If user is authenticated, changes also saved to Firebase
3. Automatic conflict resolution maintains data consistency

### On Logout
1. Local data preserved in AsyncStorage
2. Firebase sync paused
3. User can log back in to resume sync

## Security Considerations

- Firebase Security Rules should be configured to restrict access to user's own data
- API keys are public but Firebase rules enforce data privacy
- Authentication tokens managed automatically by Firebase SDK
- No sensitive personal health data stored in plain text

## Usage

1. Install dependencies: `npm install firebase @react-native-firebase/app @react-native-firebase/auth`
2. Configure Firebase project and update config
3. Authentication is automatically integrated into app flow
4. Data syncs automatically when users are logged in

## Future Enhancements

- Google Sign-In integration
- Multi-device sync improvements
- Data export functionality
- Enhanced security with additional verification methods
- Analytics integration for cycle insights

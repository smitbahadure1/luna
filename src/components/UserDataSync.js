import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCycle } from '../context/CycleContext';

const UserDataSync = ({ children }) => {
  const { user } = useAuth();
  const { userName, setUserName, setUserAvatar } = useCycle();

  useEffect(() => {
    if (user) {
      console.log('UserDataSync: Checking name update for user:', user.displayName || user.email);
      console.log('UserDataSync: Current userName in context:', userName);
      
      // Only update name if it's still the default "User" (not set during onboarding)
      // or if the current name is from email (indicating it was set by previous sync)
      if (userName === 'User' || userName.includes('@')) {
        if (user.displayName && user.displayName !== 'User') {
          setUserName(user.displayName);
          console.log('UserDataSync: Set name to displayName:', user.displayName);
        } else if (user.email && !userName.includes('@')) {
          // Only set email-based name if current name is default "User"
          const emailName = user.email.split('@')[0];
          const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          setUserName(formattedName);
          console.log('UserDataSync: Set name to email-based:', formattedName);
        }
      } else {
        console.log('UserDataSync: Keeping existing name from onboarding:', userName);
      }
      
      // You could also set user avatar here if available
      // if (user.photoURL) {
      //   setUserAvatar(user.photoURL);
      // }
    }
  }, [user, userName, setUserName, setUserAvatar]);

  return <>{children}</>;
};

export default UserDataSync;

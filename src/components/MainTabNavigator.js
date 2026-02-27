import React from 'react';
import SimpleTabNavigator from '../navigation/SimpleTabNavigator';
import { CycleProvider } from '../context/CycleContext';
import UserDataSync from './UserDataSync';

const MainTabNavigator = () => {
  return (
    <CycleProvider>
      <UserDataSync>
        <SimpleTabNavigator />
      </UserDataSync>
    </CycleProvider>
  );
};

export default MainTabNavigator;

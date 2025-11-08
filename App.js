// App.js: Navigation setup (Stack navigator provides automatic back button)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import AddPatientScreen from './screens/AddPatientScreen';
import AddRecordScreen from './screens/AddRecordScreen';
import ListPatientsScreen from './screens/ListPatientsScreen';
import ViewPatientScreen from './screens/ViewPatientScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
          contentStyle: { backgroundColor: '#000' }
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen}   />
        <Stack.Screen name="AddPatient" component={AddPatientScreen} options={{ title: 'Add Patient' }} />
        <Stack.Screen name="ListPatients" component={ListPatientsScreen} options={{ title: 'All Patients' }} />
        <Stack.Screen name="AddRecord" component={AddRecordScreen} options={{ title: 'Add Patient Record' }} />
        <Stack.Screen name="ViewPatient" component={ViewPatientScreen} options={{ title: 'View Patient Records' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

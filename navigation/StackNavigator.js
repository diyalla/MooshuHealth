import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import AddPatientScreen from '../screens/AddPatientScreen';
import AddRecordScreen from '../screens/AddRecordScreen';
import ListPatientsScreen from '../screens/ListPatientsScreen';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddPatient" component={AddPatientScreen} />
        <Stack.Screen name="AddRecord" component={AddRecordScreen} />
        <Stack.Screen name="ListPatients" component={ListPatientsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

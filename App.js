import * as ScreenOrientation from 'expo-screen-orientation';
import React from 'react';
import { StyleSheet } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import LoadingScreen from './screens/LoadingScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import GameScreen from './screens/GameScreen';
import GuestScreen from './screens/GuestScreen';
import GetCoinsScreen from './screens/GetCoinsScreen';
import ShopScreen from './screens/ShopScreen';
import NativeShopScreen from './screens/NativeShopScreen';
import NativeGameScreen from './screens/NativeGameScreen';
import ThreeJSGameScreen from './screens/ThreeJSGameScreen';
import ReloadScreen from './screens/ReloadScreen';
import RoomsScreen from './screens/RoomsScreen';
import CreditsScreen from './screens/CreditsScreen';



import * as firebase from 'firebase';
import { firebaseConfig } from './config';
firebase.initializeApp(firebaseConfig);


async function changeScreenOrientation() {
  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
}

export default class App extends React.Component {

  componentDidMount() {
    changeScreenOrientation();
}
  render(){
    return <AppNavigator />;
  }
}


const AppSwitchNavigator = createSwitchNavigator({
  LoadingScreen: LoadingScreen,
  LoginScreen: LoginScreen,
  DashboardScreen: DashboardScreen,
  NativeGameScreen: NativeGameScreen,
  GameScreen: GameScreen,
  GuestScreen: GuestScreen,
  GetCoinsScreen: GetCoinsScreen,
  ShopScreen: ShopScreen,
  NativeShopScreen:NativeShopScreen,
  ThreeJSGameScreen: ThreeJSGameScreen,
  ReloadScreen: ReloadScreen,
  RoomsScreen: RoomsScreen,
  CreditsScreen: CreditsScreen
});

const AppNavigator = createAppContainer(AppSwitchNavigator);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

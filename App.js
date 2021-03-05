import * as ScreenOrientation from 'expo-screen-orientation';
import React from 'react';
import { StyleSheet,Platform,I18nManager } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import LoadingScreen from './screens/LoadingScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import GuestScreen from './screens/GuestScreen';
import GetCoinsScreen from './screens/GetCoinsScreen';
import NativeShopScreen from './screens/NativeShopScreen';
import ThreeJSGameScreen from './screens/ThreeJSGameScreen';
import ReloadScreen from './screens/ReloadScreen';
import RoomsScreen from './screens/RoomsScreen';
import CreditsScreen from './screens/CreditsScreen';
import SignoutScreen from './screens/SignoutScreen';
import ReturningScreen from './screens/ReturningScreen';
import BallShopScreen from './screens/BallShopScreen';
import LoginErrorScreen from './screens/LoginErrorScreen';



I18nManager.forceRTL(false);
I18nManager.allowRTL(false);


async function changeScreenOrientation() {
  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
}

export default class App extends React.Component {

  componentDidMount() {
    if(Platform.OS=='android'||Platform.OS=='ios'){
      changeScreenOrientation();
    }
}
  render(){
    return <AppNavigator />;
  }
}


const AppSwitchNavigator = createSwitchNavigator({
  LoadingScreen: LoadingScreen,
  LoginScreen: LoginScreen,
  DashboardScreen: DashboardScreen,
  GuestScreen: GuestScreen,
  GetCoinsScreen: GetCoinsScreen,
  NativeShopScreen:NativeShopScreen,
  ThreeJSGameScreen: ThreeJSGameScreen,
  ReloadScreen: ReloadScreen,
  RoomsScreen: RoomsScreen,
  CreditsScreen: CreditsScreen,
  SignoutScreen: SignoutScreen,
  ReturningScreen: ReturningScreen,
  BallShopScreen: BallShopScreen,
  LoginErrorScreen: LoginErrorScreen
});

const AppNavigator = createAppContainer(AppSwitchNavigator);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

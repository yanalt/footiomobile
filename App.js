// import { AppLoading } from 'expo';
// import { Asset } from 'expo-asset';
// import * as Font from 'expo-font';
// import React, { useState } from 'react';
// import { Platform, StatusBar, StyleSheet, View } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { ScreenOrientation } from 'expo';
import * as ScreenOrientation from 'expo-screen-orientation';
// import AppNavigator from './navigation/AppNavigator';
// import { createAppContainer } from 'react-navigation'; //a

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
  ThreeJSGameScreen: ThreeJSGameScreen
});

const AppNavigator = createAppContainer(AppSwitchNavigator);

// export default function App(props) {
//   const [isLoadingComplete, setLoadingComplete] = useState(false);

//   if (!isLoadingComplete && !props.skipLoadingScreen) {
//     return (
//       <AppLoading
//         startAsync={loadResourcesAsync}
//         onError={handleLoadingError}
//         onFinish={() => handleFinishLoading(setLoadingComplete)}
//       />
//     );
//   } else {
//     return (
//       <View style={styles.container}>
//         {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
//         <AppNavigator />
//       </View>
//     );
//   }
// }



// async function loadResourcesAsync() {
//   await Promise.all([
//     Asset.loadAsync([
//       require('./assets/images/robot-dev.png'),
//       require('./assets/images/robot-prod.png'),
//     ]),
//     Font.loadAsync({
//       // This is the font that we are using for our tab bar
//       ...Ionicons.font,
//       // We include SpaceMono because we use it in HomeScreen.js. Feel free to
//       // remove this if you are not using it in your app
//       'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
//     }),
//   ]);
// }

// function handleLoadingError(error: Error) {
//   // In this case, you might want to report the error to your error reporting
//   // service, for example Sentry
//   console.warn(error);
// }

// function handleFinishLoading(setLoadingComplete) {
//   changeScreenOrientation();
//   setLoadingComplete(true);
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

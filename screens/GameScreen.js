import * as WebBrowser from 'expo-web-browser';
import React, {Component} from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    WebView,
    AsyncStorage
} from 'react-native';

import {MonoText} from '../components/StyledText';
import {hostConfig} from '../config';

_storeData = async(str, val) => {
    try {
        await AsyncStorage.setItem(str, val);
    } catch (e) {
        console.log(e);
    }
};

_retrieveData = async(str) => {
    try {
        const value = await AsyncStorage.getItem(str);
        if (value !== null) {
            // We have data!
            console.log(value);
            return value;
        }
    } catch (e) {
        console.log(e);
    }
};


let xauth = '';

class GameScreen extends Component {

  state = {
    isLoading: true
  };

  componentDidMount() {
    
    _retrieveData('x-auth').then((val) => {
      console.log(val);
      xauth = val;
      this.setState({
        isLoading: false
      });
    }).catch((e) => {
        console.log(e);
    });

  }

  render(){
    console.log("GameScreen");

    
    if(this.state.isLoading){
      return (
          <View style={styles.container}>
              <Text>Loading</Text>
          </View>
      )
    }
    return (
      <View style={styles.container}>
          <WebView
              source={{
              uri: hostConfig + '/#/skins',
              headers: {
                  'x-auth': xauth
              }
          }}/>
      </View>
  );
  }
}

// export default function GameScreen() { //a
    

// }

export default GameScreen;

GameScreen.navigationOptions = {
    header: null
};

function handleLearnMorePress() {
    WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/workflow/development-mode/');
}

function handleHelpPress() {
    WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/workflow/up-and-running/#cant-see-your-chan' +
            'ges');
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    developmentModeText: {
        marginBottom: 20,
        color: 'rgba(0,0,0,0.4)',
        fontSize: 14,
        lineHeight: 19,
        textAlign: 'center'
    },
    contentContainer: {
        paddingTop: 30
    },
    welcomeContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20
    },
    welcomeImage: {
        width: 100,
        height: 80,
        resizeMode: 'contain',
        marginTop: 3,
        marginLeft: -10
    },
    getStartedContainer: {
        alignItems: 'center',
        marginHorizontal: 50
    },
    GameScreenFilename: {
        marginVertical: 7
    },
    codeHighlightText: {
        color: 'rgba(96,100,109, 0.8)'
    },
    codeHighlightContainer: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 3,
        paddingHorizontal: 4
    },
    getStartedText: {
        fontSize: 17,
        color: 'rgba(96,100,109, 1)',
        lineHeight: 24,
        textAlign: 'center'
    },
    tabBarInfoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        ...Platform.select({
            ios: {
                shadowColor: 'black',
                shadowOffset: {
                    width: 0,
                    height: -3
                },
                shadowOpacity: 0.1,
                shadowRadius: 3
            },
            android: {
                elevation: 20
            }
        }),
        alignItems: 'center',
        backgroundColor: '#fbfbfb',
        paddingVertical: 20
    },
    tabBarInfoText: {
        fontSize: 17,
        color: 'rgba(96,100,109, 1)',
        textAlign: 'center'
    },
    navigationFilename: {
        marginTop: 5
    },
    helpContainer: {
        marginTop: 15,
        alignItems: 'center'
    },
    helpLink: {
        paddingVertical: 15
    },
    helpLinkText: {
        fontSize: 14,
        color: '#2e78b7'
    }
});

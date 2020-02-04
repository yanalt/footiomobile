import React, {Component} from 'react';
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    Button,
    View,
    AsyncStorage
} from 'react-native';
import axios from 'axios';
import firebase from 'firebase';

{/* <Text>{firebase.auth().currentUser.email}</Text>
<Text>{firebase.auth().currentUser.displayName}</Text> //a
<Text>{firebase.auth().currentUser.refreshToken}</Text> */
}

class DashboardScreen extends Component {
    handleStartGame() {
        console.log("lul");
        this
            .props
            .navigation
            .navigate('GameScreen');
    }
    handleGetCoins() {
        console.log("luul");
    }
    render() {
        console.log("rofl");
        return (
            <View style={styles.container}>
                <Button
                    title="START GAME ⚽"
                    onPress={() => {
                    this.handleStartGame()
                }}/>
                <Button title="============="/>
                <Button
                    title="GET COINS"
                    onPress={() => {
                    this.handleGetCoins()
                }}/>
                <Button title="============="/>
                <Button title="  Sign out  " onPress={() => firebase.auth().signOut()}/>
            </View>
        );
    }

}

export default DashboardScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
    homeScreenFilename: {
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

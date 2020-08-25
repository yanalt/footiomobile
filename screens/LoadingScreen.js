import React, {Component} from 'react';
import {
    Image,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    Platform
} from 'react-native';
import axios from 'axios';
import firebase from 'firebase';
import {hostConfig} from '../config';

class LoadingScreen extends Component {

    componentDidMount() {
        console.log("LoadingScreen.js componentDidMount");
        if(Platform.OS=='android'||Platform.OS=='ios'){
            console.log(Platform.OS);
            this.checkIfLoggedIn();
        }else{
            this
                .props
                .navigation
                .navigate('GuestScreen');
        }
    }
    handleLoggedIn(user) {
        let deez = this;
        console.log("LoadingScreen.js handleLoggedIn()");
        // console.log(user.email); console.log(user.idToken);
        user
            .getIdToken(/* forceRefresh */
            true)
            .then(function (idToken) {

                axios({
                    method: 'post',
                    url: hostConfig.address + '/users/androidlogin',
                    data: {
                        email: user.email,
                        refreshToken: idToken
                    }
                })
                .then((res) => {
                    console.log(res.headers['x-auth']);
                    _storeData('x-auth', res.headers['x-auth']).then(() => {
                        deez
                            .props
                            .navigation
                            .navigate('DashboardScreen');
                    });
                }).catch((e)=>{
                    console.log(e);
                })
            })
            .catch((e) => {
                console.log("ROFL");
                console.log(e);
                console.log(e.stack);
                // for(var propName in e) {     let propValue = e[propName] //a
                // console.log(propName,propValue); }
            });
    }
    checkIfLoggedIn = () => {
        console.log("LoadingScreen.js checkIfLoggedIn");
        firebase
            .auth()
            .onAuthStateChanged(function (user) {
                // console.log(user);                  // maybe just send mail and an auth from
                // here and tackle everything else in mund-front? problem: no oauthIdToken
                if (user) { // this is being activated as soon as there is a "sign up", we should do something about it
                    this.handleLoggedIn(user);
                } else {
                    this
                        .props
                        .navigation
                        .navigate('LoginScreen');
                }
            }.bind(this));
    }

    render() {
        console.log("LoadingScreen.js render");
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large"/>
            </View>
        )
    }
}

export default LoadingScreen;

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

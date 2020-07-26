import React, {Component} from 'react';
import {
    Image,
    StyleSheet,
    Button,
    Text,
    View,
    AsyncStorage
} from 'react-native';
import * as Expo from 'expo';
import firebase from 'firebase';
import axios from 'axios';
import {hostConfig} from '../config';
import * as Google from 'expo-google-app-auth';

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
            // We have data!!
            // console.log(value);
            return value;
        }
    } catch (e) {
        console.log(e);
    }
};


handleNewUser = function (email, token) {
    console.log('handleNewUser');
    axios({
        method: 'post',
        url: hostConfig.address + '/users/androidsignup', //???????????????????????????????????
        data: {
            email,
            refreshToken: token
        }
    }).then((res) => {
        console.log(res.headers['x-auth']);
        _storeData('x-auth', res.headers['x-auth']).then(() => {
            this
                .props
                .navigation
                .navigate('DashboardScreen');
        });
    }).catch((e) => {
        console.log(e);
        // for(var propName in e) {     let propValue = e[propName];
        // console.log(propName,propValue); }
    });
}

handleReturningUser = function (email, token) {
    console.log('handleReturningUser');
    console.log(hostConfig.address);
    axios({
        method: 'post',
        url: hostConfig.address + '/users/androidlogin',
        data: {
            email,
            refreshToken: token
        }
    }).then((res) => {
        console.log(res.headers['x-auth']);
        _storeData('x-auth', res.headers['x-auth']).then(() => {
            this
                .props
                .navigation
                .navigate('DashboardScreen');
        });
    }).catch((e) => {
        console.log(e);
        // for(var propName in e) {     let propValue = e[propName];
        // console.log(propName,propValue); }
    });
}

class LoginScreen extends Component {

    isUserEqual = (googleUser, firebaseUser) => {
        console.log("isUserEqual");
        if (firebaseUser) {
            var providerData = firebaseUser.providerData;
            for (var i = 0; i < providerData.length; i++) {
                if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID && providerData[i].uid === googleUser.getBasicProfile().getId()) {
                    // We don't need to reauth the Firebase connection.
                    return true;
                }
            }
        }
        return false;
    }

    onSignIn = (googleUser) => {
        console.log("onSignIn");
        // console.log('Google Auth Response', googleUser); We need to register an
        // Observer on Firebase Auth to make sure auth is initialized.
        var unsubscribe = firebase
            .auth()
            .onAuthStateChanged(function (firebaseUser) {
                unsubscribe();
                // Check if we are already signed-in Firebase with the correct user.
                if (!this.isUserEqual(googleUser, firebaseUser)) {
                    // Build Firebase credential with the Google ID token.
                    var credential = firebase
                        .auth
                        .GoogleAuthProvider
                        .credential(googleUser.idToken, googleUser.accessToken);
                    // Sign in with credential from the Google user.
                    firebase
                        .auth()
                        .signInWithCredential(credential)
                        .then(function (result) {
                            console.log('user signed in!');
                            // console.log(result); console.log(googleUser.idToken);
                            // console.log(result.credential[0]);
                            // console.log(result.credential.oauthIdToken); console.log(result.user);
                            // console.log(result.user.stsTokenManager);
                            if (result.additionalUserInfo.isNewUser) {
                                console.log("New user");
                                handleNewUser(googleUser.user.email, googleUser.idToken);
                                omegalul();
                            } else {
                                console.log("Returning user");
                                handleReturningUser(googleUser.user.email, googleUser.idToken);
                            }
                        })
                        .catch(function (e) {
                            console.log(e);
                        });
                } else {
                    console.log('User already signed in with Firebase.');
                }
            }.bind(this));
    }

    signInWithGoogleAsync = async() => {
        console.log("signInWithGoogleAsync");
        try {
            const result = await Google
                .logInAsync({
                    behavior: 'web', androidClientId: '759889128579-jhgdv8nbg9ri1ocn19ja0d07dhlfep9p.apps.googleusercontent.com',
                    // iosClientId:
                    // '759889128579-ir3o6i9ei8bi95vrq0g7q2ct29klf9qm.apps.googleusercontent.com',
                    scopes: ['profile', 'email']
                });

            if (result.type === 'success') {
                this.onSignIn(result);
                return result.accessToken;
            } else {
                return {cancelled: true};
            }
        } catch (e) {
            alert(e);
            return {error: true};
        }
    };

    handleGuest = async() => {
        console.log("handleGuest");
        try {
            this
                .props
                .navigation
                .navigate('ThreeJSGameScreen');
                console.log("lul");
        } catch (e) {
            console.log(e);
            alert(e);
            return {error: true};
        }
    };

    render() {
        console.log("render");
        return (
            <View style={styles.container}>
                <Button
                    title="Sign In With Google"
                    onPress={() => this.signInWithGoogleAsync()}/>
                <Button title="Play as a guest! ⚽" onPress={() => this.handleGuest()}/>
            </View>
        );
    }
}
//
export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 100,
        marginBottom: 20,
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

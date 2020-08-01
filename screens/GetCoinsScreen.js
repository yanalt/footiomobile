import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    Button,
    View,
    AsyncStorage,
    TouchableOpacity
} from 'react-native';
import axios from 'axios';
import {hostConfig,adMobConfig} from '../config';
import AdBar from '../components/AdBar';
import {AdMobBanner, AdMobInterstitial, PublisherBanner, AdMobRewarded} from 'expo-ads-admob';
console.disableYellowBox = true;

{/* <Text>{firebase.auth().currentUser.email}</Text>
<Text>{firebase.auth().currentUser.displayName}</Text> //a
<Text>{firebase.auth().currentUser.refreshToken}</Text> */
}

const bannerWidths = [200, 250, 320];

// const BannerExample = ({     style,     title,     children,     ...props })
// => (     <View {...props} style={[styles.example, style]}>         <Text
// style={styles.title}>{title}</Text>         <View>{children}</View> </View>
// );

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

class GetCoinsScreen extends Component {
    constructor() {
        super();
        this.state = {
            fluidSizeIndex: 0
        };
    }

    componentDidMount() {
        // console.log(AdMobRewarded);
        AdMobRewarded.setTestDeviceID([AdMobRewarded.simulatorId]);
        AdMobRewarded.setAdUnitID(adMobConfig.AdMobRewardedID);

        AdMobRewarded.addEventListener('rewardedVideoDidRewardUser', (reward) => {
            this.handleAfterReward(reward);
        });
        // AdMobRewarded.addEventListener('adLoaded', () => console.log('AdMobRewarded
        // => adLoaded'),); AdMobRewarded.addEventListener('adFailedToLoad', error =>
        // console.warn(error),); AdMobRewarded.addEventListener('adOpened', () =>
        // console.log('AdMobRewarded => adOpened'),);
        // AdMobRewarded.addEventListener('videoStarted', () =>
        // console.log('AdMobRewarded => videoStarted'),);
        // AdMobRewarded.addEventListener('adClosed', () => { console.log('AdMobRewarded
        // => adClosed');     AdMobRewarded .requestAdAsync().then((res)=>{
        // console.log(res); console.log('lol');         })         .catch(error =>
        // console.warn(error)); }); AdMobRewarded.addEventListener('adLeftApplication',
        // () => console.log('AdMobRewarded => adLeftApplication'),); AdMobRewarded
        // .requestAdAsync()     .catch(error => console.warn(error));

        AdMobInterstitial.setTestDeviceID([AdMobInterstitial.simulatorId]);
        AdMobInterstitial.setAdUnitID('ca-app-pub-3940256099942544/1033173712');

        // AdMobInterstitial.addEventListener('adLoaded', () =>
        // console.log('AdMobInterstitial adLoaded'),);
        // AdMobInterstitial.addEventListener('adFailedToLoad', error =>
        // console.warn(error),); AdMobInterstitial.addEventListener('adOpened', () =>
        // console.log('AdMobInterstitial => adOpened'),);
        // AdMobInterstitial.addEventListener('adClosed', () => {
        // console.log('AdMobInterstitial => adClosed');     AdMobInterstitial
        // .requestAdAsync()         .catch(error => console.warn(error)); });
        // AdMobInterstitial.addEventListener('adLeftApplication', () =>
        // console.log('AdMobInterstitial => adLeftApplication'),); AdMobInterstitial
        // .requestAdAsync()     .catch(error => console.warn(error));
    }

    componentWillUnmount() {
        AdMobRewarded.removeAllListeners();
        AdMobInterstitial.removeAllListeners();
    }

    async showInterstitial() {
        AdMobInterstitial
            .requestAdAsync()
            .then(() => {
                AdMobInterstitial.showAdAsync();
            })
            .catch(error => console.warn(error));
    }

    async showRewarded() {
        AdMobRewarded
            .getIsReadyAsync()
            .then((isReady) => {
                if (!isReady) {
                    AdMobRewarded
                        .requestAdAsync()
                        .then(() => {
                            AdMobRewarded.showAdAsync();
                        });
                } else 
                    AdMobRewarded.showAdAsync();
                }
            )
            .catch(error => console.warn(error));
    }

    handleAfterReward(reward) {
        console.log('AdMobRewarded => rewarded', reward);

        _retrieveData('x-auth').then((xauth) => {
            axios({
                method: 'post',
                url: hostConfig.address + '/users/reward100',
                headers: {
                    'x-auth': xauth
                }
            }).then((res) => {
                console.log(res.data);
            })
        }).catch((e) => {
            console.log(e);
        });
    }

    handleExit() {
        console.log("handleExit");
        this
            .props
            .navigation
            .navigate('DashboardScreen');
    }
    render() {
        return (
            <View style={styles.container}>

                <TouchableOpacity style={styles.button} onPress={this.showRewarded}>
                    <Text style={styles.buttonText}>
                        👉 Click here and get coins after watching an ad! 👈
                    </Text>
                </TouchableOpacity>

                <AdBar/>
                <View
                    style={{
                    position: 'absolute',
                    bottom: '30%',
                    right: 0
                }}>
                    <Button
                        title="Exit!"
                        style={{}}
                        onPress={() => {
                        this.handleExit()
                    }}/></View>
            </View>
        );

    }

}

export default GetCoinsScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    button: {
        width: '80%',
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        padding: 10
    },
    buttonText: {
        fontSize: 20
    }
});
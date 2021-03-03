import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    Button,
    View,
    AsyncStorage,
    Linking,TouchableOpacity,LogBox
} from 'react-native';
import AdBar from '../components/AdBar';
LogBox.ignoreAllLogs(true);


const bannerWidths = [200, 250, 320];

// const BannerExample = ({     style,     title,     children,     ...props })
// => (     <View {...props} style={[styles.example, style]}>         <Text
// style={styles.title}>{title}</Text>         <View>{children}</View> </View>
// );

async function _storeData (str, val)  {
    try {
        await AsyncStorage.setItem(str, val);
    } catch (e) {
        console.log(e);
    }
};

async function _retrieveData(str) {
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

class CreditsScreen extends Component {
    constructor() {
        super();
        this.state = {
            fluidSizeIndex: 0
        };
    }

    loadInBrowser = (link) => {
        if(link==1)
            Linking.openURL('https://github.com/mozilla/fxemoji/blob/gh-pages/LICENSE.md').catch(err => console.error("Couldn't load page", err));
        if(link==2)
            Linking.openURL('https://github.com/hfg-gmuend/openmoji/blob/master/LICENSE.txt').catch(err => console.error("Couldn't load page", err));
      };

    handleExit() {
        console.log("handleExit");

        _retrieveData('x-auth').then((val) => {
            console.log(val);
            if(val){
                this
                    .props
                    .navigation
                    .navigate('DashboardScreen');
            }else{
                this
                    .props
                    .navigation
                    .navigate('LoginScreen');
            }
        }).catch((e) => {
            RoomsScreenHolder
                .props
                .navigation
                .navigate('LoginScreen');
            console.log(e);
        });
    }
    render() {
        return (
            <View style={styles.container}>
                <AdBar/>

                <TouchableOpacity onPress={()=>{this.loadInBrowser(1)}}>
                    <Text >
                        Some of the design is the derived from the free to use emoji set of Firefox. Click here to see their license.
                        Thanks to Mozilla and Firefox!
                    </Text>
                </TouchableOpacity>


                <TouchableOpacity onPress={()=>{this.loadInBrowser(2)}}>
                    <Text >
                        Some of the design is the derived from the free to use emoji set of OpenMoji. Click here to see their license.
                        Thanks to OpenMoji!
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={()=>{this.loadInBrowser(2)}}>
                    <Text >
                        Some of the design is the derived from the free to use models created by @Quaternius. Make sure to look him up on socials.
                        Thanks to @Quaternius!
                    </Text>
                </TouchableOpacity>



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

export default CreditsScreen

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
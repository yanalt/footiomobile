import React, {Component} from 'react';
import {
    Image,
    StyleSheet,
    Button,
    TouchableOpacity,
    Text,
    View,
    AsyncStorage,
    TextInput,
    Platform,LogBox
} from 'react-native';
import axios from 'axios';
import {hostConfig} from '../config';
import AdBar from '../components/AdBar';

LogBox.ignoreAllLogs(true);
console.warn = function() {};

async function _storeData (str, val) {
    try {
        await AsyncStorage.setItem(str, val);
    } catch (e) {
        console.log(e);
    }
};

async function _retrieveData (str) {
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








let handleReturningUser = function (email, password) { //move to new screen
    console.log('handleLoggedInUser');
    console.log(hostConfig.address);
    axios({
        method: 'post',
        url: hostConfig.address + '/users/login',
        data: {
            email,
            password
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




class ReturningScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded : false,
            email: '',
            password: ''
        }
    }

       
    componentDidMount(){
        this.setState({isLoaded:true});
    }

    

    async handleLogin(){
        try{
                console.log('handleLogin');
                console.log(this.state.email+' '+this.state.password);
                if(this.state.email.length>0&&this.state.password.length>0){
        
                    let res = await axios({
                        method: 'post',
                        url: hostConfig.address + '/users/login', //network error solution: add http:// before the address in config......
                        data: {
                            email: this.state.email,
                            password: this.state.password
                        }
                    });
                    if(res){
                        console.log(res.headers['x-auth']);
                        await _storeData('x-auth', res.headers['x-auth']);
                        await _storeData('email', this.state.email);
                        await _storeData('password', this.state.password);
                        this
                            .props
                            .navigation
                            .navigate('DashboardScreen');
                    }
                }
            }catch(e){
                console.log(e);
            }
    }
    

    handleChangeText(email, password){      // TODO: make this work with the login
        if(email!=null){
            console.log(email);
            this.setState({email});
        }
        if(password!=null){
            console.log(password);
            this.setState({password});
        }
    }

    // TODO: make the submit button work

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
        console.log("render");
        if(this.state.isLoaded){
            return (
                <View style={styles.container}>

                    <Text style={styles.title}>Log in with old ID and code</Text>
                    <Text style={styles.warning}>Write the old ID and code that you had before in order to access your old skin collection.</Text>
                    
                    <View style={styles.buttonSpace}>
                        <View style={styles.buttonSpace}>
                                <TextInput style={styles.textInput} onEndEditing={(ev)=>{ this.handleChangeText(ev.nativeEvent.text,null)}} placeholder='Your old ID' />
                        </View>
                        <View style={styles.buttonSpace}>
                                <TextInput style={styles.textInput} onEndEditing={(ev)=>{ this.handleChangeText(null,ev.nativeEvent.text)}} placeholder='Your old code' />
                        </View>

                        <View style={styles.buttonSpace}>
                            <TouchableOpacity
                                onPress={() => this.handleLogin()}
                                style={styles.button}><Text>Log in</Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                    <View style={styles.buttonSpace}>
                    </View>


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
        }else{
            return (
                <View style={styles.container}>
                    <Text>Loading..</Text>
                </View>
            );
        }
    }
}

export default ReturningScreen;

let displayAndroid = 'flex',displayIos = 'flex';
if(Platform.OS=='android'){
    displayIos = 'flex';
}
if(Platform.OS=='ios'){
    displayAndroid='none';
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 70,
        marginBottom: 0,
        flex: 1,
        backgroundColor: '#fff',
        // justifyContent: 'center'
    },
    
    button: {
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        display:displayAndroid,
        padding: 10
    },
    buttonApple: {
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        display:displayIos,
        padding: 10
    },
    buttonSignOut: {
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        padding: 10
    },
    buttonSpaceSignOut: {
        padding: 10,
        position: 'absolute',
        bottom: '10%',
        right: 0
    },
    buttonText: {
        fontSize: 30
    },
    buttonSpace: {
        width: '70%',
        padding: 5
    },
    buttonSpaceCredits:{
        padding: 10,
        position: 'absolute',
        bottom: '30%',
        right: 0
    },
    buttonCredits:{
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        padding: 10
    },
    title: {
        fontSize: 50
    },
    textInput: {
        borderStyle: 'solid',
        borderWidth: 1,
        paddingLeft: 4
    }
});

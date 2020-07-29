import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View
} from 'react-native';


class ReloadScreen extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount(){
        this.props.navigation.navigate('NativeShopScreen');
    }
    
    render() {
        
        return (
            <View style={styles.container}>
                <Text style={{paddingLeft:'40%',paddingTop:40}}>Reloading...</Text>
            </View>
        );
    }
}


export default ReloadScreen;

ReloadScreen.navigationOptions = {
    header: null
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});

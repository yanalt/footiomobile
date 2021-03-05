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
        let destination = this.props.navigation.state.params.page;
        if(!destination)
            this.props.navigation.navigate('NativeShopScreen');
        else
            this.props.navigation.navigate(destination);
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

import React from 'react';
import {AdMobBanner} from 'expo-ads-admob';
import {View} from 'react-native';
import {adMobConfig} from '../config';

export default function AdBar(props) {
  return (
    <View
        style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width:'100%'
    }}>

        <AdMobBanner
            adSize="smartBannerPortrait"
            adUnitID={adMobConfig.AdBarID}/></View>
  );
}

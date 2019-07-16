import React, { Component } from 'react';
import { View } from 'react-native';
import { NotificationPopup, MaybeYourNavigator } from 'react-native-push-notification-popup';

class ModalElement extends Component {

    public state = {

    }

    public componentDidMount() {
        this.popup.show({
            onPress(),
            appIconSource: require('./assets/icon.jpg'),
            appTitle: 'Some App',
            timeText: 'Now',
            title: 'New message',
            body: 'This is a sample message.\nTesting emoji 😀',
        });
    }

    public render () {
        return (
            <View>
                <NotificationPopup ref={ref => this.popup = ref} />
                <MaybeYourNavigator />
            </View>
        )
}

}

export ModalElement;

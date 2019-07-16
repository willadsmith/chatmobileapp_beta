import React, { Component } from 'react';
import { View, Animated, Alert } from 'react-native';
import AsyncStorage  from '@react-native-community/async-storage';
import firebase from 'react-native-firebase';

class FBNotification extends Component {

    constructor(props: any) {
        super(props);
        this.state = {
            spinValue: new Animated.Value(0),
            backSpinValue: new Animated.Value(0)
        };
    }

    public componentDidMount() {
        this.checkPermission();
        this.createNotificationListeners();
    }

    public componentWillUnmount() {
        this.notificationListener;
        this.notificationOpenedListener;
    }

    // Проверка наличия токена в базе
    public async checkPermission() {
        const enabled = await firebase.messaging().hasPermission();
        if (enabled) {
            this.getToken();
        } else {
            this.requestPermission();
        }
    }

    // Сохранения токена для юзера
    public async getToken() {
        let fcmToken = await AsyncStorage.getItem('fcmToken');
        if (!fcmToken) {
            fcmToken = await firebase.messaging().getToken();
            if (fcmToken) {
                // user has a device token
                console.log('fcmToken:', fcmToken);
                await AsyncStorage.setItem('fcmToken', fcmToken);
            }
        }
        console.log('fcmToken:', fcmToken);
    }

    // Ответ с БД на сервере
    public async requestPermission() {
        try {
            await firebase.messaging().requestPermission();
            // Юзер подключен
            this.getToken();
        } catch (error) {
            // Если не подключен юзер
            console.log('permission rejected');
        }
    }

    // Проверка всех методов Firebase
    public async createNotificationListeners() {
        /*
        * Triggered when a particular notification has been received in foreground
        * */
        // @ts-ignore
        this.notificationListener = firebase.notifications().onNotification((notification) => {
            // @ts-ignore
            const {title, body} = notification;
            console.log('checked onNotification: Test message');

            // @ts-ignore
            const localNotification = new firebase.notifications.Notification({
                sound: '../assets/audio/message_notification.mp3',
                show_in_foreground: true,
            })
                .setSound('../assets/audio/message_notification.mp3')
                .setNotificationId(notification.notificationId)
                .setTitle(notification.title)
                .setBody(notification.body)
                .android.setChannelId('fcm_FirebaseNotifiction_default_channel') // e.g. the id you chose above
                .android.setSmallIcon('@drawable/ic_launcher') // create this icon in Android Studio
                .android.setColor('#000000') // you can set a color here
                .android.setPriority(firebase.notifications.Android.Priority.High);

            firebase.notifications()
                .displayNotification(localNotification)
                .catch(err => console.error(err));
        });

        const channel = new firebase.notifications.Android.Channel('fcm_FirebaseNotifiction_default_channel', 'Demo app name', firebase.notifications.Android.Importance.High)
            .setDescription('Demo app description')
            .setSound('sampleaudio.wav');
        firebase.notifications().android.createChannel(channel);

        /*
        * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
        * */
        // @ts-ignore
        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            const {title, body} = notificationOpen.notification;
            console.log('onNotificationOpened:');
            Alert.alert(title, body);
        });

        /*
        * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
        * */
        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            const {title, body} = notificationOpen.notification;
            console.log('getInitialNotification:');
            Alert.alert(title, body);
        }
        /*
        * Triggered for data only payload in foreground
        * */
        this.messageListener = firebase.messaging().onMessage((message) => {
            // Проверка на DataMessage
            console.log("JSON.stringify:", JSON.stringify(message));
        });
    }
}

export class FBNotification;

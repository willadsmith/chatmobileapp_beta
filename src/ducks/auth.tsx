import { Record } from 'immutable';
import { all, fork, put, select, take, takeEvery } from 'redux-saga/effects';
import { APP_NAME, IO_SERVER } from '../configs/';
import { FAIL, REFRESH_REQUEST, SAVE, START, SUCCESS } from '../configs/types';
import { fetchDataFromServer } from '../middlewares/utils';
import { createSelector } from 'reselect';
import AsyncStorage  from '@react-native-community/async-storage';
import { rootTabsScreen, rootAuthScreen } from '../navigation/nagivation';
import Snackbar from 'react-native-snackbar';
import { success } from '../assets/app.style';
import { Navigation } from 'react-native-navigation';
import { IvcAdapter } from '../libs/IvcAdapter';
import { dispatch } from '../store';
import NotificationAdapter from '../libs/NotificationAdapter';
import firebase from 'react-native-firebase';
import { currentRoomIdSelector } from './workspace/roomCurrent';
import { MESSAGE_TYPES } from './workspace/rooms';
import {Alert, Platform} from "react-native";

/*
--- CONSTANTS ---
*/

export const moduleName = 'auth';
const prefix = `${APP_NAME}/${moduleName}`;

export const AUTH_INIT = `${prefix}/AUTH_INIT`;
export const AUTH_CHECK = `${prefix}/AUTH_CHECK`;
export const SIGN_IN_REQUEST = `${prefix}/SIGN_IN_REQUEST`;
export const USER_CONFIRM_REQUEST = `${prefix}/USER_CONFIRM_REQUEST`;
export const LOGOUT = `${prefix}/LOGOUT`;
export const PASSWORD_RESET = `${prefix}/PASSWORD_RESET`;
export const UPDATE_USER_PASSWORD_REQUEST = `${prefix}/UPDATE_USER_PASSWORD_REQUEST`;
export const START_LOADING = `${prefix}/START_LOADING`;
export const STOP_LOADING = `${prefix}/STOP_LOADING`;
export const UPDATE_USER_INFO_REQUEST = `${prefix}/UPDATE_USER_INFO_REQUEST`;
export const SET_INFO_VALUE = `${prefix}/SET_INFO_VALUE`;
export const SET_IVC_USER = `${prefix}/SET_IVC_USER`;
export const SET_NOTIFICATION_TOKEN = `${prefix}/SET_NOTIFICATION_TOKEN`;
export const ON_NOTIFICATION_SAGA = `${prefix}/ON_NOTIFICATION_SAGA`;

/*
--- REDUCER ---
*/

const UserRecord = Record({
    id: null,
    email: null,
    authRole: null,
    status: null,
    info: {
        name: null,
        surname: null,
        statusMessage: null,
        avatar: null,
        showPopups: null,
    }
});

const ErrorRecord = Record({
    errors: null,
    message: null,
    status: null
});

const MessageRecord = Record({
    id: null,
    email: null,
    authRole: null,
    status: null,
    info: {
        name: null,
    }
});

const IvcUserRecord = Record({
    userId: null,
    sessionKey: null,
    refreshToken: null,
});

export const ReducerRecord = Record({
    isInited: false,
    token: null,
    refreshToken: null,
    user: new UserRecord(),
    errors: new ErrorRecord(),
    message: new MessageRecord(),
    isLoading: false,
    ivcUser: new IvcUserRecord(),
});

/*
 ---- Create state ---- Reducer ----
*/

export default function reducer (state = new ReducerRecord(), action: any) {
    const { type, payload } = action;

    switch (type) {
        case AUTH_INIT:
            return state
                .set('isInited', true);
        case START_LOADING:                                          // -------- Load auth
            return state
                .set('isLoading', true);
        case SIGN_IN_REQUEST + SUCCESS:
            return state
                .set('token', payload.token)
                .set('refreshToken', payload.refeshToken)
                .set('isLoading', false)
                .setIn(['user', 'id'], payload.user.id)
                .setIn(['user', 'email'], payload.user.email)
                .setIn(['user', 'authRole'], payload.user.authRole)
                .setIn(['user', 'status'], payload.user.status)
                .setIn(['user', 'info'], payload.user.info);
        case UPDATE_USER_PASSWORD_REQUEST + FAIL:
            return state
                .set('isLoading', false)
                .setIn(['errors', 'errors'], payload.errors);
        case SIGN_IN_REQUEST + START:
        case SIGN_IN_REQUEST + SAVE:
        case SIGN_IN_REQUEST + FAIL:
        case USER_CONFIRM_REQUEST + FAIL:
        case PASSWORD_RESET + FAIL:
        case PASSWORD_RESET + START:
            return state
                .set('isLoading', false)
                .set('errors', new ErrorRecord(payload));
        case UPDATE_USER_PASSWORD_REQUEST + SUCCESS:
        case UPDATE_USER_INFO_REQUEST + FAIL:
        case UPDATE_USER_INFO_REQUEST + SUCCESS:
        case STOP_LOADING:
            return state
                .set('isLoading', false);
        case UPDATE_USER_INFO_REQUEST + SAVE:                        // --------  Add
            return state.setIn(['user', 'info'], payload.info);
        case SET_INFO_VALUE + SUCCESS:                               // --------  Add
            return state.setIn(['user', 'info'], payload.info);
        case REFRESH_REQUEST + SAVE:                                 // --------  Reinit user
            return state.set('token', payload.token)
                .set('refreshToken', payload.refreshToken);
        case SET_INFO_VALUE + SAVE:                                  // --------  Add
            return state.setIn(['user', 'info'], payload.info);
        case PASSWORD_RESET + SUCCESS:
            return state
                .set('isLoading', false)
                .set('errors', new ErrorRecord(payload));
        case LOGOUT + SAVE:
            return state
                .set('token', null)
                .set('refreshToken', null)
                .set('user', new UserRecord())
                .set('errors', new ErrorRecord())
                .set('message', new MessageRecord());
        case SET_IVC_USER:
            return state
                .setIn(['ivcUser', 'userId'], payload.userId)
                .setIn(['ivcUser', 'sessionKey'], payload.sessionKey)
                .setIn(['ivcUser', 'refreshToken'], payload.refreshToken);
        default:
            return state;
    }

}

/*
 --- SELECTORS ---
*/

export const authSelector = (state: any) => state[moduleName];
export const isLoadingSelector = (state: any) => state[moduleName].isLoading;
export const userSelector = (state: any) => state[moduleName].user;
export const authorizedSelector = createSelector(authSelector, (state: any) => !!state.token);
export const ivcUserSelector = (state: any) => state[moduleName].ivcUser;

export const tokenSelector = createSelector(
    authSelector,
    (state) => state.token
);

export const userIdSelector = createSelector(
    userSelector,
    (state) => state.id
);

export const errorsSelector = createSelector(
    authSelector,
    (state) => state.errors
);

export const messageSelector = createSelector(
    authSelector,
    (state) => state.message
);

export const authInitSelector = createSelector(
    authSelector,
    (state) => {
        return state.isInited;
    }
);

/*
--- ACTION CREATORS ---
*/

export function authCheck () {
    return {
        type: AUTH_CHECK,
    };
}


export function signIn (email: string, password: string) {
    return {
        type: SIGN_IN_REQUEST,
        payload: { email, password }
    };
}


export function setIvcUser (payload: any) {
    dispatch({
        type: SET_IVC_USER,
        payload
    });
}

export function updateUserInfo (userInfo: any, showNotification: boolean = false, updateIvcUser: boolean = true, payload: any) {
    console.log('ssss updateUserInfo', userInfo);
    return {
        type: UPDATE_USER_INFO_REQUEST,
        payload: {
            userInfo,
            showNotification,
            updateIvcUser,
            payload
        }
    };
}

export function passwordReset (email: string) {
    return {
        type: PASSWORD_RESET,
        payload: { email }
    };
}

export function logout () {
    IvcAdapter.disconnect(true);
    NotificationAdapter.getInstance().stop('call');
    return {
        type: LOGOUT,
    };
}

export function setNotificationToken () {
    dispatch({
        type: SET_NOTIFICATION_TOKEN
    });
}

export function onNotification (payload: any) {
    dispatch({
        type: ON_NOTIFICATION_SAGA,
        payload
    });
}

export function updateUserPassword (values: { oldPassword: string, password: string, passwordConfirmation: string }, reject: any, resolve: any) {
    return {
        type: UPDATE_USER_PASSWORD_REQUEST,
        payload: {
            values,
            reject,
            resolve
        }
    };
}

export function stopLoading () {
    return {
        type: STOP_LOADING
    };
}
export function startLoading () {
    return {
        type: START_LOADING
    };
}

/*
  Sagas
*/

export const authCheckSaga = function* () {
    while (true) {
        yield take(AUTH_CHECK);
        const auth = yield AsyncStorage.getItem('auth').then((authObject) => {
            return authObject;
        });
        console.log('ttt auth', auth);
        if (auth) {
            yield put({
                type: SIGN_IN_REQUEST + SUCCESS,
                payload: JSON.parse(auth)
            });
            yield put({
                type: AUTH_INIT
            });
            IvcAdapter.setProps({
                socketServer: IO_SERVER,
                dashboardUserToken: JSON.parse(auth).token
            });
            yield rootTabsScreen();
        } else {
            yield rootAuthScreen();
        }
    }
};

export const updateUserPasswordSaga = function* () {
    while (true) {
        const { payload: { values, payload: { reject, resolve, componentId } }} = yield take(UPDATE_USER_PASSWORD_REQUEST);
        const { token } = yield select(authSelector);
        const response = yield fetchDataFromServer({
            callApi: '/user/update_password',
            type: UPDATE_USER_PASSWORD_REQUEST + SAVE,
            data: values,
            headers: {
                Authorization: token
            },
            alerts: {
                success: {
                    action: 'Password successfully updated, token - ' + token,
                    message: 'Password successfully updated'
                },
                error: null
            }

        });
        if (response.status === false) {
            reject();
        } else {
            Snackbar.show({
                title: 'Password successfully updated',
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: success
            });
            resolve();
            Navigation.pop(componentId);
        }
    }
};

export const signInSaga = function* () {
    while (true) {
        const { payload } = yield take(SIGN_IN_REQUEST);
        const { email, password } = payload;
        const response = yield fetchDataFromServer({
            callApi: '/login',
            type: SIGN_IN_REQUEST,
            data: {
                email,
                password
            }
        });
        if (response.status) {
            yield AsyncStorage.setItem('auth', JSON.stringify(response));
            yield put({
                type: AUTH_CHECK
            });
        }
    }
};

export const updateUserInfoSaga = function* () {
    while (true) {
        const { payload } = yield take(UPDATE_USER_INFO_REQUEST);
        const { userInfo, updateIvcUser } = payload;
        console.log('ttt payload update info saga', payload);
        const { token, user } = yield select(authSelector);
        const response = yield fetchDataFromServer({
            callApi: '/user/update_info',
            type: UPDATE_USER_INFO_REQUEST,
            data: {
                info: {
                    ...user.info,
                    ...userInfo
                }
            },
            headers: {
                Authorization: token
            },
            alerts: {
                success: {
                    action: 'Profile successfully updated, token - ' + token,
                    message: 'Profile successfully updated'
                },
                error: {
                    action: 'Profile update error, token - ' + token,
                    message: 'Something went wrong, try again'
                }
            }

        });
        const auth = yield AsyncStorage.getItem('auth').then((authObject: any) => {
            return authObject;
        });
        if (auth && response && response.status === true) {
            console.log('ttt auth response', auth);
            const authObject = JSON.parse(auth);
            console.log('ttt response / init');
            authObject.user.info = {
                ...user.info,
                ...userInfo
            };
            yield AsyncStorage.setItem('auth', JSON.stringify(authObject));
            AsyncStorage.getItem('ivcUser').then((userObject) => {
                const ivcUser = userObject ? JSON.parse(userObject) : {};
                if (updateIvcUser) {
                    IvcAdapter.setProps({
                        user: {
                            info: {
                                ...authObject.user.info,
                                avatar: authObject.user.info.avatar ? `${authObject.user.id}/thumb/${authObject.user.info.avatar}` : '',
                                notificationMobileToken: userInfo.notificationMobileToken || user.info.notificationMobileToken
                            },
                            ...ivcUser
                        }
                    });
                    IvcAdapter.setUserInfo();
                }
            });
            yield put({
                type: UPDATE_USER_INFO_REQUEST + SAVE,
                payload: {
                    info: authObject.user.info
                }
            });
        }
    }
};


export const setInfoValueSaga = function* () {
    while (true) {
        const { payload } = yield take(SET_INFO_VALUE);
        const { key, value } = payload;
        const { info } = yield select(userSelector);
        yield put({
            type: SET_INFO_VALUE + SAVE,
            payload: {
                info: Object.assign({}, info, { [key]: value })
            }
        });

    }
};

export const passwordResetSaga = function* () {
    while (true) {
        const {payload} = yield take(PASSWORD_RESET);
        const {email} = payload;
        const response = yield fetchDataFromServer({
            callApi: '/reset_password',
            type: PASSWORD_RESET,
            data: {
                email: email.trim()
            },
            alerts: {
                success: null,
                error: null
            }

        });
        if (response.status === true) {
            Snackbar.show({
                title: 'A reset password link has been sent you via email',
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: success
            });
        }
    }
};

export const onNotificationSaga = function* (action: any) {
    const { payload } = action;
    const currentRoomId = yield select(currentRoomIdSelector);
    console.log('ttt current room id notification', currentRoomId);
    const messaging = firebase.messaging();
    console.log('ttt current room id messaging', messaging);
    const room = JSON.parse(payload.data.room);
    const additionalInfo = JSON.parse(payload.data.additionalInfo || '{}');
    console.log('ttt additionalInfo', additionalInfo);
    if (payload.data.action === 'roomMessage') {
        if (additionalInfo.message.type === MESSAGE_TYPES.system || additionalInfo.message.type === MESSAGE_TYPES.bot_message || currentRoomId === room.id) {
            return;
        }
    }
    const notificationBody = additionalInfo.message.content.text;
    if (payload.data.action === 'room') {
        const channel = new firebase.notifications.Android.Channel(
            'channelId',
            'Channel Name',
            firebase.notifications.Android.Importance.Max
        ).setDescription('A natural description of the channel');
        firebase.notifications().android.createChannel(channel);
        // the listener returns a function you can use to unsubscribe
        // @ts-ignore
        this.unsubscribeFromNotificationListener = firebase.notifications().onNotification(async (notification) => {
            console.log('ttt unsubscribeFromNotificationListener', firebase.notifications().onNotification);
            if (Platform.OS === 'android') {

                const localNotification = new firebase.notifications.Notification()
                    .setNotificationId(notification.notificationId)
                    .setTitle(notification.title)
                    .setSubtitle('notification.subtitle')
                    .setBody(notificationBody)
                    .setData(notification.data)
                    .android.setChannelId('channelId') // e.g. the id you chose above
                    // .android.setSmallIcon('ic_stat_notification') // create this icon in Android Studio
                    .android.setColor('#000000') // you can set a color here
                    .android.setPriority(firebase.notifications.Android.Priority.High);

                firebase.notifications()
                    .displayNotification(localNotification)
                    .catch(err => console.error(err));

            } else if (Platform.OS === 'ios') {

                const localNotification = new firebase.notifications.Notification()
                    .setNotificationId(notification.notificationId)
                    .setTitle(notification.title)
                    .setSubtitle('notification.subtitle')
                    .setBody(notification.body)
                    .setData(notification.data)
                    .ios.setBadge(notification.ios.badge = 1);

                firebase.notifications()
                    .displayNotification(localNotification)
                    .catch(err => console.error(err));
            }

            // If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
            // @ts-ignore

            this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
                console.log('ttt notificationOpenedListener', firebase.notifications().onNotification);
                const {title, body} = notificationOpen.notification;
                console.log('onNotificationOpened:');
                Alert.alert(title, body);
            });

            // If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
            const notificationBackOpen = await firebase.notifications().getInitialNotification();
            if (notificationBackOpen) {
                console.log('ttt notificationOpen', firebase.notifications().onNotification);
                const { title, body } = notificationBackOpen.notification;
                console.log('getInitialNotification:');
                Alert.alert(title, body);
            }


            // Triggered for data only payload in foreground
            messaging.onMessage((message) => {
                console.log('ttt messageListener', firebase.notifications().onNotification);
                // Проверка на DataMessage
                console.log("JSON.stringify:", JSON.stringify(message));
            });
        });
    }
};

export const setNotificationTokenSaga = function* () {
    while (true) {
        yield take(SET_NOTIFICATION_TOKEN);
        const auth = yield select(authSelector);
        console.log('ttt auth notification', auth);
        Promise.resolve().then(async () => {
            const messaging = firebase.messaging();
            await messaging.requestPermission();
            console.log('ttt auth notification promise', messaging.requestPermission());
            messaging.onMessage((payload: any) => {
                console.log('ttt messaging.onMessage', messaging.onMessage);
                if (Notification.permission === 'granted') {
                    onNotification(payload);
                }
            });
            messaging.onTokenRefresh(() => {
                messaging.getToken().then((refreshedToken: any) => {
                    // @ts-ignore
                    dispatch(updateUserInfo({ ...auth.user.info, notificationMobileToken: refreshedToken }, null,false, true, null));
                });
            });

            let fcmToken = await AsyncStorage.getItem('fcmToken');
            if (!fcmToken) {
                fcmToken = await firebase.messaging().getToken();
                if (fcmToken) {
                    // user has a device token
                    console.log('fcmToken:', fcmToken);
                    await AsyncStorage.setItem('fcmToken', fcmToken);
                }
            }
            if (auth.user.info.notificationMobileToken !== fcmToken) {
                try {
                    await messaging.deleteToken(fcmToken || '');
                    fcmToken = await messaging.getToken();
                    console.log('ttt auth refreshTokenNotification', fcmToken);
                } catch (error) {
                    console.log('ttt auth error', error);
                }
            }
            if (fcmToken !== auth.user.info.notificationMobileToken) {
                console.log('ttt auth fcmToken', fcmToken );
                console.log('ttt auth notificationMobileToken', auth.user.info.notificationMobileToken );
                // @ts-ignore
                dispatch(updateUserInfo({ ...auth.user.info, notificationToken: fcmToken }, false, true, null ));
            }
        });
    }
};

export const logoutSaga = function* () {
    while (true) {
        yield take(LOGOUT);
        yield AsyncStorage.removeItem('auth');
        yield AsyncStorage.removeItem('ivcUser');
        yield put({
            type: LOGOUT + SAVE
        });
        yield rootAuthScreen();
    }
};

function* authWatcher () {
    yield takeEvery(ON_NOTIFICATION_SAGA, onNotificationSaga);
}

/*
 --- EXPORT CLASS ---
*/

export const saga = function* () {
    yield all([
        fork(authWatcher),
        signInSaga(),
        authCheckSaga(),
        passwordResetSaga(),
        updateUserInfoSaga(),
        setInfoValueSaga(),
        updateUserPasswordSaga(),
        logoutSaga(),
        setNotificationTokenSaga()
    ]);
};

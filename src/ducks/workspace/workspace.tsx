import AsyncStorage  from '@react-native-community/async-storage';
import {OrderedMap, Record} from 'immutable';
import { all, take, select, put } from 'redux-saga/effects';
import { createSelector } from 'reselect';
import { APP_NAME, IO_SERVER  } from '../../configs';
import { authSelector, tokenSelector } from '../auth';
import { FAIL, SAVE, START, SUCCESS } from '../../configs/types';
import { fetchDataFromServer } from '../../middlewares/utils';
import { dispatch } from '../../store';
import { addError } from '../alerts';
import {arrToMap, checkNested, mapToObj} from '../../utils/common';
import { IvcAdapter } from '../../libs/IvcAdapter';
import { currentRoomSelector } from './roomCurrent';

export const moduleName = 'workspace';
const prefix = `${APP_NAME}/${moduleName}`;

export const REINIT = `${prefix}/REINIT`;
export const INIT_CONNECTION = `${prefix}/INIT_CONNECTION`;
export const CONNECTED = `${prefix}/CONNECT`;
export const DISCONNECTED = `${prefix}/CONNECT`;
export const CONNECTING = `${prefix}/CONNECTING`;
export const FAILED = `${prefix}/FAILED`;
export const INIT = `${prefix}/INIT`;
export const NONE = `${prefix}/NONE`;
export const LOADING = `${prefix}/LOADING`;
export const LOADED = `${prefix}/LOADED`;
export const SET_STATUS = `${prefix}/SET_STATUS`;
export const SET_SESSION_STATUS = `${prefix}/SET_SESSION_STATUS`;
export const SET_RTCSTATUS = `${prefix}/SET_RTCSTATUS`;
export const UPDATE_STATUS = `${prefix}/UPDATE_STATUS`;
export const UPDATE_LIGHTBOX = `${prefix}/UPDATE_LIGHTBOX`;
export const UPDATE_DASHBOARD_USERS = `${prefix}/UPDATE_DASHBOARD_USERS`;
export const UPDATE_DASHBOARD_USER = `${prefix}/UPDATE_DASHBOARD_USER`;
export const UPDATE_STREAMS = `${prefix}/UPDATE_STREAMS`;
export const TOGGLE_CAMERA = `${prefix}/TOGGLE_CAMERA`;
export const REMOVE_STREAM = `${prefix}/REMOVE_STREAM`;
export const ADD_STREAM = `${prefix}/ADD_STREAM`;
export const MUTE_STREAM = `${prefix}/MUTE_STREAM`;

/*
 Reducer
*/

export const STREAM_TYPES = {
    local: 'local',
    remote: 'remote',
};

export const WorkspaceRecord = Record({
    sessionStatus: true,
    initStatus: NONE,
    apps: null,
    topics: null,
    // @ts-ignore
    dashboardUsers: new OrderedMap({}),
    isLoading: {
        common: false,
        crud: false,
        requestHelp: false,
        sendEmail: false
    },
    agents: [],
    demo: null,
    errors: null,
    shouldAppReInit: false,
    userApps: null,
    userTopics: null,
});

const initTopicRecord = Record({
    id: null,
    appId: null,
    name: null,
    connectStatus: null,
    type: null,
    status: null,
    dashboardUsers: null
});

const initAppRecord = Record({
    id: null,
    appHash: null,
    website: null,
    fields: null,
    topics: null,
    status: null
});

export const initDashboardUserRecord = Record({
    id: null,
    isMain: null,
    info: null,
    userId: null,
    connectStatus: null,
    status: null,
});

const ConfigsRecord = Record({
    texts: {
        title: 'Welcome to ...',
        message: 'We are always ready to help you',
        greeting: 'Hello, how may I help you?',
        offlineMessage: 'Nobody is available at the moment, please write your request and leave your email address.',
        topicInquiryProcessed: null,
        topicInquiry: null,
        mediaDevicesInquiry: null
    },
    style: {
        color: '#4682F7',
        backgroundBody: null,
        logo: null
    },
    fields: [
        { type: '0', name: 'Name' },
        { type: '0', name: 'Email' },
        { type: '1', name: 'Comment' },
    ],
    modules: {
        qualityControl: {
            status: true,
            title: 'Was this helpful?',
            message: null,
            successMessage: 'Thank you!'
        },
        triggers: {
            status: true,
            rules: {
                delay: 5
            },
            components: {
                basic: {
                    status: true,
                    title: 'Hey there, have a question?',
                    message: 'Click to start a conversation.',
                    hotMenu: true
                }
            }
        }
    }
});

const AppObjectRecord = Record({
    app: {
        appKey: null,
        configs: new ConfigsRecord(),
        createdAt: null,
        dashboardUserId: null,
        extraConfigs: null,
        id: null,
        info: null,
        properties: { video: 1 },
        status: null,
        updatedAt: null,
        website: null,
    },
    appTopics: [{ name: 'Sales department', type: 0, status: 1 }],
    appTopicsUsers: []
});

export const ReducerRecord = Record({
    sessionStatus: true,
    initStatus: NONE,
    apps: null,
    topics: null,
    dashboardUsers: null,
    list: {
        currentPage: null,
        models: null,
        modelsAmount: null,
        pagesAmount: null
    },
    isLoading: {
        common: false,
        crud: false,
        requestHelp: false,
        sendEmail: false
    },
    agents: [],
    appObject: new AppObjectRecord(),
    demo: null,
    errors: null,
    shouldAppReInit: false
});

export const RTC_STATUSES = {
    none: 'none',
    connecting: 'connecting',
    connected: 'connected',
    failed: 'failed',
    reconnecting: 'reconnecting',
};

export default function reducer (state = new WorkspaceRecord(), action: any) {
    const { type, payload } = action;
    switch (type) {
        case INIT + START:
            return state
                .set('initStatus', LOADING);

        case INIT + SUCCESS:
            return state
                .set('initStatus', LOADED)
                .set('apps', payload.userApps)
                .set('topics', payload.userTopics);

        case INIT + SAVE:
            return state
                .set('initStatus', LOADED)
                .set('apps', payload.apps)
                .set('topics', payload.topics)
                .set('dashboardUsers', payload.dashboardUsers);

        case REINIT + SAVE:
            return state
                .set('initStatus', LOADED)
                .set('apps', payload.apps)
                .set('topics', payload.topics)
                .set('dashboardUsers', payload.dashboardUsers);

        case UPDATE_DASHBOARD_USERS:
            return state
                .set('dashboardUsers', payload);

        case SET_SESSION_STATUS:
            return state
                .set('sessionStatus', payload.status);

        case INIT + FAIL:
            return state
                .set('initStatus', FAILED);
        case REINIT + FAIL:
            return state
                .set('initStatus', FAILED);
        default:
            return state;
    }

}
/*
Selectors
*/
export const stateSelector = (state: any) => state[moduleName];
export const streamsSelector = (state: any) => state[moduleName].streams;

export const appInitStatusSelector = createSelector(
    stateSelector,
    (state) => {
        return state.initStatus;
    }
);
export const appTopicsSelector = createSelector(
    stateSelector,
    (state) => {
        const topics: any = {};
        if (state.topics) {
            for (const topic of state.topics) {
                topics[topic] = topic.name;
            }
        }
        return topics;
    }
);

export const topicsSelector = createSelector(
    stateSelector,
    (state: any) => {
        return state.topics;
    }
);

export const dashboardUsersSelector = createSelector(
    stateSelector,
    (state) => {
        return state.dashboardUsers;
    });

export const dashboardUsersByUserIdSelector = createSelector(
    dashboardUsersSelector,
    (dashUsers: any) => {
        const dashboardUsersArr: any = [];
        console.log('QQQ dasUser', dashboardUsersArr);
        dashUsers.map((dashUser: any, key: number) => {
            dashboardUsersArr.push(dashUser);
            return null;
        });
        return arrToMap(dashboardUsersArr, initDashboardUserRecord, 'userId');
    });

export const currentRoomAppTopicsDashboardUsersSelector = createSelector(
    dashboardUsersSelector,
    (_: any, app: any) => app,
    (dashUsers: any, app: any) => {
        const topicsArr = [];
        for (const topic of app.topics) {
            const dashboardUsers = [];
            for (const userId of topic.dashboardUsers) {
                if (dashUsers.get(userId)) {
                    dashboardUsers.push({
                        id: dashUsers.get(userId).id,
                        isMain: dashUsers.get(userId).isMain,
                        info: dashUsers.get(userId).info,
                        userId: dashUsers.get(userId).userId,
                        connectStatus: dashUsers.get(userId).connectStatus,
                        status: dashUsers.get(userId).status,
                    });
                }
            }
            const topicObj = {
                appId: topic.appId,
                connectStatus: topic.connectStatus,
                id: topic.id,
                status: topic.status,
                type: topic.type,
                name: topic.name,
                dashboardUsers
            };
            topicsArr.push(topicObj);
        }
        return {
            ...app,
            topics: topicsArr
        };
    }
);

export const appsSelector = createSelector(
    stateSelector,
    (state) => {
        return state.apps;
    }
);

export const appSelector = createSelector(
    appsSelector,
    (_: any, appId: number) => appId,
    (apps: any, appId: number) => {
        if (appId && apps.get(appId)) {
            return apps.get(appId);
        }
        return null;
    }
);

export const lightBoxUrlSelector = createSelector(
    stateSelector,
    (state) => {
        return state.lightBoxUrl;
    }
);

export const rtcStatusSelector = createSelector(
    stateSelector,
    (state) => {
        return state.rtcStatus;
    }
);

/*
 * Action Creators
*/

export function initApp () {
    return {
        type: INIT
    };
}

export function setStatus (payload: any) {
    if (payload.status === FAILED) {
        addError('io_error', 'Connection is lost.');
    }

    dispatch({
        type: SET_STATUS,
        payload
    });
}

export function signalConnectionInit () {
    return {
        type: INIT_CONNECTION
    };
}

export function updateRtcStatus (rtcStatus: string) {
    dispatch({
        type: SET_RTCSTATUS,
        payload: {
            rtcStatus
        }
    });
}

export function setSessionStatus (status: boolean) {
    dispatch({
        type: SET_SESSION_STATUS,
        payload: {
            status
        }
    });
}

export function addStream (stream: any, type: string) {
    dispatch({
        type: ADD_STREAM,
        payload: {
            stream,
            type
        }
    });
}

export function clearStreams () {
    dispatch({
        type: UPDATE_STREAMS,
        payload: {
            streams: {
                [STREAM_TYPES.local]: null,
                [STREAM_TYPES.remote]: null
            }
        }
    });
}

export function removeStream () {
    dispatch({
        type: REMOVE_STREAM,
    });
}

export function toggleLightBox (url: string | null) {
    dispatch({
        type: UPDATE_LIGHTBOX,
        payload: {
            url
        }
    });
}

/*
 Sagas
*/

export const signalConnectionInitSaga = function* () {
    while (true) {
        yield take(INIT_CONNECTION);
        const auth = yield select(authSelector);
        console.log('qqq auth workspace', auth);
        let ivcUser: any = null;
        AsyncStorage.getItem('ivcUser').then(userObject => {
            ivcUser = userObject;
            console.log('qqq userObject', ivcUser, userObject);
            IvcAdapter.setProps({
                user: {
                    sessionKey: ivcUser ? JSON.parse(ivcUser).sessionKey : null,
                    refreshToken: ivcUser ? JSON.parse(ivcUser).sessionKey : null,
                    info: {
                        ...auth.user.info,
                        avatar: checkNested(mapToObj(auth), 'user', 'info', 'avatar') ? `${auth.user.id}/thumb/${auth.user.info.avatar}` : ''
                    }
                },
                socketServer: IO_SERVER,
                dashboardUserToken: auth.token,
            });
            IvcAdapter.connect();
        });
    }
};

export const initAppSaga = function* () {
    while (true) {
        const { payload } = yield take(INIT);
        const initStatus = yield select(appInitStatusSelector);
        const token = yield select(tokenSelector);
        if (initStatus === NONE) {
            const response = yield fetchDataFromServer({
                callApi: '/init',
                type: INIT,
                headers: {
                    Authorization: payload ? payload.token : token
                }
            });

            if (response && response.status === true) {
                const apps = [];
                const topics = [];
                const dashboardUsers = [];
                for (const appId in response.apps) {
                    if (response.apps.hasOwnProperty(appId)) {
                        const appMap = {
                            id: parseInt(appId, 10),
                            appHash: response.apps[appId].appHash,
                            website: response.apps[appId].website,
                            fields: response.apps[appId].fields,
                            topics: response.apps[appId].topics,
                            status: response.apps[appId].status,
                        };
                        apps.push(appMap);
                    }
                }
                for (const topicId in response.topics) {
                    if (response.topics.hasOwnProperty(topicId)) {
                        topics.push(response.topics[topicId]);
                    }
                }
                for (const dashboardUserId in response.dashboardUsers) {
                    if (response.dashboardUsers.hasOwnProperty(dashboardUserId)) {
                        const dashboardUserMap = {
                            id: parseInt(dashboardUserId, 10),
                            isMain: response.dashboardUsers[dashboardUserId].isMain,
                            info: response.dashboardUsers[dashboardUserId].info,
                            userId: response.dashboardUsers[dashboardUserId].userId,
                            connectStatus: response.dashboardUsers[dashboardUserId].connectStatus,
                            status: response.dashboardUsers[dashboardUserId].status,
                        };
                        dashboardUsers.push(dashboardUserMap);
                    }
                }
                yield put({
                    type: INIT + SAVE,
                    payload: {
                        apps: arrToMap(apps, initAppRecord),
                        topics: arrToMap(topics, initTopicRecord),
                        dashboardUsers: arrToMap(dashboardUsers, initDashboardUserRecord)
                    }
                });
            }
        }
    }
};

export const reInitAppSaga = function* () {
    while (true) {
        const { payload } = yield take(REINIT);
        const token = yield select(tokenSelector);

        const response = yield fetchDataFromServer({
            callApi: '/init',
            type: REINIT,
            headers: {
                Authorization: payload ? payload.token : token
            }
        });

        if (response && response.status === true) {
            const apps = [];
            const topics = [];
            const dashboardUsers = [];
            for (const appId in response.apps) {
                if (response.apps.hasOwnProperty(appId)) {
                    const appMap = {
                        id: parseInt(appId, 10),
                        appHash: response.apps[appId].appHash,
                        website: response.apps[appId].website,
                        fields: response.apps[appId].fields,
                        topics: response.apps[appId].topics,
                        status: response.apps[appId].status,
                    };
                    apps.push(appMap);
                }
            }
            for (const topicId in response.topics) {
                if (response.topics.hasOwnProperty(topicId)) {
                    topics.push(response.topics[topicId]);
                }
            }
            for (const dashboardUserId in response.dashboardUsers) {
                if (response.dashboardUsers.hasOwnProperty(dashboardUserId)) {
                    const dashboardUserMap = {
                        id: parseInt(dashboardUserId, 10),
                        isMain: response.dashboardUsers[dashboardUserId].isMain,
                        info: response.dashboardUsers[dashboardUserId].info,
                        userId: response.dashboardUsers[dashboardUserId].userId,
                        connectStatus: response.dashboardUsers[dashboardUserId].connectStatus,
                        status: response.dashboardUsers[dashboardUserId].status,
                    };
                    dashboardUsers.push(dashboardUserMap);
                }
            }
            yield put({
                type: REINIT + SAVE,
                payload: {
                    apps: arrToMap(apps, initAppRecord),
                    topics: arrToMap(topics, initTopicRecord),
                    dashboardUsers: arrToMap(dashboardUsers, initDashboardUserRecord)
                }
            });
        }
    }
};


export const addStreamSaga = function* () {
    while (true) {
        const { payload: { stream, type }} = yield take(ADD_STREAM);
        const streams = yield select(streamsSelector);
        const currentRoom = yield select(currentRoomSelector);
        streams[type] = {
            mediaStream: stream,
            isVideoEnabled: currentRoom.get('rtcType') === 0
        };
        yield put({
            type: UPDATE_STREAMS,
            payload: {
                streams: { ...streams }
            }
        });
    }
};

export const removeStreamSaga = function* () {
    while (true) {
        yield take(REMOVE_STREAM);
        const streams = yield select(streamsSelector);
        streams[STREAM_TYPES.local] = null;
        yield put({
            type: UPDATE_STREAMS,
            payload: {
                streams: { ...streams }
            }
        });
    }
};

export const toggleCameraSaga = function* () {
    while (true) {
        const { payload: { streamId }} = yield take(TOGGLE_CAMERA);
        const streams = yield select(streamsSelector);
        if (streams[STREAM_TYPES.local].mediaStream && streams[STREAM_TYPES.local].mediaStream.id === streamId) {
            streams[STREAM_TYPES.local].isVideoEnabled = !(streams[STREAM_TYPES.local].isVideoEnabled);
            if (streams[STREAM_TYPES.local].mediaStream.getVideoTracks()[0]) {
                streams[STREAM_TYPES.local].mediaStream.getVideoTracks()[0].enabled = !(streams[STREAM_TYPES.local].mediaStream.getVideoTracks()[0].enabled);
            }
        } else if (streams[STREAM_TYPES.remote].mediaStream && streams[STREAM_TYPES.remote].mediaStream.id === streamId) {
            streams[STREAM_TYPES.remote].isVideoEnabled = !(streams[STREAM_TYPES.remote].isVideoEnabled);
        }
        yield put({
            type: UPDATE_STREAMS,
            payload: {
                streams: { ...streams }
            }
        });
    }
};

export const muteStreamSaga = function* () {
    while (true) {
        yield take(MUTE_STREAM);
        const streams = yield select(streamsSelector);
        streams[STREAM_TYPES.local].mediaStream.getAudioTracks()[0].enabled = !(streams[STREAM_TYPES.local].mediaStream.getAudioTracks()[0].enabled);
        yield put({
            type: UPDATE_STREAMS,
            payload: {
                streams: { ...streams }
            }
        });
    }
};


export const updateDashboardUserSaga = function* () {
    while (true) {
        const { payload: { userId, connectStatus }} = yield take(UPDATE_DASHBOARD_USER);
        const dashboardUsers = yield select(dashboardUsersSelector);
        const newDashUsers: any = [];
        dashboardUsers.forEach((user: any) => {
            newDashUsers.push({
                connectStatus: user.get('userId') === userId ? connectStatus : user.get('connectStatus'),
                id: user.get('id'),
                info: user.get('info'),
                status: user.get('status'),
                isMain: user.get('isMain'),
                userId: user.get('userId')
            });
        });
        yield put({
            type: UPDATE_DASHBOARD_USERS,
            payload: arrToMap(newDashUsers, initDashboardUserRecord)
        });
    }
};

export const setStatusSaga = function* () {
    while (true) {
        const { payload } = yield take(SET_STATUS);
        yield put({
            type: UPDATE_STATUS,
            payload: {
                status: payload.status
            }
        });
    }
};

/*
  Export all
*/

export const saga = function* () {
    yield all([
        initAppSaga(),
        reInitAppSaga(),
        setStatusSaga(),
        signalConnectionInitSaga(),
        addStreamSaga(),
        removeStreamSaga(),
        toggleCameraSaga(),
        muteStreamSaga()
    ]);
};


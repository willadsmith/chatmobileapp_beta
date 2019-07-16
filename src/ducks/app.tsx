/*
import React from 'react';
import deepMerge from 'deepmerge';
import { reset } from 'redux-form';
import {OrderedMap, Record} from 'immutable';
import { all, select, take, put } from 'redux-saga/effects';
import { createSelector } from 'reselect';
import { tokenSelector, LOGOUT, authSelector } from './auth';
import { APP_NAME } from '../configs/';
import { fetchDataFromServer } from '../middlewares/utils';
import { FAIL, START, SUCCESS, SAVE } from '../configs/types';
import { LOCATION_CHANGE, push } from 'react-router-redux';
import { arrToMap, mapToObj } from '../utils/common';
import { dispatch } from '../store';
import { addError } from './alerts';
import LocalizedText from '../components/local/LocalizedText';

/*
 CONSTANTS
*/

/*
export const moduleName = 'app';
const prefix = `${APP_NAME}/${moduleName}`;

export const NULL_INIT_STATUS = `${prefix}/NULL_INIT_STATUS`;
export const INIT = `${prefix}/INIT`;
export const REINIT = `${prefix}/REINIT`;
export const NONE = `${prefix}/NONE`;
export const LOADING = `${prefix}/LOADING`;
export const LOADED = `${prefix}/LOADED`;
export const FAILED = `${prefix}/FAILED`;
export const GET_APPS_LIST_REQUEST = `${prefix}/GET_APPS_LIST_REQUEST`;
export const SWITCH_STATUS_REQUEST = `${prefix}/SWITCH_STATUS_REQUEST`;
export const CLEAR_APP_STATE = `${prefix}/CLEAR_APP_STATE`;
export const DELETE_APP_REQUEST = `${prefix}/DELETE_APP_REQUEST`;
export const CLEAR_APPS_STATE = `${prefix}/CLEAR_APPS_STATE`;
export const LOGOUT_APPS_STATE = `${prefix}/LOGOUT_APPS_STATE`;
export const GET_DEMO_DATA = `${prefix}/GET_DEMO_DATA`;
export const UPDATE_DASHBOARD_USERS = `${prefix}/UPDATE_DASHBOARD_USERS`;
export const UPDATE_DASHBOARD_USER = `${prefix}/UPDATE_DASHBOARD_USER`;
export const SET_SESSION_STATUS = `${prefix}/SET_SESSION_STATUS`;
export const SEND_EMAIL_INSTRUCTIONS_REQUEST = `${prefix}/SEND_EMAIL_INSTRUCTIONS_REQUEST`;
export const GET_APP_DATA = `${prefix}/GET_APP_DATA`;
export const CREATE_APP_REQUEST = `${prefix}/CREATE_APP_REQUEST`;
export const UPDATE_APP_REQUEST = `${prefix}/UPDATE_APP_REQUEST`;
export const GET_AGENTS_LIST = `${prefix}/GET_AGENTS_LIST`;
export const IN_APP_AGENT_CREATE = `${prefix}/IN_APP_AGENT_CREATE`;
export const SET_SHOULD_APP_REINIT = `${prefix}/SET_SHOULD_APP_REINIT`;
export const SET_LOADING = `${prefix}/SET_LOADING`;
export const REQUEST_HELP_REQUEST = `${prefix}/REQUEST_HELP_REQUEST`;

/*
 Reducer
*/

/*
const initAppRecord = Record({
    id: null,
    appHash: null,
    website: null,
    fields: null,
    topics: null,
    status: null
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
    dashboardUsers: new OrderedMap({}),
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

export default function reducer (state = new ReducerRecord(), action: any) {
    const { type, payload } = action;
    switch (type) {

        case INIT + START:
            return state
                .set('initStatus', LOADING);

        case INIT + SAVE:
            return state
                .set('initStatus', LOADED)
                .set('apps', payload.apps)
                .set('topics', payload.topics)
                .set('shouldAppReInit', false)
                .set('dashboardUsers', payload.dashboardUsers);

        case REINIT + SAVE:
            return state
                .set('initStatus', LOADED)
                .set('apps', payload.apps)
                .set('topics', payload.topics)
                .set('shouldAppReInit', false)
                .set('dashboardUsers', payload.dashboardUsers);

        case UPDATE_DASHBOARD_USERS:
            return state
                .set('dashboardUsers', payload);

        case REQUEST_HELP_REQUEST + START:
            return state
                .set('isLoading', { ...state.isLoading, requestHelp: true });

        case REQUEST_HELP_REQUEST + FAIL:
        case REQUEST_HELP_REQUEST + SUCCESS:
            return state
                .set('isLoading', { ...state.isLoading, requestHelp: false });

        case SEND_EMAIL_INSTRUCTIONS_REQUEST + START:
            return state
                .set('isLoading', { ...state.isLoading, sendEmail: true });

        case SEND_EMAIL_INSTRUCTIONS_REQUEST + FAIL:
        case SEND_EMAIL_INSTRUCTIONS_REQUEST + SUCCESS:
            return state
                .set('isLoading', { ...state.isLoading, sendEmail: false });

        case INIT + FAIL:
        case REINIT + FAIL:
            return state
                .set('initStatus', FAILED);

        case LOGOUT:
        case NULL_INIT_STATUS:
            return state
                .set('initStatus', NONE);

        case GET_APPS_LIST_REQUEST + START:
        case GET_DEMO_DATA + START:
        case GET_AGENTS_LIST + START:
        case GET_APP_DATA + START:
            return state
                .set('isLoading', { ...state.isLoading, common: true });
        case DELETE_APP_REQUEST + START:
        case IN_APP_AGENT_CREATE + START:
        case CREATE_APP_REQUEST + START:
        case UPDATE_APP_REQUEST + START:
            return state
                .set('isLoading', { ...state.isLoading, crud: true });

        case GET_APPS_LIST_REQUEST + FAIL:
        case GET_AGENTS_LIST + FAIL:
        case GET_APP_DATA + FAIL:
            return state
                .set('isLoading', { ...state.isLoading, common: false });
        case DELETE_APP_REQUEST + FAIL:
        case DELETE_APP_REQUEST + SUCCESS:
        case IN_APP_AGENT_CREATE + SUCCESS:
        case CREATE_APP_REQUEST + FAIL:
        case UPDATE_APP_REQUEST + FAIL:
            return state
                .set('isLoading', { ...state.isLoading, crud: false });


        case CLEAR_APP_STATE:
            return state
                .set('appObject', new AppObjectRecord())
                .set('agents', []);

        case GET_APPS_LIST_REQUEST + SUCCESS:
            return state
                .set('list', Object.assign({}, payload))
                .set('isLoading', { ...state.isLoading, common: false });

        case IN_APP_AGENT_CREATE + FAIL:
            return state
                .set('errors', payload.errors)
                .set('isLoading', { ...state.isLoading, crud: false });

        case GET_DEMO_DATA + SUCCESS:
        case GET_DEMO_DATA + FAIL:
            return state
                .set('demo', payload)
                .set('isLoading', { ...state.isLoading, common: false });

        case CLEAR_APPS_STATE:
            return new ReducerRecord({
                initStatus: state.initStatus,
                apps: state.apps,
                topics: state.topics,
                dashboardUsers: state.dashboardUsers,
                shouldAppReInit: state.shouldAppReInit
            });
        case SET_SESSION_STATUS:
            return state
                .set('sessionStatus', payload.status);
        case CREATE_APP_REQUEST + SUCCESS:
        case UPDATE_APP_REQUEST + SUCCESS:
        case GET_APP_DATA + SAVE:
            return state
                .set('isLoading', { ...state.isLoading, crud: false })
                .set('appObject', payload);
        case GET_AGENTS_LIST + SUCCESS:
            return state
                .set('agents', payload.models);
        case SET_LOADING:
            return state
                .set('isLoading', { ...payload.value });
        case SET_SHOULD_APP_REINIT:
            return state
                .set('shouldAppReInit', payload.value);
        case LOGOUT_APPS_STATE:
            return new ReducerRecord();
        default:
            return state;
    }

}

/*
Selectors
*/

/*
export const stateSelector = (state: any) => state[moduleName];
export const sessionStatusSelector = (state: any) => state[moduleName].sessionStatus;
export const shouldAppReInitSelector = (state: any) => state[moduleName].shouldAppReInit;

export const appInitStatusSelector = createSelector(
    stateSelector,
    (state) => {
        return state.initStatus;
    }
);
export const topicsSelector = createSelector(
    stateSelector,
    (state: any) => {
        return state.topics;
    }
);

export const currentRoomAppTopicsSelector = createSelector(
    topicsSelector,
    (_: any, app: any) => app,
    (topics: any, app: any) => {
        let appObj = null;
        if (app) {
            const topicsArr = [];
            for (const appTopicId of app.topics) {
                if (topics.get(appTopicId)) {
                    topicsArr.push(topics.get(appTopicId));
                }
            }
            appObj = {
                appHash: app.appHash,
                fields: app.fields,
                id: app.id,
                topics: topicsArr,
                website: app.website,
                status: app.status,
            };
        }
        return appObj;
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

export const appsListSelector = (state: any) => state[moduleName].list;
export const currentAppSelector = (state: any) => state[moduleName].appObject;
export const appAgentsSelector = (state: any) => state[moduleName].agents;
export const isLoadingSelector = (state: any) => state[moduleName].isLoading;
export const appsRecordSelector = (state: any) => state[moduleName];
export const errorsSelector = (state: any) => state[moduleName].errors;

/*
 * Action Creators
*/

/*
export function initApp () {
    return {
        type: INIT
    };
}

export function reInitApp () {
    return {
        type: REINIT
    };
}

export function requestHelp () {
    return {
        type: REQUEST_HELP_REQUEST
    };
}

export function setShouldAppReInit (value: boolean) {
    dispatch({
        type: SET_SHOULD_APP_REINIT,
        payload: {
            value
        }
    });
}

export function setLoading (value: any) {
    dispatch({
        type: SET_LOADING,
        payload: {
            value
        }
    });
}


/*
 Sagas
*/

/*
export const initAppSaga = function* () {
    while (true) {
        const { payload } = yield take(INIT);
        const token = yield select(tokenSelector);

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


export function updateDashboardUser (userId: number, connectStatus: boolean) {
    dispatch({
        type: UPDATE_DASHBOARD_USER,
        payload: {
            userId,
            connectStatus
        }
    });
}

/*
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
*/

// GET FULL LIST OS APPS

/*
export function getAppsList (page: number) {
    return {
        type: GET_APPS_LIST_REQUEST,
        payload: {
            page
        }
    };
}

export const getAppsListSaga = function* () {
    while (true) {
        const { payload } = yield take(GET_APPS_LIST_REQUEST);
        const { page } = payload;
        const { token } = yield select(authSelector);
        yield fetchDataFromServer({
            callApi: '/apps',
            type: GET_APPS_LIST_REQUEST,
            data: {
                page
            },
            headers: {
                Authorization: token
            }
        });
    }
};

// SWITCH APP STATUS

export function switchStatus (appId: number) {
    return {
        type: SWITCH_STATUS_REQUEST,
        payload: {
            appId
        }
    };
}

export const switchStatusSaga = function* () {
    while (true) {
        const { payload } = yield take(SWITCH_STATUS_REQUEST);
        const { appId } = payload;
        const { token } = yield select(authSelector);
        const response = yield fetchDataFromServer({
            callApi: '/apps/switch_status',
            type: SWITCH_STATUS_REQUEST,
            data: {
                appId
            },
            headers: {
                Authorization: token
            },
            alerts: {
                success: {
                    action: 'status successfully switched, appId - ' + appId,
                    message: 'App status changed'
                },
                error: {
                    action: 'status switch error, appId - ' + appId,
                    message: 'Something went wrong, try again'
                }
            }
        });
        const list = yield select(appsListSelector);
        if (response.status === true) {
            const appsArr = [];
            for (const app of list.models) {
                if (app.id === parseInt(appId, 10)) {
                    appsArr.push({
                        ...app,
                        status: app.status === 1 ? 0 : 1
                    });
                } else {
                    appsArr.push(app);
                }
            }
            yield put({
                type: GET_APPS_LIST_REQUEST + SUCCESS,
                payload: {
                    ...list,
                    models: appsArr
                }
            });
        }
    }
};

// CLEAR APP REDUCER STATE
export function clearAppState () {
    return {
        type: CLEAR_APP_STATE,
    };
}


export function deleteApp (appId: number, payload: any = {}) {
    return {
        type: DELETE_APP_REQUEST,
        payload: {
            appId,
            payload
        }
    };
}

export const deleteAppSaga = function* () {
    while (true) {
        const { payload } = yield take(DELETE_APP_REQUEST);
        const { appId } = payload;
        const { token } = yield select(authSelector);
        const apps = yield select(appsListSelector);
        const response = yield fetchDataFromServer({
            callApi: '/apps/delete',
            type: DELETE_APP_REQUEST,
            data: {
                appId
            },
            headers: {
                Authorization: token
            },
            alerts: {
                success: {
                    action: 'App successfully deleted, id - ' + appId,
                    message: 'App successfully deleted'
                },
                error: {
                    action: 'App delete error, id - ' + appId,
                    message: 'Something wen wrong, try again'
                }
            }
        });
        if (response && response.status === true) {
            for (const key in apps.models) {
                if (apps.models.hasOwnProperty(key) && apps.models[key].id === parseInt(appId, 10)) {
                    apps.models.splice(key, 1);
                }
            }

            if (payload.payload.toggleModal) {
                payload.payload.toggleModal(null);
            }
        }
    }
};


export function getDemoData (hash: string) {
    return {
        type: GET_DEMO_DATA,
        payload: {
            hash,
        }
    };
}
export const getDemoDataSaga = function* () {
    while (true) {
        const { payload } = yield take(GET_DEMO_DATA);
        const { hash } = payload;
        yield fetchDataFromServer({
            callApi: '/apps/info?hash=' + hash,
            type: GET_DEMO_DATA,
        });
    }
};

export const locationChangeSaga = function* () {
    while (true) {
        const { payload } = yield take(LOCATION_CHANGE);
        const apps = yield select(appsRecordSelector);
        if (!apps.equals(new ReducerRecord({
            initStatus: apps.initStatus,
            apps: apps.apps,
            topics: apps.topics,
            dashboardUsers: apps.dashboardUsers
        })) && !payload.pathname.includes('/apps')) {
            yield put({
                type: CLEAR_APPS_STATE,
            });
        }
    }
};

export function setSessionStatus (status: boolean) {
    dispatch({
        type: SET_SESSION_STATUS,
        payload: {
            status
        }
    });
}
export function sendEmailInstructions (appId: number, email: string) {
    return {
        type: SEND_EMAIL_INSTRUCTIONS_REQUEST,
        payload: {
            appId,
            email
        }
    };
}
export const sendEmailInstructionsSaga = function* () {
    while (true) {
        const { payload } = yield take(SEND_EMAIL_INSTRUCTIONS_REQUEST);
        const { appId, email } = payload;
        const { token } = yield select(authSelector);
        yield fetchDataFromServer({
            callApi: '/apps/send_instructions',
            type: SEND_EMAIL_INSTRUCTIONS_REQUEST,
            data: {
                appId,
                email
            },
            headers: {
                Authorization: token
            },
            alerts: {
                success: {
                    action: 'Email instructions successfully sent, appId - ' + appId,
                    message: 'Instructions were successfully sent'
                },
                error: {
                    action: 'Something went wrong, try again, appId - ' + appId,
                    message: 'Something went wrong, try again'
                }
            }
        });
    }
};

export function getAppData (appId: number) {
    return {
        type: GET_APP_DATA,
        payload: {
            appId,
        }
    };
}
export const getAppDataSaga = function* () {
    while (true) {
        const { payload: { appId }} = yield take(GET_APP_DATA);
        const { token } = yield select(authSelector);
        yield fetchDataFromServer({
            callApi: '/apps/update',
            type: GET_APP_DATA,
            data: {
                appId,
            },
            headers: {
                Authorization: token
            },
        });
    }
};

export const getAppDataSuccessSaga = function* () {
    while (true) {
        const { payload } = yield take(GET_APP_DATA + SUCCESS);
        const appObject = mapToObj(new AppObjectRecord());
        appObject.appTopics = [];
        appObject.app.configs.fields = [];
        const mergedAppObject = deepMerge.all([appObject, payload]);
        yield put({
            type: GET_APP_DATA + SAVE,
            payload: mergedAppObject
        });
    }
};

export function createApp (appObject: any, redirect: boolean) {
    return {
        type: CREATE_APP_REQUEST,
        payload: {
            appObject,
            redirect
        }
    };
}
export const createAppSaga = function* () {
    while (true) {
        const { payload: { appObject, redirect }} = yield take(CREATE_APP_REQUEST);
        const { token } = yield select(authSelector);
        const agentsArr: any = [];
        for (const appTopicsUser of appObject.appTopicsUsers) {
            agentsArr.push(appTopicsUser.dashboardUserId);
        }
        const response = yield fetchDataFromServer({
            callApi: '/apps/create',
            type: CREATE_APP_REQUEST,
            data: {
                appKey: appObject.app.appKey,
                website: appObject.app.website,
                properties: appObject.app.properties,
                configs: appObject.app.configs,
                topics: JSON.stringify([{ name: 'Sales department', type: 0, agents: agentsArr }])
            },
            headers: {
                Authorization: token
            },
        });
        if (response && response.status === true && redirect) {
            yield put(push('/apps'));
        }
        yield setShouldAppReInit(true);
    }
};

export function updateApp (appObject: any, redirect: boolean) {
    return {
        type: UPDATE_APP_REQUEST,
        payload: {
            appObject,
            redirect
        }
    };
}
export const updateAppSaga = function* () {
    while (true) {
        const { payload: { appObject, redirect }} = yield take(UPDATE_APP_REQUEST);
        const { token } = yield select(authSelector);
        const agentsArr: any = [];
        for (const appTopicsUser of appObject.appTopicsUsers) {
            agentsArr.push(appTopicsUser.dashboardUserId);
        }
        const response = yield fetchDataFromServer({
            callApi: '/apps/update',
            type: UPDATE_APP_REQUEST,
            data: {
                appId: appObject.app.id,
                website: appObject.app.website,
                properties: appObject.app.properties,
                configs: appObject.app.configs,
                topics: JSON.stringify([{ name: 'Sales department', type: 0, agents: agentsArr }])
            },
            headers: {
                Authorization: token
            },
            alerts: {
                success: {
                    action: 'App saved, appId - ' + appObject.app.id,
                    message: 'Updated'
                },
                error: null
            }
        });
        if (response && response.status === true && redirect) {
            yield put(push('/apps'));
        }
        yield setShouldAppReInit(true);
    }
};

export function getAgentsList () {
    return {
        type: GET_AGENTS_LIST,
    };
}
export const getAgentsListSaga = function* () {
    while (true) {
        yield take(GET_AGENTS_LIST);
        const { token } = yield select(authSelector);
        yield fetchDataFromServer({
            callApi: '/agents',
            type: GET_AGENTS_LIST,
            data: {
                userInclude: true
            },
            headers: {
                Authorization: token
            },
        });
    }
};

export function inAppCreateAgent (values: { email: string, info: any }, reject: any, resolve: any) {
    return {
        type: IN_APP_AGENT_CREATE,
        payload: {
            values,
            reject,
            resolve
        }
    };
}

export const inAppCreateAgentSaga = function* () {
    while (true) {
        const { payload } = yield take(IN_APP_AGENT_CREATE);
        const { values, reject, resolve } = payload;
        const auth = yield select(authSelector);
        const agents = yield select(appAgentsSelector);
        const { token } = auth;
        const response = yield fetchDataFromServer({
            callApi: '/agents/add',
            type: IN_APP_AGENT_CREATE,
            data: {
                email: values.email,
                info: values.info
            },
            headers: {
                Authorization: token
            },
            alerts: {
                success: {
                    action: 'Agent successfully created, email - ' + values.email,
                    message: 'Agent successfully created'
                },
                error: null
            }
        });
        if (response.status === false && response.errors) {
            reject();
        } else if (response.status === false && response.message) {
            addError('User limit exceeded for current plan', <LocalizedText path={'serverValidation.agents.' + response.message.toLowerCase()}/>);
            resolve();
        } else {
            yield setShouldAppReInit(true);
            agents.push({
                ...response.agent,
                status: 0
            });
            yield put({
                type: GET_AGENTS_LIST + SUCCESS,
                payload: {
                    models: [...agents]
                }
            });
            dispatch(reset('modalAgentCreate'));
            resolve();
        }
    }
};

export const requestHelpSaga = function* () {
    while (true) {
        yield take(REQUEST_HELP_REQUEST);
        const auth = yield select(authSelector);
        const { token, user: { email }} = auth;
        yield fetchDataFromServer({
            callApi: '/apps/requestHelp',
            type: REQUEST_HELP_REQUEST,
            headers: {
                Authorization: token
            },
            data: {
                email
            },
            alerts: {
                success: {
                    action: 'Request help',
                    message: 'Thanks for your request. We will get in touch with you soon.'
                },
                error: null
            }
        });
    }
};

export const saga = function* () {
    yield all([
        initAppSaga(),
        deleteAppSaga(),
        getAppsListSaga(),
        switchStatusSaga(),
        locationChangeSaga(),
        getDemoDataSaga(),
        sendEmailInstructionsSaga(),
        getAppDataSaga(),
        createAppSaga(),
        getAgentsListSaga(),
        inAppCreateAgentSaga(),
        updateAppSaga(),
        reInitAppSaga(),
        getAppDataSuccessSaga(),
        requestHelpSaga()
    ]);
};
*/

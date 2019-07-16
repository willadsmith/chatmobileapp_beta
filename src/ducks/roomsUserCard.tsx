import {
    moduleName, UPDATE_ROOM_USERS, UPDATE_ROOM_INFO,
    roomByIdSelector
} from './workspace/rooms';
import {
    currentRoomSelector
} from './workspace/roomCurrent';

import { Map } from 'immutable';
import { all, fork, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { tokenSelector } from './auth';
import { fetchDataFromServer } from '../middlewares/utils';
import { APP_NAME } from '../configs';
import { LOADED, SUCCESS } from '../configs/types';
import { IvcAdapter } from '../libs/IvcAdapter';
import { dispatch } from '../store';


const prefix = `${APP_NAME}/${moduleName}`;
export const GET_ROOM_INFO = `${prefix}/GET_ROOM_INFO`;
export const SAVE_USER_CARD = `${prefix}/SAVE_USER_CARD`;
export const UPDATE_USER_CARD = `${prefix}/UPDATE_USER_CARD`;



/*
 * Action Creators
*/
export function getRoomInfo (payload: any) {
    return {
        type: GET_ROOM_INFO,
        payload
    };
}

export function saveUserCard (payload: any) {
    return {
        type: SAVE_USER_CARD,
        payload
    };
}

export function updateUserCard (payload: any) {
    dispatch({
        type: UPDATE_USER_CARD,
        payload
    });
}


/*
 Sagas
*/
export const getRoomInfoSaga = function* (action: any) {
    const { payload } = action;
    const token = yield select(tokenSelector);
    yield fetchDataFromServer({
        callApi: '/workspace/room_components',
        type: GET_ROOM_INFO,
        headers: {
            Authorization: token
        },
        data: payload
    });
};

export const getRoomInfoSuccessSaga = function* (action: any) {
    const { payload } = action;
    if (payload.status === true) {
        const room = yield select(roomByIdSelector(payload.roomId));
        if (room) {
            let users = room.get('users');
            for (const card of payload.userCards) {
                users = users.setIn([card.userId, 'card'], Map({
                    status: LOADED,
                    info: card.info || {}
                }));
            }
            yield put({
                type: UPDATE_ROOM_USERS,
                payload: {
                    roomId: payload.roomId,
                    users
                }
            });
            yield put({
                type: UPDATE_ROOM_INFO,
                payload: {
                    roomId: payload.roomId
                }
            });

        }
    }
};

export const saveUserCardSaga = function* (action: any) {
    const { payload } = action;
    const room = yield select(currentRoomSelector);
    const info = room.getIn(['users', payload.userId, 'card', 'info']);
    info[payload.attributeName] = payload.value;
    const users = room.get('users')
        .setIn([payload.userId, 'card', 'info'], info);
    yield put({
        type: UPDATE_ROOM_USERS,
        payload: {
            roomId: room.get('id'),
            users
        }
    });
    const token = yield select(tokenSelector);

    const response = yield fetchDataFromServer({
        callApi: '/workspace/room_components/save_user_card',
        type: SAVE_USER_CARD,
        headers: {
            Authorization: token
        },
        data: {
            roomId: room.get('id'),
            userId: payload.userId,
            info: {
                name: payload.attributeName,
                value: payload.value
            }
        }
    });
    if (response && response.status === true) {
    //     IvcAdapter.sendRoomBroadcast(room.get('hash'), {
    //        eventName: ROOM_SIGNAL_EVENT_NAMES.updateUserCard, user: {
    //            userId: payload.userId,
    //            attributeName: payload.attributeName,
    //            value: payload.value
    //        },
    //        roomId: room.get('id')
    //    });
    }
    if (payload.attributeName === 'Name') {
        const userInfo = room.getIn(['users', payload.userId, 'info']) || {};
        userInfo.name = payload.value;
        yield put({
            type: UPDATE_ROOM_USERS,
            payload: {
                roomId: room.get('id'),
                users: room.get('users').setIn([payload.userId, 'info'], userInfo)
            }
        });
    }
};

export const updateUserCardSaga = function* (action: any) {
    const { payload } = action;
    const room = yield select(roomByIdSelector(payload.roomId));
    const info = room.getIn(['users', payload.userId, 'card', 'info']);
    if (info) {
        info[payload.attributeName] = payload.value;
        let users = room.get('users');
        users = users.setIn([payload.userId, 'card', 'info'], { ...info });
        yield put({
            type: UPDATE_ROOM_USERS,
            payload: {
                roomId: room.get('id'),
                users,
            }
        });
    }

};

export const saveUserCardSuccessSaga = function* (action: any) {
    const { payload } = action;
    if (payload.roomName) {
        const room = yield select(currentRoomSelector);
        yield IvcAdapter.setRoomName(room.get('hash'), payload.roomName);
    }
};

function* roomsUserCardWatcher () {
    yield takeLatest(GET_ROOM_INFO, getRoomInfoSaga);
    yield takeLatest(GET_ROOM_INFO + SUCCESS, getRoomInfoSuccessSaga);
    yield takeEvery(SAVE_USER_CARD, saveUserCardSaga);
    yield takeEvery(UPDATE_USER_CARD, updateUserCardSaga);
    yield takeEvery(SAVE_USER_CARD + SUCCESS, saveUserCardSuccessSaga);
}

export const saga = function* () {
    yield all([
        fork(roomsUserCardWatcher)
    ]);
};

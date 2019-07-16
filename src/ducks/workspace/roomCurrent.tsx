import { Map, OrderedMap } from 'immutable';
import { all, put, select, takeEvery, takeLatest, fork, take } from 'redux-saga/effects';
import { createSelector } from 'reselect';
import { fetchDataFromServer } from '../../middlewares/utils';
import { mapToArr, arrToMap } from '../../utils/common';
import {
    moduleName, UPDATE_ROOMS,
    MessageRecord, UserRecord,
    stateSelector, roomsSelector,
    addMessage, MESSAGE_TYPES
} from './rooms';
import { APP_NAME } from '../../configs';
import { SUCCESS, LOADED } from '../../configs/types';
import { IvcAdapter } from '../../libs/IvcAdapter';
import { GET_ROOM_INFO } from '../roomsUserCard';
import { dispatch } from '../../store';
import { authSelector, tokenSelector } from '../auth';
import {clearStreams, RTC_STATUSES, rtcStatusSelector, STREAM_TYPES, streamsSelector} from './workspace';

const prefix = `${APP_NAME}$/${moduleName}$`;
export const LOAD_ROOM = `${prefix}/LOAD_ROOM`;
export const SEND_MESSAGE = `${prefix}/SEND_MESSAGE`;
export const JOIN_ROOM = `${prefix}/JOIN_ROOM`;
export const SEND_TYPING_SIGNAL = `${prefix}/SEND_TYPING_SIGNAL`;
export const UPDATE_LAST_SEEN_MESSAGE = `${prefix}/UPDATE_LAST_SEEN_MESSAGE`;
export const INIT_RTC_CONNECTION = `${prefix}/INIT_RTC_CONNECTION`;
export const CLOSE_RTC_CONNECTION = `${prefix}/CLOSE_RTC_CONNECTION`;
export const FAILED_MESSAGES = `${prefix}/FAILED_MESSAGES`;

export const ROOM_SIGNAL_EVENT_NAMES = {
    updateUserCard: 'updateUserCard',
    toggleCamera: 'toggleCamera'
};

/*
  Selectors
*/

export const currentRoomIdSelector = createSelector(
    stateSelector,
    (state) => {
        return state.get('currentRoomId');
    }
);

export const currentRoomSelector = createSelector(
    roomsSelector,
    currentRoomIdSelector,
    (rooms, currentRoomId) => {
        console.log('ttt currentRoomSelector currentRoomId', currentRoomId);
        if (!currentRoomId) {
            return null;
        }
        const roomsArr = mapToArr(rooms);
        const room = roomsArr.find((item: any) => {
            return item.get('id') === currentRoomId;
        });
        console.log('ttt currentRoomSelector : room', room);
        return room ? room : null;
    }
);

export const currentRoomMessagesSelector = createSelector(
    currentRoomSelector,
    (room: any) => {
        console.log('ttt currentRoomMessagesSelector', room.get('messages'));
        return mapToArr(room.get('messages'));
    }
);

export const currentRoomAppIdSelector = createSelector(
    currentRoomSelector,
    (room: any) => {
        return room.get('appId');
    }
);

export const currentRoomInfoSelector = createSelector(
    currentRoomSelector,
    (room: any) => {
        console.log('ttt currentRoomInfoSelector', room);
        return room.get('roomInfo');
    }
);

export const currentRoomUsersMapSelector = createSelector(
    currentRoomSelector,
    (room: any) => {
        if (!room) {
            // @ts-ignore
            return new OrderedMap({});
        }
        return room.get('users');
    }
);

export const currentRoomUsersSelector = createSelector(
    currentRoomSelector,
    (room: any) => {
        if (!room) {
            return [];
        }
        return mapToArr(room.get('users'));
    }
);

export const currentRoomLastSeenMessageSelector = createSelector(
    currentRoomSelector,
    (room: any) => {
        console.log('ttt currentRoomLastSeenMessageSelector',room.get('lastSeenMessageId'));
        return room.get('lastSeenMessageId');
    }
);

export const currentRoomTypingUsersSelector = createSelector(
    currentRoomUsersSelector,
    (users: any[]) => {
        if (!users) {
            return false;
        }
        console.log('ttt typing users selector', users);
        return users.filter((user: any) => {
            return user.get('typing').status === true;
        });
    }
);

export const currentRoomAssignedSelector = createSelector(
    currentRoomUsersSelector,
    (state) => state.auth.user,
    (users: any[], currentUser) => {
        const filteredUser = users.find((user: any) => {
            return user.get('id') === currentUser.get('id');
        });
        if (!filteredUser) {
            return false; // ---------------------------- Assigned to you
        }
        return true;
    }
);

/*
    Action Creators
*/

export function loadRoom (payload: { id: number; }) {
    console.log('ttt load room', payload.id);
    return {
        type: LOAD_ROOM,
        payload: {
            roomId: payload.id
        }
    };
}

export function joinSelectRoom (roomHash: string) {
    return {
        type: JOIN_ROOM,
        payload: {
            roomHash
        }
    };
}

export function sendMessage (payload: { message: { hash: string, text: string }, type: number }) {
    console.log('QQQ', sendMessage);
    return {
        type: SEND_MESSAGE,
        payload
    };
}

export function dispatchSendMessage (payload: { message: { hash: string, text: string }, type: number }) {
    dispatch({
        type: SEND_MESSAGE,
        payload
    });
}

export function failedMessages () {
    dispatch({
        type: FAILED_MESSAGES,
    });
}

export function sendTypingSignal (payload: { roomHash: string }) {
    return {
        type: SEND_TYPING_SIGNAL,
        payload
    };
}

export function updateLastSeenMessage (payload: any) {
    return {
        type: UPDATE_LAST_SEEN_MESSAGE,
        payload
    };
}

export function closeRtcConnection (payload: any) {
    return {
        type: CLOSE_RTC_CONNECTION,
        payload
    };
}

export function initRtcConnection (payload: any) {
    return {
        type: INIT_RTC_CONNECTION,
        payload
    };
}

/*
  Sagas
*/

export const loadRoomSaga = function* (action: any) {
    const { payload } = action;
    console.log('ttt loadRoomSaga', payload);
    const token = yield select(tokenSelector);
    const response = yield fetchDataFromServer({
        callApi: '/workspace/room_info',
        type: LOAD_ROOM,
        headers: {
            Authorization: token
        },
        data: payload
    });
    console.log('ttt loadRoomSaga response = ', response);
    if (response.status === true) {
        yield fetchDataFromServer({
            callApi: '/workspace/room_components',
            type: GET_ROOM_INFO,
            headers: {
                Authorization: token
            },
            data: payload
        });
    }
};

export const loadRoomSuccessSaga = function* (action: any) {
    const { payload } = action;
    let rooms = yield select(roomsSelector);
    const usersArr = [];
    for (const user of payload.roomUsers) {
        usersArr.push({
            id: user.id,
            status: user.status,
            rtcStatus: user.rtcStatus,
            info: user.info,
        });
    }
    const users = arrToMap(usersArr, UserRecord);

    let messages: any[] = [];
    console.log('ttt Success Saga', messages);
    payload.messages = payload.messages.sort((a: any, b: any) => {
        return a.id - b.id;
    });
    for (const message of payload.messages) {
        const messageMap = Map({
            id: message.id,
            hash: null,
            userId: message.userId,
            userInfo: message.user.info,
            content: message.message.content,
            type: message.message.type,
            createdAt: new Date(message.createdAt)
        });
        messages.push(messageMap);
    }
    messages = arrToMap(messages, MessageRecord);
    rooms = rooms.withMutations((map: any) => {
        return map
            .setIn([payload.roomId, 'users'], users)
            .setIn([payload.roomId, 'messages'], messages)
            .setIn([payload.roomId, 'loadingStatus'], LOADED);
    });

    yield put({
        type: UPDATE_ROOMS,
        payload: {
            rooms
        }
    });

};

export const joinRoomSaga = function* () {
    while (true) {
        yield take(JOIN_ROOM);
        const currentRoom = yield select(currentRoomSelector);
        if (currentRoom !== null) {
            IvcAdapter.props.ivcClient.joinRoom({
                roomHash: currentRoom.get('hash')
            });
        }
    }
};

export const sendMessageSaga = function* () {
    while (true) {
        const { payload } = yield take(SEND_MESSAGE);
        console.log('QQQ sendMessageSaga');
        const auth = yield select(authSelector);
        const currentRoom = yield select(currentRoomSelector);
        if (currentRoom !== null) {
            if (payload.modificator !== 'finalMessage') {
                const preMessage = {
                    id: payload.message.hash,
                    userId: auth.get('user').get('id'),
                    content: payload.message,
                    type: MESSAGE_TYPES.sending,
                    createdAt: new Date(),
                    userInfo: { ...auth.get('user').get('info') }
                };
                if (preMessage.userInfo.avatar) {
                    preMessage.userInfo.avatar = `${auth.user.id}/thumb/${preMessage.userInfo.avatar}`;
                }
                yield addMessage(preMessage, currentRoom.get('id'));
            }

            if (payload.modificator !== 'preMessage') {
                const messageContent = Object.assign({}, payload.message);
                delete messageContent.type;
                const message = {
                    content: messageContent,
                    type: payload.type
                };
                IvcAdapter.props.ivcClient.sendMessage({
                    roomHash: currentRoom.get('hash'),
                    message
                });
            }
        }
    }
};

export const sendTypingSignalSaga = function* () {
    while (true) {
        const { payload } = yield take(SEND_TYPING_SIGNAL);
        IvcAdapter.sendTypingSignal(payload.roomHash);
    }
};


export const closeRtcConnectionSaga = function* () {
    while (true) {
        const { payload } = yield take(CLOSE_RTC_CONNECTION);
        const streams = yield select(streamsSelector);
        if (streams[STREAM_TYPES.local]) {

            yield streams[STREAM_TYPES.local].mediaStream.getTracks().forEach((track: any) => {
                track.enabled = false;
                track.stop();
            });
        }
        if (streams[STREAM_TYPES.remote]) {

            yield streams[STREAM_TYPES.remote].mediaStream.getTracks().forEach((track: any) => {
                track.enabled = false;
                track.stop();
            });
        }
        IvcAdapter.closeRtcConnection(payload.roomHash);
        clearStreams();
    }
};

export const initRtcConnectionSaga = function* () {
    while (true) {
        const { payload } = yield take(INIT_RTC_CONNECTION);
        const userRtcStatus = yield select(rtcStatusSelector);
        // const mediaDevices = yield select(mediaDevicesSelector);
        if (userRtcStatus === RTC_STATUSES.none) {
            yield IvcAdapter.getUserMedia(true, payload.rtcType === 0, payload.roomHash);
        }
    }
};

export const updateLastSeenMessageSaga = function* (action: any) {
    const { payload } = action;
    IvcAdapter.updateLastSeenMessage(
        payload.roomHash, payload.messageId
    );

    let rooms = yield select(roomsSelector);
    rooms = rooms.withMutations((map: any) => {
        return map
            .setIn([payload.roomId, 'lastSeenMessageId'], payload.messageId);
    });
    yield put({
        type: UPDATE_ROOMS,
        payload: {
            rooms
        }
    });
};

export const failedMessagesSaga = function* () {

    const currentRoom = yield select(currentRoomSelector);

    if (!currentRoom) {
        return;
    }

    const messagesArr = currentRoom.get('messages') ? mapToArr(currentRoom.get('messages')) : [];
    const newMessagesArr = currentRoom.get('newMessages') ? mapToArr(currentRoom.get('newMessages')) : [];

    messagesArr.forEach((message: any) => {
        if ((message.get('type') === MESSAGE_TYPES.sending)) {
            const index = messagesArr.indexOf(message);
            messagesArr[index]=message.set('type', MESSAGE_TYPES.error);
        }
    });

    const messages = arrToMap(messagesArr, currentRoom.get('messageRecord'));
    newMessagesArr.forEach((newMessage: any) => {
        if ((newMessage.get('type') === MESSAGE_TYPES.sending)) {
            const index = messagesArr.indexOf(newMessage);
            messagesArr[index]=newMessage.set('type', MESSAGE_TYPES.error);
        }
    });
    const newMessages = arrToMap(newMessagesArr, currentRoom.get('messageRecord'));

    let rooms = yield select(roomsSelector);
    rooms = rooms.withMutations((map: any) => {
        return map
            .setIn([currentRoom.get('id'), 'messages'], [...messages, ...newMessages]);
    });


    yield put({
        type: UPDATE_ROOMS,
        payload: {
            rooms
        }
    });
};

function* roomsCurrentRoomWatcher () {
    yield takeLatest(LOAD_ROOM, loadRoomSaga);
    yield takeLatest(LOAD_ROOM + SUCCESS, loadRoomSuccessSaga);
    yield takeLatest(FAILED_MESSAGES, failedMessagesSaga);
    yield takeEvery(UPDATE_LAST_SEEN_MESSAGE, updateLastSeenMessageSaga);
}

export const saga = function* () {
    yield all([
        fork(roomsCurrentRoomWatcher),
        joinRoomSaga(),
        sendMessageSaga(),
        sendTypingSignalSaga(),
        closeRtcConnectionSaga(),
        initRtcConnectionSaga()
    ]);
};

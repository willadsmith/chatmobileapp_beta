import { Map, OrderedMap, Record } from 'immutable';
import { START, LOADING, LOADED, SUCCESS } from '../../configs/types';
import { APP_NAME } from '../../configs';
import { createSelector } from 'reselect';
import { mapToArr, arrToMap, checkUserRoom, delay } from '../../utils/common';
import { ivcUserSelector, tokenSelector } from '../auth';
import { fetchDataFromServer } from '../../middlewares/utils';
import { all, put, select, takeEvery, takeLatest, fork, take, call } from 'redux-saga/effects';
import { appTopicsSelector, RTC_STATUSES, topicsSelector, rtcStatusSelector, CONNECTED } from './workspace';
import { dispatch } from '../../store';
import NotificationAdapter from '../../libs/NotificationAdapter';
import { IvcAdapter } from '../../libs/IvcAdapter';
import { getFormValues } from 'redux-form';
import { push } from 'react-router-redux';
import { joinSelectRoom } from './roomCurrent';
import { ROOM_TYPES } from '../../components/workspace/RoomList/roomElements/ListFilters';

export const moduleName = 'workspace_rooms';
const prefix = `${APP_NAME}/${moduleName}`;

export const LOAD_ROOMS = `${prefix}/LOAD_ROOMS`;
export const LOAD_ROOM = `${prefix}/LOAD_ROOM`;
export const JOIN_ROOM = `${prefix}/JOIN_ROOM`;
export const UPDATE_ROOMS = `${prefix}/UPDATE_ROOMS`;
export const SELECT_ROOM = `${prefix}/SELECT_ROOM`;
export const SET_CURRENT_ROOM = `${prefix}/UPDATE_CURRENT_ROOM`;
export const UPDATE_ROOM_USERS = `${prefix}/UPDATE_ROOM_USERS`;
export const ROOM_SIGNAL = `${prefix}/ROOM_SIGNAL`;
export const ROOM_MESSAGE = `${prefix}/ROOM_MESSAGE`;
export const ROOM_MESSAGE_TYPING = `${prefix}/ROOM_MESSAGE_TYPING`;
export const UPDATE_ROOM_INFO = `${prefix}/UPDATE_ROOM_INFO`;
export const ROOM_COUNT = `${prefix}/ROOM_COUNT`;
export const REMOVE_ROOM = `${prefix}/REMOVE_ROOM`;
export const UPDATE_ROOM_COUNT = `${prefix}/UPDATE_ROOM_COUNT`;
export const CLEAR_ROOMS_STATE = `${prefix}/CLEAR_ROOMS_STATE`;
export const MANAGE_CALL_NOTIFICATION = `${prefix}/MANAGE_CALL_NOTIFICATION`;
export const NOTIFICATION_CLICK = `${prefix}/NOTIFICATION_CLICK`;

export const ROOM_STATES = {
    shown: 0,
    reassigned: 1
};

export const ROOM_STATUSES = {
    open: 0,
    active: 1,
    closed: 2
};

export const MESSAGE_TYPES = {
    sending: 1,
    text: 2,
    fileUploading: 4,
    fileLink: 5,
    sticker: 6,
    error: 7,
    bot_message: 10,
    system: 11
};

export const SYSTEM_MESSAGE_EVENTS = {
    redirectRoomToTopic: 1,
    redirectRoomToUser: 2,
    switchRoomTopic: 3,
    addAgentToRoom: 4,
    leaveRoom: 5,
    closeRoom: 6,
    joinConversation: 7,
    startVideoCall: 8,
    startAudioCall: 9,
    missedAudioCall: 10,
    endVideoCall: 11,
    missedVideoCall: 12
};

/*
 Reducer
*/

export const MessageRecord = Record({
    id: null,
    hash: null,
    userId: null,
    content: null,
    type: null,
    createdAt: null,
    userInfo: null
});

export const UserRecord = Record({
    id: null,
    status: null,
    rtcStatus: null,
    card: null,
    typing: {
        status: false,
        timestamp: null
    },
    info: {
        name:null,
        surname: null,
    }
});

export const RoomRecord = Record({
    id: null,
    hash: null,
    appId: null,
    rooms: null,
    name: null,
    status: null,
    state: ROOM_STATES.shown,
    // @ts-ignore
    topic: new Map({
        id: null,
        name: null
    }),
    rtcStatus: 0,
    rtcType: null,
    timestamp: null,
    lastMessage: null,
    lastSeenMessageId: null,
    loadingStatus: null,
    // @ts-ignore
    messages: new OrderedMap({}),
    // @ts-ignore
    users: new OrderedMap({}),
    // @ts-ignore
    onlineStatus: false,
    roomInfo: null
});

// @ts-ignore
export const WorkspaceRoomsListRecord = Record({
    status: LOADING,
    // @ts-ignore
    rooms: new OrderedMap({}),
    // @ts-ignore
    roomsCounter: new OrderedMap({
        assigned: 0,
        notAssigned: 1
    }),
    currentRoomId: null,
    rtcStatus: false
});

export default function reducer (state = new WorkspaceRoomsListRecord(), action: any) {
    const { type, payload } = action;
    switch (type) {
        case LOAD_ROOMS + START:
            return state
                .set('status', LOADING);
        case UPDATE_ROOMS:
            return state
                .set('rooms', payload.rooms)
                .set('status', LOADED);
        case SET_CURRENT_ROOM:
            return state
                .set('currentRoomId', payload.currentRoomId);
        case LOAD_ROOM + START:
            return state.setIn(['rooms', state.get('currentRoomId'), 'loadingStatus'], LOADING);
        case UPDATE_ROOM_USERS:
            return state.setIn(['rooms', payload.roomId, 'users'], payload.users);
        case UPDATE_ROOM_INFO:
            // @ts-ignore
            return state.setIn(['rooms', payload.roomId, 'roomInfo'], new Map({
                status: LOADED
            }));
        case UPDATE_ROOM_COUNT:
            return state
                .set('roomsCounter', payload.roomsCounter);
        case CLEAR_ROOMS_STATE:
            return new WorkspaceRoomsListRecord();
        default:
            return state;
    }
}

/*
Selectors
*/

export const stateSelector = (state: any) => state[moduleName];

export const roomsSelector = createSelector(
    stateSelector,
    (state) => {
        return state.rooms;
    }
);

export const roomsLastMessagesSelector = createSelector(roomsSelector, (rooms: any) => {
    const roomsArr = mapToArr(rooms);
    return roomsArr.map((room: any) => {
        return {
            roomId: room.get('id'),
            lastMessage: room.get('lastMessage')
        };
    });
});

export const roomsListSelector = createSelector(
    roomsSelector,
    (rooms) => {
        const a = rooms.filter((room: any) => {
            if (room.status !== 2) {
                return room;
            }
        });
        return mapToArr(a);
    });

export const myRoomsListSelector = createSelector(
    roomsSelector,
    (rooms) => {
        const a = rooms.filter((room: any) => {
            if (room.status === 1) {
                return room;
            }
        });
        return mapToArr(a);
    });

export const newRoomsListSelector = createSelector(
    roomsSelector,
    (rooms) => {
        const a = rooms.filter((room: any) => {
            if(room.status === 0) {
                return room;
            }
        });
        return mapToArr(a);
    });

export const roomsStatusSelector = createSelector(
    stateSelector,
    (state) => {
        return state.status;
    }
);

export const roomByIdSelector = (id: number) => createSelector(roomsListSelector, (rooms) => {
    const room =  rooms.find((item: any) => {
        return item.get('id') === id;
    });
    return room ? room : null;
});

export const roomMessageByIdSelector = (id: number) => createSelector(roomsListSelector, (rooms) => {
    const room =  rooms.find((item: any) => {
        return item.get('id') === id;
    });
    return room ? mapToArr(room.get('messages')) : null;
});

export const roomsCounterSelector = createSelector(
    stateSelector,
    (state) => {
        return state.get('roomsCounter');
    }
);

/*
  Action Creators
*/

export function loadRooms (type: string) {
    return {
        type: LOAD_ROOMS,
        payload: {
            type
        }
    };
}

export function selectRoom (id:number) {
    return {
        type: SELECT_ROOM,
        payload: {
            id
        }
    };
}

export function joinRoom (roomHash: string) {
    return {
        type: JOIN_ROOM,
        payload: {
            roomHash
        }
    };
}

export function manageCallNotification (room: any|null = null) {
    dispatch({
        type: MANAGE_CALL_NOTIFICATION,
        payload: {
            room
        }
    });
}

export function roomMessageTyping (payload: any) {
    dispatch({
        type: ROOM_MESSAGE_TYPING,
        payload
    });

}

export function roomMessage (payload: any) {
    dispatch({
        type: ROOM_MESSAGE,
        payload
    });
}

export function roomSignal (payload: any) {
    dispatch({
        type: ROOM_SIGNAL,
        payload
    });
}

export function removeRoom (roomHash: string) {
    dispatch({
        type: REMOVE_ROOM,
        payload: {
            roomHash
        }
    });
}

export function notificationClick (room: any|null = null) {
    dispatch({
        type: NOTIFICATION_CLICK,
        payload: {
            room
        }
    });
}

/*
 Sagas
*/

export const countRooms = function* () {
    const token = yield select(tokenSelector);
    yield fetchDataFromServer({
        callApi: '/workspace/rooms_count',
        type: ROOM_COUNT,
        headers: {
            Authorization: token,
            sessionKey: {},
        },
        data: {}
    });
};

export const joinRoomSaga = function* () {
    while (true) {
        const { payload: { roomHash }} = yield take(JOIN_ROOM);
        if (roomHash) {
            IvcAdapter.joinRoom(roomHash);
        }
    }
};

export const selectRoomSaga = function* () {
    while (true) {
        const { payload } = yield take(SELECT_ROOM);
        yield put({
            type: SET_CURRENT_ROOM,
            payload: {
                currentRoomId: payload.id
            }
        });
    }
};

export const loadRoomsSaga = function* (action: any) {
    const { payload } = action;
    const token = yield select(tokenSelector);
    const response = yield fetchDataFromServer({
        callApi: '/workspace/room_list',
        type: LOAD_ROOMS,
        headers: {
            Authorization: token
        },
        data: payload
    });
    if (response.status === true) {
        const topics = yield select(appTopicsSelector);
        let rooms = [];
        payload.userRooms = response.userRooms.sort((a: any, b: any) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        for (const room of response.userRooms) {
            if (room.lastMessage) {
                room.lastMessage.id = Number(room.lastMessage.id);
            }
            const roomMap = {
                id: room.id,
                hash: room.hash,
                appId: room.appId,
                name: room.name,
                status: room.status,
                // @ts-ignore
                topic: new Map({
                    id: room.topicId,
                    name: topics[room.topicId]
                }),
                rtcStatus: room.rtcStatus,
                timestamp: room.timestamp,
                lastMessage: room.lastMessage,
                lastSeenMessageId: room.lastSeenMessageId ? room.lastSeenMessageId : 0,
                onlineStatus: room.onlineStatus
            };
            rooms.push(roomMap);
        }

        // @ts-ignore                                 ------------------------ THIS NEEDED ADD PARAM, FOR STATIC LOAD ROOM
        rooms = arrToMap(rooms, RoomRecord);
        yield put({
            type: UPDATE_ROOMS,
            payload: {
                rooms
            }
        });
    }

    yield countRooms();

};

export const notificationClickSaga = function* () {
    while (true) {
        const { payload: { room }} = yield take(NOTIFICATION_CLICK);
        const rtcStatus = yield select(rtcStatusSelector);
        // const wsStatus = yield select(wsStatusSelector);
        const roomsFilter = yield select(getFormValues('roomsFilter'));

        if (rtcStatus === RTC_STATUSES.none && wsStatus === CONNECTED) {
            // if (roomsFilter.roomType.value !== ROOM_TYPES.my.value) {
            // }
            yield selectRoom(room.id);
            if (room.status === ROOM_STATUSES.open) {
                yield joinSelectRoom(room.hash);
            }

            if (!roomsFilter) {
                yield put(push('/workspace'));
                dispatch(change('roomsFilter', 'roomType', ROOM_TYPES.my));
            }
        }
    }
};

export const manageCallNotificationSaga = function* () {
    while (true) {
        const { payload: { room }} = yield take(MANAGE_CALL_NOTIFICATION);
        const rooms = yield select(roomsSelector);
        const rtcStatus = yield select(rtcStatusSelector);
        const ivcUser = yield select(ivcUserSelector);
        const currentUserInRoom = room.roomUsers.find((user: any) => {
            return user.user.id === ivcUser.userId;
        });
        const rtc1Rooms = rooms.filter((roomObj: any) => {
            return roomObj.get('rtcStatus') === 1 && roomObj.get('id') !== room.id && roomObj.get('state') !== ROOM_STATES.reassigned;
        });
        // 1 - Юзер звонит (loop мелодия)
        if (rtcStatus === RTC_STATUSES.none) {
            if (room.rtcStatus === 1 || (rtc1Rooms.size > 0 || room.rtcStatus === 1)) {
                NotificationAdapter.getInstance().play('call');
            }
        }
        if (rtc1Rooms.size === 0 && room.rtcStatus === 0) {
            NotificationAdapter.getInstance().stop('call');
        }
        // 8 - Агент поднял
        if (room.rtcStatus === 1 && currentUserInRoom && currentUserInRoom.rtcStatus === true) {
            NotificationAdapter.getInstance().stop('call');
        }

        if (rtc1Rooms.size === 0 && room.rtcStatus === 1 && !currentUserInRoom && room.status !== ROOM_STATUSES.open) {
            NotificationAdapter.getInstance().stop('call');
        }
    }
};

export const roomMessageSaga = function* (action: any) {
    const { payload } = action;
    const room = yield select(roomByIdSelector(payload.roomId));
    const currentRoomId = (yield select(stateSelector)).get('currentRoomId');
    const ivcUser = yield select(ivcUserSelector);
    if (room) {
        const message = {
            id: payload.id,
            userId: payload.userId,
            content: payload.message.content,
            type: payload.message.type,
            createdAt: new Date(),
            userInfo: room.get('users').get(payload.userId) ? room.get('users').get(payload.userId).info: {}
        };
        yield addMessage(message, payload.roomId);
        if (ivcUser.userId !== payload.userId && currentRoomId !== payload.roomId && payload.message.type !== MESSAGE_TYPES.system) {
            console.log('ttt room message saga currentroomid userid', payload.message.content.text);
        }
    } else {
        if (payload.message.type !== MESSAGE_TYPES.system) {
            console.log('ttt room message saga system types', payload.message.content.text);
        }
    }
    if (payload.message.type === MESSAGE_TYPES.system) {
        const content = JSON.parse(payload.message.content.text || '{}');
        if (content.event !== SYSTEM_MESSAGE_EVENTS.joinConversation && content.event !== SYSTEM_MESSAGE_EVENTS.startAudioCall && content.event !== SYSTEM_MESSAGE_EVENTS.startVideoCall) {
            console.log('ttt notification audio event', NotificationAdapter.getInstance().play('message'));
            NotificationAdapter.getInstance().play('message');
        }
    } else {
        if (ivcUser.userId !== payload.userId) {
            console.log('ttt notification audio ivcuser', NotificationAdapter.getInstance().play('message'));
            NotificationAdapter.getInstance().play('message');
        }
    }
};

export const roomMessageTypingSaga = function* (action: any) {
    const { payload } = action;
    let rooms = yield select(roomsSelector);
    let typingRoomUser = rooms.getIn([payload.roomId, 'users', payload.userId]);
    if (typingRoomUser) {
        typingRoomUser = typingRoomUser.set('typing', {
            status: true,
            timestamp: new Date()
        });
        rooms = rooms.setIn([payload.roomId, 'users', payload.userId], typingRoomUser);
        yield put({
            type: UPDATE_ROOMS,
            payload: {
                rooms
            }
        });

        yield call(delay, 2200);

        rooms = yield select(roomsSelector);
        typingRoomUser = rooms.getIn([payload.roomId, 'users', payload.userId]);
        if (typingRoomUser && (Number(new Date()) - Number(typingRoomUser.get('typing').timestamp)) > 2000) {
            typingRoomUser = typingRoomUser.set('typing', {
                status: false,
                timestamp: new Date()
            });
            rooms = rooms.setIn([payload.roomId, 'users', payload.userId], typingRoomUser);
            yield put({
                type: UPDATE_ROOMS,
                payload: {
                    rooms
                }
            });
        }
    }
};

export const addMessage = function* (message: any, roomId: number) {
    let messages = yield select(roomMessageByIdSelector(roomId));
    if (message.type !== MESSAGE_TYPES.sending) {
        messages = messages.filter((item: any) => {
            return item.get('id') !== message.content.hash;
        });
    }
    messages.push(message);
    messages = arrToMap(messages, MessageRecord);
    console.log('ttt MessageRecord', message);
    let rooms = yield select(roomsSelector);
    rooms = rooms.withMutations((map: any) => {
        return map
            .setIn([roomId, 'messages'], messages)
            .setIn([roomId, 'lastMessage'], message)
            .setIn([roomId, 'timestamp'], new Date())
            .setIn([roomId, 'typing'], message);
    });

    rooms = rooms.sort((a: any, b: any) => {
        if (a.id === roomId) {
            return -1;
        }
        return 0;
    });

    yield put({
        type: UPDATE_ROOMS,
        payload: {
            rooms
        }
    });
};

export const roomSaga = function* (action: any) {
    const { payload } = action;
    const topics = yield select(topicsSelector);
    const { userId } = yield select(ivcUserSelector);
    let rooms = yield select(roomsSelector);
    const roomsArr = mapToArr(rooms);
    const isRelatedToRoom = yield checkIfUserRelatedToRoom(payload, userId);
    if (!isRelatedToRoom) {
        yield IvcAdapter.leaveRoom(payload.hash);
        yield countRooms();
        return;
    }
    yield manageCallNotification(payload);

    const filteredRoom = roomsArr.find((item: any) => {
        return item.get('id') === payload.id;
    });

    // Пользователи; Статус комнаты
    let onlineStatus = false;
    const users: any = [];
    for (const roomUser of payload.roomUsers) {
        const card = filteredRoom ?
            rooms.getIn([filteredRoom.get('id'), 'users', roomUser.user.id, 'card'])
            :
            null;
        const userMap = {
            id: roomUser.user.id,
            status: roomUser.user.connectStatus,
            rtcStatus: roomUser.rtcStatus,
            info: roomUser.user.info || {},
            card: card ? card : null,
        };
        users.push(userMap);
        if (
            roomUser.user.connectStatus &&
            userId !== roomUser.user.id
        ) {
            onlineStatus = true;
        }
    }

    const checker = yield roomFilterChecker(payload, !filteredRoom);
    if (checker) {
        // Если комната найдена
        if (filteredRoom) {
            const roomId = filteredRoom.get('id');
            let roomState = ROOM_STATES.shown;
            if (
                (payload.status !== filteredRoom.get('status') || filteredRoom.get('state') === ROOM_STATES.reassigned) &&
                (payload.status !== ROOM_STATUSES.open)
            ) {
                roomState = ROOM_STATES.reassigned;
            }
            rooms = rooms.withMutations((map: any) => {
                if (payload.status === 2) {
                    return map.delete(roomId);
                } else {
                    return map
                        .setIn([roomId, 'name'], payload.name)
                        .setIn([roomId, 'status'], payload.status)
                        .setIn([roomId, 'rtcStatus'], payload.rtcStatus)
                        .setIn([roomId, 'rtcType'], payload.rtcType)
                        .setIn([roomId, 'timestamp'], payload.updatedAt)
                        .setIn([roomId, 'state'], roomState)
                        .setIn([roomId, 'users'], arrToMap(users, UserRecord))
                        .setIn([roomId, 'messages'], arrToMap(rooms, RoomRecord))
                        .setIn([roomId, 'onlineStatus'], onlineStatus)
                        .setIn([roomId, 'topic', 'id'], payload.appTopicId)
                        .setIn([roomId, 'topic', 'name'], topics.get(payload.appTopicId).name);
                }
            });
        } else {
            const room = {
                id: payload.id,
                hash: payload.hash,
                appId: payload.appId,
                name: payload.name,
                status: payload.status,
                rtcStatus: payload.rtcStatus,
                rtcType: payload.rtcType,
                messages: payload.messages,
                timestamp: payload.updatedAt,
                users: arrToMap(users, UserRecord),
                onlineStatus,
            };
            roomsArr.unshift(room);
            rooms = arrToMap(roomsArr, RoomRecord);
            NotificationAdapter.getInstance().play('room');
        }

        yield put({
            type: UPDATE_ROOMS,
            payload: {
                rooms
            }
        });
    } else {
        NotificationAdapter.getInstance().play('room');
    }
    yield countRooms();
};

const checkIfUserRelatedToRoom: any = function* (room: any, chatUserId: number) {

    // Когда перенаправили в другой топик, все ливают с комнаты
    if (room.status === ROOM_STATUSES.open && room.roomUsers.find((roomUser: any) => {
        return roomUser.user.id === chatUserId;
    })) {
        return false;
    }
    return true;
};

// Простая временная проверка
const roomFilterChecker: any = function* (room: any, isNew: boolean) {
    const filterValues = yield select(getFormValues('roomsFilter'));
    if (!filterValues) {
        return false;
    }
    const reduxFilters = {
        type: filterValues.roomType.value,
    };

    /*
    * Если комната новая и фильтр стоит на 'my' => скорее всего она нам не нужна
    * Требуется все же проверка, т.к. есть сценарий
    */
    const { userId } = yield select(ivcUserSelector);
    const isUserInRoom = yield checkUserRoom(room.roomUsers, userId);
    if (reduxFilters.type === 'my' && room.status !== ROOM_STATUSES.closed) {
        if (isUserInRoom) {
            return true;
        }
        if (isNew) {
            return false;
        }
    }
    if (room.status === ROOM_STATUSES.closed) {
        return false;
    }

    if (reduxFilters.type === 'unassigned') {
        if (isNew && room.status === 1) {
            return false;
        }
        // ==> reassigned room status show
    }

    return true;
};


export const roomCountSaga = function* (action: any) {
    const { payload } = action;
    yield put({
        type: UPDATE_ROOM_COUNT,
        payload: {
            // @ts-ignore
            roomsCounter: new Map({
                assigned: payload.assignedRooms,
                notAssigned: payload.notAssignedRooms
            })
        }
    });
};

export const removeRoomSaga = function* () {
    while (true) {
        const { payload } = yield take(REMOVE_ROOM);
        const rooms = yield select(roomsSelector);
        const filteredRooms = rooms.filter((item: any) => {
            return item.get('hash') !== payload.roomHash;
        });
        yield put({
            type: SET_CURRENT_ROOM,
            payload: {
                currentRoomId: null
            }
        });
        yield put({
            type: UPDATE_ROOMS,
            payload: {
                rooms: filteredRooms
            }
        });
        yield countRooms();
    }
};

function* roomsWatcher () {
    yield takeLatest(LOAD_ROOMS, loadRoomsSaga);
    yield takeEvery(ROOM_MESSAGE, roomMessageSaga);
    yield takeEvery(ROOM_SIGNAL, roomSaga);
    yield takeEvery(ROOM_MESSAGE_TYPING, roomMessageTypingSaga);
    yield takeEvery(ROOM_COUNT + SUCCESS, roomCountSaga);
}

export const saga = function* () {
    yield all([
        fork (roomsWatcher),
        loadRooms,
        joinRoomSaga(),
        selectRoomSaga(),
        removeRoomSaga(),
        manageCallNotificationSaga(),
        notificationClickSaga()
    ]);
};

/* eslint-disable */
import {
    setStatus,
    CONNECTED,
    CONNECTING,
    FAILED,
    DISCONNECTED,
    updateRtcStatus,
    RTC_STATUSES, STREAM_TYPES,
    addStream, setSessionStatus, clearStreams, removeStream
} from '../ducks/workspace/workspace';

import {
    MESSAGE_TYPES,
    removeRoom,
    roomMessage,
    roomMessageTyping,
    roomSignal,
    SYSTEM_MESSAGE_EVENTS
} from '../ducks/workspace/rooms';

import {
    logout,
    setIvcUser,
    setNotificationToken
} from '../ducks/auth';

import AsyncStorage  from '@react-native-community/async-storage';
import { dispatchSendMessage, failedMessages } from '../ducks/workspace/roomCurrent';
import MobileAdapter, { checkDevices } from 'ivcbox-adapter';
import NotificationAdapter from './NotificationAdapter';
import { randomString } from '../utils/common';
import { addPopUp } from '../ducks/popups';
import { addError } from '../ducks/alerts';

class Adapter {

    public static getInstance (): Adapter {
        return Adapter.instance;
    }

    protected static instance: Adapter = new Adapter();

    public props = {
        ivcClient: new MobileAdapter(),
        store: null,
        state: 'disconnected',
        socketServer: null,
        user: {
            sessionKey: null,
            refreshToken: null,
            info: null
        },
        localStream: null,
        remoteStream: null,
        dashboardUserToken: null,
        blockedRooms: []
    };

    public notificationAdapter: NotificationAdapter;

    public constructor () {
        if (Adapter.instance) {
            throw new Error('Instantiation failed: '+
                'use Adapter.getInstance() instead of new.');
        }
        this.notificationAdapter = NotificationAdapter.getInstance();
        this.notificationAdapter.addSound('call','call_notification.mp3',true);
        this.notificationAdapter.addSound('message', 'message_notification.mp3');
        this.notificationAdapter.addSound('room', 'room_notification.mp3');
    }

    public setProps (props: any) {
        this.props = {...this.props, ...props};
    }

    public connect () {
        const self = this;
        console.log('Status IvcAdapter = "Connected"');

        if (self.props.state !== 'disconnected') {
            return;
        }

        self.props.state = 'connecting';
        setStatus({ status: CONNECTING });
        return new Promise((resolve) => {
            this.init(resolve);

            this.props.ivcClient.on('connectionSucceeded', (stompClient: any) => {
                failedMessages();
                self.props.state = 'connected';
                setStatus({ status: CONNECTED });
            });

            this.props.ivcClient.on('connectionFailed', () => {
                self.props.state = 'disconnected';
                setStatus({ status: FAILED });

            });

            this.props.ivcClient.on('incomingStream', (stream: any) =>{
                self.addRemoteStream(stream)
            });

            this.props.ivcClient.on('processUser', (payload: any) => {
                console.log('ttt processUser', payload);
                self.processUser(payload);
            });

            this.props.ivcClient.on('initConnectionResponse', (payload: any) => {
                console.log('ttt processInitConnectionResponse', payload);
                self.processInitConnectionResponse(payload);
            });

            self.props.ivcClient.on('autoReconnect', () => {
                self.props.state = 'connecting';
                setStatus({ status: CONNECTING });
                self.init(resolve);
            });

            this.props.ivcClient.on('outdatedRefreshToken', (payload: any) => {
                self.createUser();
            });
            this.props.ivcClient.on('invalidDashboardUserToken', (payload: any) => {
                logout();
            });
            this.props.ivcClient.on('wrongRefreshToken', (payload: any) => {
                logout();
            });
            this.props.ivcClient.on('wrongUser', (payload: any) => {
                logout();
            });

            this.props.ivcClient.on('createUserResponse', (payload: any) => {
                console.log('qqq createUserResponse', payload);
                this.processUser(payload);
            });

            this.props.ivcClient.on('room', (payload: any) => {    // ----- ADDED TO NEED FOR SIGNAL
                roomSignal(payload);
            });

            this.props.ivcClient.on('roomMessage', (payload: any) => {
                roomMessage(payload);
            });

            this.props.ivcClient.on('roomMessageTyping', (payload: any) => {
                roomMessageTyping(payload);
            });

            this.props.ivcClient.on('noHeartbeat', () => {
                self.props.state = 'disconnected';
                setStatus({ status: FAILED });
            });

            this.props.ivcClient.on('mediaAccessSuccess', (stream: any) => {
                self.cameraSucceeded(stream);
            });

            this.props.ivcClient.on('UserMessage', (payload: any) => {
                self.processUserMessage(payload);
            });

            this.props.ivcClient.on('invalidateSession', () => {
                self.props.state = 'disconnected';
                self.props.ivcClient.disconnect();
                this.notificationAdapter.stop('call');
                setSessionStatus(false);
            });

            this.props.ivcClient.on('mediaAccessError', (error: any) => {
                self.cameraFailed();
            });

            this.props.ivcClient.on('userLeftRtc', (peerId: number) => {
                self.hangupRtcConnection(peerId);
            });

            this.props.ivcClient.on('peerConnectionClosed', (peerId: number) => {
                self.hangupRtcConnection(peerId);
            });
            this.props.ivcClient.on('peerConnectionDisconnected', () => {
                updateRtcStatus(RTC_STATUSES.reconnecting)
            });

            this.props.ivcClient.on('peerConnectionFailed', (peerId: any) => {
                self.hangupRtcConnection(peerId);
            });

            this.props.ivcClient.on('peerConnectionConnected', () => {
                updateRtcStatus(RTC_STATUSES.connected)
            });

        });
    }
    // -----------------------------------------------------------------------  INIT CONNECTION
    public init (resolve: any) {
        this.props.ivcClient.init({
            socketServer: this.props.socketServer
        }, () => {
            this.createUser();
            resolve();
        });
    }

    public initConnection () {
        if (!this.props.user.sessionKey) {
            logout();
        } else {
            this.props.ivcClient.initConnection({
                sessionKey: this.props.user.sessionKey,
                refreshToken: this.props.user.refreshToken
            });
        }
    }
    // -----------------------------------------------------------------------  INIT CONNECTION RESPONSE
    public processInitConnectionResponse (payload: any) {
        AsyncStorage.getItem('ivcUser').then((ivcUserObject) => {
            const ivcUser = ivcUserObject ? JSON.parse(ivcUserObject) : {};
            AsyncStorage.setItem('ivcUser', JSON.stringify({
                ...ivcUser,
                userId: payload.userId
            }));
            setIvcUser(payload);
            const permission = Notification.permission.toLowerCase();
            console.log('ttt permission', permission);
            if (permission === 'granted') {
                setNotificationToken();
            }
        })
    }
    // -----------------------------------------------------------------------  CREATE USER
    public createUser () {
        if (!this.props.dashboardUserToken) {               // -------------   CHECK FOR NULL
            logout();
        } else {
            this.props.ivcClient.createUser({
                dashboardUserToken: this.props.dashboardUserToken,
                info: this.props.user.info
            });
        }

    }

    public setUserInfo () {
        console.log('www create user info', this.props.ivcClient.setUserInfo);
        this.props.ivcClient.setUserInfo({
            info: this.props.user.info
        });
    }

    public disconnect (clear: boolean = false) {
        const self = this;
        if (self.props.state === 'connected') {
            self.props.state = 'disconnected';
            this.props.ivcClient.disconnect();
            if (!clear) {
                setStatus({ status: DISCONNECTED });
            } else {
                setStatus({ status: null });
            }
        }
    }
    // -----------------------------------------------------------------------  PROCESS USER
    public processUser (payload: any) {
        AsyncStorage.getItem('auth').then((authObject) => {
            const ivcUser = authObject ? JSON.parse(authObject) : {};
            AsyncStorage.setItem('ivcUser', JSON.stringify({
                ...ivcUser,
                sessionKey: payload.sessionKey,
                refreshToken: payload.refreshToken
            }));
            this.setProps({
                user: {
                    ...this.props.user,
                    sessionKey: payload.sessionKey,
                    refreshToken: payload.refreshToken
                }
            });
            this.initConnection();
        });
    }
    // -----------------------------------------------------------------------  ROOMS COMMANDS
    public changeRoomStatus (roomHash: string, status: string) {
        const self = this;
        if (status === 'close') {
            self.props.ivcClient.closeRoom({ roomHash });
        } else {
            self.props.ivcClient.openRoom({ roomHash });
        }
    }

    public setRoomName (roomHash: string, roomName: string) {
        const self = this;
        self.props.ivcClient.setRoomName({
            roomHash,
            name: roomName
        });
    }

    public joinRoom (roomHash: string) {
        const self = this;
        self.props.ivcClient.joinRoom({
            roomHash
        });
    }

    public leaveRoom (roomHash: string) {
        const self = this;
        self.props.ivcClient.leaveRoom({
            roomHash
        });
        removeRoom(roomHash);
    }

    public sendSystemMessage (payload: any) {
        dispatchSendMessage(payload);
    }

    public sendTypingSignal (roomHash: string) {
        const self = this;
        self.props.ivcClient.sendMessageTyping({
            roomHash
        });
    }

    public sendMessageToUser (userId: number, eventName: string, roomHash: string, additional: any|null = null) {
        const self = this;
        self.props.ivcClient.sendMessageToUser(userId, {
            eventName,
            roomHash,
            additional
        });
    }


    public updateLastSeenMessage (roomHash: string, messageId: number) {
        const self = this;
        self.props.ivcClient.sendLastSeenMessage({
            roomHash,
            messageId
        });
    }

    // RTC Connection -------------------------------------- NEEDED ADD

    public initRtcConnection (roomHash: string) {
        const self = this;
        self.props.ivcClient.initRtcConnection({
            roomHash
        });
    }


    public getUserMedia (audio: boolean, video: boolean, roomHash: string) {
        const self = this;
        self.props.ivcClient.getUserMedia({
            audio,
            video
        }, (error: any, stream: any) => {
            if (!error) {
                self.initRtcConnection(roomHash);
            }
        });
    }


    public closeRtcConnection (roomHash: string) {
        const self = this;
        self.props.ivcClient.closeRtcConnection({
            roomHash
        });
        updateRtcStatus(RTC_STATUSES.none);
    }

    public switchRoomTopic (topicId: number, roomHash: string, refreshStatus: number) {
        const self = this;
        self.props.ivcClient.switchRoomTopic({
            roomHash,
            topicId,
            refreshStatus
        });
    }

    private hangupRtcConnection (peerId: number) {
        const self = this;
        clearStreams();
        self.props.ivcClient.leaveRtcConnection();
        updateRtcStatus(RTC_STATUSES.none);
    }

    private cameraFailed () {
        removeStream();
        new Promise((resolve: any, reject: any) => {
            checkDevices(resolve, reject);
        }).then((resp: any) => {
            // empty;
        }).catch((error: any) => {
            // empty
        });
        updateRtcStatus(RTC_STATUSES.failed);
        addError('cameraFailed', 'Please check your camera connection and try again');
    }

    private cameraSucceeded (stream: any) {
        addStream(stream, STREAM_TYPES.local);
        updateRtcStatus(RTC_STATUSES.connecting);
    }


    private addRemoteStream (stream: any) {
        addStream(stream, STREAM_TYPES.remote);
        updateRtcStatus(RTC_STATUSES.connected);
    }

    private processUserMessage (response: any) {
        const self = this;
        const { payload } = response;
        switch (payload.eventName) {
            case MESSAGE_TO_USER_EVENT_NAMES.requestJoinRoom:
                addPopUp('RequestJoinRoomPopUp', { roomHash: payload.roomHash, authorUserId: payload.additional.authorUserId });
                break;
            case MESSAGE_TO_USER_EVENT_NAMES.requestReplaceMe:
                addPopUp('RequestReplaceMePopUp', { roomHash: payload.roomHash, topicId: payload.additional.topicId, authorUserId: payload.additional.authorUserId });
                break;
            case MESSAGE_TO_USER_EVENT_NAMES.responseReplace:
                self.sendSystemMessage({
                    message: { 'hash': randomString(8), 'text': JSON.stringify({
                            event: SYSTEM_MESSAGE_EVENTS.redirectRoomToUser,
                            payload: {
                                isAgree: payload.additional.isAgree,
                                senderUserId: payload.additional.senderUserId,
                                recipientUserId: payload.additional.recipientUserId
                            }

                        })},
                    type: MESSAGE_TYPES.system
                });
                if (payload.additional.isAgree === true) {
                    if (payload.additional.topicId) {
                        self.sendSystemMessage({
                            message: { 'hash': randomString(8), 'text': JSON.stringify({
                                    event: SYSTEM_MESSAGE_EVENTS.switchRoomTopic,
                                    payload: {
                                        senderUserId: payload.additional.senderUserId,
                                        topicId: payload.additional.topicId
                                    }

                                })},
                            type: MESSAGE_TYPES.system
                        });
                        self.switchRoomTopic(payload.additional.topicId, payload.roomHash, 0);
                    }
                    self.setProps({ blockedRooms: [...self.props.blockedRooms, payload.roomHash]});
                    setTimeout(() => {
                        self.setProps({ blockedRooms: self.props.blockedRooms.filter((hash: string) => {
                                return hash !== payload.roomHash;
                            })
                        });
                    }, 2000);
                    self.leaveRoom(payload.roomHash);
                }
                break;
            case MESSAGE_TO_USER_EVENT_NAMES.responseJoinRoom:
                const textObj = {
                    event: SYSTEM_MESSAGE_EVENTS.addAgentToRoom,
                    payload: {
                        senderUserId: payload.additional.senderUserId,
                        isAgree: payload.additional.isAgree,
                        recipientUserId: payload.additional.recipientUserId,
                    }
                };
                const messagePayload = {
                    message: { 'hash': randomString(8), 'text': JSON.stringify(textObj) },
                    type: MESSAGE_TYPES.system
                };
                self.sendSystemMessage(messagePayload);
                break;

            default:
            // empty
        }
    }

}

export const IvcAdapter = Adapter.getInstance();
export const MESSAGE_TO_USER_EVENT_NAMES = {
    'requestJoinRoom': 'requestJoinRoom',
    'responseJoinRoom': 'responseJoinRoom',
    'requestReplaceMe': 'requestReplaceMe',
    'responseReplace': 'responseReplace'
};

import React, { PureComponent } from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Image, ScrollView} from 'react-native';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';
import {
    loadRooms,
    selectRoom,
    myRoomsListSelector,
    roomsLastMessagesSelector,
    roomsStatusSelector,
    roomsListSelector
} from '../../../ducks/workspace/rooms';
import {
    sendMessage,
    sendTypingSignal,
    currentRoomTypingUsersSelector,
    currentRoomAssignedSelector,
    currentRoomUsersMapSelector, initRtcConnection, closeRtcConnection
} from '../../../ducks/workspace/roomCurrent';
import RoomListDate from './roomElements/roomdate';
import { rootMessageScreen } from '../../../navigation/nagivation';
import Icon from 'react-native-vector-icons/FontAwesome';
import avatar from './defaultAvatar/defaultAvatar.png';
import { dashboardUsersByUserIdSelector } from '../../../ducks/workspace/workspace';
import { ivcUserSelector, updateUserInfo, userIdSelector } from '../../../ducks/auth';
import RoomItem from './roomElements/roomlistitem';
import Spinner from 'react-native-spinkit';
import { LOADING } from '../../../configs/types';
import TypeSignal from './roomElements/TypeSignal';

interface IRoomMy
{
    status: number;
    type: string;
    isOnline: boolean
    loadRooms: (type: string) => any;
    roomMy: any;
    room: any;
    roomHash: string;
    selectRoom: any;
    sendMessage: any;
    ivcUser: any;
    dashboardUsers: any;
    rooms: any;
    userId: number;
    myUserId: number;
    lastMessage: any;
    messageViewed: boolean;
    message: any;
    style: any;
    text: any;
    roomStatus: number;
    rtcStatus: number;
    currentRoomId: any;
    filterValues: any;
    updateUserInfo: any;
    currentRoomTypingUsers: any[];
    currentRoomAssigned: boolean;
    componentId: any;
    sendTypingSignal: any;
}

class RoomMy extends PureComponent<IRoomMy, any> {

    public state = {
        spinner: false,
        filters: {
            type: null,
            status: null
        },
    };

    public handleSelect = (id: number) => {
        this.props.selectRoom(id);
        rootMessageScreen();
    };


    public componentDidUpdate (prevProps: any) {
        this.props.loadRooms.bind(this);
    };

    public render () {

        const { dashboardUsers, ivcUser, currentRoomId, currentRoomTypingUsers, currentRoomAssigned } = this.props;

        return (
            <ScrollView>
                <View>
                    {this.getLoader()}
                    <View>
                        <View style={styles.form}>
                            {this.props.roomMy.length > 0 && this.props.roomMy.map((room: any, key: number) => {
                                console.log('ttt roomMy', );
                                if (room.get('id')) {
                                    let messageViewed = true;
                                    if (room.get('lastMessage')) {
                                        if (room.get('lastMessage').userId !== ivcUser.userId) {
                                            if (room.get('lastSeenMessageId') !== room.get('lastMessage').id) {
                                                messageViewed = false;
                                            }
                                        }
                                        return (
                                            <TouchableOpacity key={key} activeOpacity={0.7} onPress={this.handleSelect.bind(this, room.get('id'))}>
                                                <View style={styles.message} key={key}>
                                                    <View style={styles.upinfo}>
                                                        <Image source={avatar} style={styles.avatar}/>
                                                        <View style={{justifyContent: 'space-between'}}>
                                                            <Text style={styles.h1}>{room.get('id')}</Text>
                                                            <View>
                                                                {room.get('onlineStatus') === true ?
                                                                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginLeft: 5,
                                                                    }}>
                                                                        <Icon name={'circle'} size={12} style={{color: '#08B533', marginTop: 5}}/>
                                                                        <Text style={{ color: '#08B533' }}> online </Text>
                                                                    </View> : null}
                                                            </View>
                                                            <View>
                                                                {room.get('onlineStatus') === false ?
                                                                    <View style={{flexDirection: 'row', justifyContent: 'center', marginLeft: 5,}}>
                                                                        <Icon name={'circle'} size={12} style={{color: '#ccc', marginTop: 5}}/>
                                                                        <Text style={{ color: '#ccc' }}> offline </Text>
                                                                    </View> : null}
                                                            </View>
                                                        </View>
                                                        <View style={styles.Date}>
                                                            <Text style={styles.h3}>
                                                                <RoomListDate
                                                                    dateInSeconds={new Date(room.get('timestamp')).getTime()}
                                                                    timestamp={room.get('timestamp')}
                                                                />
                                                            </Text>
                                                        </View>
                                                        <View style={{
                                                            position: 'absolute',
                                                            right: 0,
                                                            marginRight: 7,
                                                            marginStart: 10,
                                                            marginTop: 50,
                                                            justifyContent: 'center',
                                                            alignItems: 'center'
                                                        }}>
                                                            <RoomItem
                                                                rtcStatus={room.get('rtcStatus')}
                                                                messageViewed={messageViewed}
                                                            />
                                                        </View>
                                                    </View>
                                                    <View style={styles.h4}>
                                                        <TypeSignal
                                                            id={room.get('id')}
                                                            isSelected={currentRoomId === room.get('id')}
                                                            handleSelect={this.props.selectRoom}
                                                            style={{ flexDirection: 'row', alignItems: 'center' }}
                                                            currentRoomAssigned={currentRoomAssigned}
                                                            typingUsers={currentRoomTypingUsers}
                                                            sendTypingSignal={this.props.sendTypingSignal}
                                                            userId={this.props.userId}
                                                        />
                                                    </View>
                                                    <View style={styles.h2}>
                                                        <RoomItem
                                                            id={room.get('id')}
                                                            isSelected={currentRoomId === room.get('id')}
                                                            handleSelect={this.props.selectRoom}
                                                            message={room.get('lastMessage') && room.get('lastMessage').content.text}
                                                            lastMessage={room.get('lastMessage')}
                                                            dashboardUsers={dashboardUsers}
                                                            currentChatUserId={ivcUser.userId}
                                                            updateUserInfo={this.props.updateUserInfo}
                                                        />
                                                    </View>
                                                </View>
                                            </TouchableOpacity>

                                        );
                                    }
                                }
                                return null;
                            })}
                        </View>
                    </View>
                </View>
            </ScrollView>
        );
    }

    public getLoader () {
        const { roomStatus } = this.props;
        // @ts-ignore
        if (roomStatus === LOADING) {
            return (
                <View style={styles.spinnerTextStyle}>
                    <Spinner
                        color={'#2196F3'}
                        size={76}
                        type={'FadingCircleAlt'}
                        visible={this.state.spinner}
                    />
                </View>

            );
        }
        return;
    };

}

const styles = StyleSheet.create({
    form: {
        marginVertical: 0,
        marginHorizontal: 0,
        shadowColor: "#2196F3",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    h1: {
        fontFamily: 'SegoeUI-Bold',
        fontSize: 16,
        marginLeft: 15,
        marginStart: 80,
        marginEnd: 30
    },
    h2: {
        flexDirection: 'row',
        alignItems: 'center',
        color: '#000',
        fontFamily: 'SegoeUI',
        fontSize: 14,
        marginStart: -7,
        marginTop: 10
    },
    h3: {
        color: '#ccc',
        fontFamily: 'SegoeUI',
        fontSize: 14,
        marginStart: 10,
        marginTop: 20
    },
    h4: {
        flexDirection: 'row',
        alignItems: 'center',
        marginStart: -7,
        marginTop: 10
    },
    message: {
        borderColor: "rgb(255,255,255)",
        backgroundColor: "rgb(255,255,255)",
        marginHorizontal: 5,
        marginBottom: 3,
        height: 115,
        padding: 15
    },
    avatar: {
        marginLeft: 1,
        height: 50,
        width: 50,
    },
    Date: {
        position: 'absolute',
        right: 0,
        marginTop: -17,
        marginRight:7,
        flexDirection: 'row'
    },
    upinfo:{
        textAlign: 'right',
        flexDirection: 'row',
    },
    spinnerTextStyle: {
        marginTop: 200,
        flex: 1,
        color: '#2196F3',
        alignItems: 'center'
    },
    loaderContainer: {
        minWidth: 60,
        minHeight: 60
    },
});

export default connect((state: any) => ({
    rooms: roomsListSelector,
    roomStatus: roomsStatusSelector(state),
    roomsConfig: state.roomMy,
    roomMy: myRoomsListSelector(state),
    myUserId: userIdSelector(state),
    ivcUser: ivcUserSelector(state),
    lastMessage: roomsLastMessagesSelector(state),
    dashboardUsers: dashboardUsersByUserIdSelector(state),
    filterValues: getFormValues('roomsFilter')(state),
    currentRoomTypingUsers: currentRoomTypingUsersSelector(state),
    currentRoomAssigned: currentRoomAssignedSelector(state),
    currentRoomUsers: currentRoomUsersMapSelector(state)
}), {
    loadRooms,
    selectRoom,
    sendMessage,
    updateUserInfo,
    sendTypingSignal,
    initRtcConnection,
    closeRtcConnection
})(RoomMy);

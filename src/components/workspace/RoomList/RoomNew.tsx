import React, { PureComponent } from 'react';
import {View, StyleSheet, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import {
    joinRoom,
    selectRoom,
    newRoomsListSelector,
    roomsLastMessagesSelector,
    loadRooms,
    roomsListSelector,
    roomsStatusSelector
} from '../../../ducks/workspace/rooms';
import RoomListDate from './roomElements/roomdate';
import TextSegoe from '../../common/TextSegoe';
import { initRtcConnection, joinSelectRoom, closeRtcConnection } from '../../../ducks/workspace/roomCurrent';
import { dashboardUsersSelector } from '../../../ducks/workspace/workspace';
import { ivcUserSelector, userIdSelector } from '../../../ducks/auth';
import avatar from './defaultAvatar/defaultAvatar.png';
import { rootMessageScreen } from '../../../navigation/nagivation';
import { LOADING } from '../../../configs/types';
import Spinner from 'react-native-spinkit';
import RoomItem from './roomElements/roomlistitem';

interface IRoomNew {
    type: string;
    joinRoom: any;
    joinSelectRoom: any;
    selectRoom: any;
    generalRtcStatus: string;
    loadRooms: (type: string) => any;
    roomNew: any;
    dashboardUsers: any;
    room: any;
    message: string;
    myUserId: number;
    style: any;
    rooms: any;
    rtcStatus: number;
    roomStatus: number;
    roomType: string;
}

class RoomNew extends PureComponent<IRoomNew, any> {

    public state = {
        spinner: false,
        filters: {
            type: null,
            status: null
        }
    };

    private roomNew: any = null;


    public componentDidUpdate (prevProps: any) {
        this.props.loadRooms.bind(this);
    }

    public render () {

        const { dashboardUsers } = this.props;

        return (
            <ScrollView>
                <View>
                    {this.getLoader()}
                    <View>
                        <View style={styles.form}>
                            {this.props.roomNew.length > 0 && this.props.roomNew.map((room: any, key: number) => {
                                return (
                                    <View style={styles.message} key={key} ref={(ref: any) => { this.roomNew = ref; }}>
                                        <View style={styles.upinfo}>
                                            <Image source={avatar} style={styles.avatar}/>
                                            <View style={{justifyContent: 'space-between'}}>
                                                <Text style={styles.h1}>{room.get('id')}</Text>
                                            </View>
                                            <View style={styles.Date}>
                                                <Text style={styles.h3}>
                                                    <RoomListDate
                                                        dateInSeconds={new Date(room.get('timestamp')).getTime()}
                                                        timestamp={room.get('timestamp')}
                                                    />
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.textwithButton}>
                                            <View style={styles.h2}>
                                                <RoomItem
                                                    handleSelect={this.props.selectRoom}
                                                    message={room.get('lastMessage') && room.get('lastMessage').content.text}
                                                    lastMessage={room.get('lastMessage')}
                                                    dashboardUsers={dashboardUsers}
                                                />
                                            </View>

                                            <TouchableOpacity style={styles.ButtonBlue} onPress={this.handleJoin.bind(this, room.get('hash'), room.get('id'))}>
                                                <TextSegoe style={styles.textBlue}> Start chatting </TextSegoe>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
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
    }

    public handleJoin = (hash: string, id: number) => {
        this.props.joinRoom(hash);
        this.props.selectRoom(id);
        this.props.joinSelectRoom(hash);
        rootMessageScreen();
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
        width: "45%",
        margin: 10,
        fontFamily: 'SegoeUI',
        fontSize: 14,
        marginStart: -7,
        marginTop: 15
    },
    h3: {
        color: '#ccc',
        fontFamily: 'SegoeUI',
        fontSize: 14,
        marginStart: 10,
        marginTop: 20
    },
    textwithButton: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 5,
        marginBottom: 3,
    },
    textBlue: {
        alignItems: 'center',
        color: "#fff"
    },
    textGreen: {
        alignItems: 'center',
        color: "#000"
    },
    Date: {
        position: 'absolute',
        right: 0,
        marginTop: -17,
        marginRight:7,
        flexDirection: 'row'
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
    ButtonBlue: {
        position: 'absolute',
        right: 0,
        marginTop: 70,
        marginLeft: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#2196F3",
        width: 130,
        height: 35,
        borderRadius: 5
    },
    ButtonGreen: {
        position: 'absolute',
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#fff",
        marginLeft: 230,
        marginTop: -30,
        marginEnd: 100,
        width: 260,
        height: 35,
        borderRadius: 5,
        borderStyle: 'solid'
    },
    upinfo: {
        textAlign: 'right',
        flexDirection: 'row',
    },
    spinnerTextStyle: {
        marginTop: 200,
        flex: 1,
        color: '#2196F3',
        alignItems: 'center'
    }
});

export default connect((state: any) => ({
    rooms: roomsListSelector,
    roomsConfig: state.roomNew,
    roomNew: newRoomsListSelector(state),
    myUserId: userIdSelector(state),
    ivcUser: ivcUserSelector(state),
    lastMessage: roomsLastMessagesSelector(state),
    dashboardUsers: dashboardUsersSelector(state),
    roomStatus: roomsStatusSelector(state),
}), {
    loadRooms,
    initRtcConnection,
    closeRtcConnection,
    joinRoom,
    joinSelectRoom,
    selectRoom
})(RoomNew);

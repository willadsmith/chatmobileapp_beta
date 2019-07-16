import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import { MESSAGE_TYPES, ROOM_STATUSES } from '../../../../ducks/workspace/rooms';
import SystemMessage from '../roomElements/systemMessage';
import { isJson, randomString } from '../../../../utils/common';
import { RTC_STATUSES } from "../../../../ducks/workspace/workspace";
import { addError } from '../../../../ducks/alerts';
import Icon from 'react-native-vector-icons/FontAwesome';

interface IRoomItem {
    message: any;
    isOnline: boolean;
    handleSelect: (id: number) => any;
    roomUsers: any;
    lastMessage: any;
    dashboardUsers: any;
    ivcUser: any;
    updateUserInfo: any;
    generalRtcStatus: string;
    rtcStatus: number;
    userInfo: any;
    roomStatus: number;
    currentChatUserId: number;
    messageViewed: boolean;
}

class RoomItem extends PureComponent<IRoomItem, any> {

    public state = {
        didMount: false
    };

    public  componentDidMount () {
        this.setState({
            didMount: true
        });
    }

    public render () {

        const { roomStatus, rtcStatus, messageViewed } = this.props;

        return(
            <View>
                <View>
                    <Text ellipsizeMode='tail' numberOfLines={1}>{this.setLastMessage()}</Text>
                </View>
                <View>
                    {this.state.didMount && rtcStatus === 0 && !messageViewed && roomStatus !== ROOM_STATUSES.open && (
                        <Icon name={'circle'} size={20} style={{
                            color: '#2196F3',
                            marginStart: -10,
                            marginTop: -40
                        }}/>
                    )}
                </View>
            </View>
        );
    }

    private setLastMessage = () => {
        const {lastMessage, currentChatUserId, dashboardUsers, message} = this.props;
        if (lastMessage) {
            if (lastMessage.type === MESSAGE_TYPES.system || isJson(message)) {
                return (
                    <SystemMessage textOnly={true} content={message}/>
                );
            }
            if (lastMessage.userId === currentChatUserId){
                return (
                    <Text>You: {message}</Text>
                );
            } else {
                if (dashboardUsers.get(lastMessage.userId) && dashboardUsers.get(lastMessage.userId).info) {
                    return (
                        <Text>{dashboardUsers.get(lastMessage.userId).info.name}: {message}</Text>
                    );
                } else {
                    return (
                        <Text>#{lastMessage.userId}: {message}</Text>
                    );
                }
            }
        }
        return null;
    };

    private handleSelect (id: number, event: any) {
        const { userInfo, rtcStatus } = this.props;
        if (this.props.generalRtcStatus !== RTC_STATUSES.none) {
            addError('Rtc is on, noone moves - ' + randomString(5), 'You cannot switch until the video session is over');
            return;
        }
        if (this.state.didMount && rtcStatus === 1 && !userInfo.hasSeenCall) {
            this.props.updateUserInfo({
                hasSeenCall: true
            });
        }
        this.props.handleSelect(id);
    }
}

export default RoomItem;

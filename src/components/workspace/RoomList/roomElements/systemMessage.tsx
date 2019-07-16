import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import { SYSTEM_MESSAGE_EVENTS } from '../../../../ducks/workspace/rooms';
import { connect } from 'react-redux';
import { dashboardUsersByUserIdSelector, topicsSelector } from '../../../../ducks/workspace/workspace';
import { ivcUserSelector } from '../../../../ducks/auth';
import Icon from 'react-native-vector-icons/Ionicons';

interface ISystemMessage {
    dashboardUsers: any;
    topics: any;
    ivcUser: any;
    content: any;
    textOnly?: boolean;
}

class SystemMessage extends PureComponent<ISystemMessage, any> {
    constructor (props: any) {
        super(props);
        this.state = {
            message: null
        };
    }

    public componentDidMount () {
        this.setState({
            message: JSON.parse(this.props.content)
        });
    }

    public render () {
        if (!this.state.message) {
            return null;
        }
        const message = this.getMessage();
        if (!message) {
            return null;
        }
        if (this.props.textOnly) {
            return message;
        }
        return (
            <Text>{message}</Text>
        );
    }

    private getMessage = () => {
        const { message: { event, payload: { senderUserId, topicId, isAgree, recipientUserId }}} = this.state;
        console.log('test get message', {message: { event, payload: { senderUserId, topicId, isAgree, recipientUserId }}});
        const { ivcUser: { userId }} = this.props;
        switch (event) {
            case SYSTEM_MESSAGE_EVENTS.redirectRoomToTopic:
                if (userId === senderUserId) {
                    return `The inquiry was redirected to ${this.setTopicName(topicId)}`;
                } else if (userId !== senderUserId) {
                    return `${this.setUserName(senderUserId)} redirected the inquiry to ${this.setTopicName(topicId)}`;
                }
                return null;
            case SYSTEM_MESSAGE_EVENTS.redirectRoomToUser:
                if (isAgree === true) {
                    return `${this.setUserName(recipientUserId)} was replaced by ${this.setUserName(senderUserId)}`;
                } else if (isAgree === false) {
                    if (senderUserId === userId) {
                        return `${this.setUserName(recipientUserId)} denied your redirection request`;
                    }
                }
                return null;
            case SYSTEM_MESSAGE_EVENTS.switchRoomTopic:
                if (senderUserId === userId) {
                    return `You changed the room assignment to ${this.setTopicName(topicId)}`;
                } else if (senderUserId !== userId) {
                    return `${this.setUserName(senderUserId)} changed the room assignment to ${this.setTopicName(topicId)}`;
                }
                return null;
            case SYSTEM_MESSAGE_EVENTS.addAgentToRoom:
                if (isAgree === true) {
                    if (senderUserId === userId) {
                        return `${this.setUserName(recipientUserId)} accepted your invitation request`;
                    } else if (senderUserId !== userId) {
                        return `${this.setUserName(senderUserId)} added ${this.setUserName(recipientUserId)} to the conversation`;
                    }
                } else if (isAgree === false) {
                    if (senderUserId === userId) {
                        return `${this.setUserName(recipientUserId)} refused to join the conversation`;
                    }
                }
                return null;
            case SYSTEM_MESSAGE_EVENTS.closeRoom:
                if (userId === senderUserId) {
                    return `You closed the conversation`;
                } else if (userId !== senderUserId) {
                    return `${this.setUserName(senderUserId)} closed the conversation`;
                }
                return null;
            case SYSTEM_MESSAGE_EVENTS.joinConversation:
                if (userId === senderUserId) {
                    return `You joined the conversation`;
                } else if (userId !== senderUserId) {
                    return `${this.setUserName(senderUserId)} joined the conversation`;
                }
                return null;
            case SYSTEM_MESSAGE_EVENTS.startVideoCall:
                return `Incoming video call`;
            case SYSTEM_MESSAGE_EVENTS.startAudioCall:
                return `Incoming audio call`;
            case SYSTEM_MESSAGE_EVENTS.missedAudioCall:
                return `Missed audio call`;
            case SYSTEM_MESSAGE_EVENTS.missedVideoCall:
                return <Text style={{ color: '#FF5555', flexDirection: 'row', alignItems: 'center' }} ><Icon name={'ios-videocam'} size={25}/> Missed video call</Text>;
            case SYSTEM_MESSAGE_EVENTS.endVideoCall:
                return `Complete video call`;
            default:
                return null;
        }
    };

    private setTopicName = (topicId: number) => {
        const topic = this.props.topics.get(topicId);
        if (topic) {
            return topic.name;
        }
        return `#${topicId}`;
    };
    private setUserName = (userId: number) => {
        const user = this.props.dashboardUsers.get(userId);
        if (user) {
            return user.info.name;
        }
        return `#${userId}`;
    };
}

export default connect((state: any) => ({
    dashboardUsers: dashboardUsersByUserIdSelector(state),
    topics: topicsSelector(state),
    ivcUser: ivcUserSelector(state)
}), null)(SystemMessage);

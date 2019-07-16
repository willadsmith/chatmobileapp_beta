import React, { Component } from 'react';
import { Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import RoomMy from './RoomList/RoomMy';
import RoomNew from './RoomList/RoomNew';
import { connect } from 'react-redux';
import { authSelector, authInitSelector, authorizedSelector } from '../../ducks/auth';
import { appsSelector, initApp, signalConnectionInit } from '../../ducks/workspace/workspace';
import { loadRooms, roomsCounterSelector } from '../../ducks/workspace/rooms';


interface IWorkSpaceScreen {
    authIsInited: boolean;
    isAuthorized: boolean;
    initApp: () => any;
    signalConnectionInit: () => any;
    loadRooms: (type: string) => any;
    apps: any;
    roomsCounter: any;
    componentId: any;
    auth: any;
}

class WorkSpaceScreen extends Component<IWorkSpaceScreen, any> {

    constructor (props: any) {
        super(props);
        this.state = {
            index: 0,
            routes: [
                { key: 'my', title: 'My' },
                { key: 'new', title: 'New' },
            ],
        };
    }

    public componentDidMount () {
        const { apps, authIsInited, isAuthorized } = this.props;
        if (!apps && authIsInited && isAuthorized) {
            this.props.initApp();
            this.props.loadRooms(this.state.index === 0 ? 'my' : 'unassigned');
        }
        this.props.signalConnectionInit();
    }

    // <Badge value="99+" status="error" />
    // `My ($)`
    //  `My <Badge value="{roomsCounter.get('assigned')}" status="primary" />`

    public componentDidUpdate (prevProps: any) {
        const { roomsCounter } = this.props;
        if (prevProps.roomsCounter.get('assigned') !== roomsCounter.get('assigned') || prevProps.roomsCounter.get('notAssigned') !== roomsCounter.get('notAssigned')) {
            this.setState({
                routes: [
                    { key: 'my', title: `My (${roomsCounter.get('assigned')})` },
                    { key: 'new', title: `New (${roomsCounter.get('notAssigned')})` }
                ]
            });
        }
    }

    public render () {

        return (
            <TabView
                navigationState={this.state}
                renderScene={SceneMap({
                    my: () => <RoomMy />,
                    new: () => <RoomNew />,
                })}
                onIndexChange={(index: any) => {
                    this.setState({ index }, () => {
                        this.props.loadRooms(index === 0 ? 'my' : 'unassigned');
                    });
                }}
                initialLayout={{ width: Dimensions.get('window').width, height: 0 }}
                renderTabBar={(props: any) => (
                    <TabBar
                        {...props}
                        indicatorStyle={{ backgroundColor: '#FFF', height: 3 }}
                    />
                )}
            />
        );
    }

}

export default connect((state: any) => ({
    authIsInited: authInitSelector(state),
    isAuthorized: authorizedSelector(state),
    apps: appsSelector(state),
    roomsCounter: roomsCounterSelector(state),
    auth: authSelector(state)
}), {
    initApp,
    signalConnectionInit,
    loadRooms,
    authSelector
})(WorkSpaceScreen);

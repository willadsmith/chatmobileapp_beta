import Icon from 'react-native-vector-icons/Ionicons';
import { Navigation } from 'react-native-navigation';
import { primary } from '../assets/app.style';

export const rootTabsScreen = () => {
    Promise.all([
        Icon.getImageSource('ios-chatbubbles', 35),
        Icon.getImageSource('ios-cog', 35),
    ]).then((sources: any) => {
        Navigation.setRoot({
            root: {
                bottomTabs: {
                    children: [
                        {
                            stack: {
                                children: [{
                                    component: {
                                        name: 'IvcBox.WorkSpaceScreen',
                                        options: {
                                            topBar: {
                                                noBorder: true,
                                                elevation: 0,
                                                title: {
                                                    alignment: 'center',
                                                    text: 'Conversations',
                                                },
                                            },
                                        },
                                    },

                                }],
                                options: {
                                    bottomTab: {
                                        text: 'Conversations',
                                        icon: sources[0],
                                        selectedIconColor: primary,
                                        selectedTextColor: primary,
                                        iconColor: '#5F5F5F'
                                    }
                                }
                            }
                        },
                        {
                            stack: {
                                children: [{
                                    component: {
                                        name: 'IvcBox.SettingsScreen',
                                        options: {
                                            topBar: {
                                                title: {
                                                    text: 'Settings',
                                                },
                                            },
                                        }
                                    },

                                }],
                                options: {
                                    bottomTab: {
                                        text: 'Settings',
                                        icon: sources[1],
                                        selectedIconColor: primary,
                                        selectedTextColor: primary,
                                        iconColor: '#5F5F5F'
                                    }
                                }
                            }
                        }
                    ],
                    options: {
                    }
                },

            }
        });
    });
};

export const startTopTabs = (componentId: any) => {

    Navigation.mergeOptions(componentId, {
        bottomTabs: {

        }
    });
};


export const rootMessageScreen = () => {
    Promise.all([
        Icon.getImageSource('ios-arrow-round-back', 40),
    ]).then((sources) => {
        Navigation.setRoot({
            root: {
                component: {
                    name: "IvcBox.ChatScreen",
                    options: {
                        topBar: {
                            title: {
                                text: 'ChatID',
                            },
                            backButton: {
                                visible: false
                            },
                            leftButtons: [
                                {
                                    id: 'backButton',
                                    icon: sources[0],
                                    color: '#FFF'
                                }]
                        }
                    }
                }
            }
        });
    });
};


/*
export const pushMessageScreen = (componentId: string) => {
    Promise.all([
        Icon.getImageSource('ios-arrow-round-back', 40),
    ]).then((sources) => {
        Navigation.push(componentId, {
            component: {
                name: 'IvcBox.ChatScreen',
                options: {
                    topBar: {
                        title: {
                            text: 'Sales Department',
                        },
                        backButton: {
                            visible: false
                        },
                        leftButtons: [
                            {
                                id: 'backButton',
                                icon: sources[0],
                                color: '#FFF'
                            }
                        ]
                    },
                }
            },
        });

    });
};
*/

export const rootAuthScreen = () => {
    Navigation.setRoot({
        root: {
            component: {
                name: "IvcBox.AuthScreen",
                options: {
                    statusBar: {
                        style: 'dark',
                        backgroundColor: '#FFF'
                    }
                }
            },
        }
    });
};

export const rootPasswordResetScreen = () => {
    Navigation.setRoot({
        root: {
            component: {
                name: 'IvcBox.PasswordResetScreen',
            }
        }
    });
};

export const pushProfileScreen = (componentId: string) => {
    Promise.all([
        Icon.getImageSource('ios-arrow-round-back', 40),
    ]).then((sources) => {
        Navigation.push(componentId, {
            component: {
                name: 'IvcBox.ProfileScreen',
                options: {
                    topBar: {
                        title: {
                            text: 'Settings',
                        },
                        backButton: {
                            visible: false
                        },
                        leftButtons: [
                            {
                                id: 'backButton',
                                icon: sources[0],
                                color: '#FFF'
                            }
                        ]
                    },
                }
            },
        });

    });
};

export const pushPasswordChangeScreen = (componentId: string) => {
    Navigation.push(componentId, {
        component: {
            name: 'IvcBox.PasswordChangeScreen',
            options: {
                topBar: {
                    title: {
                        text: 'Change password',
                    }
                },
            }
        }
    });
};

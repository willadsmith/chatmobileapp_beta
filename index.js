import { registerScreens } from './src/navigation/screens';
import { Navigation } from 'react-native-navigation';
import { primary } from './src/assets/app.style';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppRegistry } from 'react-native';
import bgMessages from './bgMessages';
import { RTCPeerConnection, mediaDevices } from 'react-native-webrtc';

const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
const pc = new RTCPeerConnection(configuration);

let isFront = true;
mediaDevices.enumerateDevices().then(sourceInfos => {
    console.log('ttt source info', sourceInfos);
    let videoSourceId;
    for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if(sourceInfo.kind === "videoinput" && sourceInfo.facing === (isFront ? 'front' : 'back')) {
            videoSourceId = sourceInfo.deviceId;
        }
    }
    mediaDevices.getUserMedia({
        audio: true,
        video: {
            mandatory: {
                minWidth: 500, // Provide your own width, height and frame rate here
                minHeight: 300,
                minFrameRate: 30
            },
            facingMode: (isFront ? "user" : "environment"),
            optional: (videoSourceId ? [{sourceId: videoSourceId}] : [])
        }
    })
        .then(stream => {
            // Got stream!
        })
        .catch(error => {
            // Log error
        });
});

pc.createOffer().then(desc => {
    pc.setLocalDescription(desc).then(() => {
        // Send pc.localDescription to peer
    });
});

pc.onicecandidate = function (event) {
    // send event.candidate to peer
};

// also support setRemoteDescription, createAnswer, addIceCandidate, onnegotiationneeded, oniceconnectionstatechange, onsignalingstatechange, onaddstream


registerScreens();

Promise.all([
    Icon.getImageSource('ios-arrow-round-back', 40),
]).then((sources) => {
    Navigation.setDefaultOptions({
        topBar: {
            title: {
                color: '#fff',
                fontSize: 18,
                fontFamily: 'SegoeUI-Bold',
            },
            background: {
                color: primary
            },
            backButton: {
                color: '#FFF',
                icon: sources[0]
            },
        },
        statusBar: {
            style: 'light',
            backgroundColor: primary
        },
        bottomTabs: {
            titleDisplayMode: 'alwaysShow',
            backgroundColor: '#FAFAFA',
        },
        animations: {
            push: {
                topBar: {
                    x: {
                        from: 1000,
                        to: 0,
                        duration: 400,
                        interpolation: 'accelerate',
                    },
                },
                content: {
                    x: {
                        from: 1000,
                        to: 0,
                        duration: 400,
                        interpolation: 'accelerate'
                    },
                },
            },
            pop: {
                topBar: {
                    x: {
                        from: 0,
                        to: 1000,
                        duration: 400,
                        interpolation: 'decelerate',
                    },
                },
                content: {
                    x: {
                        from: 0,
                        to: 1000,
                        duration: 400,
                        interpolation: 'decelerate',
                    },
                }
            }
        }
    });
});

Navigation.events().registerAppLaunchedListener(() => {
    Navigation.setRoot({
        root: {
            component: {
                name: 'IvcBox.InitializeScreen',
            }
        },
    });
});

// @ts-ignore
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessages);

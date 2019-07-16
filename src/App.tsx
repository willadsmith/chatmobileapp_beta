import React, { PureComponent } from 'react';
import { View, Animated, Dimensions, Text, Easing, Image, StyleSheet } from 'react-native';
import { authCheck } from './ducks/auth';
import { connect } from 'react-redux';
import LogoW from './assets/images/logo/Logow.png';
import Icon from 'react-native-vector-icons/FontAwesome';

interface IApp {
    authCheck: () => any;
    color?: string;
    size?: number;
    containerStyle?: any;
}

const { width: WIDTH } = Dimensions.get('window');
class App extends PureComponent<IApp, any> {

    constructor (props: any) {
        super(props);
        this.state = {
            spinValue: new Animated.Value(0),
            backSpinValue: new Animated.Value(0)
        };
    }

    public componentDidMount () {
        this.props.authCheck();
        this.startAnimation();
    }

    public render () {

        const {color, size, containerStyle} = this.props;

        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        const backSpin = this.state.backSpinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['360deg', '0deg']
        });

        const animatedStyles = {
            transform: [{rotate: spin}]
        };
        const backAnimatedStyles = {
            transform: [{rotate: backSpin}]
        };

        return (
            <View style={[styles.iconContainer, containerStyle]}>
                <View style={styles.logotype}>
                    <Image source={LogoW}/>
                </View>
                <Animated.View style={[backAnimatedStyles, styles.iconAnimatedView]}>
                    <Icon name={'circle-o-notch'} color={color || '#fff'} size={size ? size/2 : 15}/>
                </Animated.View>
                <Animated.View style={[animatedStyles, styles.iconAnimatedView]}>
                    <Icon name={'circle-o-notch'} color={color || '#fff'} size={size || 30}/>
                </Animated.View>
                <View>
                    <Text style={styles.Title}>Loading, please wait...</Text>
                </View>
            </View>

        );
    }

    public startAnimation = () => {
        Animated.loop(
            Animated.timing(
                this.state.spinValue,
                {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.linear
                }
            )
        ).start();
        Animated.loop(
            Animated.timing(
                this.state.backSpinValue,
                {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.linear
                }
            )
        ).start();
    };

    public stopAnimation = () => {
        Animated.loop(
            Animated.timing(
                this.state.spinValue,
                {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.linear
                }
            )
        ).stop();
        Animated.loop(
            Animated.timing(
                this.state.backSpinValue,
                {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.linear
                }
            )
        ).stop();
    };
}

const styles = StyleSheet.create({
    View: {
        backgroundColor: '#2196F3',
        flex: 1
    },
    Title: {
        textAlign: 'center',
        textAlignVertical: 'top',
        width: WIDTH - 20,
        color: '#fff',
        flex: 1
    },
    logotype: {
        flex: 1,
        justifyContent: 'center'
    },
    iconContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
    },
    iconAnimatedView: {
        position: 'absolute',
        color: '#fff'
    }
});

export default connect(null,
    {
        authCheck
    })(App);

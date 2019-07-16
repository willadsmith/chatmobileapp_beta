import React, { Component } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface ILoader {
    color?: string;
    size?: number;
    containerStyle?: any;
}

class Loader extends Component<ILoader, any> {

    constructor (props: any) {
        super(props);
        this.state = {
            spinValue: new Animated.Value(0),
            backSpinValue: new Animated.Value(0)
        };
    }
    public componentDidMount () {
        this.startAnimation();
    }

    public render () {
        const { color, size, containerStyle } = this.props;

        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        const backSpin = this.state.backSpinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['360deg', '0deg']
        });

        const animatedStyles = {
            transform: [ {rotate: spin} ]
        };
        const backAnimatedStyles = {
            transform: [ {rotate: backSpin} ]
        };

        return (
            <View style={[styles.iconContainer, containerStyle]}>
                <Animated.View style={[backAnimatedStyles, styles.iconAnimatedView]}>
                    <Icon name={'circle-o-notch'} color={color || '#fff'} size={size ? size / 2 : 15}/>
                </Animated.View>
                <Animated.View style={[animatedStyles, styles.iconAnimatedView]}>
                    <Icon name={'circle-o-notch'} color={color || '#fff'} size={size || 30}/>
                </Animated.View>
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
    iconContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
    },
    iconAnimatedView: {
        position: 'absolute',
        color: '#fff'
    },
});

export default Loader;

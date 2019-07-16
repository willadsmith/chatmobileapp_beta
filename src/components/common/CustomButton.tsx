import React, { PureComponent } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import TextSegoe from './TextSegoe';
import { primary } from '../../assets/app.style';
import Loader from './Loader';

interface ICustomButton {
    onPress: any;
    containerStyle?: any;
    textStyle?: any;
    isLoading?: boolean;
}

class CustomButton extends PureComponent<ICustomButton ,any> {

    public render () {
        const {
            onPress,
            containerStyle,
            textStyle,
            isLoading
        } = this.props;

        return (
            <TouchableOpacity
                style={[styles.buttonContainer, containerStyle]}
                onPress={onPress}
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader/>
                ) : (
                    <TextSegoe
                        bold={true}
                        style={[styles.text ,textStyle]}
                    >
                        {this.props.children}
                    </TextSegoe>
                )}
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        backgroundColor: primary,
        height: 41,
        lineHeight: 41,
        width: '100%',
        fontSize: 14,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        color: '#fff'
    }
});


export default CustomButton;

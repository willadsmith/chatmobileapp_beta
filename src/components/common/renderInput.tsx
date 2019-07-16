import React, { Component } from 'react';
import {
    StyleSheet,
    TextInput,
    View,
    TouchableOpacity
} from 'react-native';
import TextSegoe from './TextSegoe';
import IconGenerator from "./IconGenerator";

interface IRenderInput {
    input: {
        onChange: any;
        value: any;
    };
    meta: {
        error: any;
        touched: any;
    };
    title?: string;
    inputStyle?: any;
    containerStyle?: any;
    secureTextEntry?: boolean;
    value: any;
    multiline?: boolean;
}

class RenderInput extends Component<IRenderInput, any> {
    constructor (props: any) {
        super(props);
        this.state = {
            isFocused: false,
            isPasswordHidden: true
        };
    }
    public render () {
        const {
            meta: { error, touched },
            input: { onChange, value },
            title,
            inputStyle,
            containerStyle,
            secureTextEntry,
            ...rest
        } = this.props;
        const { isFocused, isPasswordHidden } = this.state;
        return (
            <View style={containerStyle}>
                {title && (<TextSegoe bold={true} style={styles.title}>{title}</TextSegoe>)}
                <View style={!!secureTextEntry ? styles.passwordContainer : {}}>
                    <TextInput
                        style={[
                            styles.input,
                            inputStyle,
                            isFocused ? styles.inputFocused : {},
                            error && touched ? styles.inputError : {},
                            this.props.multiline ? styles.multiline : {}
                        ]}
                        onChangeText={onChange}
                        {...rest}
                        onFocus={this.toggleFocus}
                        onBlur={this.toggleFocus}
                        secureTextEntry={!!secureTextEntry && isPasswordHidden}
                        value={value}
                    />
                    {!!secureTextEntry && (
                        <TouchableOpacity style={styles.passwordVisibilityToggleContainer} onPress={this.togglePasswordVisibility}>
                            {isPasswordHidden && (<IconGenerator iconType={'eye'}/>)}
                            {!isPasswordHidden && (<IconGenerator iconType={'eye-off'}/>)}
                        </TouchableOpacity>
                    )}

                </View>
                { error && touched && <TextSegoe style={styles.errorText}>{ error }</TextSegoe> }
            </View>
        );
    }

    public togglePasswordVisibility = () => {
        this.setState({
            isPasswordHidden: !this.state.isPasswordHidden
        });
    };
    public toggleFocus = () => {
        this.setState({
            isFocused: !this.state.isFocused
        });
    };
}

const styles = StyleSheet.create({
    passwordContainer: {
        position: 'relative'
    },
    passwordVisibilityToggleContainer: {
        position: 'absolute',
        top: 0,
        right: 0
    },
    input: {
        borderColor: 'black',
        height: 37,
        width: '100%',
        borderWidth: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#5F5F5F',
        fontSize: 16,
        color: '#262628',
        fontFamily: 'SegoeUI'
    },
    inputFocused: {
        borderBottomColor: '#0B0B0B'
    },
    inputError: {
        borderBottomColor: '#FF0000'
    },
    errorText: {
        color: '#FF0000'
    },
    title: {
        fontSize: 14,
    },
    multiline: {
        height: 'auto',
        maxHeight: 100
    }
});


export default RenderInput;

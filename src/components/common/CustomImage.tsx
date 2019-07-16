import React, { PureComponent } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Loader from './Loader';

interface ICustomImage{
    uri: string|null;
    defaultSource: any;
    containerStyle?: any;
    imageStyle?: any;
}

class CustomImage extends PureComponent<ICustomImage, any> {
    constructor (props: any) {
        super(props);
        this.state = {
            status: null,
            source: null,
        };
    }
    public componentDidMount () {
        this.setState({
            source: {
                uri: this.props.uri
            }
        });
    }
    public componentDidUpdate (prevProps: any) {
        if (prevProps.uri !== this.props.uri) {
            this.setState({
                source: {
                    uri: this.props.uri
                }
            });
        }
    }

    public render () {
        const { status, source } = this.state;
        const { imageStyle, containerStyle } = this.props;
        return (
            <View style={[styles.container, containerStyle]}>
                {status !== 'loaded' && (
                    <Loader color={'#07AEED'} containerStyle={styles.loaderContainer}/>
                )}
                <Image
                    onLoad={this.onLoad}
                    onError={this.onError}
                    source={source}
                    style={imageStyle}
                />
            </View>
        );
    }
    public onLoad = () => {
        if (this.state.status !== 'loaded') {
            this.setState({
                status: 'loaded',
            });
        }
    };

    public onError = () => {
        this.setState({
            status: 'loaded',
            source: this.props.defaultSource
        });
    };
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    loaderContainer: {
        position: 'absolute'
    }
});

export default CustomImage;

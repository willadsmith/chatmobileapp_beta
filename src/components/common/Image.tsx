import React, { PureComponent } from 'react';
import { View } from 'react-native';
import Loader from './Loader';

interface IImage{
    url: string;
    defaultUrl: string;
    className?: string;
    onClick?: any;
    whenLoaded?: () => any;
}

class Image extends PureComponent<IImage, any> {
    constructor (props: any) {
        super(props);
        this.state = {
            status: null,
            url: null,
        };
    }
    public componentDidMount () {
        this.setState({
            url: this.props.url
        });
    }
    public componentDidUpdate (prevProps: any) {
        if (prevProps.url !== this.props.url) {
            this.setState({
                url: this.props.url
            });
        }
    }
    public render () {
        const { status } = this.state;
        return (
            <View style={{ position: 'relative', minWidth: '60px', minHeight: '60px' }}>
                {status !== 'loaded' && (<Loader/>)}
            </View>
        );
    }
}

export default Image;

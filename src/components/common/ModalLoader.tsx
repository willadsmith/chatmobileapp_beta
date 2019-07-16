import React, { Component } from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import TextSegoe from './TextSegoe';
import Loader from './Loader';

interface IModalLoader {
    title?: string;
}

class ModalLoader extends Component<IModalLoader, any> {

    public render () {
        const { title } = this.props;
        return (
            <Modal onRequestClose={() => null} visible={true} transparent={true}>
                <View style={styles.container}>
                    <View style={styles.contentContainer}>
                        <Loader
                            color={'#2196F3'}
                            size={50}
                            containerStyle={styles.loaderContainer}
                        />
                        {title && (<TextSegoe style={styles.title}>{title}</TextSegoe>)}
                    </View>
                </View>
            </Modal>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(52, 52, 52, 0.8)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    contentContainer: {
        borderRadius: 10,
        backgroundColor: 'white',
        padding: 25,
        width: '80%',
        minHeight: 100,
        alignItems: 'center',
        justifyContent: 'center'
    },
    loaderContainer: {
        minWidth: 40,
        minHeight: 40
    },
    title: {
        marginTop: 27
    }
});
export default ModalLoader;

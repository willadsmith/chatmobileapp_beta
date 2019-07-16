import React from 'react';
import { StyleSheet, Text } from 'react-native';


const TextSegoe = (props: any) => (
    <Text style={[
        styles.text,
        props.style,
        { fontFamily: props.bold ? 'SegoeUI-Bold' : 'SegoeUI' }
    ]}
    >{props.children}</Text>
);

const styles = StyleSheet.create({
    text: {
        fontSize: 16
    },
});

export default TextSegoe;

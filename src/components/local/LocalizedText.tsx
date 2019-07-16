import PropTypes from 'prop-types';
import React from 'react';

interface ILocalizedText {
    path: string;
}

class LocalizedText extends React.Component<ILocalizedText, any> {

    public static contextTypes = {
        dictionary: PropTypes.object
    };

    public render (): JSX.Element {
        let { dictionary } = this.context;
        const { path } = this.props;

        for (const item of path.split('.')) {
            if (!dictionary[item]) {
                return <span>{ path }</span>;
            }
            dictionary = dictionary[item];
        }
        return dictionary;

    }
}

export default LocalizedText;


// import React, { PureComponent } from 'react';
// import PropTypes from 'prop-types';
//
// interface ILocalizedText {
//     path: string;
// }
//
// class LocalizedText extends PureComponent<ILocalizedText, any> {
//
//     public static contextTypes = {
//         dictionary: PropTypes.object,
//         fallBackDictionary: PropTypes.object
//     };
//
//     public render (): JSX.Element {
//         let { dictionary, fallBackDictionary } = this.context;
//         const { path } = this.props;
//         for (const item of path.split('.')) {
//             if (!dictionary[item] && !fallBackDictionary[item]) {
//                 return <span>{ path }</span>;
//             }
//
//             dictionary = dictionary[item] || null;
//             fallBackDictionary = fallBackDictionary[item] || null;
//         }
//         return dictionary || fallBackDictionary;
//
//     }
// }
//
// export default LocalizedText;

import React, { PureComponent, Fragment } from 'react';
import { getDictionary, getFallbackDictionary } from '@ivcbox/locale';
interface ILocalizedText {
    path: string;
}

class LocalizedText extends PureComponent<ILocalizedText, any> {
    public render () {
        let dictionary = getDictionary();
        let fallBackDictionary = getFallbackDictionary();
        const { path } = this.props;
        for (const item of path.split('.')) {
            if (!dictionary[item] && !fallBackDictionary[item]) {
                return <Fragment>{ path }</Fragment>;
            }

            dictionary = dictionary[item] || null;
            fallBackDictionary = fallBackDictionary[item] || null;
        }
        return dictionary || fallBackDictionary;

    }
}

export default LocalizedText;

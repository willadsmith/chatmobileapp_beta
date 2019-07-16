import React from 'react';
import LocalizedText from '../components/common/LocalizedText';

const expand = (str: any, val: any) => {
    return str.split('.').reduceRight((acc: any, currentValue: any) => {
        return { [currentValue]: acc };
    }, <LocalizedText path={'serverValidation.' + str + '.' + val}/>);
};

export const processErrors = (errors: any) => {
    let result: any = {};
    for (const error of errors) {
        if (error.path.split('.').length > 1) {
            result = Object.assign({}, result, expand(error.path, error.message));
        } else {
            result[error.path] = <LocalizedText path={'serverValidation.' + error.path + '.' + error.message}/>;
        }
    }
    return result;
};

import { Map, OrderedMap } from 'immutable';

export function randomString ($amount = 24) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';

    for (let i = 0; i < $amount; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

export function isJson (item: string) {
    let localItem = typeof item !== 'string'
        ? JSON.stringify(item)
        : item;

    try {
        localItem = JSON.parse(item);
    } catch (e) {
        return false;
    }

    if (typeof localItem === 'object' && localItem !== null) {
        return true;
    }

    return false;
}

export const timeFormatter = (date: any) => {
    const seconds = Math.floor((Number(new Date()) - Number(new Date(date))) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return interval + ` ${interval > 1 ? 'years' : 'year'} ago`;
    }

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval + ` ${interval > 1 ? 'months' : 'month'} ago`;
    }
    interval = Math.floor(seconds / 86400);

    if (interval >= 1) {
        return interval + ` ${interval > 1 ? 'days' : 'day'} ago`;
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval + ` ${interval > 1 ? 'hours' : 'hour'} ago`;
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval + ` ${interval > 1 ? 'minutes' : 'minute'} ago`;
    }

    return 'Just now';
};

export const checkUserRoom  = (roomUsers: any, userId: number) => {
    for (const user of roomUsers) {
        if (user.user.id === userId) {
            return true;
        }
    }
    return false;
};

export const checkIfStringContainsURLs = (str: string) => {
    const pattern = new RegExp('([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?');
    return pattern.test(str);
};
export const checkIfStringIsURL = (str: string) => {
    const pattern = /^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/i;
    return pattern.test(str);
};

export function areObjectsEqual (a: any, b: any) {
    const aProps = Object.getOwnPropertyNames(a);
    const bProps = Object.getOwnPropertyNames(b);
    if (aProps.length !== bProps.length) {
        return false;
    }

    for (const aProp of aProps) {
        const propName = aProp;
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    return true;
}

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export function mapToObj (obj: any) {
    return JSON.parse(JSON.stringify(obj, null, 2));
}

export const checkNested = (objParam: any, ...args: any[]) => {
    const argsArr = Array.prototype.slice.call(args, 0);
    let obj = objParam;
    for (const arg of argsArr) {
        if (!obj || !obj.hasOwnProperty(arg)) {
            return false;
        }
        obj = obj[arg];
    }
    return true;
};


export function mapToArr (obj: any) {
    return obj.valueSeq().toArray();
}

export function arrToMap (arr: any, DataRecord: any = Map, key: string = 'id') {
    return arr.reduce((acc: any, item: any) => {
        const id = typeof item.get !== 'undefined' ? (item.get('id')) : item[key];
        // @ts-ignore
        return acc.set(id, new DataRecord(item));
        // @ts-ignore
    }, new OrderedMap({}));
}

const formatVND = (amount) => {
    if (amount === "" || amount === 0) return "";
    let result = parseInt(amount).toLocaleString('it-IT') + 'đ';
    return result.replace(/\./g, ",").trim();
}

const keysToCamelCase = (obj) => {
    function convertToCamelCase(str) {
        return str.replace(/([-_][a-z])/gi, ($1) => {
            return $1.toUpperCase().replace('-', '').replace('_', '');
        });
    }

    if (Array.isArray(obj)) {
        return obj.map(item => keysToCamelCase(item));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((result, key) => {
            result[convertToCamelCase(key)] = keysToCamelCase(obj[key]);
            return result;
        }, {});
    }
    return obj;
}

const findIconsByKeywords = (icons, input) => {
    return icons.filter(icon => {
        const keywords = icon.keyword.split(/,\s*/);
        for (let keyword of keywords) {
            if (input.toLowerCase().includes(keyword.toLowerCase())) {
                return true;
            }
        }
        return false;
    }).map(icon => icon);
}

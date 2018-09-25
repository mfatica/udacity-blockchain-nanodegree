module.exports.stringToHex = function(s) {
    let str = '';
    for(let i = 0; i < s.length; i++) 
        str += s.charCodeAt(i).toString(16);
    return str;
}

module.exports.hexToString = function(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) 
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
    // https://jsfiddle.net/Guffa/uT2q5/
}
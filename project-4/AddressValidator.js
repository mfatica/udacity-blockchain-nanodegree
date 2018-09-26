/* ===== Address Validator ========================================
|  Methods for validating bitcoin addresses and registration	   |
|  ==============================================================*/

const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

const validationWindowMs = 300 * 1000;
const messageSuffix = "starRegistry";

const addressTimestampMap = {};

function getTimestamp() {
    // divide by 1000 to convert ms -> s
    // and call Math.floor to round to whole seconds
    return Math.floor(Date.now() / 1000);
}

function grantValidation(address) {
    // if we're already validated we want to let it run out
    // but inform the user when the request was made
    if(addressTimestampMap[address]) {
        const requestTimeStamp = addressTimestampMap[address].requestTimeStamp;

        return {
            "address": address,
            "requestTimeStamp": requestTimeStamp,
            "message": `${address}:${requestTimeStamp}:${messageSuffix}`,
            "validationWindow": 300             
        };
    }

    const currentTimestamp = getTimestamp();
    addressTimestampMap[address] = {
        "requestTimeStamp": currentTimestamp,
        "expired": false,
        "validated": false,
        "registered": false
    };

    (function(address) {
        setTimeout(function() {
            console.log("removing " + address);
            if(!addressTimestampMap[address].validated) {
                addressTimestampMap[address].expired = true;
            }
        }, validationWindowMs);
    })(address);

    return {
        "address": address,
        "requestTimeStamp": currentTimestamp,
        "message": `${address}:${currentTimestamp}:${messageSuffix}`
    };
}

function validateSignature(address, signature) {
    if(!addressTimestampMap[address]) {
        return {
            "registerStar": false
        };
    }

    const { requestTimeStamp, expired } = addressTimestampMap[address];

    console.log(addressTimestampMap[address]);

    var message = `${address}:${requestTimeStamp}:${messageSuffix}`;

    var isValidSignature = bitcoinMessage.verify(message, address, signature);

    if(!expired && isValidSignature) {
        addressTimestampMap[address].validated = true;
    }

    return {
        "registerStar": !expired && isValidSignature,
        "status": {
          "address": address,
          "requestTimeStamp": requestTimeStamp,
          "message": message,
          "validationWindow": getTimestamp() - requestTimeStamp,
          "messageSignature": (!expired && isValidSignature) ? "valid" : "invalid"
        }
    };
}

function canRegister(address) {
    if(!addressTimestampMap[address])
        return false;

    const { validated, expired } = addressTimestampMap[address];
    return !expired && validated;
}

function recordRegistration(address) {
    if(!addressTimestampMap[address])
        return;

    delete addressTimestampMap[address];
}

module.exports = {
    grantValidation,
    validateSignature,
    canRegister,
    recordRegistration
};
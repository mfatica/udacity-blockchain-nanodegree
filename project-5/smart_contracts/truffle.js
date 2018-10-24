var HDWalletProvider = require('truffle-hdwallet-provider');

var mnemonic = 'squirrel rotate permit omit risk exchange elder elite imitate few girl kangaroo';

module.exports = {
    networks: {
        development: {
            host: '127.0.0.1',
            port: 8545,
            network_id: "*"
        },
        rinkeby: {
            provider: function () {
                return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/3ebda60de3174fd5b343d9f0e708a0c9')
            },
            network_id: 4,
            gas: 4500000,
            gasPrice: 10000000000,
        }
    }
};
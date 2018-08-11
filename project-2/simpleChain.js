/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const Block = require('./Block');

class Blockchain{
  constructor(){
    // constructor does not support async/await, so I moved genesis block logic outside
  }

  // Add new block
  async addBlock(newBlock){
    var height = await this.getBlockHeight()+1;

    // Block height
    newBlock.height = height;
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);

    // previous block hash
    if(height>0){
      newBlock.previousBlockHash = (await this.getBlock(height-1)).hash;
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
      
    // persist block in leveldb
    await db.put(newBlock.height, JSON.stringify(newBlock));
  }

  // Get block height
    async getBlockHeight(){
      return new Promise(function(resolve, reject) {
        var height = -1;
        db.createKeyStream()
          .on('data', ()=>{height++})
          .on('end', ()=>resolve(height));
      });
    }

    // get block
    async getBlock(blockHeight){
      return JSON.parse(await db.get(blockHeight));
    }

    // validate block
    async validateBlock(blockHeight){
      // get block object
      let block = await this.getBlock(blockHeight);
      // get block hash
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash===validBlockHash) {
          console.log('Block #'+blockHeight+' valid.');
          return true;
        } else {
          console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
          return false;
        }
    }

   // Validate blockchain
    async validateChain(){
      let errorLog = [];
      var height = await this.getBlockHeight();
      for (var i = 0; i <= height; i++) {
        // validate block
        if (!(await this.validateBlock(i)))errorLog.push(i);

        // last block has no hash link to validate
        if (i == height) continue;

        // compare blocks hash link
        let blockHash = (await this.getBlock(i)).hash;
        let previousHashFromNextBlock = (await this.getBlock(i+1)).previousBlockHash;
        if (blockHash!==previousHashFromNextBlock) {
          errorLog.push(i);
        }
      }
      if (errorLog.length>0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
      } else {
        console.log('No errors detected');
      }
    }
}

console.log('## testing..');

const testInducedError = true;

var blockchain = new Blockchain();

(async () => {
  var height = await blockchain.getBlockHeight();
  
  // if we don't have a chain in storage, start a new one and add some blocks
  if (height < 0) {
    console.log("## Initializing new chain with genesis block");
    await blockchain.addBlock(new Block("First block in the chain - Genesis block"));

    for(var i = 0; i < 3; i++) {
      await blockchain.addBlock(new Block("test--" + i));
    }
  }

  await blockchain.validateChain();

  if(testInducedError) {
    console.log('## testing induced error');
    var block = await blockchain.getBlock(1);
    block.data = "bad data";

    // put directly, otherwise blockchain.addBlock will add this as a new block
    await db.put(block.height, JSON.stringify(block));

    console.log('## blockchain should now have an error at block 1:');
    await blockchain.validateChain();
  }
})();
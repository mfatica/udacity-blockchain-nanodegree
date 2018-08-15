const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const { Blockchain, Block } = require('./Blockchain');
const blockchain = new Blockchain();

app.get('/blocks', async (req, res) => {
    try {
        const height = await blockchain.getBlockHeight();
        const blocks = [];
    
        for(let i = 0; i <= height; i++) {
            blocks.push(await blockchain.getBlock(i));
        }
    
        res.send(blocks);
    } catch(error) {
        console.log(error);
        res.send("Unable to retrieve blockchain");
    }
});

app.get('/blocks/:BLOCK_HEIGHT', async (req, res) => {
    try {
        res.send(await blockchain.getBlock(req.params.BLOCK_HEIGHT));
    } catch(error) {
        console.log(error);
        res.send("No block found at height " + req.params.BLOCK_HEIGHT);
    }
});

app.post('/blocks', async (req, res) => {
    try {
        res.send(await blockchain.addBlock(new Block(req.body.body)));
    } catch(error) {
        console.log(error);
        res.send("Unable to add new block");
    }
});

app.listen(8000, async () => {
    const height = await blockchain.getBlockHeight();
    
    // if we don't have a chain in storage, start a new one and add some blocks
    if (height < 0) {
      console.log("## Initializing new chain with genesis block");
      await blockchain.addBlock(new Block("First block in the chain - Genesis block"));
    }
  
    await blockchain.validateChain();

    console.log("listening on port 8000");
});
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const { Blockchain, Block } = require('./Blockchain');
const blockchain = new Blockchain();

const { grantValidation, validateSignature, canRegister, recordRegistration } = require('./AddressValidator');
const { stringToHex } = require('./utilities'); 

app.post('/requestValidation', async (req, res) => {
    try {
        res.send(grantValidation(req.body.address));
    } catch(error) {
        res.send("Invalid request!" + error);
    }
});

app.post('/message-signature/validate', async (req, res) => {
    try {
        res.send(validateSignature(req.body.address, req.body.signature));
    } catch(error) {
        res.send("Invalid request!" + error);
    }
});

app.post('/block', async (req, res) => {
    try {
        if( 
            !("address" in req.body) ||
            !("star" in req.body) ||
            !("dec" in req.body.star) ||
            !("ra" in req.body.star) ||
            !("story" in req.body.star)
         ) {
                return res.send("Invalid request! Body must include address and star information");
            }

        if(!canRegister(req.body.address))
        {
            return res.send("You must validate before registering a star");
        }

        const starBlock = {
          address: req.body.address,
          star: {
              dec: req.body.star.dec,
              ra: req.body.star.ra,
              story: stringToHex(req.body.star.story.substring(0,500)),
              // optional
              cen: req.body.star.cen,
              mag: req.body.star.mag
          }  
        };

        recordRegistration(req.body.address);
        res.send(await blockchain.addBlock(new Block(starBlock)));
    } catch(error) {
        console.log(error);
        res.send("Unable to add new block");
    }
});

app.get('^/stars/:HASH(hash:([a-zA-Z0-9]+)$)', async (req, res) => {
    var hash = req.params[0];
    res.send(await blockchain.getBlockByHash(hash));
});

app.get('^/stars/:ADDRESS(address:([a-zA-Z0-9]+)$)', async (req, res) => {
    var address = req.params[0];
    res.send(await blockchain.getBlocksForAddress(address));
});

app.get('/blocks', async (req, res) => {
    try {
        const height = await blockchain.getBlockHeight();
        const blocks = [];
    
        for(let i = 0; i <= height; i++) {
            blocks.push(await getBlock(i));
        }
    
        res.send(blocks);
    } catch(error) {
        console.log(error);
        res.send("Unable to retrieve blockchain");
    }
});

app.get('/block/:HEIGHT', async (req, res) => {
    try {
        res.send(await getBlock(req.params.HEIGHT));
    } catch(error) {
        console.log(error);
        res.send("No block found at height " + req.params.HEIGHT);
    }
});

app.listen(8000, async () => {
    const height = await blockchain.getBlockHeight();
    
    // if we don't have a chain in storage, start a new one and add some blocks
    if (height < 0) {
      console.log("## Initializing new chain with genesis block");
      await blockchain.addBlock(new Block({
        "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
        "star": {
          "dec": "-26° 29'\'' 24.9",
          "ra": "16h 29m 1.0s",
          "story": stringToHex("Found star using https://www.google.com/sky/")
        }
      }));
    }
  
    await blockchain.validateChain();

    console.log("listening on port 8000");
});

async function getBlock(height) {
    const block = await blockchain.getBlock(height);
    return block;
}
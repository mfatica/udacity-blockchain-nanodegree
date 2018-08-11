# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the [Node.js® web site](https://nodejs.org/en/).

### Configuring your project

- Use NPM to install project dependencies.
```
npm install
```

## Testing

To test code:

1: Open a command prompt or shell terminal after following instructions above.
2: Run the code with `node ./simpleChain.js` to execute included testing code.

Here is the test code for reference:

```
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
```

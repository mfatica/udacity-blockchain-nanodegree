# Simple Blockchain

Blockchain has the potential to change the way that the world approaches data. This simple blockchain provides a RESTful API to get blocks and add new blocks.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the [Node.js® web site](https://nodejs.org/en/).

### Running the application

- Use NPM to install project dependencies.
```
npm install
```

Start the express app with node:
```
node .\app.js
```
The site is now running on localhost:8000!

### API Documentation

The provided API is powered by [express.js](https://expressjs.com/), a fast, unopinionated, minimalist web framework for Node.js.

#### Endpoints

    GET /blocks
        Returns a JSON array of all blocks in the chain

    GET /blocks/:BLOCK_HEIGHT
        Returns a block at a specific height

    POST /block
        Adds a new block to the chain

    POST /requestValidation
        This signature proves the users blockchain identity. Upon validation of this identity, the user should be granted access to register a single star.

    POST /message-signature/validate
        After receiving the response, users will prove their blockchain identity by signing a message with their wallet. Once they sign this message, the application will validate their request and grant access to register a star.

    GET /stars/address:[ADDRESS]
        Get star block(s) by wallet address 

    GET /stars/hash:[HASH]
        Get star block by hash

#### Examples

GET response example

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json; charset=utf-8
    Content-Length: 220
    ETag: W/"dc-tUgBeS30uDNl3wc12Ei3lohPczw"
    Date: Wed, 15 Aug 2018 00:10:30 GMT
    Connection: keep-alive
    {
        "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
        "height": 1,
        "body": {
            "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
            "star": {
            "ra": "16h 29m 1.0s",
            "dec": "-26° 29' 24.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
            }
        },
        "time": "1532296234",
        "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
    }

#### Testing with CURL

##### GET blocks
```
# Get all the blocks
curl "http://localhost:8000/blocks"

#Get a single block
curl "http://localhost:8000/blocks/0"
```
##### POST block
```
curl -X "POST" "http://localhost:8000/block" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "star": {
    "dec": "-26° 29'\'' 24.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
  }
}'
```
##### Validation
First request timestamp for validation
```
curl -X "POST" "http://localhost:8000/requestValidation" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
}'

# Response
{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "requestTimeStamp": "1532296090",
  "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
  "validationWindow": 300
}
```
Then submit a request with the signed message
```
curl -X "POST" "http://localhost:8000/message-signature/validate" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "signature": "H6ZrGrF0Y4rMGBMRT2+hHWGbThTIyhBS0dNKQRov9Yg6GgXcHxtO9GJN4nwD2yNXpnXHTWU9i+qdw5vpsooryLU="
}'

# Response
{
  "registerStar": true,
  "status": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "requestTimeStamp": "1532296090",
    "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
    "validationWindow": 193,
    "messageSignature": "valid"
  }
}
```
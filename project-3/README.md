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

    GET /chain
        Returns a JSON array of all blocks in the chain

    GET /block/:BLOCK_HEIGHT
        Returns a block at a specific height

    POST /block
        Adds a new block to the chain

#### Examples

GET response example

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json; charset=utf-8
    Content-Length: 220
    ETag: W/"dc-tUgBeS30uDNl3wc12Ei3lohPczw"
    Date: Wed, 15 Aug 2018 00:10:30 GMT
    Connection: keep-alive
    {"hash":"49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3","height":0,"body":"First block in the chain - Genesis block","time":"1530311457","previousBlockHash":""

POST response example 

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json; charset=utf-8
    Content-Length: 220
    ETag: W/"dc-AdIojIo3GPDA2jFxULURNxFkPUg"
    Date: Wed, 15 Aug 2018 00:12:26 GMT
    Connection: keep-alive
    {"hash":"46e4939c6312b7108a70035f6fca4304fbb88132dd11daafd417407e41cd62e2","height":3,"body":"Testing w/ curl 3","time":"1534291946", previousBlockHash":"93f995ca7b0670ad5592ce598722176dc156f1065d99b70b7aa45db072ad7b9b"}

#### Testing with CURL

##### GET block
```
curl "http://localhost:8000/block/0"
```
##### POST block
```
curl -X "POST" "http://localhost:8000/block" \
     -H 'Content-Type: application/json' \
     -d $'{
  "body": "Testing block with test string data"
}'
```
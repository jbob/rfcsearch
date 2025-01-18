# RFC Search

Search all the RFCs with Typesense and Instantsearch.js

## Requirements

- Docker
- Nodejs (optionally, or docker-compose)

## How-To (without docker)

- This requires a Nodejs installation
- Download all the RFCs: https://www.rfc-editor.org/in-notes/tar/RFC-all.tar.gz
- Extract the archive to public/rfcs/ (once extracted, the files will need ~2GB)
- Copy .env.example to .env and make adjustments as neccessary
- Run `./typesenseserver.sh` to start a Typesense server instance via docker and create the typesense-data directory  
  This will need another ~1GB
- In a second termianl run `npm install`
- Run `node bulkImport.js` to import everything from public/rfcs/ into Typesense
- Wait
- Run `node index.mjs server` and visit e.g. http://localhost:3000, depending on your setup

## How-To (with docker)

- Download all the RFCs: https://www.rfc-editor.org/in-notes/tar/RFC-all.tar.gz
- Extract the archive to public/rfcs/ (once extracted, the files will need ~2GB)
- Copy .env.example to .env and make adjustments as neccessary
- Run `./typesenseserver.sh` to start a Typesense server instance via docker and create the typesense-data directory  
  This will need another ~1GB
- In a second terminal run `docker build -t rfcsearch .`
- Run `docker-compose up`
- In a third terminal run `docker run --rm --network rfcsearch_default -v ./public/rfcs:/app/public/rfcs rfcsearch:latest bulkImport.mjs`
- Wait and visist e.g. http://localhost:3000, depending on your setup

# NFT Art Generator and Minter project

## Prerequisites

* An infura.io dedicated gateway (detailed [here](https://docs.infura.io/infura/networks/ipfs/how-to/access-ipfs-content/dedicated-gateways))
* MongoDB database
* Docker installed on local machine
* .env.dev AND .env.prod files with the following environment variables:
	* `REACT_APP_DNS` this will be your website name when deployed in production environment
	* `REACT_APP_SERVER_URL` e.g. http://localhost:8080
	* `REACT_APP_INFURA_IPFS_PROJECT_URL` in the format `https://<subdomain>.infura-ipfs.io/ipfs` where subdomain is the name provided when creating the dedicated gateway
	* `REACT_APP_FACTORY_CONTRACT_ADDRESS` e.g. `0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`
	* `JWT_EXPIRY` e.g. `43200s` for a twelve hour expiry
	* `JWT_SECRET` e.g. `someSecretToKeepTokensSafe99!`
	* `MONGODB_CONNECTION_STRING` e.g. `mongodb+srv://...` (this will be provided when creating the database)
	* `IPFS_PROJECT_ID` - infura project ID
	* `IPFS_PROJECT_SECRET` - infura project secret

	
## Usage

### Running development environment locally
How to start containers:

```
docker-compose -f docker-compose.dev.yaml up -d --build --remove-orphans 
```
How to start stop containers:

```
docker-compose -f docker-compose.dev.yaml down --remove-orphans  
```

### Running prod environment locally
How to start containers:

```
docker-compose -f docker-compose.prod.yaml up -d --build --remove-orphans 
```
How to start stop containers:

```
docker-compose -f docker-compose.prod.yaml down --remove-orphans  
```
## Deployment instructions

### Deploying the app
1. Build the production containers using:
	``docker-compose -f docker-compose.prod.yaml build``
2. Push images ``client-prod-image`` and ``server-prod-image`` to remote container registry of choice
3. Assemble cloud resources (ECS cluster etc.) providing the pushed images as references to the appropriate containers

### Deploying the factory contract
To deploy the factory contract you would need an IDEA, capable of compiling solidity.
You would need to follow the next steps (For example we used Remix IDEA but these apply to all IDEA [link](https://remix.ethereum.org/)):
1. Open Remix and create a file with the name "Factory.sol".
2. Copy and paste the contents of the "factory.sol" file, under "client/src/contract" directory of this project.
3. Save and on compile tab select 8.4.0 solidity version or greater.
4. Select "Compile Factory.sol".
5. After it compiles, go to the deployment tab and 
under the "Environment" from the drop-down menu select 
"Injected Provider - Metamask". (Assuming you are using Metamask).
6. Under "Contract" select frrom the drop-down menu "NftFactory - contracts/Factory.sol".
7. Click on "Deploy" button and sign the transaction with your wallet. You should see the transaction hash and status.

### Verifying and Publishing the factory contract
There are many ways to verify the contract on-chain.
We will examine one of them on the following steps:
1. Open etherscan and search the contract address of the deployed factory.
2. Select the "Contract" tab and then click on "Verify and Publish" link.
3. Under "Please select Compiler Type" from the drop-down menu select "Solidity (Single file)".
4. Under "Please select Compiler Version" from the drop-down menu select "v0.8.4+commit.c7e474f2". 
5. Under "Please select Open Source License Type" from the drop-down menu select "3) MIT License (MIT)".
6. Check "I agree to the terms of service" checkbox and click "Continue".
7. Under "Enter the Solidity Contract Code below" in the input box, copy code from the "flatFactory.sol" file, 
under "client/src/contract" directory of this project and paste in the box.
8. Click the "Verify and Publish" button and once it is completed the factory contract
is verified and published on-chain.

## Acknowledgements
* Daniel Bound (s3719027@student.rmit.edu.au)
* Michael Lyberopoulos (s3787260@student.rmit.edu.au)
* Tiana Chimbaikar (s3908853@student.rmit.edu.au)
* Jun Cao (s3712883@student.rmit.edu.au)# nft-minter

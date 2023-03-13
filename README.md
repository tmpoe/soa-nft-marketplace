# soa-nft-marketplace

A "state of the art" NFT marketplace by adhering to learnt best practices etc

## Goals

I have done a very rough NFT marketplace without any knowledge on best practices etc. It is highly un-optimised, the tooling is not the best and in most of the cases I had to do nasty shortcuts.

After finishing the giga block chain development course I want to have a neat NFT marketplace, that follows best practices, secure, well tested, automatically deploy and so on.

## Features

### NFTs

There are pre-defined types of NFTs.

NFTs are mintable by anyone.

A newly minted NFT has an owner, an id that is incremented by minting a new one, a picture and a type (latter two are pre-defined).

A newly minted NFT gets a type and depending on the type a picture randomly with different probabilities.

NFTs can change owners.

### Marketplace

The site has a homepage with a carousel of x number of listed NFTs.

The site has a page for checking a user’s NFTs.

Depending on whether a user checks their or others’s NFTs the text in the heading is customized - your vs xy’s NFTs.

The site has a page where the user can check, cancel and update a listing.

Users can mint NFTs.

Users can list NFTs for ETH.

Users can cancel listings.

Users can change the price of their listings.

Users can set the price of the NFT at the time of listing.

Users can buy listed NFTs they don’t own.

Users can list NFTs for dollars (?).

### Technical

Stack:

- typescript
- hardhat - eth dev tool
- openzeppelin - smart contracts
- chainlink - oracles
- node - server
- yarn - package mgr
- nextjs - frontend base
- the graph or moralis (more material) - event indexing
- web3uikit - web3 specific frontend
- tailwind - CSS
- slither, solc select - security
- solidity linter
- git - 2 repos (front, back)

Reference: https://github.com/smartcontractkit/full-blockchain-solidity-course-js

Deployment is automatized with scripts.

Deployments are verified through etherscan

Oracles are used for randomness and price queries.

Instead of internalizing everything in smart contracts like in the “original” emit events that can be indexed.

Events: minted, listed, cancelled, bought

Use audited smart contract wherever possible.

Use web3uikit for basic web3 features such as wallet handling.

Test everything in backend.

Avoid direct CSS if possible and lean on tailwind

Smart contracts are proxied.

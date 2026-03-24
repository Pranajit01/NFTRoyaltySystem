# NFTRoyaltySystem
# NFT Royalty System on Stellar Soroban

## 🚀 Project Description

This project implements a basic NFT Royalty System using Soroban smart contracts on the Stellar blockchain. The goal is to ensure that NFT creators receive a percentage of revenue from secondary sales.
<img width="1920" height="925" alt="Screenshot 2026-03-24 142022" src="https://github.com/user-attachments/assets/af389f18-e14a-4d09-ba50-a0b9826ec45a" />


## 📌 What it does

- Allows minting NFTs with royalty information
- Stores creator address and royalty percentage
- Calculates royalty amount during resale
- Provides a simple on-chain royalty tracking system

## ✨ Features

- 🔹 NFT minting with royalty percentage
- 🔹 Creator ownership tracking
- 🔹 Royalty calculation based on sale price
- 🔹 Lightweight and efficient Soroban contract
- 🔹 Designed for integration with NFT marketplaces

## ⚙️ How it works

1. Creator mints an NFT with a royalty percentage
2. NFT data is stored on-chain
3. During resale, royalty is calculated using:
   - `royalty = (sale_price × percentage) / 100`
4. Marketplace can use this value to distribute earnings

## 🔗 Deployed Smart Contract Link

> https://stellar.expert/explorer/testnet/contract/CAWAZ5ZEPRUHCHVHUZ3KDI4425B66P762WMZR2XYWUHL6CV7NX264ZIK

## 🛠 Tech Stack

- Rust (Soroban SDK)
- Stellar Blockchain
- Smart Contracts

## 📈 Future Improvements

- Enforce royalty payments during transfers
- Integrate with NFT marketplace
- Add metadata support (IPFS)
- Support multiple royalty recipients

## 👤 Author

Pranajit Das

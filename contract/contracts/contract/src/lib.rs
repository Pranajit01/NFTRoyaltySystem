#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Env, Address, Symbol
};

#[contracttype]
#[derive(Clone)]
pub struct NFT {
    pub creator: Address,
    pub royalty_percentage: u32, // e.g., 5 = 5%
}

#[contracttype]
pub enum NFTRegistry {
    NFT(u32),
}

#[contract]
pub struct RoyaltyNFTContract;

#[contractimpl]
impl RoyaltyNFTContract {

    // Mint NFT with royalty
    pub fn mint_nft(env: Env, nft_id: u32, creator: Address, royalty_percentage: u32) {
        creator.require_auth();

        if royalty_percentage > 100 {
            panic!("Royalty cannot exceed 100%");
        }

        let nft = NFT {
            creator,
            royalty_percentage,
        };

        env.storage().instance().set(&NFTRegistry::NFT(nft_id), &nft);
    }

    // Get NFT details
    pub fn get_nft(env: Env, nft_id: u32) -> NFT {
        env.storage()
            .instance()
            .get(&NFTRegistry::NFT(nft_id))
            .unwrap()
    }

    // Calculate royalty on sale
    pub fn calculate_royalty(env: Env, nft_id: u32, sale_price: i128) -> i128 {
        let nft: NFT = env.storage()
            .instance()
            .get(&NFTRegistry::NFT(nft_id))
            .unwrap();

        (sale_price * nft.royalty_percentage as i128) / 100
    }
}
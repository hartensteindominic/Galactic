const express = require('express');
const router = express.Router();

// In-memory storage for NFT data (DEMO ONLY - use a database in production)
// WARNING: All data will be lost on server restart
const nftGardens = new Map();
let tokenIdCounter = 1;

// Helper function to calculate garden rarity
function calculateRarity(gardenData) {
    const treeCount = gardenData.trees ? gardenData.trees.length : 0;
    const flowerCount = gardenData.flowers ? gardenData.flowers.length : 0;
    const totalElements = treeCount + flowerCount;
    
    // Simple rarity system based on total elements
    if (totalElements >= 300) return 'Legendary';
    if (totalElements >= 250) return 'Epic';
    if (totalElements >= 200) return 'Rare';
    return 'Common';
}

// Helper function to generate mock IPFS hash (DEMO ONLY)
// WARNING: This creates fake IPFS URIs. Implement real IPFS integration for production.
function generateIPFSHash() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let hash = 'Qm';
    for (let i = 0; i < 44; i++) {
        hash += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return hash;
}

// POST /api/nft/mint-garden - Mint garden as NFT with metadata
router.post('/mint-garden', async (req, res) => {
    try {
        const { address, gardenData, metadata } = req.body;
        
        if (!address) {
            return res.status(400).json({ error: 'Wallet address is required' });
        }
        
        if (!gardenData) {
            return res.status(400).json({ error: 'Garden data is required' });
        }
        
        // Calculate rarity
        const rarity = calculateRarity(gardenData);
        
        // Generate token ID
        const tokenId = tokenIdCounter++;
        
        // Create NFT metadata
        const nftMetadata = {
            name: metadata?.name || `Galactic Garden #${tokenId}`,
            description: metadata?.description || 'A unique procedurally generated garden in the Infinite Galactic Garden metaverse',
            image: metadata?.image || `https://galactic-garden.io/preview/${tokenId}.png`,
            attributes: [
                {
                    trait_type: 'Trees',
                    value: gardenData.trees?.length || 0
                },
                {
                    trait_type: 'Flowers',
                    value: gardenData.flowers?.length || 0
                },
                {
                    trait_type: 'Rarity',
                    value: rarity
                },
                {
                    trait_type: 'Created',
                    value: new Date().toISOString()
                }
            ],
            properties: {
                garden_data: gardenData
            }
        };
        
        // Mock IPFS upload (in production, actually upload to IPFS)
        const ipfsHash = generateIPFSHash();
        const metadataURI = `ipfs://${ipfsHash}`;
        
        // Store NFT data
        const nftData = {
            tokenId: tokenId,
            owner: address,
            metadata: nftMetadata,
            metadataURI: metadataURI,
            rarity: rarity,
            mintedAt: Date.now(),
            gardenData: gardenData
        };
        
        // Store by token ID
        nftGardens.set(tokenId, nftData);
        
        // Also store by address for easy lookup
        const ownerKey = `owner_${address.toLowerCase()}`;
        const ownerGardens = nftGardens.get(ownerKey) || [];
        ownerGardens.push(tokenId);
        nftGardens.set(ownerKey, ownerGardens);
        
        console.log(`Minted garden NFT #${tokenId} for ${address} (${rarity})`);
        
        res.json({
            success: true,
            tokenId: tokenId,
            metadataURI: metadataURI,
            rarity: rarity,
            message: `Successfully minted ${rarity} garden NFT #${tokenId}!`
        });
    } catch (error) {
        console.error('Error minting garden:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// GET /api/nft/my-gardens/:address - Get user's NFT gardens
router.get('/my-gardens/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        if (!address) {
            return res.status(400).json({ error: 'Wallet address is required' });
        }
        
        const ownerKey = `owner_${address.toLowerCase()}`;
        const tokenIds = nftGardens.get(ownerKey) || [];
        
        // Get full garden data for each token
        const gardens = tokenIds.map(tokenId => {
            const garden = nftGardens.get(tokenId);
            if (!garden) return null;
            
            // Return without the full garden data to keep response size small
            return {
                tokenId: garden.tokenId,
                name: garden.metadata.name,
                description: garden.metadata.description,
                image: garden.metadata.image,
                rarity: garden.rarity,
                mintedAt: garden.mintedAt,
                attributes: garden.metadata.attributes
            };
        }).filter(g => g !== null);
        
        res.json({
            success: true,
            address: address,
            count: gardens.length,
            gardens: gardens
        });
    } catch (error) {
        console.error('Error fetching gardens:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// GET /api/nft/load-garden/:tokenId - Load garden from NFT
router.get('/load-garden/:tokenId', async (req, res) => {
    try {
        const tokenId = parseInt(req.params.tokenId);
        
        if (isNaN(tokenId)) {
            return res.status(400).json({ error: 'Invalid token ID' });
        }
        
        const garden = nftGardens.get(tokenId);
        
        if (!garden) {
            return res.status(404).json({ 
                success: false,
                error: 'Garden not found' 
            });
        }
        
        res.json({
            success: true,
            tokenId: tokenId,
            metadata: garden.metadata,
            gardenData: garden.gardenData,
            owner: garden.owner,
            rarity: garden.rarity,
            mintedAt: garden.mintedAt
        });
    } catch (error) {
        console.error('Error loading garden:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// GET /api/nft/stats - Get NFT statistics
router.get('/stats', async (req, res) => {
    try {
        // Count total NFTs (excluding owner keys)
        const totalNFTs = Array.from(nftGardens.keys())
            .filter(key => typeof key === 'number')
            .length;
        
        // Count by rarity
        const rarityCount = {
            Common: 0,
            Rare: 0,
            Epic: 0,
            Legendary: 0
        };
        
        nftGardens.forEach((value, key) => {
            if (typeof key === 'number' && value.rarity) {
                rarityCount[value.rarity] = (rarityCount[value.rarity] || 0) + 1;
            }
        });
        
        res.json({
            success: true,
            totalNFTs: totalNFTs,
            rarityDistribution: rarityCount
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;

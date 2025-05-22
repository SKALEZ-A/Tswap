import Dex from "./components/Dex";
import { useState, useEffect } from "react";
import { Spinner, Flex } from "@chakra-ui/react";
import { DeDustClient } from '@dedust/sdk';
import CircularText from "./components/Preloader";
import axios from 'axios';

// Alternative TON API endpoints
const TON_API_ENDPOINTS = {
  DEDUST: 'https://api.dedust.io',
  TONAPI: 'https://tonapi.io/v2',
  TONCENTER: 'https://toncenter.com/api/v2',
  TONWHALES: 'https://tonwhales.com/api/v2'
};

export default function DexPage() {
  const [coins, setCoins] = useState(null);
  const [loading, setLoading] = useState(true);

  const getPools = async (retries = 3, apiEndpointIndex = 0) => {
    try {
      // List of API endpoints to try in order
      const apiEndpoints = [
        TON_API_ENDPOINTS.DEDUST,
        TON_API_ENDPOINTS.TONAPI + '/dex/pools',
        TON_API_ENDPOINTS.TONCENTER + '/pools',
        TON_API_ENDPOINTS.TONWHALES + '/dex/pools'
      ];
      
      // If we've tried all endpoints, start over with the first one
      const currentEndpoint = apiEndpoints[apiEndpointIndex % apiEndpoints.length];
      console.log(`Trying API endpoint: ${currentEndpoint}`);
      
      // Create DeDustClient with the current endpoint
      const dedustClient = new DeDustClient({ 
        endpointUrl: currentEndpoint,
        timeout: 60000 // 60 seconds timeout
      });
      
      // Use Promise.race to implement a custom timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API request timed out')), 15000); // 15 second timeout
      });
      
      // Try to get pools from the current endpoint
      let pools = [];
      try {
        // If using DeDust endpoint
        if (currentEndpoint.includes('dedust')) {
          const poolsPromise = dedustClient.getPools();
          pools = await Promise.race([poolsPromise, timeoutPromise]) || [];
        } 
        // If using other endpoints, use direct axios calls with appropriate path structure
        else {
          const response = await Promise.race([
            axios.get(`${currentEndpoint}`, { timeout: 15000 }),
            timeoutPromise
          ]);
          
          if (response && response.data) {
            // Different APIs might have different response structures
            // Handle each one appropriately
            if (currentEndpoint.includes('tonapi')) {
              pools = response.data.pools || [];
            } else if (currentEndpoint.includes('toncenter')) {
              pools = response.data.result || [];
            } else {
              pools = response.data || [];
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching pools from ${currentEndpoint}:`, error);
        
        // Try the next API endpoint
        if (apiEndpointIndex < apiEndpoints.length - 1) {
          console.log(`Trying next API endpoint...`);
          return getPools(retries, apiEndpointIndex + 1);
        }
        
        // If we've tried all endpoints and still have retries left
        if (retries > 0) {
          const delay = Math.pow(2, 4-retries);
          console.log(`Retrying in ${delay}s... (${4-retries})`);
          await new Promise(resolve => setTimeout(resolve, delay * 1000));
          return getPools(retries - 1, 0); // Start over with the first endpoint
        }
        
        // Last resort: try to get pools directly from TON blockchain
        try {
          console.log('Attempting direct blockchain query for pools...');
          // This would be a direct TON blockchain query implementation
          // For now, we'll throw to indicate failure
          throw new Error('Direct blockchain query not implemented');
        } catch (blockchainError) {
          console.error('Failed to query blockchain directly:', blockchainError);
          return [];
        }
      }
      
      const filteredPools = pools.filter(pool =>
        parseInt(pool.totalSupply) > 10 &&
        Array.isArray(pool.assets) &&
        pool.assets.length > 0 &&
        pool.assets[0] &&
        pool.assets[0].metadata
      );
      
      const uniqueNamesWithImages = new Map();
      filteredPools.forEach(pool => {
        const metadata = pool.assets[0].metadata;
        const address = pool.assets[0].address;
        if (metadata) {
          const name = metadata.name;
          const imageUrl = metadata.image;
          const symbol = metadata.symbol;
          const contractAddress = address;
          const combinedInfo = { imageUrl, symbol, contractAddress };
          if (!uniqueNamesWithImages.has(name)) {
            uniqueNamesWithImages.set(name, combinedInfo);
          }
        }
      });
  
      const uniqueNamesArray = Array.from(uniqueNamesWithImages, ([name, info]) => ({ name, ...info }));
      
      // Add TON as the first token if it's not already in the list
      const hasTon = uniqueNamesArray.some(token => token.contractAddress === "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c");
      if (!hasTon) {
        uniqueNamesArray.unshift({
          name: "Toncoin",
          symbol: "TON",
          contractAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
          imageUrl: "https://assets.dedust.io/images/ton.webp"
        });
      }
      
      // Add NOT if it's not in the list
      const hasNot = uniqueNamesArray.some(token => 
        token.contractAddress === "EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT" || 
        token.symbol === "NOT"
      );
      if (!hasNot) {
        uniqueNamesArray.push({
          name: "Notcoin",
          symbol: "NOT",
          contractAddress: "EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT",
          imageUrl: "https://assets.dedust.io/images/not.webp"
        });
      }
      
      setCoins(uniqueNamesArray);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pools:", error);
      
      // If API fails, use a fallback list of common tokens
      if (retries <= 0) {
        const fallbackTokens = [
          {
            name: "Toncoin",
            symbol: "TON",
            contractAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
            imageUrl: "https://assets.dedust.io/images/ton.webp"
          },
          {
            name: "Notcoin",
            symbol: "NOT",
            contractAddress: "EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT",
            imageUrl: "https://assets.dedust.io/images/not.webp"
          },
          {
            name: "Bolt",
            symbol: "BOLT",
            contractAddress: "EQB-MPwrd1G6WKNkLz_VnV7-yWQQvB2i-RoVxTnv_lQJjNxB",
            imageUrl: "https://assets.dedust.io/images/bolt.webp"
          },
          {
            name: "Scale",
            symbol: "SCALE",
            contractAddress: "EQDnBMrXk_dM8FkMirr5JjYyYXXjEQa3hvV5-AYT8Hre22kz",
            imageUrl: "https://assets.dedust.io/images/scale.webp"
          }
        ];
        
        setCoins(fallbackTokens);
        setLoading(false);
        return;
      }
      
      // Retry with exponential backoff
      const retryDelay = Math.pow(2, 3 - retries) * 1000; // 1s, 2s, 4s
      console.log(`Retrying in ${retryDelay/1000}s... (${3 - retries + 1})`);
      setTimeout(() => getPools(retries - 1), retryDelay);
    }
  }

  useEffect(() => {
    getPools();
  }, []);

  return (
    <main>
      {loading ? (
        <Flex
          height="100vh"
          alignItems="center"
          justifyContent="center"
        bg={"#000000"}
        
          
        >
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        // </Flex>

        // <CircularText/>
      ) : (
        <>
        
        <Dex coins={coins} />
  
        </>
      )}
    </main>
  );
} 
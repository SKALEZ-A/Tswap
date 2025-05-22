import Dex from "@/components/DexClient";
import { useState, useEffect } from "react";
import { Spinner, Flex } from "@chakra-ui/react";
import { DeDustClient } from '@dedust/sdk';
import CircularText from "@/components/Preloader";
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
      // Immediately use fallback tokens to avoid network errors
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
        },
        {
          name: "jUSDT",
          symbol: "jUSDT",
          contractAddress: "EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA",
          imageUrl: "https://assets.dedust.io/images/usdt.webp"
        },
        {
          name: "Tegro",
          symbol: "TGR",
          contractAddress: "EQAvDfWFG0oYX19jwNDNBBL1rKNT9XfaGP9HyTb5nb2Eml6y",
          imageUrl: "https://assets.dedust.io/images/tgr.webp"
        }
      ];
      
      // Set coins immediately with fallback tokens
      setCoins(fallbackTokens);
      setLoading(false);
      
      // Try to fetch real data in the background
      try {
        // List of API endpoints to try in order
        const apiEndpoints = [
          TON_API_ENDPOINTS.DEDUST
        ];
        
        // If we've tried all endpoints, use fallback data
        if (apiEndpointIndex >= apiEndpoints.length) {
          console.log('All API endpoints failed, using fallback data');
          return;
        }
        
        const currentEndpoint = apiEndpoints[apiEndpointIndex];
        console.log(`Trying API endpoint: ${currentEndpoint}`);
        
        // Create DeDustClient with the current endpoint
        const dedustClient = new DeDustClient({ 
          endpointUrl: currentEndpoint,
          timeout: 10000 // 10 seconds timeout
        });
        
        // Use Promise.race to implement a custom timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('API request timed out')), 5000); // 5 second timeout
        });
        
        // Try to get pools from DeDust endpoint
        const poolsPromise = dedustClient.getPools();
        const pools = await Promise.race([poolsPromise, timeoutPromise]) || [];
        
        if (pools && pools.length > 0) {
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
          
          // Update coins with real data
          setCoins(uniqueNamesArray);
        }
      } catch (error) {
        console.log('Background API fetch failed, using fallback data:', error);
        // We already set fallback tokens, so no need to do anything here
      }
    } catch (error) {
      console.error("Error in getPools:", error);
      
      // Use fallback tokens in case of any error
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
        }
      ];
      
      setCoins(fallbackTokens);
      setLoading(false);
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
        </Flex>
      ) : (
        <>
          <Dex coins={coins} />
        </>
      )}
    </main>
  );
} 
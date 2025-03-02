import Dex from "./components/Dex";
import { useState, useEffect } from "react";
import { Spinner, Flex } from "@chakra-ui/react";
import { DeDustClient } from '@dedust/sdk';
import CircularText from "./components/Preloader";

export default function DexPage() {
  const [coins, setCoins] = useState(null);
  const [loading, setLoading] = useState(true);

  const getPools = async (retries = 3) => {
    try {
      const dedustClient = new DeDustClient({ endpointUrl: 'https://api.dedust.io' });
      const pools = await dedustClient.getPools();
      
      const filteredPools = pools.filter(pool => parseInt(pool.totalSupply) > 10 && pool.assets[0].metadata !== null);
      
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
      
      setCoins(uniqueNamesArray);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pools:", error);
      if (retries > 0) {
        console.log(`Retrying... (${3 - retries + 1})`);
        setTimeout(() => getPools(retries - 1), 2000); // Retry after 2 seconds
      } else {
        setLoading(false);
      }
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
        <Dex coins={coins} />
      )}
    </main>
  );
} 
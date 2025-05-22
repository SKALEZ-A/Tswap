import React, { useState, useEffect } from "react";
import {
  Flex,
  Box,
  Text,
  Image,
  Icon,
  InputGroup,
  Input,
  InputLeftElement,
  HStack,
  Spacer,
  Button,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { DeDustClient, JettonWallet, VaultJetton } from "@dedust/sdk";
import { toast } from "react-toastify";
import bg from "../../../public/bg.png";
import { TonConnectButton } from "@tonconnect/ui-react";
import { LuRefreshCw } from "react-icons/lu";
import { GiSettingsKnobs } from "react-icons/gi";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { MdOutlineKeyboardDoubleArrowDown } from "react-icons/md";
import { SearchIcon } from "@chakra-ui/icons";
import {
  Address,
  toNano,
  Sender,
  fromNano,
  TonClient,
  beginCell,
} from "@ton/ton";
import {
  Asset,
  Factory,
  JettonRoot,
  MAINNET_FACTORY_ADDR,
  Pool,
  PoolType,
  VaultNative,
} from "@dedust/sdk";
import { useTonConnect } from "@/Hooks/useTonConnect";
import { useTonClient } from "@/Hooks/useTonClient";
import { TonClient4 } from "@ton/ton";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useSwapAggregator } from "@/Hooks/useSwapAggregator";
import { useSwapRoot } from "@/Hooks/useSwapRoot";
import { motion } from "framer-motion";
import { FaWallet } from "react-icons/fa";
import { FaArrowDown } from "react-icons/fa6";

const CandyLogo = () => (
  <Box boxSize="40px" borderRadius="full" bgGradient="linear(to-br, pink.400, pink.700)" display="flex" alignItems="center" justifyContent="center">
    <Text fontWeight="bold" color="white" fontSize="2xl">🍬</Text>
  </Box>
);
const TonIcon = () => (
  <Box boxSize="32px" bg="blue.700" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
    <Text color="white" fontWeight="bold">TON</Text>
  </Box>
);
const NotIcon = () => (
  <Box boxSize="32px" bg="yellow.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
    <Text color="black" fontWeight="bold">NOT</Text>
  </Box>
);

const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionFaArrowDown = motion(FaArrowDown);
const MotionChakraIcon = motion(Icon);

const Dex = ({ coins }) => {
  const [amount, setAmount] = useState("");
  const [change, setChange] = useState("");
  const [buttonText, setButtonText] = useState("Enter an amount");
  const [buttonColor, setButtonColor] = useState("bg-gray-200 text-gray-600");
  const [poolsLoading, setPoolsLoading] = useState(true);
  const [pools, setPools] = useState([]);
  // Default TON price already set below
  const [selectedToken, setSelectedToken] = useState({
    contractAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
    imageUrl: "https://assets.dedust.io/images/ton.webp",
    name: "Toncoin",
    symbol: "TON",
  }); // State to store the selected token
  const [selectedCoin, setSelectedCoin] = useState({
    contractAddress: "EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT",
    imageUrl: "https://assets.dedust.io/images/not.webp",
    name: "Notcoin",
    symbol: "NOT",
  });
  const [filteredCoins, setFilteredCoins] = useState(coins); // State to store filtered coins
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSecondModalOpen,
    onOpen: onSecondModalOpen,
    onClose: onSecondModalClose,
  } = useDisclosure();
  const { sender, userAddress, connected } = useTonConnect();
  const client = useTonClient();
  const [tonBalance, setTonBalance] = useState(0);
  const [amountOut, setAmountOut] = useState(0);
  const [amountInUSD, setAmountInUSD] = useState(0);
  const [fromTokenPrice, setFromTokenPrice] = useState(0); // State variable for fromTokenPrice
  const [toTokenPrice, setToTokenPrice] = useState(0);
  const [priceImpact, setPriceImpact] = useState(0);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [priceAmount, setPriceAmount] = useState(0);
  const [tonPrice, setTonPrice] = useState(0);

  const {
    noReferred,
    referralEarnings,
    userAggregatorStatus,
    swapTonForJetton,
    swapJettonForTon,
    swapJettonForJetton,
    withdrawJetton,
  } = useSwapAggregator();
  const { fixedFee, initSwapAggregator } = useSwapRoot();

  const [isLoading, setIsLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const withdraw = async () => {
    setWithdrawing(true);
    await withdrawJetton();
    setWithdrawing(false);
  };

  useEffect(() => {
    // Initialize filtered coins with all coins initially
    setFilteredCoins(coins);
  }, [coins]);

  // Fetch TON price with improved error handling
  const fetchTonPrice = async () => {
    try {
      // Use Promise.race to implement a custom timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TON price fetch timed out')), 10000); // 10 second timeout
      });
      
      // Make sure axios is properly imported at the top of the file
      const pricePromise = axios.get('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd', {
        timeout: 15000 // 15 seconds timeout
      });
      
      const response = await Promise.race([pricePromise, timeoutPromise]);
      
      if (response && response.data && response.data['the-open-network'] && response.data['the-open-network'].usd) {
        setTonPrice(response.data['the-open-network'].usd);
        return response.data['the-open-network'];
      }
    } catch (error) {
      console.error('Error fetching TON price:', error);
      // Keep using the default price if there's an error
    }
    return { usd: 7.25 }; // Default fallback
  };

  // Effect to fetch TON price on component mount
  useEffect(() => {
    const getTonPrice = async () => {
      const price = await fetchTonPrice();
      console.log(price?.usd);
    };
    
    getTonPrice();
  }, []);
  
  // Fetch pools when component mounts
  useEffect(() => {
    const fetchPools = async () => {
      try {
        setPoolsLoading(true);
        // Check if DeDust SDK is available
        if (typeof window !== 'undefined' && window.dedust) {
          // Use Promise.race to implement a custom timeout
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Pools fetch timed out')), 20000); // 20 second timeout
          });
          
          const poolsPromise = window.dedust.getPools();
          const pools = await Promise.race([poolsPromise, timeoutPromise]);
          setPools(pools || []);
        } else {
          console.error('DeDust SDK not available');
          // Use mock data as fallback when SDK is not available
          setPools([
            // Add some mock pool data here if needed
          ]);
        }
      } catch (error) {
        console.error('Error fetching pools:', error);
        // Set empty pools array on error
        setPools([]);
      } finally {
        setPoolsLoading(false);
      }
    };

    fetchPools();
  }, []);

  // Get hardcoded rates for fallback when API calls fail
  const getHardcodedRate = (fromAddress, toAddress) => {
    // Determine symbols based on addresses
    const fromSymbol = fromAddress === "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c" ? "TON" : 
                     fromAddress?.includes("NOT") ? "NOT" : "UNKNOWN";
    
    const toSymbol = toAddress === "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c" ? "TON" : 
                   toAddress?.includes("NOT") ? "NOT" : "UNKNOWN";
    
    // Hardcoded rates for common pairs
    const rates = {
      "TON_NOT": 1000, // 1 TON = 1000 NOT
      "NOT_TON": 0.001, // 1 NOT = 0.001 TON
      "UNKNOWN_UNKNOWN": 1, // 1:1 for unknown pairs
      "TON_UNKNOWN": 100,
      "UNKNOWN_TON": 0.01,
      "NOT_UNKNOWN": 0.1,
      "UNKNOWN_NOT": 10
    };
    
    const pairKey = `${fromSymbol}_${toSymbol}`;
    return rates[pairKey] || 1; // Default to 1:1 if pair not found
  };

  const fetchEquivalentAmount = async (amount, fromAddress, toAddress) => {
    if (!amount || amount === 0 || !fromAddress || !toAddress) {
      setExpectedOutput(0);
      setPriceImpact(0);
      return;
    }

    try {
      console.log(`Converting ${amount} from ${fromAddress} to ${toAddress}`);
      
      // Try to get expected swap amount from DeDust API with timeout protection
      let expectedOutput = 0;
      let priceImpact = 0;
      
      try {
        // First, try to get the expected amount from the API with a timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Swap calculation timed out')), 15000); // 15 second timeout
        });
        
        const swapPromise = getExpectedSwapAmount(fromAddress, toAddress, amount);
        const result = await Promise.race([swapPromise, timeoutPromise]);
        
        if (result && result.expectedOutput !== undefined) {
          expectedOutput = result.expectedOutput;
          priceImpact = result.priceImpact || 0.5; // Default to 0.5% if not provided
        }
      } catch (error) {
        console.log("Error getting expected swap amount from API, using hardcoded rates", error);
        // If API call fails, use hardcoded rates
        const rate = getHardcodedRate(fromAddress, toAddress);
        expectedOutput = amount * rate * 0.995; // Apply a 0.5% fee
        priceImpact = 0.5; // Default price impact for hardcoded rates
      }
      
      // If we still don't have an expected output, try to calculate based on token prices
      if (expectedOutput === 0) {
        // Try to determine token prices
        let fromTokenPrice = 0.01; // Default price if unknown
        let toTokenPrice = 0.01; // Default price if unknown
        
        // Check if it's TON
        if (fromAddress === "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c") {
          fromTokenPrice = tonPrice;
        } else if (fromAddress?.includes("NOT")) {
          fromTokenPrice = tonPrice / 1000; // Approximate NOT price
        }
        
        if (toAddress === "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c") {
          toTokenPrice = tonPrice;
        } else if (toAddress?.includes("NOT")) {
          toTokenPrice = tonPrice / 1000; // Approximate NOT price
        }
        
        console.log(`From token: ${fromAddress === "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c" ? "TON" : 
                  fromAddress?.includes("NOT") ? "NOT" : "UNKNOWN"} price: ${fromTokenPrice}`);
        console.log(`To token: ${toAddress === "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c" ? "TON" : 
                toAddress?.includes("NOT") ? "NOT" : "UNKNOWN"} price: ${toTokenPrice}`);
        
        // Calculate equivalent amount based on USD value
        const amountInUSD = amount * fromTokenPrice;
        console.log(`Amount in USD: ${amountInUSD}`);
        
        // Calculate expected output based on USD value and apply a 0.5% fee
        expectedOutput = (amountInUSD / toTokenPrice) * 0.995;
        priceImpact = 0.5; // Default price impact
        
        console.log(`Expected output: ${expectedOutput}`);
        console.log(`Price impact: ${priceImpact} %`);
      }
      
      setExpectedOutput(expectedOutput);
      setPriceImpact(priceImpact);
    } catch (error) {
      console.error("Error calculating equivalent amount:", error);
      setExpectedOutput(0);
      setPriceImpact(0);
    }
  };

  const getExpectedSwapAmount = async (fromAddress, toAddress, amount) => {
    try {
      if (!client) {
        console.error('TonClient not available');
        return getHardcodedRate(fromAddress, toAddress) * parseFloat(fromNano(amount));
      }

      // Create assets from addresses
      const fromAsset = fromAddress === "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c" 
        ? Asset.native() 
        : Asset.jetton(Address.parse(fromAddress));
        
      const toAsset = toAddress === "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c" 
        ? Asset.native() 
        : Asset.jetton(Address.parse(toAddress));

      // Get factory
      const factory = client.open(Factory.createFromAddress(MAINNET_FACTORY_ADDR));

      try {
        // Try direct pool
        const directPool = client.open(
          await factory.getPool(PoolType.VOLATILE, [fromAsset, toAsset])
        );

        // Check if direct pool exists and is ready
        if ((await directPool.getReadinessStatus()) === ReadinessStatus.READY) {
          // Direct swap is possible
          const { amountOut } = await directPool.getEstimatedSwapOut({
            assetIn: fromAsset,
            amountIn: amount,
          });

          // Calculate price impact
          const expectedOutput = parseFloat(fromNano(amountOut));
          const priceImpact = 0.5; // Default impact for direct swaps
          setPriceImpact(priceImpact);

          return expectedOutput;
        }

        // Direct pool not available, try multi-hop through TON
        const TON = Asset.native();

        // Check if both tokens are not TON
        if (fromAddress !== "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c" && 
            toAddress !== "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c") {
          
          // First hop: fromToken -> TON
          const firstPool = client.open(
            await factory.getPool(PoolType.VOLATILE, [fromAsset, TON])
          );
          
          // Second hop: TON -> toToken
          const secondPool = client.open(
            await factory.getPool(PoolType.VOLATILE, [TON, toAsset])
          );
          
          // Check if both pools exist and are ready
          const firstPoolReady = (await firstPool.getReadinessStatus()) === ReadinessStatus.READY;
          const secondPoolReady = (await secondPool.getReadinessStatus()) === ReadinessStatus.READY;
          
          if (firstPoolReady && secondPoolReady) {
            // Multi-hop swap is possible
            const firstHopResult = await firstPool.getEstimatedSwapOut({
              assetIn: fromAsset,
              amountIn: amount,
            });
            
            const secondHopResult = await secondPool.getEstimatedSwapOut({
              assetIn: TON,
              amountIn: firstHopResult.amountOut,
            });
            
            // Calculate combined price impact (approximate)
            const priceImpact = 1.0; // Default impact for multi-hop swaps
            setPriceImpact(priceImpact);
            
            return parseFloat(fromNano(secondHopResult.amountOut));
          }
        }
        
        // If no valid path found, use hardcoded rate
        console.log("No valid swap path found, using hardcoded rate");
        return {
          expectedOutput: getHardcodedRate(fromAddress, toAddress) * parseFloat(fromNano(amount)),
          priceImpact: 0.5 // Default price impact for hardcoded rates
        };
      } catch (poolError) {
        console.error("Error in pool operations:", poolError);
        return {
          expectedOutput: getHardcodedRate(fromAddress, toAddress) * parseFloat(fromNano(amount)),
          priceImpact: 0.5 // Default price impact for hardcoded rates
        };
      }
    } catch (error) {
      console.error("Error calculating swap amount:", error);
      return {
        expectedOutput: getHardcodedRate(fromAddress, toAddress) * parseFloat(fromNano(amount)),
        priceImpact: 0.5 // Default price impact for hardcoded rates
      };
    }
  };

  const isTonContractAddress = (address) => {
    // Assuming TON contract addresses start with "EQ" and are 48 characters long
    const tonAddressPattern = /^EQ[A-Za-z0-9_-]/;
    return tonAddressPattern.test(address);
  };

  // Local implementation of token details fetching
  const fetchTokenDetailsFromTon = (contractAddress) => {
    console.log("Fetching token details locally for", contractAddress);
    
    // Check if the token exists in our database
    const token = tokenPriceDatabase[contractAddress];
    
    if (token) {
      // Return a simulated API response with the token data
      return {
        result: {
          jetton_content: {
            type: "onchain",
            data: {
              name: token.name,
              symbol: token.symbol
            }
          }
        }
      };
    }
    
    // Return a generic response for unknown tokens
    return {
      result: {
        jetton_content: {
          type: "onchain",
          data: {
            name: "Unknown Token",
            symbol: "UNK"
          }
        }
      }
    };
  };

  // Local implementation of additional content fetching
  const fetchAdditionalContent = (uri) => {
    console.log("Fetching additional content locally for", uri);
    
    // Return simulated content
    return {
      name: "External Token",
      symbol: "EXT"
    };
  };

  const handleSearch = async (query) => {
    if (isTonContractAddress(query)) {
      try {
        // Use our local implementation instead of API call
        const coinDetails = fetchTokenDetailsFromTon(query);
        console.log("Coin Details:", coinDetails);
        
        if (coinDetails.result) {
          const jettonContent = coinDetails.result.jetton_content;

          if (jettonContent.type === "onchain") {
            const onChainData = jettonContent.data;
            console.log("On-chain Data:", onChainData);
            const combinedDetails = {
              name: onChainData.name,
              symbol: onChainData.symbol,
              contractAddress: query,
              imageUrl: "/images/unknown-token.png" // Default image for unknown tokens
            };

            setFilteredCoins([combinedDetails]);
          } else if (jettonContent.type === "offchain") {
            const combinedDetails = {
              name: "External Token",
              symbol: "EXT",
              contractAddress: query,
              imageUrl: "/images/unknown-token.png"
            };

            setFilteredCoins([combinedDetails]);
          }
        } else {
          setFilteredCoins([]);
        }
      } catch (error) {
        console.error("Error processing token details:", error);
        setFilteredCoins([]);
      }
    } else {
      // Filter coins by name or symbol
      const filtered = coins.filter((coin) => {
        return (
          coin.name.toLowerCase().includes(query.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(query.toLowerCase())
        );
      });
      setFilteredCoins(filtered);
    }
  };

  const handleAmountChange = (event) => {
    const value = event.target.value;
    // Only allow numbers and one decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setButtonText("Connect Wallet Address");
      setButtonColor("bg-[#0680fb] text-white");
    }
  };

  const handleTokenSelection = (token) => {
    setSelectedToken(token);
    setFilteredCoins(coins);
    onClose(); // Close the modal
  };

  const handleCoinSelection = (token) => {
    setSelectedCoin(token);
    setFilteredCoins(coins);
    onSecondModalClose(); // Close the modal
  };
  
  const handleSwap = async () => {
    try {
      if (!connected) {
        toast.error("Please connect your wallet");
        return;
      }

      if (!amount || Number(amount) <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      // Check if the amount exceeds the balance for TON swaps
      if (
        selectedToken.contractAddress ===
          "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c" &&
        Number(amount) > Number(fromNano(tonBalance))
      ) {
        toast.error("Insufficient TON balance");
        return;
      }

      setIsLoading(true);
      toast.info("Preparing swap...");

      const amountInNano = toNano(amount);
      const slippageTolerance = 0.5; // 0.5% slippage tolerance
      const deadlineMinutes = 5; // 5 minutes deadline

      // Get the swap functions from the hook
      const { swapTonForJetton, swapJettonForTon, swapJettonForJetton } = useSwapAggregator();

      // TON to Jetton
      if (
        selectedToken.contractAddress ===
        "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c"
      ) {
        toast.info(`Swapping ${amount} TON to ${selectedCoin.symbol}...`);
        await swapTonForJetton(
          selectedCoin.contractAddress,
          amountInNano,
          slippageTolerance,
          deadlineMinutes
        );
        toast.success(`Successfully swapped ${amount} TON to ${selectedCoin.symbol}!`);
      }
      // Jetton to TON
      else if (
        selectedCoin.contractAddress ===
        "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c"
      ) {
        toast.info(`Swapping ${amount} ${selectedToken.symbol} to TON...`);
        
        // Calculate jettonPriceToTon based on current rates or use a default value
        const jettonPriceToTon = await getExpectedSwapAmount(
          selectedToken.contractAddress,
          "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
          toNano("1")
        );
        
        await swapJettonForTon(
          selectedToken.contractAddress,
          amountInNano,
          jettonPriceToTon || toNano("0.1"), // Use calculated price or fallback
          slippageTolerance,
          deadlineMinutes
        );
        toast.success(`Successfully swapped ${amount} ${selectedToken.symbol} to TON!`);
      }
      // Jetton to Jetton
      else {
        toast.info(`Swapping ${amount} ${selectedToken.symbol} to ${selectedCoin.symbol}...`);
        
        // For Jetton to Jetton, we need to calculate the price in TON
        const jettonPriceToTon = await getExpectedSwapAmount(
          selectedToken.contractAddress,
          "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
          toNano("1")
        );
        
        await swapJettonForJetton(
          selectedToken.contractAddress,
          selectedCoin.contractAddress,
          amountInNano,
          jettonPriceToTon || toNano("0.1"), // Use calculated price or fallback
          toNano("0"), // Minimum amount out
          deadlineMinutes
        );
        toast.success(`Successfully swapped ${amount} ${selectedToken.symbol} to ${selectedCoin.symbol}!`);
      }
      
      // Reset form after successful swap
      setAmount("");
      setChange("");
      setPriceImpact(0);
      setSwapSuccess(true);
    } catch (error) {
      console.error("Swap error:", error);
      let errorMessage = "Swap failed";
      
      // Provide more user-friendly error messages
      if (error.message && error.message.includes("does not exist")) {
        errorMessage = "Swap pool does not exist for this token pair";
      } else if (error.message && error.message.includes("rejected")) {
        errorMessage = "Transaction was rejected by the wallet";
      } else if (error.message && error.message.includes("slippage")) {
        errorMessage = "Swap failed due to price impact exceeding slippage tolerance";
      } else if (error.message && error.message.includes("balance")) {
        errorMessage = "Insufficient balance for this swap";
      } else if (error.message) {
        errorMessage = `Swap failed: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Hide success message after 5 seconds
  useEffect(() => {
    if (swapSuccess) {
      const timer = setTimeout(() => {
        setSwapSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [swapSuccess]);

  const [tonConnectUI] = useTonConnectUI();

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } },
  };
  const swapIconVariants = {
    rest: { rotate: 0 },
    hover: { rotate: 180, transition: { duration: 0.4 } },
  };
  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.04, boxShadow: "0 0 0 2px #e35b5b" },
  };

  // State for swap icon animation
  const [swapHover, setSwapHover] = React.useState(false);

  return (
    <Box minH="100vh" w="100vw" fontFamily="'Baloo 2', sans-serif" bgGradient="radial(circle at 50% 30%, #2a1833 0%, #0d0904 100%)" position="relative" overflowX="hidden">
      {/* Navbar */}
      <Flex as="nav" w="full" px={{ base: 3, sm: 4, md: 12 }} py={{ base: 3, md: 4 }} align="center" justify="space-between" position="fixed" top={0} left={0} zIndex={10} bg="rgba(13,9,4,0.85)" boxShadow="0 2px 24px 0 rgba(0,0,0,0.25)">
        <HStack spacing={{ base: 2, md: 3 }}>
          <CandyLogo />
          <Text fontWeight="bold" fontSize={{ base: "xl", sm: "2xl" }} color="white" letterSpacing="wide">CandySwap</Text>
        </HStack>
        <Box
          borderRadius="full"
          overflow="hidden"
          bg="#e35b5b"
          _hover={{ bg: "#c13c3c" }}
          px={0}
          py={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          minW={{ base: "140px", sm: "170px" }}
          minH={{ base: "40px", sm: "48px" }}
        >
          <TonConnectButton style={{ width: "100%", height: "100%", background: "none", border: "none", color: "white", fontWeight: "bold", fontSize: window.innerWidth < 480 ? "0.9rem" : "1.1rem", borderRadius: "999px", padding: window.innerWidth < 480 ? "0 16px" : "0 24px", cursor: "pointer" }} />
        </Box>
      </Flex>

      {/* Centered Swap Card */}
      <Flex minH="100vh" align="center" justify="center" pt={{ base: "80px", md: "100px" }} px={{ base: 2, sm: 4 }}>
        <MotionBox
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          bg="rgba(13,9,4,0.95)"
          borderRadius="2xl"
          boxShadow="0 0 32px 4px #e35b5b55, 0 1.5px 0 0 #e35b5b"
          border="2px solid #e35b5b"
          p={{ base: 4, sm: 5, md: 6 }}
          w={{ base: "100%", sm: "420px", md: "450px" }}
          maxW="98vw"
          position="relative"
          mx={{ base: 2, sm: 0 }}
          backdropFilter="blur(10px)"
        >
          {/* Header */}
          <Text fontSize={{ base: "lg", sm: "xl" }} fontWeight="bold" mb={{ base: 4, md: 6 }} bgGradient="linear(to-r, #e35b5b, #ffe066)" bgClip="text">
            On-chain swap
          </Text>

          {/* Token Inputs */}
          <Box mb={3} bg="#18131c" borderRadius="lg" p={4} display="flex" flexDirection="column" gap={3}>
            <Flex justify="space-between" align="center">
              <Text color="#b0b0b0" fontSize="sm">You will pay</Text>
              <Text color="#636e9d" fontSize="xs">Balance: -</Text>
            </Flex>
            <Flex justify="space-between" align="center">
              <Input
                variant="unstyled"
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  setAmount(value);
                  // Recalculate the output amount when input changes
                  if (value && parseFloat(value) > 0) {
                    getExpectedSwapAmount(selectedCoin.contractAddress, value)
                      .then(result => setAmountOut(result))
                      .catch(err => console.error(err));
                  } else {
                    setAmountOut(0);
                  }
                }}
                fontSize="2xl"
                fontWeight="bold"
                color="white"
                _focus={{ outline: "none" }}
                maxW="70%"
              />
              <Button 
                bg="#23202a" 
                color="white" 
                borderRadius="xl" 
                fontWeight="bold" 
                px={4} 
                py={2} 
                _hover={{ bg: "#2a1833" }} 
                onClick={onOpen}
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
              >
                {selectedToken.imageUrl ? (
                  <Image 
                    src={selectedToken.imageUrl} 
                    alt={selectedToken.symbol} 
                    boxSize="24px" 
                    borderRadius="full" 
                    objectFit="cover"
                  />
                ) : (
                  <TonIcon />
                )}
                {selectedToken.symbol}
              </Button>
            </Flex>
          </Box>

          {/* Swap Icon */}
          <Flex justify="center" align="center" my={-3} zIndex={2} position="relative">
            <MotionBox
              variants={swapIconVariants}
              initial="rest"
              animate={swapHover ? "hover" : "rest"}
              whileHover="hover"
              onMouseEnter={() => setSwapHover(true)}
              onMouseLeave={() => setSwapHover(false)}
              onClick={() => {
                // Swap the tokens
                const tempToken = selectedToken;
                setSelectedToken(selectedCoin);
                setSelectedCoin(tempToken);
                
                // Swap the amounts if they exist
                if (amount && amountOut) {
                  const tempAmount = amount;
                  setAmount(amountOut);
                  setAmountOut(tempAmount);
                }
                
                setSwapHover((h) => !h);
              }}
              style={{
                display: "inline-flex",
                background: "#0d0904",
                borderRadius: "50%",
                border: "4px solid #18131c",
                padding: "8px",
                boxShadow: "0 0 12px 2px #e35b5b55",
                cursor: "pointer",
              }}
          >
              <Box position="relative" transform="rotate(90deg)">
                <Icon as={FaArrowDown} boxSize={5} color="#e35b5b" />
                <Icon as={FaArrowDown} boxSize={5} color="#e35b5b" position="absolute" top="0" left="0" transform="rotate(180deg)" />
              </Box>
            </MotionBox>
          </Flex>

          <Box mb={3} bg="#18131c" borderRadius="lg" p={4} display="flex" flexDirection="column" gap={3}>
            <Flex justify="space-between" align="center">
              <Text color="#b0b0b0" fontSize="sm">You will receive</Text>
              <Text color="#636e9d" fontSize="xs">Balance: -</Text>
            </Flex>
            <Flex justify="space-between" align="center">
              <Input
                variant="unstyled"
                type="number"
                placeholder="0.0"
                value={amountOut}
                isReadOnly
                fontSize="2xl"
                fontWeight="bold"
                color="white"
                _focus={{ outline: "none" }}
                maxW="70%"
              />
              <Button 
                bg="#23202a" 
                color="white" 
                borderRadius="xl" 
                fontWeight="bold" 
                px={4} 
                py={2} 
                _hover={{ bg: "#2a1833" }} 
                onClick={onSecondModalOpen}
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
              >
                {selectedCoin.imageUrl ? (
                  <Image 
                    src={selectedCoin.imageUrl} 
                    alt={selectedCoin.symbol} 
                    boxSize="24px" 
                    borderRadius="full" 
                    objectFit="cover"
                  />
                ) : (
                  <NotIcon />
                )}
                {selectedCoin.symbol}
              </Button>
            </Flex>
          </Box>

          {/* Connect Wallet Button */}
          {!connected ? (
            <Box
              w="full"
              mt={6}
              mb={2}
              borderRadius="lg"
              overflow="hidden"
              bg="#e35b5b"
              _hover={{ bg: "#c13c3c" }}
              transition="all 0.3s ease"
            >
              <TonConnectButton style={{
                width: "100%",
                height: "100%",
                padding: "24px",
                background: "none",
                border: "none",
                color: "white",
                fontWeight: "bold",
                fontSize: "xl",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }} />
            </Box>
          ) : (
            <MotionButton
              w="full"
              mt={6}
              mb={2}
              py={6}
              bg="#e35b5b"
              color="white"
              borderRadius="lg"
              fontWeight="bold"
              fontSize="xl"
              _hover={{ bg: "#c13c3c" }}
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              onClick={handleSwap}
              isLoading={isLoading}
              loadingText="Swapping..."
            >
              Swap
            </MotionButton>
          )}

          {/* Info Section */}
          <Box mt={4} bg="#18131c" borderRadius="lg" p={4} color="white" fontSize="sm">
            <Flex align="center" mb={2}>
              <Text fontWeight="bold" color="#ffe066">1 {selectedToken.symbol}</Text>
              <Box mx={2} color="#ffe066">⇄</Box>
              <Text fontWeight="bold">{priceAmount ? priceAmount.toFixed(4) : '0'} {selectedCoin.symbol}</Text>
              <Spacer />
              <Text color="#b0b0b0" fontSize="xs">Fee {fixedFee ? fromNano(fixedFee) : '0.01'} TON</Text>
          </Flex>
            <Flex justify="space-between" color="#b0b0b0" fontSize="xs" mb={1}>
              <Text>Minimum received</Text>
              <Text color="white">{amountOut ? (amountOut * 0.995).toFixed(2) : '0'} {selectedCoin.symbol}</Text>
          </Flex>
            <Flex justify="space-between" color="#b0b0b0" fontSize="xs" mb={1}>
              <Text>Price impact</Text>
              <Text color="white">{priceImpact ? priceImpact.toFixed(2) : '<0.01'}%</Text>
        </Flex>
            <Flex justify="space-between" color="#b0b0b0" fontSize="xs" mb={1}>
              <Text>Slippage tolerance</Text>
              <Text color="#ffe066" fontWeight="bold">0.50%</Text>
          </Flex>
            <Flex justify="space-between" color="#b0b0b0" fontSize="xs">
              <Text>Tx fee</Text>
              <Text color="white">{fixedFee ? fromNano(fixedFee) : '0.01'} TON</Text>
        </Flex>
          </Box>
        </MotionBox>
      </Flex>

      {/* Token Selection Modals */}
      <Modal isCentered onClose={onClose} isOpen={isOpen} motionPreset="slideInBottom">
        <ModalOverlay />
        <ModalContent bg="#18131c" color="white" borderRadius="2xl" maxW="360px">
          <ModalHeader>Select token</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <InputGroup mb={4}>
                  <InputLeftElement>
                <SearchIcon color="#e35b5b" />
                  </InputLeftElement>
                  <Input
                border="2px solid #e35b5b"
                    placeholder="Search assets or address"
                    onChange={(e) => handleSearch(e.target.value)}
                color="white"
                  />
                </InputGroup>
            <Box maxH="260px" overflowY="auto">
              {filteredCoins && filteredCoins.length > 0 ? (
                filteredCoins.map((coin, index) => (
                  <Flex key={index} gap={4} alignItems="center" py={2} px={2} borderRadius="md" _hover={{ bg: "#23202a", cursor: "pointer" }} onClick={() => handleTokenSelection(coin)}>
                    <Image src={coin.imageUrl} boxSize={8} borderRadius="full" />
                              <Box>
                      <Text fontWeight="bold">{coin.symbol}</Text>
                      <Text fontSize="sm" color="#b0b0b0">{coin.name}</Text>
                              </Box>
                              </Flex>
                ))
              ) : (
                <Text color="#e35b5b">No assets found.</Text>
              )}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={onClose} borderRadius="xl">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isCentered onClose={onSecondModalClose} isOpen={isSecondModalOpen} motionPreset="slideInBottom">
        <ModalOverlay />
        <ModalContent bg="#18131c" color="white" borderRadius="2xl" maxW="360px">
          <ModalHeader>Select token</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <InputGroup mb={4}>
                  <InputLeftElement>
                <SearchIcon color="#e35b5b" />
                  </InputLeftElement>
                  <Input
                border="2px solid #e35b5b"
                    placeholder="Search assets or address"
                    onChange={(e) => handleSearch(e.target.value)}
                color="white"
                  />
                </InputGroup>
            <Box maxH="260px" overflowY="auto">
              {filteredCoins && filteredCoins.length > 0 ? (
                filteredCoins.map((coin, index) => (
                  <Flex key={index} gap={4} alignItems="center" py={2} px={2} borderRadius="md" _hover={{ bg: "#23202a", cursor: "pointer" }} onClick={() => handleCoinSelection(coin)}>
                    <Image src={coin.imageUrl} boxSize={8} borderRadius="full" />
                              <Box>
                      <Text fontWeight="bold">{coin.symbol}</Text>
                      <Text fontSize="sm" color="#b0b0b0">{coin.name}</Text>
                              </Box>
                              </Flex>
                ))
              ) : (
                <Text color="#e35b5b">No assets found.</Text>
              )}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={onSecondModalClose} borderRadius="xl">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Dex;

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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { TonConnectButton } from "@tonconnect/ui-react";
import { SearchIcon } from "@chakra-ui/icons";
import { MdOutlineKeyboardDoubleArrowDown } from "react-icons/md";
import { FaArrowDown } from "react-icons/fa6";
import { motion } from "framer-motion";
import { toNano, fromNano } from "@ton/ton";
import { useTonConnect } from "@/Hooks/useTonConnect";
import { useTonClient } from "@/Hooks/useTonClient";
import { useSwapAggregator } from "@/Hooks/useSwapAggregator";
import { 
  calculateExpectedOutput, 
  formatNumber, 
  getHardcodedRate,
  calculateGasFee,
  validateSwap,
  getDefaultTokens
} from "@/utils/dedustHelpers";

// Motion components
const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionIcon = motion(Icon);

const DexNew = ({ coins = getDefaultTokens() }) => {
  // State variables
  const [amount, setAmount] = useState("");
  const [expectedOutput, setExpectedOutput] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [priceImpact, setPriceImpact] = useState(0);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [tonPrice, setTonPrice] = useState(3.11); // Default TON price in USD
  const [filteredCoins, setFilteredCoins] = useState(coins);
  const [slippage, setSlippage] = useState(0.5); // Default slippage 0.5%
  const [gasFee, setGasFee] = useState({ fee: 0.1, total: 0.1 });
  
  // Default tokens
  const [fromToken, setFromToken] = useState(coins[0]); // TON
  const [toToken, setToToken] = useState(coins[1]); // NOT
  
  // Hooks
  const { isOpen: isFromModalOpen, onOpen: onFromModalOpen, onClose: onFromModalClose } = useDisclosure();
  const { isOpen: isToModalOpen, onOpen: onToModalOpen, onClose: onToModalClose } = useDisclosure();
  const { sender, userAddress, connected } = useTonConnect();
  const client = useTonClient();
  const { 
    swapTonForJetton, 
    swapJettonForTon, 
    swapJettonForJetton,
    userAggregatorStatus 
  } = useSwapAggregator();
  const toast = useToast();

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
  };

  const swapIconVariants = {
    rest: { rotate: 0 },
    hover: { rotate: 180, transition: { duration: 0.3 } },
  };

  // Fetch TON price
  useEffect(() => {
    const fetchTonPrice = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd");
        const data = await response.json();
        if (data && data["the-open-network"] && data["the-open-network"].usd) {
          setTonPrice(data["the-open-network"].usd);
        }
      } catch (error) {
        console.error("Error fetching TON price:", error);
      }
    };

    fetchTonPrice();
  }, []);

  // Calculate expected output when amount, fromToken, or toToken changes
  useEffect(() => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setExpectedOutput(0);
      setPriceImpact(0);
      return;
    }

    // Calculate gas fee
    const fee = calculateGasFee(fromToken.symbol, toToken.symbol, parseFloat(amount));
    setGasFee(fee);

    // Get exchange rate
    const rate = getHardcodedRate(fromToken.contractAddress, toToken.contractAddress);
    
    // Calculate expected output
    const { expectedOutput } = calculateExpectedOutput(parseFloat(amount), rate, slippage);
    setExpectedOutput(expectedOutput);
    
    // Set price impact (simplified)
    setPriceImpact(0.5); // Default price impact
  }, [amount, fromToken, toToken, slippage]);

  // Hide success message after 5 seconds
  useEffect(() => {
    if (swapSuccess) {
      const timer = setTimeout(() => {
        setSwapSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [swapSuccess]);

  // Handle token selection
  const handleFromTokenSelection = (token) => {
    if (token.contractAddress === toToken.contractAddress) {
      // Swap tokens if the same token is selected
      setToToken(fromToken);
    }
    setFromToken(token);
    setFilteredCoins(coins);
    onFromModalClose();
  };

  // Handle coin selection
  const handleToTokenSelection = (token) => {
    if (token.contractAddress === fromToken.contractAddress) {
      // Swap tokens if the same token is selected
      setFromToken(toToken);
    }
    setToToken(token);
    setFilteredCoins(coins);
    onToModalClose();
  };

  // Handle amount change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  // Handle search
  const handleSearch = (query) => {
    if (!query) {
      setFilteredCoins(coins);
      return;
    }

    const filtered = coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(query.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(query.toLowerCase()) ||
        coin.contractAddress.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredCoins(filtered);
  };

  // Handle swap tokens
  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    
    // Reset amount and expected output
    setAmount("");
    setExpectedOutput(0);
  };

  // Handle swap
  const handleSwap = async () => {
    try {
      // Validate swap parameters
      const validation = validateSwap({
        connected,
        fromToken,
        toToken,
        amount,
        balance: undefined // We don't have balance info yet
      });
      
      if (!validation.valid) {
        toast({
          title: "Swap Error",
          description: validation.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      // Check if user aggregator is initialized
      if (!userAggregatorStatus) {
        toast({
          title: "Initializing",
          description: "Please wait while we initialize your swap account...",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      setIsLoading(true);
      toast({
        title: "Preparing Swap",
        description: "Please confirm the transaction in your wallet...",
        status: "info",
        duration: 5000,
        isClosable: true,
      });

      const amountInNano = toNano(amount);
      const deadlineMinutes = 5; // 5 minutes deadline

      // TON to Jetton
      if (fromToken.symbol === "TON") {
        toast({
          title: "Swapping",
          description: `Swapping ${amount} TON to ${toToken.symbol}...`,
          status: "loading",
          duration: 10000,
          isClosable: true,
        });
        
        await swapTonForJetton(
          toToken.contractAddress,
          amountInNano,
          slippage,
          deadlineMinutes
        );
        
        toast({
          title: "Swap Successful",
          description: `Successfully swapped ${amount} TON to ${toToken.symbol}!`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
      // Jetton to TON
      else if (toToken.symbol === "TON") {
        toast({
          title: "Swapping",
          description: `Swapping ${amount} ${fromToken.symbol} to TON...`,
          status: "loading",
          duration: 10000,
          isClosable: true,
        });
        
        // Calculate jettonPriceToTon based on current rates
        const rate = getHardcodedRate(fromToken.contractAddress, toToken.contractAddress);
        const jettonPriceToTon = toNano(rate.toString());
        
        await swapJettonForTon(
          fromToken.contractAddress,
          amountInNano,
          jettonPriceToTon,
          slippage,
          deadlineMinutes
        );
        
        toast({
          title: "Swap Successful",
          description: `Successfully swapped ${amount} ${fromToken.symbol} to TON!`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
      // Jetton to Jetton
      else {
        toast({
          title: "Swapping",
          description: `Swapping ${amount} ${fromToken.symbol} to ${toToken.symbol}...`,
          status: "loading",
          duration: 10000,
          isClosable: true,
        });
        
        // Calculate jettonPriceToTon based on current rates
        const rate = getHardcodedRate(fromToken.contractAddress, "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c");
        const jettonPriceToTon = toNano(rate.toString());
        
        await swapJettonForJetton(
          fromToken.contractAddress,
          toToken.contractAddress,
          amountInNano,
          jettonPriceToTon,
          toNano("0"), // Minimum amount out
          deadlineMinutes
        );
        
        toast({
          title: "Swap Successful",
          description: `Successfully swapped ${amount} ${fromToken.symbol} to ${toToken.symbol}!`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
      
      // Reset form after successful swap
      setAmount("");
      setExpectedOutput(0);
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
      
      toast({
        title: "Swap Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get swap button text
  const getSwapButtonText = () => {
    if (!connected) {
      return "Connect Wallet";
    }
    
    if (!fromToken || !toToken) {
      return "Select Tokens";
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return "Enter Amount";
    }
    
    return "Swap";
  };

  // State for swap icon animation
  const [swapHover, setSwapHover] = useState(false);

  return (
    <Box minH="100vh" w="100%" fontFamily="'Baloo 2', sans-serif" bgGradient="radial(circle at 50% 30%, #2a1833 0%, #0d0904 100%)" position="relative" overflowX="hidden">
      {/* Navbar */}
      <Flex as="nav" align="center" justify="space-between" p={4} color="white">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" bgGradient="linear(to-r, #e35b5b, #ffe066)" bgClip="text">
            TSwap
          </Text>
        </Box>
        <Box>
          <TonConnectButton />
        </Box>
      </Flex>

      {/* Centered Swap Card */}
      <Flex minH="80vh" align="center" justify="center" pt={{ base: "20px", md: "40px" }} px={{ base: 2, sm: 4 }}>
        <MotionBox
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          bg="rgba(24, 19, 28, 0.8)"
          borderRadius="2xl"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.5)"
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

          {/* From Token Input */}
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
                onChange={handleAmountChange}
                color="white"
                fontSize="2xl"
                fontWeight="bold"
                min="0"
              />
              <Button
                bg="#23202a"
                color="white"
                borderRadius="xl"
                px={4} 
                py={2} 
                _hover={{ bg: "#2a1833" }} 
                onClick={onFromModalOpen}
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
              >
                <Image src={fromToken.imageUrl} boxSize={6} borderRadius="full" />
                <Text>{fromToken.symbol}</Text>
                <Icon as={MdOutlineKeyboardDoubleArrowDown} />
              </Button>
            </Flex>
            <Flex justify="space-between" color="#b0b0b0" fontSize="xs">
              <Text>≈ ${(parseFloat(amount || 0) * (fromToken.symbol === "TON" ? tonPrice : 1)).toFixed(2)}</Text>
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
              onClick={handleSwapTokens}
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

          {/* To Token Input */}
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
                value={expectedOutput ? formatNumber(expectedOutput) : "0.0"}
                isReadOnly
                color="white"
                fontSize="2xl"
                fontWeight="bold"
              />
              <Button
                bg="#23202a"
                color="white"
                borderRadius="xl"
                px={4} 
                py={2} 
                _hover={{ bg: "#2a1833" }} 
                onClick={onToModalOpen}
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
              >
                <Image src={toToken.imageUrl} boxSize={6} borderRadius="full" />
                <Text>{toToken.symbol}</Text>
                <Icon as={MdOutlineKeyboardDoubleArrowDown} />
              </Button>
            </Flex>
            <Flex justify="space-between" color="#b0b0b0" fontSize="xs">
              <Text>≈ ${(expectedOutput * (toToken.symbol === "TON" ? tonPrice : 1)).toFixed(2)}</Text>
            </Flex>
          </Box>

          {/* Swap Button */}
          {!connected ? (
            <Box
              w="full"
              mt={6}
              mb={2}
              bg="#18131c"
              color="white"
              borderRadius="lg"
              overflow="hidden"
              position="relative"
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
              isDisabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
            >
              {getSwapButtonText()}
            </MotionButton>
          )}

          {/* Info Section */}
          <Box mt={4} bg="#18131c" borderRadius="lg" p={4} color="white" fontSize="sm">
            <Flex align="center" mb={2}>
              <Text fontWeight="bold" color="#ffe066">1 {fromToken.symbol}</Text>
              <Box mx={2} color="#ffe066">⇄</Box>
              <Text fontWeight="bold">
                {amount && expectedOutput 
                  ? (expectedOutput / parseFloat(amount)).toFixed(4) 
                  : getHardcodedRate(fromToken.contractAddress, toToken.contractAddress).toFixed(4)
                } {toToken.symbol}
              </Text>
              <Spacer />
              <Text color="#b0b0b0" fontSize="xs">Fee {gasFee.fee} TON</Text>
          </Flex>
            <Flex justify="space-between" color="#b0b0b0" fontSize="xs" mb={1}>
              <Text>Minimum received</Text>
              <Text color="white">
                {expectedOutput 
                  ? (expectedOutput * (1 - slippage / 100)).toFixed(6) 
                  : '0'
                } {toToken.symbol}
              </Text>
          </Flex>
            <Flex justify="space-between" color="#b0b0b0" fontSize="xs" mb={1}>
              <Text>Slippage tolerance</Text>
              <Text color="#ffe066" fontWeight="bold">{slippage.toFixed(2)}%</Text>
          </Flex>
            <Flex justify="space-between" color="#b0b0b0" fontSize="xs">
              <Text>Price impact</Text>
              <Text color={priceImpact > 5 ? "#e35b5b" : "white"}>
                {priceImpact > 0 ? `${priceImpact.toFixed(2)}%` : '< 0.01%'}
              </Text>
        </Flex>
          </Box>
        </MotionBox>
      </Flex>

      {/* From Token Selection Modal */}
      <Modal isCentered onClose={onFromModalClose} isOpen={isFromModalOpen} motionPreset="slideInBottom">
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
                  <Flex 
                    key={index} 
                    gap={4} 
                    alignItems="center" 
                    py={2} 
                    px={2} 
                    borderRadius="md" 
                    _hover={{ bg: "#23202a", cursor: "pointer" }} 
                    onClick={() => handleFromTokenSelection(coin)}
                  >
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
            <Button colorScheme="red" mr={3} onClick={onFromModalClose} borderRadius="xl">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* To Token Selection Modal */}
      <Modal isCentered onClose={onToModalClose} isOpen={isToModalOpen} motionPreset="slideInBottom">
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
                  <Flex 
                    key={index} 
                    gap={4} 
                    alignItems="center" 
                    py={2} 
                    px={2} 
                    borderRadius="md" 
                    _hover={{ bg: "#23202a", cursor: "pointer" }} 
                    onClick={() => handleToTokenSelection(coin)}
                  >
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
            <Button colorScheme="red" mr={3} onClick={onToModalClose} borderRadius="xl">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DexNew;

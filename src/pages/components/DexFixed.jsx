import React, { useState, useEffect } from "react";
import {
  Flex,
  Box,
  Text,
  Image,
  Icon,
  InputGroup,
  Input,
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
} from "@chakra-ui/react";
import { toast } from "react-toastify";
import { TonConnectButton } from "@tonconnect/ui-react";
import { LuRefreshCw } from "react-icons/lu";
import { GiSettingsKnobs } from "react-icons/gi";
import { SearchIcon } from "@chakra-ui/icons";
import { MdOutlineKeyboardDoubleArrowDown } from "react-icons/md";
import { FaWallet } from "react-icons/fa";
import { FaArrowDown } from "react-icons/fa6";
import { motion } from "framer-motion";
import { Address, toNano, fromNano } from "@ton/ton";
import { useTonConnect } from "@/Hooks/useTonConnect";
import { useTonClient } from "@/Hooks/useTonClient";
import { useSwapAggregator } from "@/Hooks/useSwapAggregator";
import { 
  getExpectedSwapAmount, 
  getHardcodedRate 
} from "@/utils/dedustUtils";

// Motion components
const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionFaArrowDown = motion(FaArrowDown);
const MotionIcon = motion(Icon);

const Dex = ({ coins = [] }) => {
  // State variables
  const [amount, setAmount] = useState("");
  const [expectedOutput, setExpectedOutput] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [priceImpact, setPriceImpact] = useState(0);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [tonPrice, setTonPrice] = useState(3.11); // Default TON price in USD
  const [filteredCoins, setFilteredCoins] = useState(coins);
  
  // Default tokens
  const [selectedToken, setSelectedToken] = useState({
    contractAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
    imageUrl: "https://assets.dedust.io/images/ton.webp",
    name: "Toncoin",
    symbol: "TON",
  });
  
  const [selectedCoin, setSelectedCoin] = useState({
    contractAddress: "EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT",
    imageUrl: "https://assets.dedust.io/images/not.webp",
    name: "Notcoin",
    symbol: "NOT",
  });

  // Hooks
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isSecondModalOpen, onOpen: onSecondModalOpen, onClose: onSecondModalClose } = useDisclosure();
  const { sender, userAddress, connected } = useTonConnect();
  const client = useTonClient();
  const { 
    swapTonForJetton, 
    swapJettonForTon, 
    swapJettonForJetton 
  } = useSwapAggregator();

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.04, boxShadow: "0 0 0 2px #e35b5b" },
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

  // Calculate expected output when amount, selectedToken, or selectedCoin changes
  useEffect(() => {
    const calculateExpectedOutput = async () => {
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        setExpectedOutput(0);
        setPriceImpact(0);
        return;
      }

      try {
        const amountInNano = toNano(amount);
        const { expectedOutput, priceImpact } = await getExpectedSwapAmount({
          fromAddress: selectedToken.contractAddress,
          toAddress: selectedCoin.contractAddress,
          amount: amountInNano,
          client
        });

        setExpectedOutput(expectedOutput);
        setPriceImpact(priceImpact);
      } catch (error) {
        console.error("Error calculating expected output:", error);
        setExpectedOutput(0);
        setPriceImpact(0);
      }
    };

    if (client && selectedToken && selectedCoin) {
      calculateExpectedOutput();
    }
  }, [amount, selectedToken, selectedCoin, client]);

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
  const handleTokenSelection = (token) => {
    setSelectedToken(token);
    setFilteredCoins(coins);
    onClose();
  };

  // Handle coin selection
  const handleCoinSelection = (token) => {
    setSelectedCoin(token);
    setFilteredCoins(coins);
    onSecondModalClose();
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

  // Handle swap
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

      setIsLoading(true);
      toast.info("Preparing swap...");

      const amountInNano = toNano(amount);
      const slippageTolerance = 0.5; // 0.5% slippage tolerance
      const deadlineMinutes = 5; // 5 minutes deadline

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
        const { expectedOutput } = await getExpectedSwapAmount({
          fromAddress: selectedToken.contractAddress,
          toAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
          amount: toNano("1"),
          client
        });
        
        const jettonPriceToTon = toNano(expectedOutput.toString() || "0.1");
        
        await swapJettonForTon(
          selectedToken.contractAddress,
          amountInNano,
          jettonPriceToTon, // Use calculated price or fallback
          slippageTolerance,
          deadlineMinutes
        );
        toast.success(`Successfully swapped ${amount} ${selectedToken.symbol} to TON!`);
      }
      // Jetton to Jetton
      else {
        toast.info(`Swapping ${amount} ${selectedToken.symbol} to ${selectedCoin.symbol}...`);
        
        // For Jetton to Jetton, we need to calculate the price in TON
        const { expectedOutput } = await getExpectedSwapAmount({
          fromAddress: selectedToken.contractAddress,
          toAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
          amount: toNano("1"),
          client
        });
        
        const jettonPriceToTon = toNano(expectedOutput.toString() || "0.1");
        
        await swapJettonForJetton(
          selectedToken.contractAddress,
          selectedCoin.contractAddress,
          amountInNano,
          jettonPriceToTon, // Use calculated price or fallback
          toNano("0"), // Minimum amount out
          deadlineMinutes
        );
        toast.success(`Successfully swapped ${amount} ${selectedToken.symbol} to ${selectedCoin.symbol}!`);
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
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // State for swap icon animation
  const [swapHover, setSwapHover] = useState(false);

  return (
    <Box minH="100vh" w="100vw" fontFamily="'Baloo 2', sans-serif" bgGradient="radial(circle at 50% 30%, #2a1833 0%, #0d0904 100%)" position="relative" overflowX="hidden">
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
      <Flex minH="100vh" align="center" justify="center" pt={{ base: "80px", md: "100px" }} px={{ base: 2, sm: 4 }}>
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
                onClick={onOpen}
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
              >
                <Image src={selectedToken.imageUrl} boxSize={6} borderRadius="full" />
                <Text>{selectedToken.symbol}</Text>
                <Icon as={MdOutlineKeyboardDoubleArrowDown} />
              </Button>
            </Flex>
            <Flex justify="space-between" color="#b0b0b0" fontSize="xs">
              <Text>≈ ${(parseFloat(amount || 0) * tonPrice).toFixed(2)}</Text>
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
                if (amount && expectedOutput) {
                  setAmount(expectedOutput.toString());
                  setExpectedOutput(parseFloat(amount));
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
                value={expectedOutput ? expectedOutput.toFixed(6) : "0.0"}
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
                onClick={onSecondModalOpen}
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
              >
                <Image src={selectedCoin.imageUrl} boxSize={6} borderRadius="full" />
                <Text>{selectedCoin.symbol}</Text>
                <Icon as={MdOutlineKeyboardDoubleArrowDown} />
              </Button>
            </Flex>
            <Flex justify="space-between" color="#b0b0b0" fontSize="xs">
              <Text>≈ ${(expectedOutput * (selectedCoin.symbol === "TON" ? tonPrice : 1)).toFixed(2)}</Text>
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
            >
              Swap
            </MotionButton>
          )}

          {/* Info Section */}
          <Box mt={4} bg="#18131c" borderRadius="lg" p={4} color="white" fontSize="sm">
            <Flex align="center" mb={2}>
              <Text fontWeight="bold" color="#ffe066">1 {selectedToken.symbol}</Text>
              <Box mx={2} color="#ffe066">⇄</Box>
              <Text fontWeight="bold">
                {amount && expectedOutput 
                  ? (expectedOutput / parseFloat(amount)).toFixed(4) 
                  : getHardcodedRate(selectedToken.contractAddress, selectedCoin.contractAddress).toFixed(4)
                } {selectedCoin.symbol}
              </Text>
              <Spacer />
              <Text color="#b0b0b0" fontSize="xs">Fee 0.01 TON</Text>
          </Flex>
            <Flex justify="space-between" color="#b0b0b0" fontSize="xs" mb={1}>
              <Text>Minimum received</Text>
              <Text color="white">
                {expectedOutput 
                  ? (expectedOutput * 0.995).toFixed(6) 
                  : '0'
                } {selectedCoin.symbol}
              </Text>
          </Flex>
            <Flex justify="space-between" color="#b0b0b0" fontSize="xs" mb={1}>
              <Text>Slippage tolerance</Text>
              <Text color="#ffe066" fontWeight="bold">0.50%</Text>
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
                  <Flex 
                    key={index} 
                    gap={4} 
                    alignItems="center" 
                    py={2} 
                    px={2} 
                    borderRadius="md" 
                    _hover={{ bg: "#23202a", cursor: "pointer" }} 
                    onClick={() => handleTokenSelection(coin)}
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
                  <Flex 
                    key={index} 
                    gap={4} 
                    alignItems="center" 
                    py={2} 
                    px={2} 
                    borderRadius="md" 
                    _hover={{ bg: "#23202a", cursor: "pointer" }} 
                    onClick={() => handleCoinSelection(coin)}
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
            <Button colorScheme="red" mr={3} onClick={onSecondModalClose} borderRadius="xl">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Dex;

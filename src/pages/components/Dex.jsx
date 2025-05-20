import React from "react";
import {
  Flex,
  Box,
  Text,
  Image,
  Icon,
  useBreakpointValue,
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
import { useState, useEffect } from "react";
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
import axios from "axios";
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

  useEffect(() => {
    const tonPrice = async () => {
      const tonPrice = await fetchTonPrice();
      console.log(tonPrice?.usd);
      setTonPrice(tonPrice?.usd);
    };

    tonPrice();
  }, []);

  const fetchBalance = async () => {
    try {
      if (client && connected) {
        const wallet = await client.getLastBlock();
        const seqno = wallet.last.seqno;
        const balance = await client.getAccount(seqno, userAddress);
        const tonBalance = parseFloat(fromNano(balance.account.balance.coins));
        console.log(tonBalance.toFixed(4));
        setTonBalance(tonBalance.toFixed(4));
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) {
        await fetchBalance();
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [client, connected, userAddress]); // Add dependencies here

  useEffect(() => {
    if (selectedToken && selectedCoin && amount) {
      fetchEquivalentAmount(
        selectedToken.contractAddress,
        selectedCoin.contractAddress,
        amount
      );
    }
  }, [selectedToken, selectedCoin, amount]);

  const fetchTonPrice = async () => {
    const apiKey = "CG-HVh6stdWnBt3jz9oHydUvJMa"; // Replace with your actual API key

    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price",
        {
          params: {
            ids: "the-open-network",
            vs_currencies: "usd",
          },
          headers: {
            "Content-Type": "application/json",
            "x-cg-demo-api-key": apiKey,
          },
        }
      );

      return response.data["the-open-network"];
    } catch (error) {
      console.error("Error fetching TON price:", error);
      return null; // Return null or some default value in case of error
    }
  };

  const fetchTokenDetails = async (contractAddress) => {
    try {
      const response = await axios.get(
        `https://api.dexscreener.io/latest/dex/tokens/${contractAddress}`
      );
      console.log(response.data);

      return response.data.pairs[0];
    } catch (error) {
      console.error("Error fetching token details:", error);
      return null;
    }
  };
  const fetchEquivalentAmount = async (fromAddress, toAddress, amount) => {
    console.log("toaddress", toAddress);
    if (Number(amount) <= 0) return;
    try {
      let fromTokenData;
      let toTokenData;

      if (selectedToken.symbol === "TON") {
        fromTokenData = await fetchTonPrice();
        toTokenData = await fetchTokenDetails(toAddress);

        console.log("fromTokenData:", fromTokenData);
        console.log("toTokenData:", toTokenData);

        if (fromTokenData && toTokenData) {
          const fromTokenPrice = parseFloat(fromTokenData.usd);
          const toTokenPrice = parseFloat(toTokenData.priceUsd);

          console.log("fromTokenPrice:", fromTokenPrice);
          console.log("toTokenPrice:", toTokenPrice);
          const amountInUSD = amount * fromTokenPrice;
          setAmountInUSD(amountInUSD);

          if (toTokenPrice !== 0) {
            const equivalentAmount = (amount * fromTokenPrice) / toTokenPrice;
            const expectedAmountOut = await getExpectedSwapAmount(
              toAddress,
              amount
            );
            console.log(
              "Expected amount out considering price impact:",
              expectedAmountOut
            );
            console.log("Equivalent amount:", equivalentAmount);
            const priceImpactPercentage =
              ((equivalentAmount - expectedAmountOut) / equivalentAmount) * 100;
            console.log(
              "Price Impact Percentage:",
              priceImpactPercentage.toFixed(2) + "%"
            );
            const priceAMount = expectedAmountOut * toTokenPrice;

            console.log("real", amountInUSD);
            setPriceAmount(priceAMount);

            setAmountOut(expectedAmountOut);
            setPriceImpact(priceImpactPercentage);
            setFromTokenPrice(fromTokenPrice);
            setToTokenPrice(toTokenPrice);
          } else {
            console.error("Error: Division by zero (toTokenPrice is 0)");
          }
        }
      } else if (selectedCoin.symbol === "TON") {
        fromTokenData = await fetchTokenDetails(fromAddress);
        toTokenData = await fetchTonPrice();

        console.log("fromTokenData:", fromTokenData);
        console.log("toTokenData:", toTokenData);

        if (fromTokenData && toTokenData) {
          const fromTokenPrice = parseFloat(fromTokenData.priceUsd);
          const toTokenPrice = parseFloat(toTokenData.usd);

          console.log("fromTokenPrice:", fromTokenPrice);
          console.log("toTokenPrice:", toTokenPrice);

          if (toTokenPrice !== 0) {
            const equivalentAmount = (amount * fromTokenPrice) / toTokenPrice;
            const expectedAmountOut = await getExpectedSwapAmount(
              fromAddress,
              amount
            );

            console.log("Equivalent amount:", equivalentAmount);
            console.log("expected amount out");

            const priceAMount = equivalentAmount * fromTokenPrice;

            const amountInUSD = amount * fromTokenPrice;
            console.log("real", amountInUSD);
            console.log("real", amountInUSD);
            setPriceAmount(priceAMount);
            setAmountOut(expectedAmountOut);
            setAmountInUSD(amountInUSD);
            setFromTokenPrice(fromTokenPrice);
            setToTokenPrice(toTokenPrice);
          } else {
            console.error("Error: Division by zero (toTokenPrice is 0)");
          }
        }
      } else {
        fromTokenData = await fetchTokenDetails(fromAddress);
        toTokenData = await fetchTokenDetails(toAddress);

        console.log("fromTokenData:", fromTokenData);
        console.log("toTokenData:", toTokenData);

        if (fromTokenData && toTokenData) {
          const fromTokenPrice = parseFloat(fromTokenData.priceUsd);
          const toTokenPrice = parseFloat(toTokenData.priceUsd);

          console.log("fromTokenPrice:", fromTokenPrice);
          console.log("toTokenPrice:", toTokenPrice);

          if (toTokenPrice !== 0) {
            const equivalentAmount = (amount * fromTokenPrice) / toTokenPrice;
            console.log("Equivalent amount:", equivalentAmount);
            const amountInUSD = amount * fromTokenPrice;

            setAmountOut(equivalentAmount.toFixed(5));
            setAmountInUSD(amountInUSD);
            setFromTokenPrice(fromTokenPrice);
            setToTokenPrice(toTokenPrice);
          } else {
            console.error("Error: Division by zero (toTokenPrice is 0)");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching equivalent amount:", error);
    }
  };

  const getExpectedSwapAmount = async (address, amount) => {
    const client = new TonClient4({
      endpoint: "https://mainnet-v4.tonhubapi.com",
    });

    const factory = client.open(
      Factory.createFromAddress(MAINNET_FACTORY_ADDR)
    );

    const contractAddress = Address.parse(address);
    const jetton = client.open(JettonRoot.createFromAddress(contractAddress));

    const pool = client.open(
      Pool.createFromAddress(
        await factory.getPoolAddress({
          poolType: PoolType.VOLATILE,
          assets: [Asset.native(), Asset.jetton(jetton.address)],
        })
      )
    );

    const lastBlock = await client.getLastBlock();
    const poolState = await client.getAccountLite(
      lastBlock.last.seqno,
      pool.address
    );

    if (poolState.account.state.type !== "active") {
      throw new Error("Pool does not exist.");
    }

    const amountIn = toNano(amount);

    let expectedAmountOut;

    if (selectedToken.symbol === "TON") {
      expectedAmountOut = await pool.getEstimatedSwapOut({
        assetIn: Asset.native(),
        amountIn,
      });
      console.log(fromNano(expectedAmountOut.amountOut));
    } else {
      expectedAmountOut = await pool.getEstimatedSwapOut({
        assetIn: Asset.jetton(jetton.address),
        amountIn,
      });
    }

    // Slippage handling (1%)
    const minAmountOut =
      (expectedAmountOut.amountOut * BigInt(99)) / BigInt(100); // expectedAmountOut - 1%
    console.log("Min amount out after slippage:", fromNano(minAmountOut));

    return fromNano(minAmountOut);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
    setButtonText("Connect Wallet Address");
    setButtonColor("bg-[#0680fb] text-white");
  };

  // Function to filter coins based on search query
  const fetchTokenDetailsFromTon = async (contractAddress) => {
    console.log("fetching ton details");
    const options = {
      method: "GET",
      headers: { accept: "application/json" },
      url: `https://ton-mainnet.s.chainbase.online/2gdN9YBhuIewH7tTgyVeCkCKFl5/v1/getTokenData?address=${contractAddress}`,
    };

    try {
      const response = await axios(options);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching token details:", error);
      throw error;
    }
  };

  const fetchAdditionalContent = async (url) => {
    if (!url) {
      throw new Error("Invalid URL");
    }

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching additional content:", error);
      throw error;
    }
  };

  const isTonContractAddress = (address) => {
    // Assuming TON contract addresses start with "EQ" and are 48 characters long
    const tonAddressPattern = /^EQ[A-Za-z0-9_-]/;
    return tonAddressPattern.test(address);
  };

  const handleSearch = async (query) => {
    if (isTonContractAddress(query)) {
      // Fetch coin details using the contract address
      try {
        const coinDetails = await fetchTokenDetailsFromTon(query);
        console.log("Coin Details:", coinDetails);

        if (coinDetails.result && coinDetails.result.jetton_content) {
          const jettonContent = coinDetails.result.jetton_content;

          if (jettonContent.type === "onchain") {
            // Use the on-chain data directly
            const onChainData = jettonContent.data;
            console.log("On-chain Data:", onChainData);
            const combinedDetails = {
              name: onChainData.name,
              symbol: onChainData.symbol,
              imageUrl: onChainData.image,
              contractAddress: query,
            };

            setFilteredCoins([combinedDetails]);
          } else if (jettonContent.type === "offchain") {
            // Fetch the off-chain data from the URI
            const offChainUri = jettonContent.data;
            console.log("Off-chain URI:", offChainUri);

            if (offChainUri) {
              const additionalContent = await fetchAdditionalContent(
                offChainUri
              );
              console.log("Off-chain Data:", additionalContent);
              const combinedDetails = {
                name: additionalContent.name,
                symbol: additionalContent.symbol,
                imageUrl: additionalContent.image,
                contractAddress: query,
              };
              setFilteredCoins([combinedDetails]);
            } else {
              console.error("Off-chain URI is undefined");
              setFilteredCoins([coinDetails]);
            }
          }
        } else {
          setFilteredCoins([coinDetails]);
        }
      } catch (error) {
        console.error("Error fetching coin details:", error);
        setFilteredCoins([]); // Clear the list or show a message indicating the coin wasn't found
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

  // Function to handle selection of a token
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
    if (!connected) {
      toast.error("Please connect wallet");
      return;
    }
    if (Number(amount) <= 0) return;
    setIsLoading(true);
    const tonData = await fetchTonPrice();
    let toAmount;
    if (fromTokenPrice) {
      const tokenInTon = toNano(
        (Number(amount) * fromTokenPrice) / parseFloat(tonData.usd)
      );
      toAmount =
        Number(fixedFee) > Number(tokenInTon) * 0.01 ? fixedFee : tokenInTon;
    } else {
      toAmount = fixedFee || toNano("0.01");
    }
    try {
      if (selectedToken.symbol === "TON") {
        await swapTonForJetton(selectedCoin.contractAddress, toNano(amount));
      } else if (selectedCoin.symbol === "TON") {
        await swapJettonForTon(
          selectedToken.contractAddress,
          toNano(amount),
          toAmount
        );
      } else if (
        selectedCoin.symbol != "TON" &&
        selectedToken.symbol != "TON"
      ) {
        await swapJettonForJetton(
          selectedToken.contractAddress,
          selectedCoin.contractAddress,
          toNano(amount),
          toAmount
        );
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };
  const [tonConnectUI] = useTonConnectUI();

  // Animation variants
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
    <Box minH="100vh" w="100vw" fontFamily="'Baloo 2', sans-serif" bgGradient="radial(circle at 50% 30%, #2a1833 0%, #0d0904 100%)" position="relative">
      {/* Navbar */}
      <Flex as="nav" w="full" px={{ base: 4, md: 12 }} py={4} align="center" justify="space-between" position="fixed" top={0} left={0} zIndex={10} bg="rgba(13,9,4,0.85)" boxShadow="0 2px 24px 0 rgba(0,0,0,0.25)">
        <HStack spacing={3}>
          <CandyLogo />
          <Text fontWeight="bold" fontSize="2xl" color="white" letterSpacing="wide">CandySwap</Text>
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
          minW="170px"
          minH="48px"
        >
          <TonConnectButton style={{ width: "100%", height: "100%", background: "none", border: "none", color: "white", fontWeight: "bold", fontSize: "1.1rem", borderRadius: "999px", padding: "0 24px", cursor: "pointer" }} />
        </Box>
      </Flex>

      {/* Centered Swap Card */}
      <Flex minH="100vh" align="center" justify="center" pt="100px">
        <MotionBox
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          bg="rgba(13,9,4,0.95)"
          borderRadius="2xl"
          boxShadow="0 0 32px 4px #e35b5b55, 0 1.5px 0 0 #e35b5b"
          border="2px solid #e35b5b"
          p={{ base: 4, md: 8 }}
          w={{ base: "95vw", sm: "420px", md: "420px" }}
          maxW="98vw"
          position="relative"
        >
          {/* Header */}
          <Text fontSize="xl" fontWeight="bold" mb={6} bgGradient="linear(to-r, #e35b5b, #ffe066)" bgClip="text">
            On-chain swap
            </Text>

          {/* Token Inputs */}
          <Box mb={3} bg="#18131c" borderRadius="lg" p={4} display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Text color="#b0b0b0" fontSize="sm">You will pay</Text>
              <Text fontSize="2xl" color="white" fontWeight="bold">{amount || 0}</Text>
              <Text color="#636e9d" fontSize="xs">Balance: -</Text>
                </Box>
            <Button rightIcon={<TonIcon />} bg="#23202a" color="white" borderRadius="xl" fontWeight="bold" px={4} py={2} _hover={{ bg: "#2a1833" }} onClick={onOpen}>
              {selectedToken.symbol}
            </Button>
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
              onClick={() => setSwapHover((h) => !h)}
              style={{
                display: "inline-flex",
                background: "black",
                borderRadius: "50%",
                border: "4px solid #18131c",
                padding: "8px",
                boxShadow: "0 0 12px 2px #e35b5b55",
                cursor: "pointer",
              }}
          >
              <Icon as={FaArrowDown} boxSize={12} color="#e35b5b" />
            </MotionBox>
          </Flex>

          <Box mb={3} bg="#18131c" borderRadius="lg" p={4} display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Text color="#b0b0b0" fontSize="sm">You will receive</Text>
              <Text fontSize="2xl" color="white" fontWeight="bold">{amountOut || 0}</Text>
              <Text color="#636e9d" fontSize="xs">Balance: -</Text>
                </Box>
            <Button rightIcon={<NotIcon />} bg="#23202a" color="white" borderRadius="xl" fontWeight="bold" px={4} py={2} _hover={{ bg: "#2a1833" }} onClick={onSecondModalOpen}>
              {selectedCoin.symbol}
            </Button>
          </Box>

          {/* Connect Wallet Button */}
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
            leftIcon={<FaWallet />}
          >
            Connect wallet
          </MotionButton>

          {/* Info Section */}
          <Box mt={4} bg="#18131c" borderRadius="lg" p={4} color="white" fontSize="sm">
            <Flex align="center" mb={2}>
              <Text fontWeight="bold" color="#ffe066">1 TON</Text>
              <Box mx={2} color="#ffe066">⇄</Box>
              <Text fontWeight="bold">100.4567 NOT</Text>
              <Spacer />
              <Text color="#b0b0b0" fontSize="xs">Fee 0.01 TON</Text>
          </Flex>
            <Flex justify="space-between" color="#b0b0b0" fontSize="xs" mb={1}>
              <Text>Minimum received</Text>
              <Text color="white">350.87 NOT</Text>
          </Flex>
            <Flex justify="space-between" color="#b0b0b0" fontSize="xs" mb={1}>
              <Text>Price impact</Text>
              <Text color="white">&lt;0.01%</Text>
        </Flex>
            <Flex justify="space-between" color="#b0b0b0" fontSize="xs" mb={1}>
              <Text>Slippage tolerance</Text>
              <Text color="#ffe066" fontWeight="bold">0.50%</Text>
          </Flex>
            <Flex justify="space-between" color="#b0b0b0" fontSize="xs">
              <Text>Tx fee</Text>
              <Text color="white">0.01 TON</Text>
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

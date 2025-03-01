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

  // async function sendFee(amount) {
  //   if (!connected) {
  //     console.error("Wallet not connected. Please connect using the UI.");
  //     return;
  //   }

  //   if (!amount || isNaN(amount) || amount <= 0) {
  //     console.error("Invalid amount provided:", amount);
  //     return;
  //   }

  //   const feeAddress = Address.parse(
  //     "UQAp050vzuXoS-LlgRB7KJnvY3wisP1ewpGldwQWKf3pmfzL"
  //   ); // Replace with actual recipient address (if needed)
  //   const feePercentage = 0.01; // 1% fee
  //   const Amount = parseFloat(amount * feePercentage);
  //   const nanoTons = toNano(Amount);
  //   console.log(nanoTons); // Calculate fee amount
  //   const sendAmount = nanoTons.toString();
  //   console.log(sendAmount);
  //   console.log(feeAddress);

  //   const body = beginCell()
  //     .storeUint(0, 32)
  //     .storeStringTail("Hello Ton")
  //     .endCell();

  //   try {
  //     await tonConnectUI.sendTransaction({
  //       validUntil: Math.floor(Date.now() / 1000) + 360,
  //       messages: [
  //         {
  //           address: feeAddress.toString({
  //             bounceable: false,
  //           }),
  //           amount: sendAmount,
  //         },
  //       ],
  //     });
  //     console.log("Transaction sent successfully!");
  //   } catch (error) {
  //     console.error("Error sending transaction:", error);
  //   }
  // }

  return (
    <Flex
      direction="column"
      minH="100vh"
      bgColor="rgba(0, 24, 19, 1)"
    >
    <Flex justify="space-between" align="center" p="4">
  <Flex align="center"> {/* Adding a Flex container for logo and text */}
    <Box
      maxW="80px"
      maxH="80px"
      overflow="hidden"
      borderRadius="lg"
      boxShadow="md"
      transition="transform 0.3s ease"
    >
      <Image
        src="/tcandy.jpg"
        alt="Logo"
        objectFit="contain"
        width="100%"
        height="100%"
        borderRadius="lg" // Keeps corners rounded
        transition="transform 0.3s ease" // Smooth transition for hover effect
        _hover={{ transform: "scale(1.1)" }} // Scale up on hover
      />
    </Box>
    <Text
      ml={2} // Margin-left for spacing between logo and text
      fontSize="xl" // Adjust font size as needed
      fontWeight="bold" // Bold text for emphasis
      color="white" // Change as necessary for visibility
    >
      CANDYSWAP
    </Text>
  </Flex>
  <Box
    as="div"
    className="ton-connect-button"
    sx={{
      display: "inline-block",
      borderRadius: "10px",
      border: "1px solid #357930",
      background: "",
      color: "white",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "background-color 0.3s",
      "&:hover": {
        backgroundColor: "#0D0904",
        border: "2px solid white",
      },
      "& .ton-connect-button__icon": {
        marginRight: "8px",
      },
    }}
  >
    <TonConnectButton />
  </Box>
</Flex>

      <Flex
        direction="column"
        justify="center"
        align="center"
        minH="100vh"
        gap={5}
      >
        {/* <Flex
          w={useBreakpointValue({ base: "85%", medium: "85%", lg: "30vw" })}
          justify={"end"}
          gap={5}
          p={3}
        >
          <Icon as={LuRefreshCw} boxSize={6} color={"#357930"} />
          <Icon as={GiSettingsKnobs} boxSize={6} color={"#357930"} />
        </Flex> */}
        <Flex
          // justify="center"
          minH="40vh"
          w={useBreakpointValue({ base: "85%", medium: "85%", lg: "40vw" })}
          borderRadius="15px"
          border="2px solid #357930"
          direction={"column"}
          gap={1}
          bg={"#d9d9d91a"}
        >
          <Flex direction={"column"} w={"100%"} p={5} gap={2}>
            <Flex
              gap={2}
              color={"white"}
              alignItems={"center"}
              cursor={"pointer"}
              onClick={onOpen}
            >
              <img
                src={selectedToken ? selectedToken.imageUrl : "/logoton.png"}
                width={40}
                height={40}
              />
              <Text fontSize={"md"}>
                {selectedToken ? selectedToken.symbol : "TON"}
              </Text>
              <Icon as={TriangleDownIcon} boxSize={3} />
            </Flex>

            <Input
              h={"10vh"}
              borderRadius={"10px"}
              bg={"rgba(0, 24, 19, 1)"}
              border={"none"}
              type="number"
              color={"white"}
              value={amount}
              onChange={handleAmountChange}
            />
          </Flex>

          <Flex
            bg="rgba(0, 24, 19, 1)"
            borderRadius="50%"
            p={2}
            w={useColorModeValue({ base: "6vw", medium: "6vw", lg: "3vw" })}
            h={useColorModeValue({ base: "12vh", medium: "12vh", lg: "6vh" })}
            justify="center"
            align="center"
            alignSelf={"center"}
          >
            <Icon
              as={MdOutlineKeyboardDoubleArrowDown}
              boxSize={6}
              color={"#357930"}
            />
          </Flex>

          <Flex direction={"column"} w={"100%"} p={5} gap={2}>
            <Flex
              gap={2}
              color={"white"}
              alignItems={"center"}
              cursor={"pointer"}
              onClick={onSecondModalOpen}
            >
              <img
                src={selectedCoin ? selectedCoin.imageUrl : "/nut.png"}
                width={40}
                height={40}
              />
              <Text fontSize={"md"}>
                {selectedCoin ? selectedCoin.symbol
                 : "NUT"}
              </Text>
              <Icon as={TriangleDownIcon} boxSize={3} />
            </Flex>

            <Input
              h={"10vh"}
              borderRadius={"10px"}
              bg={"rgba(0, 24, 19, 1)"}
              border={"none"}
              type="number"
              color={"white"}
              value={amountOut}
              placeholder={Number(0)}
              readOnly
            />
          </Flex>

          <Flex
            w={useBreakpointValue({ base: "93%", medium: "93%", lg: "30vw" })}
            alignSelf={"center"}
            borderRadius="10px"
            border="1px solid #357930"
            mb={3}
            direction={"column"}
            h={useColorModeValue({ base: "20vh", medium: "20vh", lg: "25vh" })}
          >
            <HStack p={2}>
              <Text
                textDecoration="underline"
                textDecorationStyle="dotted"
                textDecorationColor="#636e9d"
                color="#636e9d"
              >
                Rate
              </Text>
              <Spacer />
              <Text color={"white"}>
                {selectedToken ? `1 ${selectedToken.symbol}` : null} ={" "}
                {fromTokenPrice &&
                  toTokenPrice &&
                  (fromTokenPrice / toTokenPrice).toFixed(4)}{" "}
                {selectedCoin && selectedCoin.symbol}{" "}
              </Text>
            </HStack>

            <HStack p={2}>
              <Text
                textDecoration="underline"
                textDecorationStyle="dotted"
                textDecorationColor="#636e9d"
                color="#636e9d"
              >
                Minimum Received
              </Text>
              <Spacer />
              <Text color={"white"}>
                {" "}
                {selectedCoin && `${amountOut} ${selectedCoin.symbol}`}
              </Text>
            </HStack>

            <HStack p={2}>
              <Text
                textDecoration="underline"
                textDecorationStyle="dotted"
                textDecorationColor="#636e9d"
                color="#636e9d"
              >
                Price Impact
              </Text>
              <Spacer />
              <Text color={"white"}> {`<${priceImpact.toFixed(2)}% `}</Text>
            </HStack>

            <HStack p={2}>
              <Text
                textDecoration="underline"
                textDecorationStyle="dotted"
                textDecorationColor="#636e9d"
                color="#636e9d"
              >
                Tx Fee
              </Text>
              <Spacer />
              <Text color={"white"}> 0.2 - 0.05</Text>
            </HStack>
          </Flex>

          <Button
            alignSelf={"center"}
            w={useBreakpointValue({ base: "80%", medium: "80%", lg: "30vw" })}
            mb={4}
            bgColor={"#357930"}
            h={"8vh"}
            borderRadius={"10px"}
            _hover={{ bg: "#357930", opacity: 0.8 }}
            onClick={userAggregatorStatus ? handleSwap : initSwapAggregator}
            disabled={isLoading}
          >
            {isLoading
              ? "Loading..."
              : userAggregatorStatus
              ? "SWAP"
              : "Initialize"}
          </Button>

              {/* <Button
            alignSelf={"center"}
            w={useBreakpointValue({ base: "80%", medium: "80%", lg: "27vw" })}
            mb={4}
            bgColor={"#357930"}
            h={"8vh"}
            borderRadius={"10px"}
            _hover={{ bg: "#357930", opacity: 0.8 }}
            onClick={withdrawJetton}
            disabled={isLoading}
          >
            {isLoading
              ? "Loading..."
              : 'Withdraw Jettons'}
          </Button> */}
          
        </Flex>

        <Flex
          w={useBreakpointValue({ base: "85%", medium: "85%", lg: "30vw" })}
          borderRadius="15px"
          border="2px solid #357930"
          justifyContent={"space-between"}
          h={"15vh"}
          p={2}
        >
          <Flex gap={2} color={"white"} alignItems={"center"}>
            <Image src="/logoton.png" />
            <Text fontSize={"lg"}>TON</Text>
            <Icon as={TriangleUpIcon} boxSize={3} color={"green.400"} />
          </Flex>

          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"x-small"} color={"#636e9d"}>
              Price
            </Text>
            <Text fontSize={"larger"} color={"white"}>
              {tonPrice && `$ ${tonPrice}`}
            </Text>
          </Flex>
        </Flex>

        <HStack mb={7}>
          <Text color={"#636e9d"}>Built with love by </Text>
          <Text color={"#636e9d"}>TCANDY</Text>
        </HStack>
      </Flex>


      {/* MODAL FOR TOKENS */}
      <Modal
        isCentered
        onClose={onClose}
        isOpen={isOpen}
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        <ModalContent
          backgroundImage={`url(${bg.src})`}
          backgroundSize="contain"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          bgColor="#0D0904"
          color={"white"}
        >
          <ModalHeader>Select token</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction={"column"}>
              <Box>
                <InputGroup>
                  <InputLeftElement>
                    <SearchIcon />
                  </InputLeftElement>
                  <Input
                    border="2px solid #357930"
                    placeholder="Search assets or address"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </InputGroup>
              </Box>

              <Tabs>
                <TabList>
                  <Tab>Assets</Tab>
                  <Tab>Favourite</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <Flex direction={"column"} gap={5}>
                      {filteredCoins &&
                        filteredCoins.map((coin, index) => {
                          return (
                            <Flex
                              key={index}
                              gap={4}
                              alignItems={"center"}
                              onClick={() => handleTokenSelection(coin)}
                            >
                              <Box>
                                <Image src={coin.imageUrl} w={10} />
                              </Box>

                              <Flex direction={"column"}>
                                <Text fontWeight={"bolder"}>{coin.symbol}</Text>
                                <Text>{coin.name}</Text>
                              </Flex>
                            </Flex>
                          );
                        })}
                    </Flex>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isCentered
        onClose={onSecondModalClose}
        isOpen={isSecondModalOpen}
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        <ModalContent
          backgroundImage={`url(${bg.src})`}
          backgroundSize="contain"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          bgColor="#0D0904"
          color={"white"}
        >
          <ModalHeader>Select token</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction={"column"}>
              <Box>
                <InputGroup>
                  <InputLeftElement>
                    <SearchIcon />
                  </InputLeftElement>
                  <Input
                    placeholder="Search assets or address"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </InputGroup>
              </Box>

              <Tabs>
                <TabList>
                  <Tab>Assets</Tab>
                  <Tab>Favourite</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <Flex direction={"column"} gap={5}>
                      {filteredCoins &&
                        filteredCoins.map((coin, index) => {
                          return (
                            <Flex
                              key={index}
                              gap={4}
                              alignItems={"center"}
                              onClick={() => handleCoinSelection(coin)}
                            >
                              <Box>
                                <Image src={coin.imageUrl} w={10} />
                              </Box>

                              <Flex direction={"column"}>
                                <Text fontWeight={"bolder"}>{coin.symbol}</Text>
                                <Text>{coin.name}</Text>
                              </Flex>
                            </Flex>
                          );
                        })}
                    </Flex>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onSecondModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Dex;

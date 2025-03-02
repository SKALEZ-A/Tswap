import { Box, Button, Flex, Heading, Image, Text } from "@chakra-ui/react";

const FeaturesSection = () => {
  return (
    <Box className="container" mx="auto" mt="28" px={{ base: 4, lg: 0 }}>
    {/* Header Section */}
    <Box textAlign="center">
      <Heading fontSize={{ base: "30px", md: "5xl", lg: "56px" }} fontWeight="semibold">
        Seamless TON to NOT Swaps
      </Heading>
      <Text
        my={5}
        color="gray.500"
        fontSize={{ base: "14px", lg: "xl" }}
        fontWeight="medium"
      >
        Swap your TON tokens effortlessly with our intuitive platform. Experience <br /> fast and secure transactions without complexity.
      </Text>
    </Box>
  
    {/* Main Section */}
    <Flex
      direction={{ base: "column", md: "row", lg: "row" }}
      h={{ lg: "500px" }}
      gap={4}
      w="full"
    >
      {/* Left Box */}
      <Box
        bg="#51c848"
        w={{ base: "full", lg: "50%" }}
        borderRadius="xl"
        textAlign="center"
        pt={6}
        overflow="hidden"
      >
        <Heading fontSize={{ base: "25px", md: "4xl" }} fontWeight="semibold" color="white">
          Get Started with Swaps
        </Heading>
        <Button
              size="lg"
              bg="#357930"
              color="white"
              _hover={{ bg: "#357930" }}
              borderRadius="full"
              mt={2}
              px={8}
              onClick={() => router.push("/dex")}
            >
              Launch App
            </Button>
        <Box w={{ base: "200px", lg: "80%" }} mx="auto" h={{ lg: "250px" }} mt={4}>
          <Image src="/tcandy-removebg.png" alt="Swap Interface" boxSize="full" objectFit="cover" />
        </Box>
      </Box>
  
      {/* Right Box */}
      <Flex flexDir="column" gap={4} w={{ base: "full", lg: "50%" }}>
        <Box bg="gray.950" borderRadius="xl" h="50%" display="flex" alignItems="center" pl={10}>
          <Box w="60%">
            <Heading fontSize={{ base: "25px", md: "4xl" }} fontWeight="semibold" color="white">
              Secure & Instant Swaps
            </Heading>
            <Text my={5} color="gray.500" fontSize={{ base: "14px", lg: "xl" }} fontWeight="medium">
              Our platform ensures fast and secure swaps between TON and NOT coin, giving you full control over your assets.
            </Text>
          </Box>
        </Box>
  
        <Box bg="#357930" h="50%" borderRadius="xl" display="flex" alignItems={{ lg: "center" }} pl={10}>
          <Box w="60%">
            <Heading fontSize={{ base: "25px", md: "4xl" }} fontWeight="semibold" color="white">
              Maximize Your Trading
            </Heading>
            <Text my={5} color="gray.300" fontSize={{ base: "14px", lg: "xl" }} fontWeight="medium">
              Get the best rates for your swaps with our optimized liquidity pools, ensuring efficient and cost-effective transactions.
            </Text>
          </Box>
        </Box>
      </Flex>
    </Flex>
  </Box>
  );
};

export default FeaturesSection;

import { Box, Flex, Heading, Image, Text, VStack, SimpleGrid } from "@chakra-ui/react";

const AboutSection = () => {
  return (
    <Box className="container" mx="auto" px={{ base: 4, lg: 0 }} bg="transparent" zIndex={99}>
      {/* About Section */}
      <Text color="#357930" fontWeight="medium" fontSize="lg" mb={6} mt={20}>
        About Our Swap Platform:
      </Text>

      <Flex align="center" direction={{ base: "column", lg: "row" }}>
        {/* Left Content */}
        <Box w={{ base: "full", lg: "50%" }} order={{ base: 2, lg: 1 }} mt={{ base: 2, lg: 0 }}>
          <Heading fontSize={{ base: "4xl", lg: "6xl" }} fontWeight="medium">
            The easiest way to swap your {" "}
            <Text as="span" color="#357930">
              TON tokens
            </Text>{" "}
            for {" "}
            <Text as="span" color="#357930">
              NOT coins
            </Text>
          </Heading>

          <Text mt={5} color="gray.500" fontWeight="medium" fontSize={{ base: "14px", lg: "xl" }}>
            Our swap platform is designed to provide a seamless, secure, and efficient way to
            exchange TON tokens for NOT coins. With a focus on transparency and ease of use, we
            ensure the best rates and fastest transactions. Our mission is to empower users with a
            reliable swapping experience, backed by secure infrastructure and innovative technology.
          </Text>
        </Box>

        {/* Right Image */}
        <Box order={{ base: 1, lg: 2 }}>
          <Image src="/tcandy-removebg.png" alt="Swap Interface" />
        </Box>
      </Flex>

      {/* Stats Section */}
      <Box mt={9} mb={48}>
        <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={6} mx="auto" w={{ lg: "70%" }} textAlign="center">
          <VStack>
            <Heading fontSize={{ base: "2xl", lg: "5xl" }} fontWeight="semibold">
              10K+
            </Heading>
            <Text fontWeight="medium" color="gray.500" fontSize={{ base: "12px", lg: "xl" }}>
              Successful swaps
            </Text>
          </VStack>
          <VStack>
            <Heading fontSize={{ base: "2xl", lg: "5xl" }} fontWeight="semibold">
              20K+
            </Heading>
            <Text fontWeight="medium" color="gray.500" fontSize={{ base: "12px", lg: "xl" }}>
              Active users
            </Text>
          </VStack>
          <VStack>
            <Heading fontSize={{ base: "2xl", lg: "5xl" }} fontWeight="semibold">
              99.9%
            </Heading>
            <Text fontWeight="medium" color="gray.500" fontSize={{ base: "12px", lg: "xl" }}>
              Swap success rate
            </Text>
          </VStack>
          <VStack>
            <Heading fontSize={{ base: "2xl", lg: "5xl" }} fontWeight="semibold">
              15+
            </Heading>
            <Text fontWeight="medium" color="gray.500" fontSize={{ base: "12px", lg: "xl" }}>
              Partner integrations
            </Text>
          </VStack>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default AboutSection;

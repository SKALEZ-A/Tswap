import { Box, Button, Flex, Heading, Image, Text } from "@chakra-ui/react";

const DownloadSection = () => {
  return (
    <Box mx="auto" className="container" mt={24} px={{ base: 4, lg: 0 }}>
      <Flex
        rounded="2xl"
        px={{ base: 5, lg: 10 }}
        py={8}
        align="center"
        bg="#51c848"
      >
        {/* Left Content */}
        <Box w={{ base: "100%", lg: "60%" }}>
          <Heading
            fontSize={{ base: "4xl", lg: "6xl" }}
            fontWeight="normal"
            color="white"
          >
            Download the app and swap your assets seamlessly
          </Heading>

          <Flex gap={6} mt={9}>
            <Button
              size="lg"
              bg="#357930"
              color="white"
              _hover={{ bg: "#357930" }}
              borderRadius="full"
              px={8}
              onClick={() => router.push("/dex")}
            >
              Launch App
            </Button>
            <Button
              size="lg"
              bg="#357930"
              color="white"
              _hover={{ bg: "#357930" }}
              borderRadius="full"
              px={8}
            >
              Start Building
            </Button>
          </Flex>
        </Box>

        {/* Right Image */}
        <Box display={{ base: "none", lg: "block" }} position="relative">
          <Flex
            position="absolute"
            top="172px"
            left="100px"
            align="center"
            gap={2}
          >
           
           
          </Flex>

          <Image src="/tcandy-removebg.png" alt="candy logo" width={400} />
        </Box>
      </Flex>
    </Box>
  );
};

export default DownloadSection;

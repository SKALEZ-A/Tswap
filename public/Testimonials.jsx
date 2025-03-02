import { Box, Flex, Heading, Image, Text, VStack } from "@chakra-ui/react";

const Testimonials = () => {
    const testimonials = [
        {
          name: "Alex Matthew",
          image: "/dwayne-joe-47DNuDf2Ups-unsplash.jpg",
          text: "Swapping assets on this platform is seamless! The speed and security make it my go-to for exchanging between TON and Not Coin.",
        },
        {
          name: "Sophia Carter",
          image: "/dwayne-joe-47DNuDf2Ups-unsplash.jpg",
          text: "I’ve never had such a smooth experience swapping tokens. The low fees and fast transactions are a game-changer!",
        },
        {
          name: "Daniel Smith",
          image: "/dwayne-joe-47DNuDf2Ups-unsplash.jpg",
          text: "Reliable and efficient! This swap platform makes it easy to move between TON and Not Coin with just a few clicks.",
        },
        {
          name: "Emily Johnson",
          image: "/dwayne-joe-47DNuDf2Ups-unsplash.jpg",
          text: "I was skeptical at first, but after using it, I’m impressed! The interface is user-friendly, and the transactions are lightning-fast.",
        },
        {
          name: "Michael Brown",
          image: "/dwayne-joe-47DNuDf2Ups-unsplash.jpg",
          text: "Finally, a swap platform that gets it right! Secure, fast, and easy to use—what more could you ask for?",
        },
      ];

  return (
    <Box className="container" mx="auto" px={{ base: 4, lg: 0 }}>
      {/* Heading */}
      <Heading textAlign="center" fontWeight="medium" mb={16} fontSize={{ base: "4xl", lg: "6xl" }}>
        Thousands of users <br /> talk about us
      </Heading>

      {/* Testimonials */}
      <Flex wrap="wrap" justify="center" gap={5}>
        {testimonials.map((testimonial, index) => (
          <Box
            key={index}
            bg="blackAlpha.900"
            borderRadius="lg"
            w="400px"
            px={6}
            py={5}
          >
            <Flex align="center" gap={3} mb={4}>
              <Image src={testimonial.image} alt={testimonial.name} w="40px" h="40px" borderRadius="full" />
              <Text fontWeight="medium">{testimonial.name}</Text>
            </Flex>
            <Text color="gray.300" fontSize="base">{testimonial.text}</Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default Testimonials;

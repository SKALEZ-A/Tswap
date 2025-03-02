"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  HStack,
  Link,
  useDisclosure,
  Image,
  VStack, SimpleGrid
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import FeaturesSection from "./Features";
import AboutSection from "./About";
import Testimonials from "./Testimonials";
import DownloadSection from "./DownloadSection";
import Background from "./background";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const router = useRouter();

  return (
    <>
    
    <Box position="fixed" top={0} left={0} right={0} zIndex={10} px={4}>
      <Container maxW="container.xl">
        <Flex py={4} justify="space-between" align="center">
          <HStack spacing={2}>
            <Image src="/tcandy.jpg" rounded={"sm"} alt="Logo" w={8} h={8} />
            <Text fontSize="xl" fontWeight="bold">
              CANDYSWAP
            </Text>
          </HStack>

          <HStack spacing={8} display={{ base: "none", md: "flex" }}>
            <Link href="#stats">Stats</Link>
            <Link href="#docs">Docs</Link>
            <Button
              bg="rgba(164, 255, 237, 1)"
              color="black"
              _hover={{ bg: "rgba(164, 255, 237, 0.8)" }}
              borderRadius="full"
              px={6}
              onClick={() => router.push("/dex")}
            >
              Launch App
            </Button>
          </HStack>

          <Box display={{ base: "block", md: "none" }} onClick={onToggle}>
            {isOpen ? <X /> : <Menu />}
          </Box>
        </Flex>

      
        <Box
          display={{ base: isOpen ? "block" : "none", md: "none" }}
          pb={4}
          bg="white"
          borderRadius="md"
          shadow="md"
          mt={2}
        >
          <Flex direction="column" spacing={4}>
            <Link py={2} px={4} href="#stats">
              Stats
            </Link>
            <Link py={2} px={4} href="#docs">
              Docs
            </Link>
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
          </Flex>
        </Box>
      </Container>
    </Box>
    

    </>



  );
};

// Floating image component with animation
const FloatingImage = ({ src, initialPosition }) => {
  const [position, setPosition] = useState(initialPosition);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition({
        x: Math.random() * (window.innerWidth - 100), // Subtract image width
        y: Math.random() * (window.innerHeight - 100), // Subtract image height
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <MotionBox
      position="absolute"
      animate={{
        x: position.x,
        y: position.y,
        rotate: [0, 10, -10, 0],
      }}
      transition={{
        duration: 4,
        ease: "easeInOut",
      }}
    >
      <Image
        src={src}
        alt="Floating candy"
        boxSize={{ base: "70px", md: "130px" }}
        objectFit="cover"
        opacity="0.7"
        rounded={"2xl"}
      />
    </MotionBox>
  );
};


const FloatingElement = ({ children, ...props }) => (
  <MotionBox
    position="absolute"
    animate={{
      y: [0, 20, 0],
      rotate: [0, 10, -10, 0],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    {...props}
  >
    {children}
  </MotionBox>
);


const Footer = () => (
  <Box bg="rgba(0, 24, 19, 0.9)" color="white" py={12}>
    <Container maxW="container.xl">
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "center", md: "flex-start" }}
        gap={8}
      >
        <Box>
          <Heading size="md" mb={4}>
            CANDYSWAP
          </Heading>
          <Text color="gray.400">The next generation of DeFi trading</Text>
        </Box>

        <HStack
          spacing={12}
          wrap="wrap"
          justify={{ base: "center", md: "flex-end" }}
        >
          <Link href="#features">Features</Link>
          <Link href="#developers">Developers</Link>
          <Link href="#community">Community</Link>
          <Link href="#governance">Governance</Link>
        </HStack>
      </Flex>
    </Container>
  </Box>
);

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Initialize floating images with random positions
  const floatingImages = [
    { src: "/tcandy.jpg", pos: { x: 100, y: 100 } },
    { src: "/tcandy.jpg", pos: { x: 300, y: 200 } },
    { src: "/tcandy.jpg", pos: { x: 500, y: 300 } },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration errors

  return (
    <Box
      minH="100vh"
      bg="rgba(0, 24, 19, 1)"
      color="white"
      position="relative"
      overflow="hidden"
      zIndex={1}
    >
      <Navbar />

   
      <Box maxW="95%" mx="auto" px={6} zIndex={1} position="relative">
        <Background/>

      <Container maxW="container.xl" centerContent>
        <MotionFlex
          direction="column"
          align="center"
          justify="center"
          minH="100vh"
          textAlign="center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          px={4}
        >
          <Heading
            as="h1"
            size={{ base: "2xl", md: "4xl" }}
            maxW="800px"
            lineHeight="1.2"
            mb={8}
          >
            The Universal Dex
            <br />
            For The TON Blockchain.
          </Heading>

          <Text
            fontSize={{ base: "lg", md: "xl" }}
            maxW="600px"
            mb={12}
            color="gray.400"
          >
            Explore a wide range of crypto assets across the TON Blockchain, swap assets with minimal fees and lightning fast speed.
          </Text>

          <HStack spacing={4}>
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
              variant="outline"
              borderColor="#357930"
              color="#357930"
              _hover={{ bg: "#2d6627", color: "white" }}
              borderRadius="full"
              px={8}
            >
              Start Building
            </Button>
          </HStack>
        </MotionFlex>
      </Container>
    
  <FeaturesSection />
  <AboutSection />
  <Testimonials />
  <DownloadSection />
</Box>
      <Footer />
    </Box>
  );
}
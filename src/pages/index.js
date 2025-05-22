import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import {
  Box, Flex, Heading, Text, Button, Image, SimpleGrid, VStack, HStack, Link, useBreakpointValue, Input, Divider, IconButton, Circle, keyframes, Container, useDisclosure, useColorModeValue, Fade
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { FaTelegramPlane, FaTwitter, FaRedditAlien, FaInstagram, FaGithub, FaDiscord, FaYoutube } from 'react-icons/fa';

// Import Baloo 2 font globally
const balooFontUrl = "https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700&display=swap";

// Background glow animation
const glowAnimation = keyframes`
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
`;

// Pulse animation for elements
const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.8 }
  50% { transform: scale(1.05); opacity: 1 }
  100% { transform: scale(1); opacity: 0.8 }
`;

// Slide in animation
const slideInAnimation = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Slide transition animation
const slideTransitionAnimation = keyframes`
  0% { transform: translateX(100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

// Slide out animation
const slideOutAnimation = keyframes`
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(-100%); opacity: 0; }
`;

// Moving glow animation
const moveGlowAnimation = keyframes`
  0% { transform: translate(0, 0) }
  25% { transform: translate(10%, -15%) }
  50% { transform: translate(-5%, 10%) }
  75% { transform: translate(-10%, -10%) }
  100% { transform: translate(0, 0) }
`;

// Slide in from left animation
const slideInLeftAnimation = keyframes`
  0% { opacity: 0; transform: translateX(-50px); }
  100% { opacity: 1; transform: translateX(0); }
`;

// Slide in from right animation
const slideInRightAnimation = keyframes`
  0% { opacity: 0; transform: translateX(50px); }
  100% { opacity: 1; transform: translateX(0); }
`;

// Slide in from bottom animation
const slideInBottomAnimation = keyframes`
  0% { opacity: 0; transform: translateY(50px); }
  100% { opacity: 1; transform: translateY(0); }
`;

// Fade in animation
const fadeInAnimation = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

// Carousel slides with hero images only
const heroSlides = [
  { image: "/hero1.png" },
  { image: "/hero2.png" },
  { image: "/hero3.png" }
];

// Static data for testimonials and stats
const testimonials = [
  {
    name: "Alex Matthew",
    text: "Swapping assets on this platform is seamless! The speed and security make it my go-to for exchanging between TON and Not Coin.",
  },
  {
    name: "Sophia Carter",
    text: "I've never had such a smooth experience swapping tokens. The low fees and fast transactions are a game-changer!",
  },
  {
    name: "Daniel Smith",
    text: "Reliable and efficient! This swap platform makes it easy to move between TON and Not Coin with just a few clicks.",
  },
  {
    name: "Emily Johnson",
    text: "I was skeptical at first, but after using it, I'm impressed! The interface is user-friendly, and the transactions are lightning-fast.",
  },
  {
    name: "Michael Brown",
    text: "Finally, a swap platform that gets it right! Secure, fast, and easy to use—what more could you ask for?",
  },
];

const stats = [
  { label: "Successful swap", value: "10K+" },
  { label: "Active Users", value: "20K+" },
  { label: "Swap success rate", value: "99.99%" },
  { label: "Partner Integration", value: "15+" },
];

const partnerLogos = [
  "ton.webp", "tau.webp", "usdc.webp", "dyor.webp", "major.webp", "ice.webp", "jbtc.webp", "not.webp", "cats2.webp", "web3.webp", "brad.webp", "usdt.webp", "hydra.webp", "punk.webp", "monk.webp", "ring.webp", "glint.webp", "jbwb.webp", "duck.webp"
];

// Floating animation for swap image
const floatAnim = keyframes`
  0% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-16px) scale(1.03); }
  100% { transform: translateY(0px) scale(1); }
`;

function StickyNavbar() {
  return (
    <Flex
      as="nav"
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      zIndex={200}
      bg="rgba(0, 0, 0, 0.85)"
      backdropFilter="blur(10px)"
      borderRadius="2xl"
      boxShadow="0 2px 16px 0 rgba(0,0,0,0.2)"
      maxW="7xl"
      mx="auto"
      mt={4}
      px={{ base: 4, md: 8 }}
      py={3}
      align="center"
      justify="space-between"
      style={{ left: '50%', transform: 'translateX(-50%)' }}
      fontFamily="'Baloo 2', cursive"
    >
      <HStack spacing={3} align="center">
        <Text fontSize="2xl" fontWeight="bold">
          <span role="img" aria-label="candy">🍬</span>
        </Text>
        <Text fontSize={{ base: "xl", md: "2xl", lg: "3xl" }} fontWeight="bold" color="#fff">CandySwap</Text>
      </HStack>
      <Button
        bg="#CD3642"
        color="#fff"
        borderRadius="60px"
        px={8}
        py={2}
        fontWeight="bold"
        _hover={{ bg: "#a82a36" }}
        as={Link}
        href="/dex"
        fontFamily="'Baloo 2', cursive"
        boxShadow="0 4px 10px rgba(205, 54, 66, 0.3)"
      >
        Launch app
      </Button>
    </Flex>
  );
}

// Animation for slide transitions
const slideAnimation = keyframes`
  0% { opacity: 0; transform: translateX(20px); }
  100% { opacity: 1; transform: translateX(0); }
`;

function HeroCarousel() {
  const [slide, setSlide] = useState(0);
  const total = heroSlides.length;
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  
  const goTo = idx => {
    setSlide((idx + total) % total);
    // Reset the auto-slide timer when manually navigating
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Temporarily pause auto-sliding for 5 seconds after manual navigation
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000);
  };
  
  // Set up auto-sliding
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setSlide(prevSlide => (prevSlide + 1) % total);
      }, 3000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [total, isPaused]);
  
  return (
    <VStack 
      spacing={10} 
      align="center" 
      w="full" 
      mt={{ base: 20, md: 24, lg: 32 }} 
      mb={{ base: 16, md: 20, lg: 28 }} 
      fontFamily="'Baloo 2', cursive" 
      position="relative" 
      minH={{ md: "70vh" }}
    >
      {/* Glowing elements from Figma */}
      <Box
        position="absolute"
        top="-100px"
        left="-200px"
        width="400px"
        height="400px"
        opacity="0.4"
        zIndex={-1}
        pointerEvents="none"
        sx={{
          transform: "scale(1.5)"
        }}
      >
        <Box
          position="absolute"
          width="300px"
          height="300px"
          borderRadius="full"
          bg="#552396"
          filter="blur(80px)"
          animation={`${moveGlowAnimation} 20s ease-in-out infinite alternate`}
        />
        <Box
          position="absolute"
          top="50px"
          left="100px"
          width="250px"
          height="250px"
          borderRadius="full"
          bg="#CD3642"
          filter="blur(90px)"
          animation={`${moveGlowAnimation} 25s ease-in-out infinite alternate-reverse`}
        />
        <Box
          position="absolute"
          top="100px"
          left="50px"
          width="200px"
          height="200px"
          borderRadius="full"
          bg="#E86D3B"
          filter="blur(70px)"
          animation={`${moveGlowAnimation} 18s ease-in-out infinite alternate`}
        />
      </Box>
      
      {/* Right side glow */}
      <Box
        position="absolute"
        top="-50px"
        right="-200px"
        width="400px"
        height="400px"
        opacity="0.4"
        zIndex={-1}
        pointerEvents="none"
        sx={{
          transform: "scale(1.5)"
        }}
      >
        <Box
          position="absolute"
          width="300px"
          height="300px"
          borderRadius="full"
          bg="#3B8EE8"
          filter="blur(80px)"
          animation={`${moveGlowAnimation} 22s ease-in-out infinite alternate-reverse`}
        />
        <Box
          position="absolute"
          top="100px"
          left="50px"
          width="200px"
          height="200px"
          borderRadius="full"
          bg="#F8D86E"
          filter="blur(70px)"
          animation={`${moveGlowAnimation} 19s ease-in-out infinite alternate`}
        />
      </Box>
      
      {/* Logo and heading */}
      <HStack 
        spacing={{ base: 2, sm: 3, md: 4 }} 
        justify="center" 
        mb={{ base: 4, sm: 5, md: 8, lg: 10 }} 
        zIndex={1}
        animation={`${fadeInAnimation} 1s ease-out forwards`}
        px={{ base: 2, sm: 4 }}
        flexWrap={{ base: "wrap", sm: "nowrap" }}
      >
        <Image 
          src="/candy.png" 
          alt="Candy" 
          boxSize={{ base: "36px", sm: "42px", md: "56px", lg: "70px" }} 
          animation={`${slideInLeftAnimation} 1.2s ease-out forwards`}
          mt={{ base: 2, sm: 0 }}
        />
        <Text 
          fontSize={{ base: "4xl", sm: "5xl", md: "6xl", lg: "7xl" }} 
          fontWeight="extrabold" 
          color="#fff" 
          letterSpacing="tight" 
          lineHeight={1.1}
          animation={`${fadeInAnimation} 1.5s ease-out forwards`}
          textAlign="center"
        >
          CandySwap
        </Text>
        <Image 
          src="/lollipop.png" 
          alt="Lollipop" 
          boxSize={{ base: "32px", sm: "36px", md: "48px", lg: "60px" }} 
          animation={`${slideInRightAnimation} 1.2s ease-out forwards`}
          mt={{ base: 2, sm: 0 }}
        />
      </HStack>
      
      {/* Hero Slider */}
      <Box 
        position="relative" 
        w="full" 
        maxW="900px" 
        mx="auto" 
        zIndex={1}
        animation={`${slideInBottomAnimation} 1.5s ease-out forwards`}
        px={{ base: 4, sm: 6, md: 8 }}
      >
        {/* Main slider container */}
        <Box 
          position="relative"
          borderRadius="24px"
          overflow="hidden"
          boxShadow="0 4px 20px rgba(0,0,0,0.15), 0 0 30px rgba(205, 54, 66, 0.2)"
          h={{ base: "240px", md: "320px", lg: "400px" }}
          zIndex={1}
        >
          {/* Hero Image */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            animation={`${slideTransitionAnimation} 0.8s ease-out`}
            key={slide} // Forces re-render and animation on slide change
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{
              transition: "all 0.8s ease-out"
            }}
          >
            <Image 
              src={heroSlides[slide].image} 
              alt={`Hero slide ${slide + 1}`} 
              objectFit="contain"
              maxH="100%"
              maxW="100%"
              h="auto"
              w="auto"
            />
          </Box>
          
          {/* Navigation arrows */}
          <IconButton
            aria-label="Previous"
            icon={<ChevronLeftIcon boxSize={5} />}
            variant="solid"
            bg="rgba(0,0,0,0.6)"
            color="#fff"
            borderRadius="full"
            size="sm"
            position="absolute"
            left={3}
            top="50%"
            transform="translateY(-50%)"
            zIndex={2}
            _hover={{ bg: "#CD3642" }}
            onClick={() => goTo(slide - 1)}
          />
          
          <IconButton
            aria-label="Next"
            icon={<ChevronRightIcon boxSize={5} />}
            variant="solid"
            bg="rgba(0,0,0,0.6)"
            color="#fff"
            borderRadius="full"
            size="sm"
            position="absolute"
            right={3}
            top="50%"
            transform="translateY(-50%)"
            zIndex={2}
            _hover={{ bg: "#CD3642" }}
            onClick={() => goTo(slide + 1)}
          />
        </Box>
        
        {/* Slide indicator dots */}
        <HStack spacing={{ base: 1.5, sm: 2 }} justify="center" mt={{ base: 3, sm: 4 }}>
          {heroSlides.map((_, idx) => (
            <Circle
              key={idx}
              size={{ base: "8px", sm: "10px" }}
              bg={idx === slide ? "#CD3642" : "gray.400"}
              cursor="pointer"
              onClick={() => goTo(idx)}
              transition="all 0.3s ease"
              transform={idx === slide ? "scale(1.2)" : "scale(1)"}
              opacity={idx === slide ? 1 : 0.6}
              _hover={{
                bg: idx === slide ? "#CD3642" : "gray.300",
                transform: "scale(1.2)"
              }}
            />
          ))}
        </HStack>
      </Box>
      
      {/* Launch app button */}
      <Button
        mt={{ base: 6, sm: 8, md: 12 }}
        size={{ base: "md", sm: "lg" }}
        bg="#CD3642"
        color="#fff"
        borderRadius="60px"
        px={{ base: 6, sm: 8, md: 12, lg: 16 }}
        py={{ base: 5, sm: 6, md: 8 }}
        fontSize={{ base: "lg", sm: "xl", md: "2xl", lg: "3xl" }}
        fontWeight="bold"
        _hover={{ bg: "#a82a36", transform: "translateY(-5px)", boxShadow: "0 8px 20px rgba(205, 54, 66, 0.6)" }}
        as={Link}
        href="/dex"
        fontFamily="'Baloo 2', cursive"
        boxShadow="0 4px 15px rgba(205, 54, 66, 0.4)"
        zIndex={1}
        position="relative"
        mx={{ base: 4, sm: 0 }}
        transition="all 0.3s ease"
        animation={`${slideInBottomAnimation} 1.8s ease-out forwards`}
      >
        Launch app
      </Button>
    </VStack>
  );
}

function SwapSection() {
  return (
    <Flex
      maxW="1200px"
      mx="auto"
      mt={{ base: 12, sm: 16, md: 32, lg: 40 }}
      mb={{ base: 12, sm: 16, md: 32, lg: 40 }}
      px={{ base: 3, sm: 4, md: 6 }}
      align="center"
      direction={{ base: "column", md: "row" }}
      gap={{ base: 8, sm: 12, md: 6, lg: 10 }}
      justify="space-between"
      w="full"
      position="relative"
      fontFamily="'Baloo 2', cursive"
      zIndex={1}
      id="swap-section"
      opacity="0"
      sx={{
        scrollSnapAlign: "start",
        animation: `${fadeInAnimation} 1s ease-out forwards`,
        animationDelay: "0.3s"
      }}
      _before={{
        content: '""',
        position: 'absolute',
        top: '-150px',
        left: '-200px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(232, 109, 59, 0.1) 0%, transparent 70%)',
        borderRadius: 'full',
        filter: 'blur(60px)',
        zIndex: -1,
        animation: `${moveGlowAnimation} 25s ease-in-out infinite alternate`
      }}
    >
      {/* Left: Swap image */}
      <Flex
        flex="1"
        align="center"
        justify="center"
        minW={{ base: "100%", md: "380px" }}
        maxW={{ base: "100%", md: "450px" }}
        mb={{ base: 8, md: 0 }}
        position="relative"
        sx={{
          opacity: 0,
          animation: `${slideInLeftAnimation} 1.2s ease-out forwards`,
          animationDelay: "0.5s"
        }}
        _after={{
          content: '""',
          position: 'absolute',
          top: '-20px',
          left: '-20px',
          right: '-20px',
          bottom: '-20px',
          background: 'radial-gradient(circle, rgba(59, 142, 232, 0.15) 0%, transparent 70%)',
          borderRadius: 'full',
          filter: 'blur(30px)',
          animation: `${pulseAnimation} 4s ease-in-out infinite, ${moveGlowAnimation} 30s ease-in-out infinite alternate-reverse`,
          zIndex: -1,
        }}
      >
        <Image
          src="/swap.png"
          alt="Swap interface"
          borderRadius="2xl"
          boxShadow="0 0 0 2px #CD3642, 0 8px 32px 0 rgba(0,0,0,0.25), 0 0 20px rgba(59, 142, 232, 0.2)"
          w="100%"
          maxW="380px"
          animation={`${floatAnim} 3.5s ease-in-out infinite`}
        />
      </Flex>
      
      {/* Right: Text and TON logo horizontally aligned */}
      <Flex
        flex="1"
        pl={{ base: 0, md: 16 }}
        textAlign={{ base: "center", md: "left" }}
        align="center"
        justify="center"
        direction="column"
        minH="320px"
        position="relative"
        sx={{
          opacity: 0,
          animation: `${slideInRightAnimation} 1.2s ease-out forwards`,
          animationDelay: "0.7s"
        }}
        _after={{
          content: '""',
          position: 'absolute',
          top: '50%',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(205, 54, 66, 0.08) 0%, transparent 70%)',
          borderRadius: 'full',
          transform: 'translateY(-50%)',
          filter: 'blur(40px)',
          zIndex: -1,
          animation: `${moveGlowAnimation} 20s ease-in-out infinite alternate`
        }}
      >
        <Flex align="center" justify={{ base: "center", md: "flex-start" }} mb={{ base: 4, md: 6 }} gap={4}>
          <Heading
            fontSize={{ base: "1.8rem", sm: "2.2rem", md: "3.5rem", lg: "4.2rem" }}
            fontWeight="extrabold"
            color="#fff"
            lineHeight={1.2}
            letterSpacing="tight"
            mb={0}
            fontFamily="'Baloo 2', cursive"
            bgGradient="linear(to-r, #fff, #f0f0f0)"
            bgClip="text"
            textAlign={{ base: "center", md: "left" }}
          >
            Seamless Swaps on<br />TON Chain
          </Heading>
          <Image
            src="/ton.webp"
            alt="TON"
            boxSize={{ base: "50px", sm: "60px", md: "90px", lg: "110px" }}
            ml={{ base: 0, md: 4 }}
            filter="drop-shadow(0 0 10px rgba(59, 142, 232, 0.3))"
            display={{ base: "none", sm: "block" }}
          />
        </Flex>
        <Text
          fontSize={{ base: "0.95rem", sm: "1.1rem", md: "1.5rem", lg: "1.7rem" }}
          color="rgba(255, 255, 255, 0.9)"
          maxW={{ base: "100%", md: "480px" }}
          fontWeight={400}
          lineHeight={1.5}
          mx={{ base: "auto", md: 0 }}
          px={{ base: 3, sm: 0 }}
        >
          Swap your TON tokens effortlessly with our intuitive platform. Experience fast and secure transactions without complexity.
        </Text>
      </Flex>
    </Flex>
  );
}

function SlippageSection() {
  return (
    <Flex
      maxW="1200px"
      mx="auto"
      mt={{ base: 12, sm: 16, md: 32, lg: 40 }}
      mb={{ base: 12, sm: 16, md: 32, lg: 40 }}
      px={{ base: 3, sm: 4, md: 6 }}
      align="center"
      direction={{ base: "column", md: "row" }}
      gap={{ base: 8, sm: 12, md: 6, lg: 10 }}
      justify="space-between"
      w="full"
      fontFamily="'Baloo 2', cursive"
      position="relative"
      zIndex={1}
      id="slippage-section"
      opacity="0"
      sx={{
        scrollSnapAlign: "start",
        animation: `${fadeInAnimation} 1s ease-out forwards`,
        animationDelay: "0.3s"
      }}
      _before={{
        content: '""',
        position: 'absolute',
        top: '30%',
        left: '-150px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(248, 216, 110, 0.1) 0%, transparent 70%)',
        borderRadius: 'full',
        filter: 'blur(50px)',
        zIndex: -1,
        animation: `${moveGlowAnimation} 22s ease-in-out infinite alternate-reverse`
      }}
      _after={{
        content: '""',
        position: 'absolute',
        top: '50%',
        right: '-200px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(205, 54, 66, 0.12) 0%, transparent 70%)',
        borderRadius: 'full',
        transform: 'translateY(-50%)',
        filter: 'blur(60px)',
        zIndex: -1,
        animation: `${moveGlowAnimation} 25s ease-in-out infinite alternate`
      }}
    >
      {/* Left: Text */}
      <Box 
        flex="1" 
        pr={{ base: 0, md: 16 }} 
        textAlign={{ base: "center", md: "left" }}
        sx={{
          opacity: 0,
          animation: `${slideInLeftAnimation} 1.2s ease-out forwards`,
          animationDelay: "0.5s"
        }}
      >
        <Heading 
          fontSize={{ base: "xl", sm: "2xl", md: "4xl" }} 
          fontWeight="bold" 
          color="#fff" 
          mb={{ base: 2, sm: 3, md: 4 }} 
          lineHeight={1.2}
          bgGradient="linear(to-r, #fff, #f0f0f0)"
          bgClip="text"
        >
          Adjustable Slippage Tolerance
        </Heading>
        <Text 
          fontSize={{ base: "sm", sm: "md", md: "xl", lg: "2xl" }} 
          color="rgba(255, 255, 255, 0.9)" 
          maxW={{ base: "100%", md: "480px" }} 
          fontWeight={400}
          lineHeight={1.5}
          px={{ base: 2, sm: 0 }}
          mx={{ base: "auto", md: 0 }}
        >
          Adjust slippage tolerance easily to match your trading preferences. Enjoy smoother swaps and zero failed transaction.
        </Text>
      </Box>
      {/* Right: Slippage image */}
      <Box 
        flex="1" 
        display="flex" 
        justifyContent="center" 
        alignItems="center"
        position="relative"
        sx={{
          opacity: 0,
          animation: `${slideInRightAnimation} 1.2s ease-out forwards`,
          animationDelay: "0.7s"
        }}
        _after={{
          content: '""',
          position: 'absolute',
          top: '-20px',
          left: '-20px',
          right: '-20px',
          bottom: '-20px',
          background: 'radial-gradient(circle, rgba(205, 54, 66, 0.15) 0%, transparent 70%)',
          borderRadius: 'full',
          filter: 'blur(30px)',
          animation: `${pulseAnimation} 4s ease-in-out infinite, ${moveGlowAnimation} 30s ease-in-out infinite alternate`,
          zIndex: -1,
        }}
      >
        <Image
          src="/feature-bg-2.png"
          alt="Slippage Tolerance"
          borderRadius="2xl"
          boxShadow="0 0 0 2px #CD3642, 0 8px 32px 0 rgba(0,0,0,0.25), 0 0 20px rgba(205, 54, 66, 0.3)"
          w="100%"
          maxW="420px"
          animation={`${floatAnim} 4s ease-in-out infinite`}
        />
      </Box>
    </Flex>
  );
}

function GradientHeading({ children }) {
  return (
    <Heading
      as="h2"
      fontSize={{ base: "2xl", sm: "3xl", md: "4xl", lg: "5xl" }}
      fontWeight="bold"
      textAlign="center"
      mb={{ base: 4, sm: 6, md: 8 }}
      bgGradient="linear(to-r, #E86D3B, #F8D86E)"
      bgClip="text"
      color="transparent"
      fontFamily="'Baloo 2', cursive"
      lineHeight={1.2}
      px={{ base: 2, sm: 0 }}
    >
      {children}
    </Heading>
  );
}

function AboutSection() {
  return (
    <Box
      maxW="1200px"
      mx="auto"
      mt={{ base: 16, sm: 20, md: 40, lg: 60 }}
      mb={{ base: 16, sm: 20, md: 40, lg: 60 }}
      px={{ base: 3, sm: 4, md: 8 }}
      fontFamily="'Baloo 2', cursive"
      position="relative"
      zIndex={1}
      id="about-section"
      opacity="0"
      sx={{
        scrollSnapAlign: "start",
        animation: `${fadeInAnimation} 1s ease-out forwards`,
        animationDelay: "0.3s"
      }}
      _before={{
        content: '""',
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(255, 139, 139, 0.15) 0%, transparent 70%)',
        borderRadius: 'full',
        filter: 'blur(60px)',
        zIndex: -1,
        animation: `${moveGlowAnimation} 25s ease-in-out infinite alternate`
      }}
      _after={{
        content: '""',
        position: 'absolute',
        bottom: '0',
        right: '-150px',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(59, 142, 232, 0.1) 0%, transparent 70%)',
        borderRadius: 'full',
        filter: 'blur(50px)',
        zIndex: -1,
        animation: `${moveGlowAnimation} 20s ease-in-out infinite alternate-reverse`
      }}
    >
      <GradientHeading 
        sx={{
          animation: `${slideInBottomAnimation} 1.2s ease-out forwards`,
          opacity: 0,
          animationDelay: "0.5s"
        }}
      >
        About CandySwap
      </GradientHeading>
      <Text
        fontSize={{ base: "md", sm: "lg", md: "xl", lg: "2xl" }}
        color="rgba(255, 255, 255, 0.9)"
        maxW="4xl"
        mx="auto"
        textAlign="center"
        mb={{ base: 10, sm: 12, md: 16 }}
        lineHeight={1.6}
        fontFamily="'Baloo 2', cursive"
        px={{ base: 2, sm: 4, md: 0 }}
        sx={{
          animation: `${fadeInAnimation} 1.5s ease-out forwards`,
          opacity: 0,
          animationDelay: "0.7s"
        }}
      >
        Our swap platform is designed to provide a seamless, secure, and efficient way to exchange TON tokens for NOT coins. With a focus on transparency and ease of use, we ensure the best rates and fastest transactions. Our mission is to empower users with a reliable swapping experience, backed by secure infrastructure and innovative technology
      </Text>
      <Flex justify="center" gap={8} wrap="wrap">
        {stats.map((stat, idx) => (
          <VStack
            key={idx}
            bg={idx === 0 ? "#FFF9C4" : idx === 1 ? "#FFD6D6" : idx === 2 ? "#D6F0FF" : "#F2F2F2"}
            borderRadius="32px"
            minW="220px"
            minH="120px"
            px={8}
            py={6}
            boxShadow="0 8px 20px rgba(0,0,0,0.15), 0 0 15px rgba(0,0,0,0.1)"
            spacing={2}
            align="center"
            justify="center"
            transform="translateY(0)"
            transition="transform 0.3s ease, box-shadow 0.3s ease"
            _hover={{
              transform: "translateY(-5px)",
              boxShadow: "0 12px 25px rgba(0,0,0,0.2), 0 0 15px rgba(0,0,0,0.1)"
            }}
          >
            <Text 
              fontSize="lg" 
              fontWeight="bold" 
              color={idx === 0 ? "#E6C200" : idx === 1 ? "#E86D3B" : idx === 2 ? "#3B8EE8" : "#888"} 
              mb={1} 
              textAlign="center"
            >
              {stat.label}
            </Text>
            <Text 
              fontSize="3xl" 
              fontWeight="extrabold" 
              color={idx === 0 ? "#E6C200" : idx === 1 ? "#E86D3B" : idx === 2 ? "#3B8EE8" : "#888"} 
              textAlign="center"
            >
              {stat.value}
            </Text>
          </VStack>
        ))}
      </Flex>
    </Box>
  );
}

function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonialsPerPage = useBreakpointValue({ base: 1, md: 3 });
  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);

  const goToPage = (index) => {
    setActiveIndex((index + totalPages) % totalPages);
  };

  return (
    <Box
      maxW="1200px"
      mx="auto"
      mt={{ base: 20, md: 40 }}
      mb={{ base: 20, md: 40 }}
      px={{ base: 4, md: 8 }}
      fontFamily="'Baloo 2', cursive"
      position="relative"
      zIndex={1}
      _before={{
        content: '""',
        position: 'absolute',
        top: '20%',
        left: '-150px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(85, 35, 150, 0.1) 0%, transparent 70%)',
        borderRadius: 'full',
        filter: 'blur(60px)',
        zIndex: -2,
        pointerEvents: 'none',
        animation: `${moveGlowAnimation} 28s ease-in-out infinite alternate-reverse`
      }}
      _after={{
        content: '""',
        position: 'absolute',
        bottom: '-50px',
        right: '-100px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(232, 109, 59, 0.08) 0%, transparent 70%)',
        borderRadius: 'full',
        filter: 'blur(50px)',
        zIndex: -2,
        pointerEvents: 'none',
        animation: `${moveGlowAnimation} 22s ease-in-out infinite alternate`
      }}
    >
      <Heading
        fontSize={{ base: "3xl", md: "5xl" }}
        fontWeight="bold"
        textAlign="center"
        mb={16}
        bgGradient="linear(to-r, #fff, #f0f0f0)"
        bgClip="text"
        fontFamily="'Baloo 2', cursive"
      >
        Thousands of users<br />talk about us
      </Heading>
      <Box w="full" display="flex" flexDirection="column" alignItems="center" gap={8}>
        {/* First row: 3 testimonials */}
        <Flex gap={8} mb={4} justify="center" w="full" flexWrap="wrap">
          {testimonials.slice(0, 3).map((t, idx) => (
            <Box
              key={idx}
              bg="rgba(25,25,25,0.7)"
              backdropFilter="blur(10px)"
              borderRadius="20px"
              border="1.5px solid rgba(80,80,80,0.5)"
              color="#fff"
              px={8}
              py={6}
              minW="280px"
              maxW="340px"
              flex={1}
              boxShadow="0 8px 20px rgba(0,0,0,0.15), 0 0 15px rgba(0,0,0,0.1)"
              transform="translateY(0)"
              transition="transform 0.3s ease, box-shadow 0.3s ease"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "0 12px 25px rgba(0,0,0,0.2), 0 0 15px rgba(0,0,0,0.1)"
              }}
              position="relative"
              _after={idx === 0 ? {
                content: '""',
                position: 'absolute',
                top: '-10px',
                left: '-10px',
                right: '-10px',
                bottom: '-10px',
                background: 'radial-gradient(circle, rgba(205, 54, 66, 0.05) 0%, transparent 70%)',
                borderRadius: '25px',
                filter: 'blur(10px)',
                zIndex: -1,
                pointerEvents: 'none',
              } : idx === 1 ? {
                content: '""',
                position: 'absolute',
                top: '-10px',
                left: '-10px',
                right: '-10px',
                bottom: '-10px',
                background: 'radial-gradient(circle, rgba(59, 142, 232, 0.05) 0%, transparent 70%)',
                borderRadius: '25px',
                filter: 'blur(10px)',
                zIndex: -1,
                pointerEvents: 'none',
              } : {
                content: '""',
                position: 'absolute',
                top: '-10px',
                left: '-10px',
                right: '-10px',
                bottom: '-10px',
                background: 'radial-gradient(circle, rgba(232, 109, 59, 0.05) 0%, transparent 70%)',
                borderRadius: '25px',
                filter: 'blur(10px)',
                zIndex: -1,
                pointerEvents: 'none',
              }}
            >
              <Text fontWeight="bold" fontSize="lg" mb={2} color="rgba(255,255,255,0.95)">{t.name}</Text>
              <Text fontSize="md" color="rgba(255,255,255,0.8)">{t.text}</Text>
            </Box>
          ))}
        </Flex>
        {/* Second row: 2 testimonials */}
        <Flex gap={8} justify="center" w="full" flexWrap="wrap">
          {testimonials.slice(3, 5).map((t, idx) => (
            <Box
              key={idx}
              bg="rgba(25,25,25,0.7)"
              backdropFilter="blur(10px)"
              borderRadius="20px"
              border="1.5px solid rgba(80,80,80,0.5)"
              color="#fff"
              px={8}
              py={6}
              minW="280px"
              maxW="340px"
              flex={1}
              boxShadow="0 8px 20px rgba(0,0,0,0.15), 0 0 15px rgba(0,0,0,0.1)"
              transform="translateY(0)"
              transition="transform 0.3s ease, box-shadow 0.3s ease"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "0 12px 25px rgba(0,0,0,0.2), 0 0 15px rgba(0,0,0,0.1)"
              }}
              position="relative"
              _after={idx === 0 ? {
                content: '""',
                position: 'absolute',
                top: '-10px',
                left: '-10px',
                right: '-10px',
                bottom: '-10px',
                background: 'radial-gradient(circle, rgba(248, 216, 110, 0.08) 0%, transparent 70%)',
                borderRadius: '25px',
                filter: 'blur(10px)',
                zIndex: -1,
              } : {
                content: '""',
                position: 'absolute',
                top: '-10px',
                left: '-10px',
                right: '-10px',
                bottom: '-10px',
                background: 'radial-gradient(circle, rgba(85, 35, 150, 0.08) 0%, transparent 70%)',
                borderRadius: '25px',
                filter: 'blur(10px)',
                zIndex: -1,
              }}
            >
              <Text fontWeight="bold" fontSize="lg" mb={2} color="rgba(255,255,255,0.95)">{t.name}</Text>
              <Text fontSize="md" color="rgba(255,255,255,0.8)">{t.text}</Text>
            </Box>
          ))}
        </Flex>
      </Box>
    </Box>
  );
}

function DownloadSection() {
  return (
    <Box
      maxW="1200px"
      mx="auto"
      mt={{ base: 20, md: 40 }}
      mb={{ base: 20, md: 40 }}
      px={{ base: 4, md: 8 }}
      fontFamily="'Baloo 2', cursive"
      position="relative"
      zIndex={1}
      _before={{
        content: '""',
        position: 'absolute',
        top: '20%',
        left: '-150px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(248, 216, 110, 0.15) 0%, transparent 70%)',
        borderRadius: 'full',
        filter: 'blur(50px)',
        zIndex: -1,
        animation: `${moveGlowAnimation} 24s ease-in-out infinite alternate-reverse`
      }}
      _after={{
        content: '""',
        position: 'absolute',
        bottom: '10%',
        right: '-100px',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(205, 54, 66, 0.1) 0%, transparent 70%)',
        borderRadius: 'full',
        filter: 'blur(40px)',
        zIndex: -1,
        animation: `${moveGlowAnimation} 20s ease-in-out infinite alternate`
      }}
    >
      <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" gap={12}>
        {/* Left: Text and button */}
        <Box flex="1" textAlign={{ base: "center", md: "left" }}>
          <Heading 
            fontSize={{ base: "2xl", md: "4xl" }} 
            fontWeight="bold" 
            mb={6} 
            fontFamily="'Baloo 2', cursive"
            bgGradient="linear(to-r, #fff, #f0f0f0)"
            bgClip="text"
          >
            Download the app and<br />swap your assets<br />seamlessly
          </Heading>
          <Button
            mt={4}
            size={{ base: "md", md: "lg" }}
            bg="#fff"
            color="#CD3642"
            borderRadius="60px"
            px={10}
            py={6}
            fontSize="xl"
            fontWeight="bold"
            _hover={{ bg: "#f5f5f5", transform: "translateY(-3px)", boxShadow: "0 12px 25px rgba(0,0,0,0.2)" }}
            as={Link}
            href="/dex"
            fontFamily="'Baloo 2', cursive"
            boxShadow="0 8px 20px rgba(0,0,0,0.15)"
            transition="all 0.3s ease"
          >
            Launch app
          </Button>
        </Box>
        {/* Right: Partner logos grid */}
        <Box flex="1" display="flex" justifyContent={{ base: "center", md: "flex-end" }} alignItems="center">
          <Box 
            display="grid" 
            gridTemplateColumns="repeat(5, 48px)" 
            gap={4}
            position="relative"
            _after={{
              content: '""',
              position: 'absolute',
              top: '-20px',
              left: '-20px',
              right: '-20px',
              bottom: '-20px',
              background: 'radial-gradient(circle, rgba(59, 142, 232, 0.08) 0%, transparent 70%)',
              borderRadius: 'full',
              filter: 'blur(20px)',
              zIndex: -1,
            }}
          >
            {partnerLogos.map((logo, idx) => (
              <Image 
                key={idx} 
                src={`/${logo}`} 
                alt={logo} 
                boxSize="48px" 
                borderRadius="full" 
                bg="#fff" 
                p={1} 
                transition="transform 0.3s ease, box-shadow 0.3s ease"
                _hover={{
                  transform: "scale(1.1)",
                  boxShadow: "0 0 15px rgba(255,255,255,0.3)"
                }}
              />
            ))}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}

function Footer() {
  return (
    <Box 
      as="footer" 
      py={{ base: 8, md: 10 }} 
      bg="#FFFFFF" 
      color="#333333" 
      w="full"
      borderTop="1px solid rgba(0,0,0,0.05)"
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        bottom: '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '200px',
        background: 'radial-gradient(ellipse, rgba(205, 54, 66, 0.08) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: -1,
        pointerEvents: 'none',
        animation: `${moveGlowAnimation} 30s ease-in-out infinite alternate`
      }}
      _after={{
        content: '""',
        position: 'absolute',
        top: '0',
        right: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(59, 142, 232, 0.05) 0%, transparent 70%)',
        borderRadius: 'full',
        filter: 'blur(50px)',
        zIndex: -1,
        pointerEvents: 'none',
        animation: `${moveGlowAnimation} 25s ease-in-out infinite alternate-reverse`
      }}
    >
      <Flex 
        direction="column" 
        align="center" 
        maxW="1200px"
        mx="auto" 
        px={{ base: 3, sm: 4 }}
        position="relative"
        zIndex={1}
      >
        {/* Logo and name */}
        <Flex align="center" justify="center" mb={{ base: 4, md: 6 }}>
          <Image 
            src="/candy.png" 
            alt="Candy" 
            boxSize={{ base: "24px", sm: "28px", md: "36px" }} 
            mr={{ base: 1, sm: 2 }}
            filter="drop-shadow(0 0 8px rgba(232, 109, 59, 0.5))"
            animation={`${pulseAnimation} 3s ease-in-out infinite`}
          />
          <Heading 
            fontSize={{ base: "xl", sm: "2xl", md: "3xl" }} 
            fontWeight="bold" 
            bgGradient="linear(to-r, #CD3642, #E86D3B)"
            bgClip="text" 
            fontFamily="'Baloo 2', cursive"
            letterSpacing="tight"
            mx={{ base: 1, sm: 2 }}
          >
            CandySwap
          </Heading>
          <Image 
            src="/lollipop.png" 
            alt="Lollipop" 
            boxSize={{ base: "20px", sm: "24px", md: "32px" }} 
            ml={{ base: 1, sm: 2 }}
            filter="drop-shadow(0 0 8px rgba(205, 54, 66, 0.5))"
            animation={`${pulseAnimation} 3s ease-in-out infinite 0.5s`}
          />
        </Flex>
        
        {/* Tagline */}
        <Text 
          fontSize={{ base: "sm", sm: "md", md: "lg" }} 
          color="rgba(0,0,0,0.7)"
          mb={{ base: 6, md: 8 }}
          fontFamily="'Baloo 2', cursive"
          textAlign="center"
        >
          Next generation of Defi trading
        </Text>
        
        {/* Social icons */}
        <Flex 
          justify="center" 
          wrap="wrap" 
          mb={{ base: 6, md: 8 }}
          gap={{ base: 2, sm: 3, md: 4, lg: 6 }}
          px={{ base: 2, sm: 0 }}
        >
          <IconButton
            aria-label="Twitter"
            variant="ghost"
            colorScheme="blackAlpha"
            color="#555555"
            icon={<FaTwitter size={{ base: 18, sm: 20, md: 24 }} />}
            rounded="full"
            size={{ base: "md", md: "lg" }}
            _hover={{ bg: 'rgba(205, 54, 66, 0.1)', color: "#CD3642", transform: "translateY(-3px)" }}
            transition="all 0.3s ease"
          />
          <IconButton
            aria-label="Telegram"
            variant="ghost"
            colorScheme="blackAlpha"
            color="#555555"
            icon={<FaTelegramPlane size={{ base: 18, sm: 20, md: 24 }} />}
            rounded="full"
            size={{ base: "md", md: "lg" }}
            _hover={{ bg: 'rgba(205, 54, 66, 0.1)', color: "#CD3642", transform: "translateY(-3px)" }}
            transition="all 0.3s ease"
          />
          <IconButton
            aria-label="Reddit"
            variant="ghost"
            colorScheme="blackAlpha"
            color="#555555"
            icon={<FaRedditAlien size={{ base: 18, sm: 20, md: 24 }} />}
            rounded="full"
            size={{ base: "md", md: "lg" }}
            _hover={{ bg: 'rgba(205, 54, 66, 0.1)', color: "#CD3642", transform: "translateY(-3px)" }}
            transition="all 0.3s ease"
          />
          <IconButton
            aria-label="Instagram"
            variant="ghost"
            colorScheme="blackAlpha"
            color="#555555"
            icon={<FaInstagram size={{ base: 18, sm: 20, md: 24 }} />}
            rounded="full"
            size={{ base: "md", md: "lg" }}
            _hover={{ bg: 'rgba(205, 54, 66, 0.1)', color: "#CD3642", transform: "translateY(-3px)" }}
            transition="all 0.3s ease"
          />
          <IconButton
            aria-label="GitHub"
            variant="ghost"
            colorScheme="blackAlpha"
            color="#555555"
            icon={<FaGithub size={{ base: 18, sm: 20, md: 24 }} />}
            rounded="full"
            size={{ base: "md", md: "lg" }}
            _hover={{ bg: 'rgba(205, 54, 66, 0.1)', color: "#CD3642", transform: "translateY(-3px)" }}
            transition="all 0.3s ease"
          />
          <IconButton
            aria-label="Discord"
            variant="ghost"
            colorScheme="blackAlpha"
            color="#555555"
            icon={<FaDiscord size={{ base: 18, sm: 20, md: 24 }} />}
            rounded="full"
            size={{ base: "md", md: "lg" }}
            _hover={{ bg: 'rgba(205, 54, 66, 0.1)', color: "#CD3642", transform: "translateY(-3px)" }}
            transition="all 0.3s ease"
          />
          <IconButton
            aria-label="YouTube"
            variant="ghost"
            colorScheme="blackAlpha"
            color="#555555"
            icon={<FaYoutube size={{ base: 18, sm: 20, md: 24 }} />}
            rounded="full"
            size={{ base: "md", md: "lg" }}
            _hover={{ bg: 'rgba(205, 54, 66, 0.1)', color: "#CD3642", transform: "translateY(-3px)" }}
            transition="all 0.3s ease"
          />
        </Flex>
        
        {/* Copyright */}
        <Text 
          fontSize={{ base: "xs", sm: "sm" }} 
          color="rgba(0,0,0,0.5)" 
          textAlign="center"
          px={{ base: 3, sm: 0 }}
          mt={{ base: 2, sm: 0 }}
        >
          © 2023 CandySwap. All rights reserved.
        </Text>
      </Flex>
    </Box>
  );
}

function Home() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Add smooth scrolling to the entire page
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      document.documentElement.style.scrollBehavior = '';
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <Box 
      bg="#000000" 
      minH="100vh" 
      color="white" 
      overflowX="hidden"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 30%, rgba(205, 54, 66, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(232, 109, 59, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(59, 142, 232, 0.1) 0%, transparent 50%)',
        backgroundSize: '200% 200%',
        animation: `${glowAnimation} 15s ease infinite, ${moveGlowAnimation} 25s ease-in-out infinite`,
        pointerEvents: 'none',
        zIndex: -1, /* Changed from 0 to -1 to ensure it stays behind content */
      }}
    >
      <Head>
        <title>CandySwap - TON DEX</title>
        <meta name="description" content="Swap your TON tokens effortlessly with our intuitive platform" />
        <link rel="icon" href="/favicon.ico" />
        <link href={balooFontUrl} rel="stylesheet" />
      </Head>

      <StickyNavbar />

      <Box as="main" pt={24} pb={16} position="relative" zIndex={1}>
        {/* Hero Section */}
        <Container maxW="1200px" mx="auto" px={{ base: 4, md: 8 }}>
          <HeroCarousel />
        </Container>
        {/* Swap Section (animated image + text, with floating TON logo) */}
        <SwapSection />
        {/* Features Section (Figma-accurate) */}
        <SlippageSection />
        {/* About & Stats Section (Figma-accurate) */}
        <AboutSection />
        {/* Testimonials Section (Figma-accurate) */}
        <TestimonialsSection />
        {/* Download Section (Figma-accurate) */}
        <DownloadSection />
      </Box>

      <Footer />
      
      {/* Scroll to top button */}
      <Fade in={showScrollTop}>
        <IconButton
          aria-label="Scroll to top"
          icon={<ChevronUpIcon />}
          size="lg"
          colorScheme="red"
          bg="#CD3642"
          position="fixed"
          bottom={{ base: 4, md: 8 }}
          right={{ base: 4, md: 8 }}
          zIndex={99}
          borderRadius="full"
          boxShadow="0 4px 12px rgba(0,0,0,0.25)"
          onClick={scrollToTop}
          opacity={0.8}
          _hover={{ opacity: 1, transform: "translateY(-3px)" }}
          transition="all 0.3s ease"
        />
      </Fade>
    </Box>
  );
}

export default Home;

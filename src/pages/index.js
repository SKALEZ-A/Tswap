import Head from "next/head";
import { useState } from "react";
import {
  Box, Flex, Heading, Text, Button, Image, SimpleGrid, VStack, HStack, Link, useBreakpointValue, Input, Divider, IconButton, Circle, keyframes
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FaTelegramPlane, FaTwitter, FaRedditAlien, FaInstagram, FaGithub, FaDiscord, FaYoutube } from 'react-icons/fa';

// Import Baloo 2 font globally
const balooFontUrl = "https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700&display=swap";

// Carousel slides (static for now)
const heroSlides = [
  {
    text: (
      <>
        CandySawp is you no.1 exchange for seamless <br />
        <HStack as="span" display="inline-flex" justify="center" align="center" spacing={2} mt={2}>
          <Image src="/ton-logo.svg" alt="TON" boxSize="32px" display="inline-block" />
          <Text as="span" display="inline" fontWeight="bold">TON transactions</Text>
        </HStack>
      </>
    ),
  },
  {
    text: (
      <>
        Maximize your trading and get the best rates for your swaps<br />
        ensuring efficient and cost-effective transactions.
      </>
    ),
  },
  {
    text: (
      <>
        Our platform ensures fast and secure swaps across Ton chain,<br />
        giving you full control over your assets.
      </>
    ),
  },
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
      bg="rgba(24, 23, 29, 0.95)"
      borderRadius="2xl"
      boxShadow="0 2px 16px 0 rgba(0,0,0,0.12)"
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
        <Text fontSize="xl" fontWeight="bold" color="#fff">CandySwap</Text>
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
      >
        Launch app
      </Button>
    </Flex>
  );
}

function HeroCarousel() {
  const [slide, setSlide] = useState(0);
  const total = heroSlides.length;
  const goTo = idx => setSlide((idx + total) % total);
  return (
    <VStack spacing={10} align="center" w="full" mt={28} fontFamily="'Baloo 2', cursive">
      {/* Large logo and heading */}
      <HStack spacing={3} justify="center">
        <Image src="/candy.png" alt="Candy" boxSize={{ base: "48px", md: "72px", lg: "90px" }} />
        <Text fontSize={{ base: "5xl", md: "7xl", lg: "8xl" }} fontWeight="extrabold" color="#fff" letterSpacing="tight" lineHeight={1}>
          CandySwap
        </Text>
        <Image src="/lollipop.png" alt="Lollipop" boxSize={{ base: "36px", md: "56px", lg: "70px" }} />
      </HStack>
      {/* Carousel/slider card */}
      <Box position="relative" w="full" display="flex" justifyContent="center" alignItems="center">
        {/* Left arrow */}
        <IconButton
          aria-label="Previous"
          icon={<ChevronLeftIcon boxSize={8} />}
          variant="unstyled"
          bg="#FF8B8B"
          color="#fff"
          borderRadius="full"
          boxSize={{ base: 10, md: 14 }}
          position="absolute"
          left={{ base: 2, md: -12 }}
          top="50%"
          transform="translateY(-50%)"
          zIndex={2}
          _hover={{ bg: "#CD3642", color: "#fff" }}
          onClick={() => goTo(slide - 1)}
        />
        {/* Slider card with stylish curve */}
        <Box
          as="section"
          display="flex"
          alignItems="center"
          justifyContent="center"
          w={{ base: "90vw", md: "700px", lg: "900px" }}
          minH={{ base: "180px", md: "220px", lg: "260px" }}
          maxW={{ base: "98vw", md: "900px" }}
          px={{ base: 4, md: 20, lg: 32 }}
          py={{ base: 8, md: 12, lg: 14 }}
          position="relative"
          bg="#FF8B8B"
          color="#fff"
          boxShadow="0 8px 48px 0 rgba(0,0,0,0.18)"
          border="2.5px solid #FF8B8B"
          borderRadius="60px"
          style={{
            clipPath: 'path("M40,0 Q0,60 0,130 Q0,200 40,260 Q450,300 860,260 Q900,200 900,130 Q900,60 860,0 Q450,-40 40,0 Z")',
            // fallback for browsers that don't support clip-path: path
            WebkitClipPath: 'ellipse(90% 60% at 50% 50%)',
            clipPath: 'ellipse(90% 60% at 50% 50%)',
            transition: 'clip-path 0.3s',
          }}
        >
          <Box flex={1} textAlign="center" fontSize={{ base: "xl", md: "2xl", lg: "2.3xl" }} color="#fff" fontWeight="medium" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            {heroSlides[slide].text}
          </Box>
        </Box>
        {/* Right arrow */}
        <IconButton
          aria-label="Next"
          icon={<ChevronRightIcon boxSize={8} />}
          variant="unstyled"
          bg="#FF8B8B"
          color="#fff"
          borderRadius="full"
          boxSize={{ base: 10, md: 14 }}
          position="absolute"
          right={{ base: 2, md: -12 }}
          top="50%"
          transform="translateY(-50%)"
          zIndex={2}
          _hover={{ bg: "#CD3642", color: "#fff" }}
          onClick={() => goTo(slide + 1)}
        />
      </Box>
      {/* Dots */}
      <HStack spacing={3} justify="center">
        {heroSlides.map((_, idx) => (
          <Circle
            key={idx}
            size={{ base: 3, md: 4, lg: 5 }}
            bg={slide === idx ? "#fff" : "#fff"}
            opacity={slide === idx ? 1 : 0.4}
            border={slide === idx ? "2px solid #fff" : "2px solid #fff"}
            transition="all 0.2s"
            onClick={() => goTo(idx)}
            cursor="pointer"
          />
        ))}
      </HStack>
      {/* Launch app button */}
      <Button
        mt={2}
        size="lg"
        bg="#CD3642"
        color="#fff"
        borderRadius="60px"
        px={{ base: 10, md: 16, lg: 24 }}
        py={{ base: 6, md: 8, lg: 10 }}
        fontSize={{ base: "xl", md: "2xl", lg: "2.5xl" }}
        fontWeight="bold"
        _hover={{ bg: "#a82a36" }}
        as={Link}
        href="/dex"
        fontFamily="'Baloo 2', cursive"
      >
        Launch app
      </Button>
    </VStack>
  );
}

function SwapSection() {
  return (
    <Flex
      maxW="7xl"
      mx="auto"
      mt={{ base: 12, md: 24 }}
      mb={{ base: 12, md: 24 }}
      px={{ base: 4, md: 0 }}
      align="center"
      direction={{ base: "column", md: "row" }}
      gap={{ base: 12, md: 0 }}
      justify="center"
      w="full"
      position="relative"
      fontFamily="'Baloo 2', cursive"
    >
      {/* Left: Swap image */}
      <Flex
        flex="1"
        align="center"
        justify="center"
        minW={{ base: "100%", md: "480px" }}
        maxW={{ base: "100%", md: "520px" }}
        mb={{ base: 8, md: 0 }}
      >
        <Image
          src="/swap.png"
          alt="Swap interface"
          borderRadius="2xl"
          boxShadow="0 0 0 2px #CD3642, 0 8px 32px 0 rgba(0,0,0,0.25)"
          w="100%"
          maxW="420px"
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
      >
        <Flex align="center" justify={{ base: "center", md: "flex-start" }} mb={{ base: 4, md: 6 }} gap={4}>
          <Heading
            fontSize={{ base: "2.2rem", md: "3.5rem", lg: "4.2rem" }}
            fontWeight="extrabold"
            color="#fff"
            lineHeight={1.1}
            letterSpacing="tight"
            mb={0}
            fontFamily="'Baloo 2', cursive"
          >
            Seamless Swaps on<br />TON Chain
          </Heading>
          <Image
            src="/ton.webp"
            alt="TON"
            boxSize={{ base: "60px", md: "90px", lg: "110px" }}
            ml={{ base: 0, md: 4 }}
          />
        </Flex>
        <Text
          fontSize={{ base: "1.1rem", md: "1.5rem", lg: "1.7rem" }}
          color="#fff"
          maxW="480px"
          fontWeight={400}
          lineHeight={1.4}
          mx={{ base: "auto", md: 0 }}
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
      maxW="7xl"
      mx="auto"
      mt={{ base: 12, md: 24 }}
      mb={{ base: 12, md: 24 }}
      px={{ base: 4, md: 0 }}
      align="center"
      direction={{ base: "column", md: "row" }}
      gap={{ base: 12, md: 0 }}
      justify="space-between"
      w="full"
      fontFamily="'Baloo 2', cursive"
    >
      {/* Left: Text */}
      <Box flex="1" pr={{ base: 0, md: 16 }} textAlign={{ base: "center", md: "left" }}>
        <Heading fontSize={{ base: "2xl", md: "4xl" }} fontWeight="bold" color="#fff" mb={4} lineHeight={1.1}>
          Adjustable Slippage Tolerance
        </Heading>
        <Text fontSize={{ base: "lg", md: "2xl" }} color="#fff" maxW="480px" fontWeight={400}>
          Adjust slippage tolerance easily to match your trading preferences. Enjoy smoother swaps and zero failed transaction.
        </Text>
      </Box>
      {/* Right: Slippage image */}
      <Box flex="1" display="flex" justifyContent="center" alignItems="center">
        <Image
          src="/feature-bg-2.png"
          alt="Slippage Tolerance"
          borderRadius="2xl"
          boxShadow="0 0 0 2px #CD3642, 0 8px 32px 0 rgba(0,0,0,0.25)"
          w="100%"
          maxW="420px"
        />
      </Box>
    </Flex>
  );
}

function GradientHeading({ children }) {
  return (
    <Heading
      as="h2"
      fontSize={{ base: "3xl", md: "5xl" }}
      fontWeight="bold"
      textAlign="center"
      mb={8}
      bgGradient="linear(to-r, #E86D3B, #F8D86E)"
      bgClip="text"
      color="transparent"
      fontFamily="'Baloo 2', cursive"
    >
      {children}
    </Heading>
  );
}

function AboutSection() {
  const stats = [
    {
      label: "Successful swap",
      value: "10K+",
      bg: "#FFF9C4",
      color: "#E6C200",
      labelColor: "#E6C200",
    },
    {
      label: "Active Users",
      value: "20K+",
      bg: "#FFD6D6",
      color: "#E86D3B",
      labelColor: "#E86D3B",
    },
    {
      label: "Swap success rate",
      value: "99.99%",
      bg: "#D6F0FF",
      color: "#3B8EE8",
      labelColor: "#3B8EE8",
    },
    {
      label: "Partner Integration",
      value: "15+",
      bg: "#F2F2F2",
      color: "#888",
      labelColor: "#888",
    },
  ];
  return (
    <Box as="section" py={24} px={{ base: 4, md: 0 }} maxW="7xl" mx="auto">
      <GradientHeading>About CandySwap</GradientHeading>
      <Text
        fontSize={{ base: "lg", md: "2xl" }}
        color="#fff"
        maxW="4xl"
        mx="auto"
        textAlign="center"
        mb={16}
        lineHeight={1.5}
        fontFamily="'Baloo 2', cursive"
      >
        Our swap platform is designed to provide a seamless, secure, and efficient way to exchange TON tokens for NOT coins. With a focus on transparency and ease of use, we ensure the best rates and fastest transactions. Our mission is to empower users with a reliable swapping experience, backed by secure infrastructure and innovative technology
      </Text>
      <Flex justify="center" gap={8} wrap="wrap">
        {stats.map((stat, idx) => (
          <VStack
            key={idx}
            bg={stat.bg}
            borderRadius="32px"
            minW="220px"
            minH="120px"
            px={8}
            py={6}
            boxShadow="md"
            spacing={2}
            align="center"
            justify="center"
          >
            <Text fontSize="lg" fontWeight="bold" color={stat.labelColor} mb={1} textAlign="center">
              {stat.label}
            </Text>
            <Text fontSize="3xl" fontWeight="extrabold" color={stat.color} textAlign="center">
              {stat.value}
            </Text>
          </VStack>
        ))}
      </Flex>
    </Box>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: "Alex Matthew",
      text: "Swapping assets on this platform is seamless! The speed and security make it my go-to for exchanging between TON and Not Coin.",
      avatar: null,
    },
    {
      name: "Sophia Carter",
      text: "I've never had such a smooth experience swapping tokens. The low fees and fast transactions are a game-changer!",
      avatar: null,
    },
    {
      name: "Daniel Smith",
      text: "Reliable and efficient! This swap platform makes it easy to move between TON and Not Coin with just a few clicks.",
      avatar: null,
    },
    {
      name: "Emily Johnson",
      text: "I was skeptical at first, but after using it, I'm impressed! The interface is user-friendly, and the transactions are lightning-fast.",
      avatar: null,
    },
    {
      name: "Michael Brown",
      text: "Finally, a swap platform that gets it right! Secure, fast, and easy to use—what more could you ask for?",
      avatar: null,
    },
  ];
  return (
    <Box as="section" py={24} px={{ base: 4, md: 0 }} maxW="7xl" mx="auto">
      <Heading
        fontSize={{ base: "3xl", md: "5xl" }}
        fontWeight="bold"
        textAlign="center"
        mb={16}
        color="#fff"
        fontFamily="'Baloo 2', cursive"
      >
        Thousands of users<br />talk about us
      </Heading>
      <Box w="full" display="flex" flexDirection="column" alignItems="center" gap={8}>
        {/* First row: 3 testimonials */}
        <Flex gap={8} mb={4} justify="center" w="full">
          {testimonials.slice(0, 3).map((t, idx) => (
            <Box
              key={idx}
              bg="rgba(32,32,32,0.7)"
              borderRadius="20px"
              border="1.5px solid #444"
              color="#fff"
              px={8}
              py={6}
              minW="280px"
              maxW="340px"
              flex={1}
              boxShadow="md"
            >
              <Text fontWeight="bold" fontSize="lg" mb={2}>{t.name}</Text>
              <Text fontSize="md">{t.text}</Text>
            </Box>
          ))}
        </Flex>
        {/* Second row: 2 testimonials */}
        <Flex gap={8} justify="center" w="full">
          {testimonials.slice(3, 5).map((t, idx) => (
            <Box
              key={idx}
              bg="rgba(32,32,32,0.7)"
              borderRadius="20px"
              border="1.5px solid #444"
              color="#fff"
              px={8}
              py={6}
              minW="280px"
              maxW="340px"
              flex={1}
              boxShadow="md"
            >
              <Text fontWeight="bold" fontSize="lg" mb={2}>{t.name}</Text>
              <Text fontSize="md">{t.text}</Text>
            </Box>
          ))}
        </Flex>
      </Box>
    </Box>
  );
}

function DownloadSection() {
  const partnerLogos = [
    "ton.webp", "tau.webp", "usdc.webp", "dyor.webp", "major.webp", "ice.webp", "jbtc.webp", "not.webp", "cats2.webp", "web3.webp", "brad.webp", "usdt.webp", "hydra.webp", "punk.webp", "monk.webp", "ring.webp", "glint.webp", "jbwb.webp", "duck.webp"
  ];
  return (
    <Box as="section" py={24} px={{ base: 4, md: 0 }} maxW="7xl" mx="auto">
      <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" gap={12}>
        {/* Left: Text and button */}
        <Box flex="1" textAlign={{ base: "center", md: "left" }}>
          <Heading fontSize={{ base: "2xl", md: "4xl" }} fontWeight="bold" color="#fff" mb={6} fontFamily="'Baloo 2', cursive">
            Download the app and<br />swap your assets<br />seamlessly
          </Heading>
          <Button
            mt={4}
            size="lg"
            bg="#fff"
            color="#CD3642"
            borderRadius="60px"
            px={10}
            py={6}
            fontSize="xl"
            fontWeight="bold"
            _hover={{ bg: "#f5f5f5" }}
            as={Link}
            href="/dex"
            fontFamily="'Baloo 2', cursive"
          >
            Launch app
          </Button>
        </Box>
        {/* Right: Partner logos grid */}
        <Box flex="1" display="flex" justifyContent={{ base: "center", md: "flex-end" }} alignItems="center">
          <Box display="grid" gridTemplateColumns="repeat(5, 48px)" gap={4}>
            {partnerLogos.map((logo, idx) => (
              <Image key={idx} src={`/${logo}`} alt={logo} boxSize="48px" borderRadius="full" bg="#fff" p={1} />
            ))}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}

function Footer() {
  return (
    <Box as="footer" py={12} bg="#fff" color="#111" textAlign="center" w="full">
      <VStack spacing={2}>
        <Heading fontSize="2xl" fontWeight="bold" color="#111" fontFamily="'Baloo 2', cursive">CandySwap</Heading>
        <Text fontSize="lg" color="#444">Next generation of Defi trading</Text>
        <HStack spacing={6} justify="center" mt={4} color="#111">
          <Link href="#" isExternal><FaTwitter size={28} /></Link>
          <Link href="#" isExternal><FaTelegramPlane size={28} /></Link>
          <Link href="#" isExternal><FaRedditAlien size={28} /></Link>
          <Link href="#" isExternal><FaInstagram size={28} /></Link>
          <Link href="#" isExternal><FaGithub size={28} /></Link>
          <Link href="#" isExternal><FaDiscord size={28} /></Link>
          <Link href="#" isExternal><FaYoutube size={28} /></Link>
        </HStack>
      </VStack>
    </Box>
  );
}

export default function Home() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  return (
    <>
      <Head>
        <title>CANDYSWAP</title>
        <meta name="description" content="A dex built with precision by TCANDY." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href={balooFontUrl} rel="stylesheet" />
      </Head>
      <Box minH="100vh" bg="#000" color="#fff" position="relative" overflow="hidden" fontFamily="'Baloo 2', cursive">
        {/* Navbar */}
        <StickyNavbar />
        {/* Hero Section */}
        <Box as="section" pt={{ base: 24, md: 32 }} pb={4} px={{ base: 4, md: 0 }} maxW="7xl" mx="auto" position="relative">
          {/* Background gradients and ellipses (simplified for code) */}
          <Box position="absolute" top="-200px" left="-200px" w="600px" h="600px" bgGradient="radial(ellipse at center, #DB5963 0%, #F8FD80 5%, transparent 100%)" filter="blur(200px)" opacity={0.3} zIndex={0} />
          <Box position="absolute" top="100px" right="-200px" w="600px" h="600px" bgGradient="radial(ellipse at center, #7531BA 0%, #894EC4 100%)" filter="blur(200px)" opacity={0.2} zIndex={0} />
          <HeroCarousel />
        </Box>
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
        {/* Footer (Figma-accurate) */}
        <Footer />
      </Box>
    </>
  );
}

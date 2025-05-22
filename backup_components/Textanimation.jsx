import { Box, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const words = [ "Seamless", "Powerful","Seamless", "Powerful"];

const TextAnimation = () => {
  const containerHeight = 30; // Height of each word
  const [index, setIndex] = useState(0);
  const [maxWidth, setMaxWidth] = useState("auto");

  useEffect(() => {
    // Measure width dynamically for each word change
    const measureWord = document.getElementById("current-word");
    if (measureWord) {
      setMaxWidth(`${measureWord.offsetWidth}px`);
    }
  }, [index]); // Runs every time index changes

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) =>
        prevIndex === words.length ? 0 : prevIndex + 1
      );
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      h={`${containerHeight}px`}
      w={maxWidth} // Dynamically set width
      position="relative"
      display="inline-block"
      overflow="hidden"
     
     
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        transform={`translateY(-${index * containerHeight}px)`}
        transition={index === words.length ? "none" : "transform 0.5s ease-in-out"}
      >
        {[...words, words[0]].map((word, i) => (
          <Text
            key={i}
            id={i === index ? "current-word" : undefined} // Track current word width
            h={`${containerHeight}px`}
            lineHeight={`${containerHeight}px`}
            fontWeight="bold"
            whiteSpace="nowrap"
          >
            {word}
          </Text>
        ))}
      </Box>
    </Box>
  );
};

export default TextAnimation;

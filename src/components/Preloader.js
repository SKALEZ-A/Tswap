import React, { useEffect, useRef } from "react";


const CircleText = () => {
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      const text = textRef.current.innerText;
      textRef.current.innerHTML = text
        .split("")
        .map(
          (char, i) => `<span style="transform: rotate(${i * 8.3}deg)">${char}</span>`
        )
        .join("");
    }
  }, []);

  return (
    <div className="circle">
      <div className="text" ref={textRef}>
      CANDYSWAP-CANDYSWAP-CANDYSWAP-CANDYSWAP
      </div>
    </div>
  );
};

export default CircleText;

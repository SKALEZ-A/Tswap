import React from 'react'

function Background() {
  return (
    <div className="gradient-bg">
    <svg xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="goo">
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="10"
            result="blur"
          />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    </svg>
    <div className="gradient-container">
      {/* <div class="mouse-mover"></div> */}
      <div className="bg1"></div>
      <div className="bg2"></div>
      <div className="bg3"></div>
      
      <div className="bg5"></div>
    </div>
  </div>
  )
}

export default Background
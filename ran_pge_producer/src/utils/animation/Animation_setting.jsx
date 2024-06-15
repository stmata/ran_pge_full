import React from 'react';
import Lottie from 'react-lottie';
import animationData from './animation_setting.json'; 

const AnimationSetting = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData, 
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return (
    <div style={{marginTop: "75px", marginBottom:"75px"}}>
      <Lottie options={defaultOptions} height={100} width={100} />
    </div>
  );
}

export default AnimationSetting;

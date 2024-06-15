import React from 'react';
import Lottie from 'react-lottie';
import animationData from './animationJson.json'; 

/**
 * LottieAnimation is a functional component that renders a Lottie animation in your React application.
 * 
 * It utilizes the `react-lottie` package to easily implement complex animations exported as JSON from the LottieFiles.
 * The animation is configured to loop indefinitely and start playing automatically as soon as it's rendered.
 * The `rendererSettings` option is set to maintain the aspect ratio of the animation, ensuring it scales properly without distortion.
 * 
 * @returns A Lottie component configured to display a specified animation with the set dimensions of 400x400 pixels.
 */

export default function LottieAnimation () {

  // Defines the configuration options for the Lottie animation.
    // `loop` and `autoplay` are set to true for continuous play.
    // `animationData` is the imported JSON animation data.
    // `rendererSettings` manages how the animation fits within its container.

    const defaultOptions = {
      loop: true,
      autoplay: true, 
      animationData: animationData,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    };

    // Renders the Lottie animation with the specified options and dimensions.
    return <Lottie options={defaultOptions} height={400} width={400} />;

}
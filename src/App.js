import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useRef } from "react";
import { drawBoundingRect } from "./utilities.js";
//import tensorflow main lib
import * as tf from "@tensorflow/tfjs";
//import cocossd pre-trained object detection
import * as cocossd from "@tensorflow-models/coco-ssd";
//import webcam
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const runCoco = async () => {
    const network = await cocossd.load();
    //refresh in ms (framerate)
    setInterval(() => {
      detect(network);
    }, 100);
  };

  const detect = async (network) => {
    //if video, get video properties
    if (
      typeof webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      //ensure video and canvas are same dimensions
      //cam
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      //canvas
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      //detect objects in video from network
      const object = await network.detect(video);
      console.log(object);

      const canvas = canvasRef.current.getContext("2d");

      //draw boxes around objects
      drawBoundingRect(object, canvas);
    }
  };

  //spool up coco
  useEffect(() => {
    runCoco();
  }, []);

  return (
    <div className="App">
      <div>
        <Webcam
          ref={webcamRef}
          muted={true}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            top: "10%",
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            top: "10%",
            textAlign: "center",
            zindex: 8,
            width: 640,
            height: 480,
          }}
        />
      </div>
    </div>
  );
}

export default App;

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

      ///////////////////////////////
      //DO WORK ON OBJECT TO TRACK IT
      ///////////////////////////////

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

/*
Base computer vision portion of the project works well
I need to find a way to track objects so that i can count them

every frame the process runs and draws boxes around the objects in frame, but i need to be able to tie those objects to previous and future frames. I need to be able to track a unique object somehow and follow it to the edge of the frame.

--initial ideas
TF only currently provides me with position, class, and certainty for each object... with that i feel that the position is the simplest way to keep track of an object between frames.

proposed path:
  -ill need to wait for a care to be fully in frame (x > 0 && class === "car")
  -then ill need to take that car and store it in a list of current vehicles that are being tracked. array of objects
  -when any car gets to the end of the frame ~ (x + width === view width), i remove the car from the list.

issues:
  the camera may not be accurate enough to discern between two cars next to eachother.

  this does not account for cars going the opposite direction.

  adding and removing cars from the list is going to be messy, i feel like the coordinates are going to be sloppy and a lot of duplicate cars will be added and removed from the list (maybe with some math guard rails this can be reduced... but ill need to test it pretty manually)

research "Tensorflow Cumulative Object Counting"
--provide each object with an id (and attach that to rect).
--set up "finish line" that when reached adds to the persistent count
--still need to be able to consistently identify individual objects between frames for this method, does TF have any utilities for this?
*/

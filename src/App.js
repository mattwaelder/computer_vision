import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect, useRef } from "react";
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
  const lineRef = useRef(null);

  let detections = [];
  let confidenceFloor = 0.51;
  let posVariance = 30; // % pos can change and still think its the same obj
  const [count, setCount] = useState(0);

  const runCoco = async () => {
    const network = await cocossd.load();
    //refresh in ms (framerate)
    setInterval(() => {
      detect(network);
    }, 50); //100ms is 10/s
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
      const objects = await network.detect(video);
      // console.log(objects);

      ///////////////////////////////
      //DO WORK ON OBJECT TO TRACK IT
      objects.forEach((obj) => {
        let isNewObj = true;

        //if its for sure a phone
        if (obj.class === "cell phone" && obj.score > confidenceFloor) {
          //this objects xy pos based on bbox (x,y,width,height)
          let objPosSum = obj.bbox[0] + obj.bbox[1];
          let lowerBount = (1 - posVariance / 100) * objPosSum;
          let upperBound = (1 + posVariance / 100) * objPosSum;
          // console.log(lowerBount, objPosSum, upperBound);
          //x value where tracked elements are counted
          const finishLine = 320;

          //if there are objects being tracked
          if (detections.length >= 1) {
            //for each object being tracked
            detections.forEach(({ id, posX, posY }) => {
              // console.warn("LOOPING THROUGH EXISTING DETECTIONS!");
              let trackedElPosSum = posX + posY;
              //if current object is close to one of the objects being tracked
              if (
                trackedElPosSum >= lowerBount &&
                trackedElPosSum <= upperBound
              ) {
                // console.warn("PREVIOUSLY TRACKED OBJECT");
                isNewObj = false;
                let index = detections.findIndex((obj) => obj.id === id);
                obj.trackId = id;
                //update the tracked objects position
                console.log(
                  `(${Math.round(obj.bbox[0])}, ${Math.round(obj.bbox[1])})`
                );

                //check x value to see if the object is at the finish line
                if (obj.bbox[0] >= finishLine) {
                  console.log("FINISHED");
                  //if it is at the finish line
                  //itterate counter
                  setCount((count) => count + 1);
                  //remove tracked element
                  detections.splice(index, 1);
                  console.log(detections);
                } else {
                  //if it is still being tracked, update coordinates
                  detections[index].posX = Math.round(obj.bbox[0]);
                  detections[index].posY = Math.round(obj.bbox[1]);
                }

                // console.log(detections[index]);
              }
            });
          } else if (detections.length === 0) {
            //first detection of desired object
            if (obj.bbox[0] >= finishLine) return;

            console.warn("LIST WAS EMPTY, ADDING FIRST DETECTION FOR TRACKING");
            isNewObj = false;

            detections.push({
              id: 1,
              posX: Math.round(obj.bbox[0]),
              posY: Math.round(obj.bbox[1]),
            });

            obj.trackId = 1;
          }

          //if current object was not close to any of the tracked objects
          if (isNewObj) {
            if (obj.bbox[0] >= finishLine) return;

            console.warn("NEW OBJECT THAT WAS NOT BEING TRACKED");
            detections.push({
              id: detections.length + 1,
              posX: Math.round(obj.bbox[0]),
              posY: Math.round(obj.bbox[1]),
            });

            obj.trackId = detections.length + 1;
          }

          //draw boxes around objects only if meets class def
          const canvas = canvasRef.current.getContext("2d");
          drawBoundingRect(objects, canvas);
        }
      });
    }
  };

  //spool up coco
  useEffect(() => {
    console.log("effect called");
    runCoco();
  }, []);

  const resetList = () => {
    console.warn("RESET");
    setCount(0);
    detections = [];
    console.log(detections);
  };

  return (
    <div className="App">
      <div className="resetBtn">
        <button onClick={() => resetList()}>FLUSH ENTRIES</button>
      </div>
      <div className="counter">
        <p>{count}</p>
      </div>
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
        <div
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            top: "10%",
            zindex: 10,
            width: 2,
            height: 480,
            backgroundColor: "black",
          }}
        ></div>
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

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
summing xy coords is likely a bad idea, but its an easy way to get started w/ validation esp while testing on lone objects...
every frame its calling all of the console warns, which means my breaks are not working. i should make this cleaner by taking the code and storing it in functions that i call rather than keeping it all in the detect function


i removed react string mode tags from index.js, this may cause issues but it prevents the code from rendering twice in development mode (change back later)

to avoid issues with sum of coords as comparison, i may want to add a large number to the coords so that small values are less likely to be seen as new objects

got it to track objects pretty reliably and add them to a list pretty reliably. i need to play around with values and framerates to find whats really reliable, but its tracking and id'ing objects now it seems. I need to make a way to remove objects, likely when a certain x value is achieved i would remove that object and itterate a counter. solid progress

line should be variable, because perspective matter, but for simplicity lets start w/ half way (320)

refresh rate of this app can cause significant load to cpu, MIND TEMPS
*/

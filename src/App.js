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
  const desiredObject = "car"; // "cell phone", "car"
  let confidenceFloor = 0.4;
  // % pos can change and still think its the same obj
  let posVariance = 20;
  const refreshRateMS = 50; //refresh rate of app
  const [count, setCount] = useState(0);

  const runCoco = async () => {
    const network = await cocossd.load();
    setInterval(() => {
      detect(network);
    }, refreshRateMS); //100ms is 10/s
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
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      //detect objects in video from network
      const objects = await network.detect(video);

      objects.forEach((obj) => {
        let isNewObj = true; //true, used as conditional later

        //if desired object
        if (obj.class === `${desiredObject}` && obj.score > confidenceFloor) {
          //position sum with upper / lower extremes
          let objPosSum = obj.bbox[0] + obj.bbox[1];
          let lowerBount = (1 - posVariance / 100) * objPosSum;
          let upperBound = (1 + posVariance / 100) * objPosSum;

          const finishLine = 320; //arbitrary finish line

          //if objects already being tracked
          if (detections.length >= 1) {
            detections.forEach(({ id, posX, posY }) => {
              let trackedElPosSum = posX + posY;
              //if obj is close to any tracked obj
              if (
                trackedElPosSum >= lowerBount &&
                trackedElPosSum <= upperBound
              ) {
                isNewObj = false;
                let index = detections.findIndex((obj) => obj.id === id);
                obj.trackId = id;

                if (obj.bbox[0] >= finishLine) {
                  //if obj has finished and is beyond finish, remove it
                  if (detections[index].hasFinished && obj.bbox[0] >= 400) {
                    //remove tracked element
                    detections.splice(index, 1);
                  }

                  //if element has not previously finished, add
                  if (detections[index]?.hasFinished === false) {
                    detections[index].hasFinished = true;
                    setCount((count) => count + 1);
                  }
                } else {
                  //if it is still being tracked, update coordinates
                  detections[index].posX = Math.round(obj.bbox[0]);
                  detections[index].posY = Math.round(obj.bbox[1]);
                }
              }
            });
          } else if (detections.length === 0) {
            //first detection of desired object
            if (obj.bbox[0] >= finishLine) return;
            isNewObj = false;

            //push new obj to array
            detections.push({
              id: 1,
              posX: Math.round(obj.bbox[0]),
              posY: Math.round(obj.bbox[1]),
              hasFinished: false,
            });

            obj.trackId = 1;
          }

          //if obj isnt near existing tracked objects
          if (isNewObj) {
            if (obj.bbox[0] >= finishLine) return;

            detections.push({
              id: detections.length + 1,
              posX: Math.round(obj.bbox[0]),
              posY: Math.round(obj.bbox[1]),
              hasFinished: false,
            });

            obj.trackId = detections.length + 1;
          }

          //draw boxes
          const canvas = canvasRef.current.getContext("2d");
          drawBoundingRect(objects, canvas, desiredObject);
        }
      });
    }
  };

  //spool up coco
  useEffect(() => {
    console.log("effect called");
    runCoco();
  }, []);

  //reset didnt end up working well
  const resetList = () => {
    setCount(0);
    detections = [];
  };

  return (
    <div className="App">
      <div className="resetBtn">
        {/* <button onClick={() => resetList()}>FLUSH ENTRIES</button> */}
      </div>
      <div className="counter">
        <p>{count}</p>
      </div>
      <div>
        <Webcam
          ref={webcamRef}
          muted={true}
          mirrored={false}
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
issues:
  the camera may not be accurate enough to discern between two cars next to eachother.

  this does not account for cars going the opposite direction.

  adding and removing cars from the list is going to be messy, i feel like the coordinates are going to be sloppy and a lot of duplicate cars will be added and removed from the list (maybe with some math guard rails this can be reduced... but ill need to test it pretty manually)

research "Tensorflow Cumulative Object Counting"

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
summing xy coords is likely a bad idea, but its an easy way to get started w/ validation esp while testing on lone objects...
every frame its calling all of the console warns, which means my breaks are not working. i should make this cleaner by taking the code and storing it in functions that i call rather than keeping it all in the detect function

to avoid issues with sum of coords as comparison, i may want to add a large number to the coords so that small values are less likely to be seen as new objects

i removed react string mode tags from index.js, this may cause issues but it prevents the code from rendering twice in development mode (change back later)

refresh rate of this app can cause significant load to cpu, MIND TEMPS

idea for counting issues:
  instead of counting at x location, count within a field.
  a car enters frame, and is tracked
  it travels to the center of the screen where it is counted and has an additional flag attached to it
  once it gets all the way to the end (~~ x + width) remove it from the array

  objects on the left will need to be assigned an identifier, and objects on the right will need to be identified properly and the id must be cross referenced to ensure it is only counted once.

  alternatively, i could adjust the logic. for each frame i can first ask the program to find the location of each object that had been tracked in the last frame. it could then apply the object id to the closest obj (if it fails to see it, that could be an issue, tho)

counting is still scuffed, might need to make it signifantly more robust. my only thought is to cross reference and match all tracked objects to currently visible objects before accounting for new ones. i can definitely see this adding bugs, though.

*/

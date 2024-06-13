# Object enumeration using Tensorflow.js
An application which attempts to count objects from a live video input

<img src="https://github.com/mattwaelder/computer_vision/assets/74801942/2ad4ab30-52c6-4adc-b807-281d38c3da5d" width="800">


## Background
I once saw a video on Youtube where someone made a program that buys a stock based on the position of thier goldfish in a tank. Ever since I saw that video I've wanted to build something that used computer vision. This was my first attempt. 

## Challenges
  I ran into challenges with this application, but what's a bit different is that when you're using a camera for a live feed the hardware you're using becomes a consideration. I ran into hardware issues really for the first time while testing this project. The program works well for counting slower objecs with few elements in frame, but my intention from the start was to count cars, which, are fast... and numerous.
  
  Early on I found the quality of the camera to be a concern, and so I sought out alternatives with network and hardware connections to the respectable camera in my smart phone. This did work but I found it to bothersom and opted simply to work within the mans of my webcam--and to test only during the day.
  
  Beyond the hardware there was really only one major challenge that I ran into, and that was the tracking aspect. For an image counting objects is quite simple, but for a video it isn't so simple. I needed to find a way to assign an ID to a specific object and have that object retain its ID until its counted. The only real way I found to do this is by saving the elements location in frame so that I can compare it to the elements found in the following frame. I added modifier values so that I can tighten or loosen this as much as I like. I'd found that if I tighten this to only a few % the application applies multiple ID's to the same car, but if I loosen it multiple cars end up with the same ID. This coupled with the geometry of tracking cars as they overtake one another on a 4 lane street made for a difficult task. 
In the end, the application works well, but the results vary, and the actual counter tends to be off for one reason or another. Still I had a lot of fun learning about using live video inputs and this has definitely made for a fun problem!

## How does the app work?
#For the machine learning and object detection
-Tensorflow.js, COCO-SSD
#For the display in browser
-React, Javascript

## Try it for yourself (video input required)
1. Clone repo
2. Install dependencies
3. "npm run start" in root dir
4. Allow your browser to access your webcam

## Author

Matthew Waelder

[![Linkedin: LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white&link=https://www.linkedin.com/in/mattwaelder/)](https://www.linkedin.com/in/mattwaelder/)
[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white&link=https://github.com/mattwaelder)](https://github.com/mattwaelder)

My Portfolio Website: https://mattwaelder.com

## Technology Used

**Front-end:** &emsp;&nbsp;&nbsp;

![Tensorflow.js](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)

## Thanks for Reading!
If you've made it all the way down here I would like to thank you for reading this! Also, if you can think of a better method for making the counting more consistent please reach out (portfolio site listed above) :)

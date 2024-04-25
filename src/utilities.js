export const drawBoundingRect = (detections, canvas, desiredObject) => {
  detections.forEach((detection) => {
    const [x, y, width, height] = detection["bbox"];
    const prediction = detection["class"];
    const certainty = detection["score"];
    const label = `${Math.round(certainty * 100)} - ${prediction}`;
    const trackId = detection["trackId"] || "";

    //if object isnt target obj, return
    if (prediction !== `${desiredObject}`) return;

    //draw a box on the canvas at that location
    const drawColor = "darkred"; //darkgreen
    canvas.strokeStyle = drawColor;
    canvas.fillStyle = drawColor;
    canvas.font = "20px arial";

    canvas.beginPath();
    // canvas.fillText(label, x, y + 20);
    canvas.fillText(trackId, x, y);
    canvas.rect(x, y, width, height);
    canvas.stroke();
  });
};

//id like the make the lines thicker and the font more readable, i think (background?)

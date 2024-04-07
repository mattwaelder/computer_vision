export const drawBoundingRect = (detections, canvas) => {
  detections.forEach((detection) => {
    const [x, y, width, height] = detection["bbox"];
    const prediction = detection["class"];
    const certainty = detection["score"];
    const label = `${Math.round(certainty * 100)} - ${prediction}`;

    //draw a box on the canvas at that location
    const drawColor = "darkgreen";
    canvas.strokeStyle = drawColor;
    canvas.fillStyle = drawColor;
    canvas.font = "20px arial";

    canvas.beginPath();
    canvas.fillText(label, x, y + 20);
    canvas.rect(x, y, width, height);
    canvas.stroke();
  });
};

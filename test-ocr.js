const fs = require('fs');

async function test() {
  // Create a 1x1 dummy jpeg base64
  const base64Image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
  
  const response = await fetch('http://localhost:3000/api/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images: [base64Image] })
  });

  console.log(response.status);
  const data = await response.json();
  console.log(data);
}
test();

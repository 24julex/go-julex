import Tesseract from 'tesseract.js';
const { data: { text } } = await Tesseract.recognize('fb-shot.jpg', 'eng', {});
console.log(text);

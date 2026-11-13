const fs = require('fs');
const filePath = '13 - Slide in on Scroll/index-START.html';
let html = fs.readFileSync(filePath, 'utf8');

// The deterministic local image fixture
const localSVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='20' text-anchor='middle' fill='%23333333' dy='.3em'%3ELocal Image%3C/text%3E%3C/svg%3E";

// Automatically find and replace every Unsplash URL of any size
html = html.replace(/http:\/\/unsplash\.it\/\d+\/\d+/g, localSVG);

fs.writeFileSync(filePath, html);
console.log('Successfully replaced all images!');

const seminarList = await fetch("http://localhost:3000/seminar");

const parsedList = await seminarList.json();

const div = document.createElement('div');

div.textContent = JSON.stringify(parsedList);

document.body.appendChild(div);

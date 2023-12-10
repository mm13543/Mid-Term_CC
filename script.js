let s = new SpotifyWebApi();
let audio;
let playlists = []; // Store playlists data here
let balls = []; // Store balls for energetic playlists

class Playlist {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.mood = this.getMoodFromDescription(description);
    this.shape = "musicnote"; // Default shape 
    this.starColor = color(random(255), random(255), random(255)); // Initialize with a random color
  }

  getMoodFromDescription(description) {
    // Convert the description to lowercase for case-insensitive matching
    description = description.toLowerCase();

    if (description.includes("happy") || description.includes("joyful")) {
      return "happy";
    } else if (description.includes("relaxed") || description.includes("chill")) {
      return "relaxed";
    } else if (description.includes("energetic") || description.includes("upbeat")) {
      return "energetic";
    } else {
      return "unknown";
    }
  }

  // Method to change the shape of the playlist
  changeShapeToStar() {
    this.shape = "star";
    this.starColor = color(random(200), random(200), random(200)); // Change to a new random color
  }
}

function setup() {
  createCanvas(1800,1800);
  audio = new Audio();
  initializeSpotify();
  frameRate(15);
}

function getURLQuery(url, param) {
  var urlParams = new URLSearchParams(url);
  return urlParams.get(param);
}

function authorizeSpotify() {
  var authURL = "https://accounts.spotify.com/authorize?client_id=a8c0f49a02a74e47957184e62d991d0d&response_type=token&scope=playlist-modify-private";
  var authRedirect = "&redirect_uri=" + encodeURIComponent("http://localhost:5500/"); 
  window.location.href = authURL + authRedirect;
}

function initializeSpotify() {
  let url = window.location.href;
  url = url.substring(22);
  url = url.replace("#", "?");
  var token = getURLQuery(url, 'access_token');
  if (!token) {
    window.alert("Please authorize your Spotify account.");
  } else {
    s.setAccessToken(token);
    getUserPlaylists();
  }
}

function createNewPlaylist() {
  var name = prompt('name of playlist');
  var description = 'automatically created playlist';
  const isPublic = false;
  var userId = prompt('enter your user id');
  token = 'Bearer '+s.getAccessToken();
  const xhr = new XMLHttpRequest();
  xhr.open("POST", 'https://api.spotify.com/v1/users/'+userId+'/playlists');
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", token);
  const body = JSON.stringify({
    'name': name,
    'description': description,
    'public': isPublic
  });
  xhr.onload = () => {
    if (xhr.readyState == 4 && xhr.status == 201) {
      console.log(JSON.parse(xhr.responseText));
    } else {
      console.log(`Error: ${xhr.status}`);
    }
  };
  xhr.send(body);
}

function getUserPlaylists() {
  s.getUserPlaylists().then(function (data) {
    playlists = data.items.map(item => new Playlist(item.name, item.description));
  }).catch(function (error) {
    console.error('Error getting user playlists:', error);
  });
}

function draw() {
  // gradient background
  let gradientColor1 = color(255, 200, 0); 
  let gradientColor2 = color(0, 100, 255); 
  gradientBackground(gradientColor1, gradientColor2);

  textSize(18);
  fill(0); 
  text("Click on the music symbol of the playlist with description for interaction!!", 10, 30);

  // Display user's playlists
  let x = 20;
  let y = 50;
  const spacing = 150;

  for (let playlist of playlists) {
    noStroke();
    if (playlist.shape === "star") {
      // Change the color of the star constantly
      playlist.starColor = color(random(255), random(255), random(255));
      fill(playlist.starColor);
      drawStar(x + 60, y + 60, 30, 60, 5); 
    } else if (playlist.shape === "ellipse") {
      ellipse(x + 60, y + 60, 120, 120); 
    } else if (playlist.shape === "wave") {
      drawWave();
    } else if (playlist.shape === "musicnote") {
      drawMusicNoteSymbol(x + 60, y + 60, 30); // Draw a music note symbol
    }

    // Display playlist name
    textSize(14);
    fill(0); 
    text(playlist.name, x, y + 140);

    // Display playlist description below the name
    textSize(12);
    fill(0); 
    text(playlist.description, x, y + 160);

    x += spacing;
  }

  // Update and display the balls for energetic playlists
  updateBalls();

  // Draw the music equalizer at the bottom
  drawEqualizer();
}

function updateBalls() {
  for (let ball of balls) {
    ball.move();
    ball.display();
  }
}

class Ball {
  constructor(x, y, radius, fillColor) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.fillColor = fillColor;
    this.xSpeed = random(-5, 5);
    this.ySpeed = random(-5, 5);
  }

  move() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
  }

  display() {
    fill(this.fillColor);
    noStroke();
    ellipse(this.x, this.y, this.radius * 2);
  }
}

function mousePressed() {
  for (let i = 0; i < playlists.length; i++) {
    let x = 20 + i * 150;
    let y = 50;
    if (mouseX > x && mouseX < x + 120 && mouseY > y && mouseY < y + 120) {
      // Check if the mouse was clicked inside a playlist 
      if (playlists[i].mood === "happy") {
        // If the playlist has the mood "energetic," generate random balls
        for (let j = 0; j < 10; j++) {
          let ball = new Ball(x + 60, y + 60, random(10, 30), color(random(255), random(255), random(255)));
          balls.push(ball);
        }
      } else if (playlists[i].mood === "energetic") {
        playlists[i].changeShapeToStar();
      } else if (playlists[i].mood === "relaxed") {
        playlists[i].shape = "wave";
      }
    }
  }
}

// Function to draw a star
function drawStar(x, y, radius1, radius2, npoints) {
  stroke(255);
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = -PI/2; a < TWO_PI-PI/2; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// Function to draw a wave
function drawWave() {
  let angle = frameCount * 0.01;
  let r;
  let phase = 0;

  r = width / 32;
  translate(530, 100);
  rotate(angle);
  stroke(255);
  strokeWeight(4);
  fill(0, 100, 255, 200);
  let increment = TWO_PI / 32;
  beginShape();
  for (let a = 0; a < TWO_PI; a += increment) {
    let r1 = r + sin(a * 10 + phase) * 6.25;
    let x = r1 * cos(a);
    let y = r1 * sin(a);
    curveVertex(x, y);
  }
  endShape(CLOSE);
  phase += 0.05;

  resetMatrix(); // Reset the transformation matrix to avoid affecting other elements
}

// Function to draw a music note symbol
function drawMusicNoteSymbol(x, y) {
  fill(0);
  rect(x - 50, y - 50, 80, 15);
  rect(x - 50, y - 50, 10, 80);
  rect(x + 20, y - 50, 10, 80);
  ellipse(x - 60, y + 30, 40, 25);
  ellipse(x + 160, y + 30, 40, 25);
}

// Function to draw the music equalizer
function drawEqualizer() {
  let numberOfBars = 20; 
  let barWidth = 20;
  let spacing = 10;
  let maxHeight = 150;

  // Calculate total width of the equalizer
  let totalWidth = numberOfBars * (barWidth + spacing) - spacing;

  // Calculate the starting position to center the equalizer
  let startX = 600;
  let startY = 700; 

  for (let i = 0; i < numberOfBars; i++) {
    let barHeight = random(maxHeight);
    let x = startX + i * (barWidth + spacing);
    let y = startY - barHeight; 

    // random color between blue and pink
    let randomColor = color(random(0, 100), 0, random(100, 255));
    fill(randomColor);
    rect(x, y, barWidth, barHeight);
  }
}

// Function to draw a gradient background
function gradientBackground(color1, color2) {
  noStroke();
  for (let i = 0; i <= height; i++) {
    // Interpolate between the two colors
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(color1, color2, inter);
    // Set the background color for each row
    fill(c);
    rect(0, i, width, 1);
  }
}
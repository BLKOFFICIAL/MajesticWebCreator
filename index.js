const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');// Add body-parser middleware

const app = express();
const port = process.env.PORT || 6324;
const projectDirectory = __dirname; 
const profileDirectory = '/profile';
const profileFolder = 'profile';
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  ); // Allow specific HTTP methods
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  ); // Allow specific headers
  next();
});
// Adjust this to your project's directory


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/public/register.html');
});
app.get('/test', (req, res) => {
  res.sendFile(__dirname + '/public/test.html');
});
// Use body-parser middleware for parsing POST requests
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(projectDirectory, filename);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File does not exist
      res.status(404).send(`File '${filename}' not found.`);
    } else {
      // Determine the file extension
      const fileExtension = path.extname(filePath).toLowerCase();

      // Define supported image and HTML file extensions
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp'];
      const htmlExtensions = ['.html', '.htm'];

      if (imageExtensions.includes(fileExtension)) {
        // Serve images directly
        res.sendFile(filePath);
      } else if (htmlExtensions.includes(fileExtension)) {
        // Serve HTML files directly
        res.sendFile(filePath);
      } else if (!filePath.startsWith(path.join(projectDirectory, 'profile'))) {
        // Allow serving or downloading files except those in the 'profile' folder
        res.download(filePath, (err) => {
          if (err) {
            // Error occurred during download
            res.status(500).send(`Error downloading file '${filename}'.`);
          }
        });
      } else {
        // File is in the 'profile' folder, prevent access
        res.status(403).send(`Access to file '${filename}' is forbidden.`);
      }
    }
  });
});


app.get('/profile/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'profile', filename); // Use the 'profile' folder

  // Check if the file exists in the 'profile' directory
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File does not exist in the 'profile' folder
      res.status(404).send(`File '${filename}' not found in the profile folder.`);
    } else {
      // Determine the file extension
      const fileExtension = path.extname(filePath).toLowerCase();

      // Define supported image and HTML file extensions
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp'];
      const htmlExtensions = ['.html', '.htm'];

      if (imageExtensions.includes(fileExtension)) {
        // Serve images directly
        res.sendFile(filePath);
      } else if (htmlExtensions.includes(fileExtension)) {
        // Serve HTML files directly
        res.sendFile(filePath);
      } else {
        // Allow serving or downloading other files in the 'profile' folder
        res.download(filePath, (err) => {
          if (err) {
            // Error occurred during download
            res.status(500).send(`Error downloading file '${filename}' from the profile folder.`);
          }
        });
      }
    }
  });
});




// Serve the HTML form page
app.get('/addhtml', (req, res) => {
  res.sendFile(path.join(__dirname, 'addhtml.html'));
});

// ... (previous code)

app.post('/api/add-html', (req, res) => {
  // Get the HTML content and the specified filename from the form
  const { htmlContent, filename } = req.body;

  if (!htmlContent) {
    return res.status(400).send('HTML content is missing.');
  }

  // Generate a unique filename if one is not provided
  const customFilename = filename || `custom-${Date.now()}.html`;

  // Ensure the filename has the .html extension
  const sanitizedFilename = customFilename.endsWith('.html')
    ? customFilename
    : `${customFilename}.html`;

  // Save the HTML content to a file
  const filePath = path.join(projectDirectory, sanitizedFilename);
  fs.writeFile(filePath, htmlContent, (err) => {
    if (err) {
      res.status(500).send('Error saving HTML content.');
    } else {
      res.status(200).send(`HTML content saved as '${sanitizedFilename}'.`);
    }
  });
});

app.post('/api/generate-profile-html', (req, res) => {
  // Extract profile information and button links from the request body
  const {
    profileUrl,
    name,
    bio,
    youtubeLink,
    twitterLink,
    githubLink,
    websiteLink,
  } = req.body;

  // Debugging: Log received data to check if it's being correctly received
  console.log("name:", name);
  console.log("bio:", bio);
  console.log("profileUrl:", profileUrl);

  // Check if any of the required fields are missing
  if (!profileUrl || !name || !bio) {
    console.log("Missing required profile information.");
    return res.status(400).send('Missing required profile information.'); // Change status code to 400 for Bad Request
  }



  // Define the folder where profiles will be saved
  const profileFolder = 'profile';

  // Ensure the profile folder exists
  if (!fs.existsSync(profileFolder)) {
    fs.mkdirSync(profileFolder);
  }

  // Generate a unique filename based on the user's name
  let filename = `${name}.html`;
  let count = 1;
  while (fs.existsSync(path.join(profileFolder, filename))) {
    filename = `${name}${count}.html`;
    count++;
  }

  // Generate the HTML content
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" type="text/css" href="/profile/normal.css">
</head>
<body>
  <div class="container">
    <div class="profile">
      <img src="${profileUrl}" alt="Profile Picture">
      <div class="username">${name}</div>
      <div class="bio">${bio}</div>
    </div>
    <div class="button-container">
      <button class="button" onclick="window.location.href='${youtubeLink}'">Youtube</button>
      <button class="button" onclick="window.location.href='${twitterLink}'">Twitter</button>
      <button class="button" onclick="window.location.href='${githubLink}'">Github</button>
      <button class="button" onclick="window.location.href='${websiteLink}'">Website</button>
      <button class="button" onclick="window.location.href='https://www.teamblk.xyz'">How I made this</button>
    </div>
  </div>
</body>
</html>`; 

  // Save the HTML content to the profile folder with the unique filename
  const filePath = path.join(profileFolder, filename);
  fs.writeFile(filePath, htmlContent, (err) => {
    if (err) {
      res.status(500).send('Error saving HTML content.');
    } else {
      res.status(200).send(`HTML content saved as '${filename}' in the profile folder.`);
    }
  });
});

const dataFilePath = 'data.json';
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, '{}');
}

const ejs = require('ejs');

app.post('/api/generate-discord-html', (req, res) => {
  // Extract profile information and button links from the request body
  const {
    userId,
    profileUrl,
    name,
    bio,
    youtubeLink,
    contact,
    twitterLink,
    githubLink,
    websiteLink,
  } = req.body;

  console.log(profileUrl);
  console.log(name);

  // Check if any of the required fields are missing
  if (!userId || !profileUrl || !name || !bio) {
    console.log("Missing required profile information.");
    return res.status(400).send('Missing required profile information.'); // Change status code to 400 for Bad Request
  }

  // Load existing data from data.json
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

  // Check if the user already has 5 files
  if (data[userId] && data[userId].length >= 5) {
    return res.status(400).send('User has reached the maximum limit of files.');
  }

  // Generate a unique filename based on the user's name
  let filename = `${name}.html`;
  let count = 1;
  while (fs.existsSync(path.join(profileFolder, filename))) {
    filename = `${name}${count}.html`;
    count++;
  }

  // Render the EJS template with the provided data
  const htmlContent = `<!DOCTYPE HTML>
<html lang="en">
<head>
  <meta http-equiv="content-type" content="text/html;charset=UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="theme-color" content="#f5424b">
  <meta name="description" content="My Portfolio. I'm A Student Who Loves the Digital World." />
  <meta property="og:site_name" content="Adithyadev" />
  <meta property="og:title" content="Adithyadev" />
  <meta property="og:type" content="website" />
  <meta property="og:description" content="My Portfolio. I'm A Student Who Loves the Digital World." />
 <link rel="shortcut icon" href="https://cdn.discordapp.com/attachments/1103889891982573569/1119638587068137543/330821507_606971847909439_604175657583186659_n.jpg" type="image/x-icon">
  <link rel="stylesheet" type="text/css" href="/profile/discord.css">
    <link rel="icon" href=https://cdn.discordapp.com/attachments/1103889891982573569/1119638587068137543/330821507_606971847909439_604175657583186659_n.jpg" type="image/x-icon">
  <title>Team BLK</title>
  <meta charset="utf-8" />
</head>
    

    
    <link rel="canonical" href="index-2.html" />
    <link href="https://fonts.googleapis.com/css?display=swap&amp;family=Montserrat:700,700italic,400,400italic,900,900italic%7CRubik:400,400italic,300,300italic,500,500italic,700,700italic%7CRoboto:400,400italic,300,300italic,700,700italic,900,900italic" rel="stylesheet" type="text/css" />
    
</head>

<body><svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 40 40" display="none" width="0" height="0">
        <symbol id="icon-a3c" viewBox="0 0 40 40">
            <path
                d="M30.1,22.8c-0.1-0.1-0.3-0.2-0.5-0.2h-1.3c-0.2,0-0.3,0.1-0.5,0.2c-0.1,0.1-0.2,0.3-0.2,0.5v6.4c0,0.9-0.3,1.6-0.9,2.3 c-0.6,0.6-1.4,0.9-2.3,0.9H7.8c-0.9,0-1.6-0.3-2.3-0.9c-0.6-0.6-0.9-1.4-0.9-2.3V12.9c0-0.9,0.3-1.6,0.9-2.3C6.1,10,6.9,9.7,7.8,9.7 h14.1c0.2,0,0.3-0.1,0.5-0.2c0.1-0.1,0.2-0.3,0.2-0.5V7.8c0-0.2-0.1-0.3-0.2-0.5c-0.1-0.1-0.3-0.2-0.5-0.2H7.8c-1.6,0-3,0.6-4.1,1.7 S2,11.3,2,12.9v16.7c0,1.6,0.6,3,1.7,4.1c1.1,1.1,2.5,1.7,4.1,1.7h16.7c1.6,0,3-0.6,4.1-1.7c1.1-1.1,1.7-2.5,1.7-4.1v-6.4 C30.3,23,30.2,22.9,30.1,22.8z M37.6,5c-0.3-0.3-0.6-0.4-0.9-0.4H26.4c-0.3,0-0.6,0.1-0.9,0.4s-0.4,0.6-0.4,0.9s0.1,0.6,0.4,0.9 l3.5,3.5L16,23.4c-0.1,0.1-0.2,0.3-0.2,0.5s0.1,0.3,0.2,0.5l2.3,2.3c0.1,0.1,0.3,0.2,0.5,0.2c0.2,0,0.3-0.1,0.5-0.2l13.1-13.1 l3.5,3.5c0.3,0.3,0.6,0.4,0.9,0.4c0.3,0,0.6-0.1,0.9-0.4s0.4-0.6,0.4-0.9V5.9C38,5.5,37.9,5.2,37.6,5z" />
        </symbol>
        <symbol id="icon-93f" viewBox="0 0 40 40">
            <path
                d="M33.2,8.3c-2.5-1.1-5.1-1.9-7.9-2.4c-0.3,0.6-0.7,1.4-1,2c-2.9-0.4-5.8-0.4-8.7,0c-0.3-0.6-0.7-1.4-1-2 c-2.8,0.5-5.4,1.3-7.9,2.4c-5,7.2-6.3,14.2-5.6,21.1c3.3,2.3,6.5,3.8,9.6,4.7c0.8-1,1.5-2.1,2.1-3.3c-1.1-0.4-2.2-0.9-3.2-1.5 c0.3-0.2,0.5-0.4,0.8-0.6c6.3,2.8,13,2.8,19.2,0c0.3,0.2,0.5,0.4,0.8,0.6c-1,0.6-2.1,1.1-3.2,1.5c0.6,1.1,1.3,2.2,2.1,3.3 c3.1-0.9,6.3-2.4,9.6-4.7C39.7,21.4,37.5,14.4,33.2,8.3z M13.7,25.1c-1.9,0-3.4-1.7-3.4-3.7s1.5-3.7,3.4-3.7c1.9,0,3.5,1.7,3.4,3.7 C17.1,23.4,15.6,25.1,13.7,25.1z M26.3,25.1c-1.9,0-3.4-1.7-3.4-3.7s1.5-3.7,3.4-3.7c1.9,0,3.5,1.7,3.4,3.7 C29.7,23.4,28.2,25.1,26.3,25.1z" />
        </symbol>
        <symbol id="icon-905" viewBox="0 0 40 40">
            <path
                d="M36.3,10.2c-1,1.3-2.1,2.5-3.4,3.5c0,0.2,0,0.4,0,1c0,1.7-0.2,3.6-0.9,5.3c-0.6,1.7-1.2,3.5-2.4,5.1 c-1.1,1.5-2.3,3.1-3.7,4.3c-1.4,1.2-3.3,2.3-5.3,3c-2.1,0.8-4.2,1.2-6.6,1.2c-3.6,0-7-1-10.2-3c0.4,0,1.1,0.1,1.5,0.1 c3.1,0,5.9-1,8.2-2.9c-1.4,0-2.7-0.4-3.8-1.3c-1.2-1-1.9-2-2.2-3.3c0.4,0.1,1,0.1,1.2,0.1c0.6,0,1.2-0.1,1.7-0.2 c-1.4-0.3-2.7-1.1-3.7-2.3s-1.4-2.6-1.4-4.2v-0.1c1,0.6,2,0.9,3,0.9c-1-0.6-1.5-1.3-2.2-2.4c-0.6-1-0.9-2.1-0.9-3.3s0.3-2.3,1-3.4 c1.5,2.1,3.6,3.6,6,4.9s4.9,2,7.6,2.1c-0.1-0.6-0.1-1.1-0.1-1.4c0-1.8,0.8-3.5,2-4.7c1.2-1.2,2.9-2,4.7-2c2,0,3.6,0.8,4.8,2.1 c1.4-0.3,2.9-0.9,4.2-1.5c-0.4,1.5-1.4,2.7-2.9,3.6C33.8,11.2,35.1,10.9,36.3,10.2L36.3,10.2z" />
        </symbol>
        <symbol id="icon-993" viewBox="0 0 40 40">
            <path
                d="M37.6,27.1c0,0-0.3,2.4-1.4,3.5c-1.4,1.4-2.9,1.4-3.6,1.5c-5,0.4-12.4,0.4-12.4,0.4s-9.2-0.1-12.1-0.4 c-0.8-0.1-2.6-0.1-3.9-1.5c-1.1-1.1-1.4-3.5-1.4-3.5s-0.4-2.9-0.4-5.7v-2.7c0-2.9,0.4-5.7,0.4-5.7s0.3-2.4,1.4-3.5 C5.5,8,7,8,7.7,7.9c5-0.4,12.4-0.4,12.4-0.4h0c0,0,7.5,0,12.4,0.4C33.3,8,34.8,8,36.2,9.4c1.1,1.1,1.4,3.5,1.4,3.5s0.4,2.9,0.4,5.7 v2.7C37.9,24.2,37.6,27.1,37.6,27.1z M16.5,14.6l0,9.9l9.6-5L16.5,14.6z" />
        </symbol>
    </svg>
    <div id="wrapper">
        <div id="main">
            <div class="inner">
                <section id="home-section" style="border-radius: 20px;">
                    <div id="container07" class="container default full">
                        <div class="wrapper">
                            <div class="inner"></div>
                        </div>
                    </div>
                    <div id="container08" class="container columns">
                        <div class="wrapper">
                            <div class="inner">
                                <div>
                                    <div id="image01" class="image"><span class="frame"><img
                                                src="${profileUrl}" alt="" /></span></div>
                                </div>
                                <div>
                                    <h1 id="text04">${name}<span style="color: gray">#0</span></h1>
                                    <div id="image02" class="image"><span class="frame"><img
                                                src="https://cdn.discordapp.com/attachments/1023965598939631637/1024682913226293298/2022_09_28_0wl_Kleki.png" alt="" /></span></div>
                                </div>
                                <div>
                                    <ul id="buttons04" class="buttons">
                                        <li><a target="_blank" href="${contact}"
                                                class="button n01">Contact</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="container02" class="container default">
                        <div class="wrapper">
                            <div class="inner">
                                <hr id="divider01">
                            </div>
                        </div>
                    </div>
                    <div id="container14" class="container columns">
                        <div class="wrapper">
                            <div class="inner">
                                <div>
                                    <ul id="buttons12" class="style1 buttons">
                                        <li><a href="index.html" class="button n01">User Info</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <ul id="buttons11" class="style2 buttons">
                                        <li><a href="" class="button n01">Projects</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <ul id="buttons13" class="style2 buttons">
                                        <li><a href="" class="button n01">Services</a></li>
                                    </ul>
                                </div><span></span><span></span>
                            </div>
                        </div>
                    </div>
                    <div id="container03" class="container default">
                        <div class="wrapper">
                            <div class="inner">
                                <p id="text01" class="style1">ABOUT ME</p>
                            </div>
                        </div>
                    </div>
                    <div id="container06" class="container columns">
                        <div class="wrapper">
                            <div class="inner">
                                <div>
                                    <div id="image04" class="image"><span class="frame"><img
                                                src="https://wallpapercave.com/wp/wp2234615.png" alt="" /></span></div>
                                </div>
                                <div>
                                    <h3 id="text05"><span class="p">${bio}                                     </span><span
                                            class="p">Made By<br /> Team Blk </span>
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="border-radius: 0 0 20px 20px;" id="container15" class="container default">
                        <div class="wrapper" style="border-radius: 20px;">
                            <div class="inner">
                                <hr id="divider03">
                                <ul id="buttons01" class="buttons">
                                    <li><a target="_blank" href="${twitterLink}"
                                            class="button n01"><svg>
                                                <use xlink:href="#icon-905"></use>
                                            </svg><span class="label">Youtube</span></a></li>
                                    <li><a target="_blank" href="${youtubeLink}" class="button n02"><svg>
                                                <use xlink:href="#icon-993"></use>
                                            </svg><span class="label">Youtube</span></a></li>
                                    <li><a target="_blank" href="${websiteLink}" class="button n03"><svg>
                                                <use xlink:href="#icon-a3c"></use>
                                            </svg><span class="label">Website</span></a></li>
                                    <li>
  <a target="_blank" href="${githubLink}" class="button n04">
    <svg>
      <image href="https://cdn.discordapp.com/attachments/1153741287439224853/1156829164532408320/178-1787508_github-icon-download-at-icons8-white-github-icon.png?ex=6516649d&is=6515131d&hm=3740c9a04421c0b201d51b92c421f8b0a702f9b234fb61fe917413f46f8740fe" width="20" height="20" />
    </svg>
    <span class="label">Github</span>
  </a>
</li>

                                </ul>
                                <p id="text02">Better Than <span style="color: red">❤</span> You <span
                                        style="color: white">At Digital World</span>. Born To <a target="_blank"
                                        href="https://discord.com/"><span style="color: white">Win</span></a> Against
                                     <a target="_blank" href="><span
                                            style="color: white">You</span></a>.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>
    <script src="discord.js"></script>
    </body>


</html>`; 

  // Save the HTML content to the profile folder with the unique filename
  const filePath = path.join(profileFolder, filename);

  // Save the HTML content to the file
  fs.writeFile(filePath, htmlContent, (err) => {
    if (err) {
      res.status(500).send('Error saving HTML content.');
    } else {
      // Add the filename to the user's data
      if (!data[userId]) {
        data[userId] = [];
      }
      data[userId].push(filename);

      // Update the data.json file with the new data
      fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

      res.status(200).send(`https://delta.teamblk.xyz/profile/${filename}`);
    }
  });
});

// Endpoint to remove a filename for a specific userId
app.delete('/api/remove-profile/:userId/:filename', (req, res) => {
  const { userId, filename } = req.params;

  // Load existing data from data.json
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

  // Check if the user exists
  if (!data[userId]) {
    return res.status(404).send('User not found.');
  }

  // Remove the filename from the user's data
  const index = data[userId].indexOf(filename);
  if (index !== -1) {
    data[userId].splice(index, 1);

    // Update the data.json file with the updated data
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

    // Delete the file from the profile folder
    fs.unlinkSync(path.join(profileFolder, filename));

    res.status(200).send('File removed successfully.');
  } else {
    res.status(404).send('File not found.');
  }
});

// ... (remaining code)



// Error handling middleware for general server errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong on the server!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

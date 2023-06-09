var me = JSON.parse(localStorage.getItem("me"));
var access_token = localStorage.getItem("access_token");
var refresh_token = localStorage.getItem("refresh_token");
var storeDate = localStorage.getItem('storeDate')

const typeSelectElement = document.querySelector(".type");
const timeSelectElement = document.querySelector(".time")
const refreshButton = document.getElementById("refreshButton")
const logoutButton = document.getElementById("logoutButton")
const ctx = document.getElementById("myChart");

var pieChart;

async function onPageLoad() {
  checkAccessToken()

  document.getElementById("display_name").innerHTML =
    "Welcome " + me.display_name;

  if (storeDate - getDate() < 0) {
    await fetchInitData()
  }
  else {
    initData();
  }
}

function checkAccessToken() {
  if (access_token == null){
    localStorage.clear()
    window.location.href = 'https://noahcp123.github.io/index.html'
    //window.location.href = 'http://localhost:8888/index.html'
  }
}

async function fetchInitData(time_frame='short_term') {
  console.log('Fetching Init Data')
  const top20 = await getTop20(time_frame).then((top20) => {
    console.log(top20);
    return top20;
  });

  const top20Artists = await getTop20Artists(time_frame).then((top20Artists) => {
    //console.log(top20Artists);
    return top20Artists;
  });

  let songList = [];
  let artistList = [];
  let genres = [];

  let songIds = [];
  let artistsIds = [];
  
  top20.items.forEach((song) => {
    title = song.artists[0].name + " - " + song.name;
    songId = song.id;
    songIds.push(songId);
    songList.push(title);
  });

  top20Artists.items.forEach((artist) => {
    artistList.push(artist.name);
  });

  for (i = 0; i < songIds.length; ++i) {
    track = await getTrack(songIds[i]);
    artistsIds.push(track.artists[0].id);
  }

  for (i = 0; i < artistsIds.length; ++i) {
    artists = await getArtists(artistsIds[i]);
    genres.push(artists.genres);
  }

  localStorage.setItem('songList', songList)
  localStorage.setItem('artistList', artistList)
  localStorage.setItem('genres', genres)
  localStorage.setItem('songIds', songIds)
  localStorage.setItem('artistsIds', artistsIds)

  currentDate = getDate();
  localStorage.setItem('storeDate', currentDate)

  initData();
}

function initData() {
  genres = localStorage.getItem('genres').split(',')
  songList = localStorage.getItem("songList").split(',')
  updateDisplayList(songList);

  const flattenedGenres = genres.flatMap((genres) => genres);
  const genreCounts = flattenedGenres.reduce((acc, genre) => {
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});

  const pickHighest = (obj, num = 5) => {
    const requiredObj = {};
    if (num > Object.keys(obj).length) {
      return false;
    }
    Object.keys(obj)
      .sort((a, b) => obj[b] - obj[a])
      .forEach((key, ind) => {
        if (ind < num) {
          requiredObj[key] = obj[key];
        }
      });
    return requiredObj;
  };

  counts = pickHighest(genreCounts);

  //console.log(counts);
  displayPie(counts);
}

async function updateDisplayList(list) {
  //console.log("updateDisplayList fired");
  document.getElementById("top-artists").innerHTML = "";
  for (i = 0; i < 15; ++i) {
    var li = document.createElement("li");
    li.innerText = list[i];
    document.getElementById("top-artists").appendChild(li);
  }
}

async function getTop20(time_frame) {
  //console.log("getTop20 fired");
  method = "Get";
  url = "https://api.spotify.com/v1/me/top/tracks?time_range=" + time_frame;
  headers = { Authorization: "Bearer " + localStorage.getItem("access_token") };
  body = null;

  const top20 = await sendHttpRequest(method, url, headers, body);
  return top20;
}

async function getTop20Artists(time_frame) {
  //console.log("getTop20Artists fired");
  method = "Get";
  url = "https://api.spotify.com/v1/me/top/artists?time_range=" + time_frame;
  headers = { Authorization: "Bearer " + localStorage.getItem("access_token") };
  body = null;

  const top20Artists = await sendHttpRequest(method, url, headers, body);
  return top20Artists;
}

async function getTrack(trackId) {
  //console.log("getTrack fired");
  method = "Get";
  url = "https://api.spotify.com/v1/tracks/" + trackId;
  headers = { Authorization: "Bearer " + localStorage.getItem("access_token") };
  body = null;

  const track = await sendHttpRequest(method, url, headers, body);
  return track;
}

async function getArtists(artistsId) {
  //console.log("getTrack fired");
  method = "Get";
  url = "https://api.spotify.com/v1/artists/" + artistsId;
  headers = { Authorization: "Bearer " + localStorage.getItem("access_token") };
  body = null;

  const artists = await sendHttpRequest(method, url, headers, body);
  return artists;
}

// Generic GET request format taking options as params
async function sendHttpRequest(method, url, headers, body) {
    //console.log("sendHttpRequest to", url);
    var data;
    try {
        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body,
        });
        data = await response.json();
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }
    catch (error) {
        localStorage.clear()
        window.location.href = 'https://noahcp123.github.io/index.html'
        //window.location.href = 'http://localhost:8888/index.html'
    }
    return data;
  }
  

// Get the current date in YYYYMMDD format
function getDate(){
    var currentDate = new Date()
    var datetime = "" + currentDate.getFullYear()
                + currentDate.getMonth()
                + currentDate.getDate()
    datetime = parseInt(datetime)
    return datetime
}

// ----- Chart ------ //

function displayPie(genreCounts) {
  labels_list = Object.keys(genreCounts);
  values_list = Object.values(genreCounts);

  // Remove loading text first time around before drawing pie
  loadingText = document.getElementById('loading')
  if (loadingText != null){
    document.getElementById('loading').remove()
  }

  // Destroy pie if one exists so we can draw another 
  if (pieChart != undefined){
    pieChart.destroy()
  }

  // Draw pie (pieChart is a global var)
  pieChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels_list,
      datasets: [
        {
          label: "Number of songs in genre",
          data: values_list,
          borderWidth: 1,
        },
      ],
    },
    options: {
    },
  });
}


// Drop down menu event listener
typeSelectElement.addEventListener("change", (event) => {
  if (event.target.value == "songs") {
    updateDisplayList(localStorage.getItem("songList").split(','));
  }
  if (event.target.value == "artists") {
    updateDisplayList(localStorage.getItem("artistList").split(','));
  }
  if (event.target.value == "albums") {
    return;
  }
});

timeSelectElement.addEventListener("change", (event) => {
  typeSelectElement.value = 'songs'
  if (event.target.value == "short_term") {
    fetchInitData('short_term')
  }
  if (event.target.value == "medium_term") {
    fetchInitData('medium_term')
  }
  if (event.target.value == "long_term") {
    fetchInitData('long_term');
  }
});

refreshButton.addEventListener("click", (event) => {
    localStorage.removeItem('storeDate','songList','artistList','genres','aritstIds','songIds')
    typeSelectElement.value = 'songs'
    timeSelectElement.value = "short_term"
    fetchInitData()
});

logoutButton.addEventListener("click", (event) => {
    localStorage.clear()
    window.location.href = 'https://noahcp123.github.io/index.html'
    //window.location.href = 'http://localhost:8888/index.html';
});

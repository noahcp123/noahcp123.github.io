var me = JSON.parse(localStorage.getItem("me"));
var access_token = localStorage.getItem("access_token");
var refresh_token = localStorage.getItem("refresh_token");

async function sendHttpRequest(method, url, headers, body) {
  //console.log("sendHttpRequest to", url);
  const response = await fetch(url, {
    method: method,
    headers: headers,
    body: body,
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

function onPageLoad() {
  checkAccessToken();
  document.getElementById("display_name").innerHTML =
    "Welcome " + me.display_name;
  initData();
}

function checkAccessToken() {}

async function initData() {
  const top20 = await getTop20().then((top20) => {
    console.log(top20);
    return top20;
  });

  let songList = [];
  let songIds = [];
  let artistsIds = [];
  let genres = [];
  top20.items.forEach((song) => {
    title = song.artists[0].name + " - " + song.name;
    songId = song.id;
    songIds.push(songId);
    songList.push(title);
  });

  for (i = 0; i < 15; ++i) {
    var li = document.createElement("li");
    li.innerText = songList[i];
    document.getElementById("top-artists").appendChild(li);
  }
  for (i = 0; i < songIds.length; ++i) {
    track = await getTrack(songIds[i]);
    artistsIds.push(track.artists[0].id);
  }

  for (i = 0; i < artistsIds.length; ++i) {
    artists = await getArtists(artistsIds[i]);
    genres.push(artists.genres);
  }

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

  console.log(counts);
  displayPie(counts);
}

async function getTop20() {
  console.log("getTop20 fired");
  method = "Get";
  url = "https://api.spotify.com/v1/me/top/tracks";
  headers = { Authorization: "Bearer " + localStorage.getItem("access_token") };
  body = null;

  const top20 = await sendHttpRequest(method, url, headers, body);
  return top20;
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

// ----- Chart ------ //

function displayPie(genreCounts) {
  labels_list = Object.keys(genreCounts);
  values_list = Object.values(genreCounts);
  const ctx = document.getElementById("myChart");

  new Chart(ctx, {
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
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

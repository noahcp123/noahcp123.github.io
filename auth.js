var redirect_uri = "http://localhost:8888/index.html";

var client_id = "2abe2aba952841d3b3800398b492d525";
var client_secret = "c830328d91284e36be384f8fa8a6421a";

const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";

const login_btn = document.getElementById("login_btn");

// Function order =>
// onPageLoad()
// handleRedirect()
// getCode()
// fetchAccessToken()
// callAuthorizationApi()

//Runs on body load, handleRedirect if any headers are present
function onPageLoad() {
  console.log("onPageLoad fired");
  if (window.location.search.length > 0) {
    handleRedirect();
  }
  const me = getMe()
  console.log(me)
}

//Fetched code with getCode, uses code to fetchAccessToken
function handleRedirect() {
  console.log("handleRedirect fired");
  let code = getCode();
  fetchAccessToken(code);
  window.history.pushState("", "", redirect_uri); //clear headers from URL
  console.log("redirect ran");
  onPageLoad();
}

//Create the authorization URL and redirect to the user login page
function requestAuthorization() {
  console.log("requestAuthorization fired");
  let url = AUTHORIZE;
  url += "?client_id=" + client_id;
  url += "&response_type=code";
  url += "&redirect_uri=" + encodeURI(redirect_uri);
  url += "&show_dialog=true";
  url +=
    "&scope=user-read-private playlist-read-private playlist-read-collaborative user-read-playback-position user-top-read user-read-recently-played user-library-read user-read-private";
  window.location.href = url; //set URL to built URL
}

//Returns code scraped from end of redirect URL after requestAuthorization
function getCode() {
  console.log("getCode fired");
  let code = null;
  const queryString = window.location.search;
  if (queryString.length > 0) {
    const urlParams = new URLSearchParams(queryString);
    code = urlParams.get("code");
  }
  return code;
}

//Build request body, send auth request using callAuthorizationApi, send result to handleAuthResponse
function fetchAccessToken(code) {
  console.log("fetchAccessToken fired");
  let body = "grant_type=authorization_code";
  body += "&code=" + code;
  body += "&redirect_uri=" + encodeURI(redirect_uri);
  body += "&client_id=" + client_id;
  body += "&client_secret=" + client_secret;
  //console.log(body)
  callAuthorizationApi(body).then((response) => {
    handleAuthResponse(response);
  });
}

//Send POST to /token end point, return JSON object containing access_token
async function callAuthorizationApi(body) {
  console.log("callAuthorizationApi ran");
  const response = await fetch(TOKEN, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + window.btoa(client_id + ":" + client_secret),
    },
    body: body,
  });
  return response.json();
}

//save all gathered tokens/data to internalStorage
function handleAuthResponse(data) {
  console.log("handleAuthorizationResponse ran");
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
}

function sendHttpRequest(method, url, headers, body) {
  console.log("sendHttpRequest to", url);
  return fetch(url, {
    method: method,
    headers: headers,
    body: body,
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}

function getMe() {
  method = 'Get'
  url = 'https://api.spotify.com/v1/me'
  headers = { "Authorization": "Bearer " + localStorage.getItem("access_token")}
  body = null;
  const data = sendHttpRequest(method, url, headers, body)
    .then(response => response)
    .then(data => { return data })
    .catch(error => console.error(error));

    console.log(data)
}

// Call requestAuthorization on login_btn click
login_btn.addEventListener("click", (event) => {
  console.log("login_btn clicked");
  requestAuthorization();
});

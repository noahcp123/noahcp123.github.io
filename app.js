var me = JSON.parse(localStorage.getItem('me'))
var access_token = localStorage.getItem('access_token')
var refresh_token = localStorage.getItem('refresh_token')

async function sendHttpRequest(method, url, headers, body) {
    console.log("sendHttpRequest to", url);
    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: body,
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json()
    return data;
  }

function onPageLoad() {
    checkAccessToken()
    document.getElementById('display_name').innerHTML = "Welcome " + me.display_name
    initData()
}

function checkAccessToken() {

}

async function initData() {
    getTop20().then((top20) => {
        console.log(top20)
        sessionStorage.setItem('top20', JSON.stringify(top20))
    })
}

async function getTop20() {
    console.log('getTop20 fired')
    method = 'Get'
    url = 'https://api.spotify.com/v1/me/top/tracks'
    headers = { "Authorization": "Bearer " + localStorage.getItem("access_token")}
    body = null;
    
    const top20 = await sendHttpRequest(method, url, headers, body)
    return top20
  }
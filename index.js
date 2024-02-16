//initial variable needs
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const notFoundContainer = document.querySelector(".not-found");
const image = document.querySelector(".image");

let oldTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");

getfromSessionStorage(); // to check if coordinates are already presen tin sesion storage 


function switchTab(newTab) {
    if(newTab != oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");
    
        if(!searchForm.classList.contains("active")) { 
            //if search form container is invisible,if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            //mein pehle search wale tab pr tha, ab your weather tab visible krna hai
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //now i am inside your weather tab, so displya the weather now, so let's check local storage first 
            //for coordinates, if we have saved them there
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    //pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    //pass clicked tab as input parameter
    switchTab(searchTab);
});

//check if coordinates are already present in session storage
function  getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates"); //the coordinates which we save in storage we can check them or search them 
    if(!localCoordinates) {
        //if we find coordinates then show grantAccessContainer
           grantAccessContainer.classList.add("active");

    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const {lati,long} = coordinates;
    //make grantaccesscontainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //API CALL

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lati}&lon=${long}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
        console.log(data);
    }
    catch(err){
        console.log("Error occured", err);
        loadingScreen.classList.add("active");
        userInfoContainer.classList.remove("active");
        
    }
}


function renderWeatherInfo(weatherInfo) {
    //firstly, we have to fetch the element

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weather-Desc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch values from weatherInfo object and put it UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description; //[0] shows first array item
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;

    console.log("Weather Info - ",weatherInfo)
    if(weatherInfo.cod==="404") {
        console.log("inside if statement");

        notFoundContainer.classList.add("active");
        image.classList.add("active");

    }

}

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        alert("No Geolocation Support Available:");
    }
}

function showPosition(position) {

    const userCoordinates = {
        lati: position.coords.latitude,
        long: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates)); //coordinates are saving in storage here 
    // now we have to show the data in Ui 
    fetchUserWeatherInfo(userCoordinates);
    console.log(userCoordinates);

}
const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);



const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === ""){
         return;
    }
    else
    fetchSearchWeatherInfo(cityName);     
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");;
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    
    try {
        const response = await fetch(`
        https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        
        const data = await response.json(); //converting fetched data into json format
        
        if(data.cod !== "404") {

            loadingScreen.classList.remove("active"); //removing loading gif from UI
            
            renderWeatherInfo(data); //displaying the recieved json format data on UI by passing
            notFoundContainer.classList.remove("active");
            image.classList.remove("active");
            userInfoContainer.classList.add("active");
            // data as argument in  render function to show that recieved data
            // console.log("data is ",data);

        }
        else {
            // notFoundContainer.classList.add("active");
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.remove("active");
            notFoundContainer.classList.add("active");
            image.classList.add("active");
            searchForm.classList.remove("active");
        }
    }
    catch(err) {
        console.log("Error Occur, try another city");
        userInfoContainer.classList.remove("active");
        // notFoundContainer.classList.add("active");
        image.classList.add("active");
    }
}
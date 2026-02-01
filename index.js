const apiKey = '99baf33dc7ad6921883d110b2ca11d7f';
const locButton = document.querySelector('.loc-button');
const todayInfo = document.querySelector('.today-info');
const todayWeatherIcon = document.querySelector('.today-weather i');
const todayTemp = document.querySelector('weather-temp');
const daysList = document.querySelector('.days-list');

const weatherIconMap = {
    '01d': 'sun',
    '01n': 'moon',
    '02d': 'sun',
    '02n': 'moon',
    '03d': 'cloud',
    '03n': 'cloud',
    '04d': 'cloud',
    '04n': 'cloud',
    '09d': 'cloud-rain',
    '09n': 'cloud-rain',
    '10d': 'cloud-rain',
    '10n': 'cloud-rain',
    '11d': 'cloud-lightning',
    '11n': 'cloud-lightning',
    '13d': 'cloud-snow',
    '13n': 'cloud-snow',
    '50d': 'water',
    '50n': 'water'
};

function fetchWeatherData(location) {
	const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

	fetch(apiUrl).then(response => response.json()).then(data => {
		const todayWeather = data.list[0].weather[0].description;
		const todayTemperature = `${Math.round(data.list[0].main.temp)}°C`;
		const todayWeatherIconCode = data.list[0].weather[0].icon;

		todayInfo.querySelector('h2').textContent = new Date().toLocaleDateString('ru', { weekday: 'long' });
		todayInfo.querySelector('span').textContent = new Date().toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' });
		todayWeatherIcon.className = `bx bx-${weatherIconMap[todayWeatherIconCode]}`;
		todayTemp.textContent = todayTemperature;
	})
}
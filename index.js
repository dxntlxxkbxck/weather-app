const apiKey = '99baf33dc7ad6921883d110b2ca11d7f';
const locButton = document.querySelector('.loc-button');
const todayInfo = document.querySelector('.today-info');
const todayWeatherIcon = document.querySelector('.today-weather i');
const todayTemp = document.querySelector('.weather-temp');
const daysList = document.querySelector('.days-list');

// Соответствие кодов погодных условий классам иконок (в зависимости от ответа OpenWeather)
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
    // Сформировать URL API с учётом локации и ключа
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric&lang=ru`;

    // Получить данные о погоде из API
    fetch(apiUrl).then(response => response.json()).then(data => {
        // Обновить информацию на сегодня
        const todayWeather = data.list[0].weather[0].description;
        const todayTemperature = `${Math.round(data.list[0].main.temp)}°`;
        const todayWeatherIconCode = data.list[0].weather[0].icon;

        todayInfo.querySelector('h2').textContent = new Date().toLocaleDateString('ru', { weekday: 'long' });
        todayInfo.querySelector('span').textContent = new Date().toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' });
        todayWeatherIcon.className = `bx bx-${weatherIconMap[todayWeatherIconCode]}`;
        todayTemp.textContent = todayTemperature;

        // Обновить местоположение и описание погоды в секции "left-info"
        const locationElement = document.querySelector('.today-info > div > span');
        locationElement.textContent = `${data.city.name}, ${data.city.country}`;

        const weatherDescriptionElement = document.querySelector('.today-weather > h3');
        weatherDescriptionElement.textContent = todayWeather;

        // Обновить информацию о дне в секции "day-info"
        const todayPrecipitation = `${data.list[0].pop}%`;
        const todayHumidity = `${data.list[0].main.humidity}%`;
        const todayWindSpeed = `${data.list[0].wind.speed} км/ч`;

        const dayInfoContainer = document.querySelector('.day-info');
        dayInfoContainer.innerHTML = `

            <div>
                <span class="title">Осадки</span>
                <span class="value">${todayPrecipitation}</span>
            </div>
            <div>
                <span class="title">Влажность</span>
                <span class="value">${todayHumidity}</span>
            </div>
            <div>
                <span class="title">Скорость ветра</span>
                <span class="value">${todayWindSpeed}</span>
            </div>

        `;

        // Обновить погоду на следующие 4 дня
        const today = new Date();
        const nextDaysData = data.list.slice(1);

        const uniqueDays = new Set();
        let count = 0;
        daysList.innerHTML = '';
        for (const dayData of nextDaysData) {
            const forecastDate = new Date(dayData.dt_txt);
            const dayAbbreviation = forecastDate.toLocaleDateString('ru', { weekday: 'short' });
            const dayTemp = `${Math.round(dayData.main.temp)}°`;
            const iconCode = dayData.weather[0].icon;

            // Убедиться, что день не дублируется и не является сегодняшним
            if (!uniqueDays.has(dayAbbreviation) && forecastDate.getDate() !== today.getDate()) {
                uniqueDays.add(dayAbbreviation);
                daysList.innerHTML += `
                
                    <li>
                        <i class='bx bx-${weatherIconMap[iconCode]}'></i>
                        <span>${dayAbbreviation}</span>
                        <span class="day-temp">${dayTemp}</span>
                    </li>

                `;
                count++;
            }

            // Прекратить после получения 4 различных дней
            if (count === 4) break;
        }
    }).catch(error => {
        alert(`Ошибка: ${error} (Api Error)`);
    });
}

// Запросить данные о погоде при загрузке документа для локации по умолчанию (Санкт-Петербург)
document.addEventListener('DOMContentLoaded', () => {
    const defaultLocation = 'Saint Petersburg';
    fetchWeatherData(defaultLocation);
});

locButton.addEventListener('click', () => {
    const location = prompt('Введите название города :');
    if (!location) return;

    fetchWeatherData(location);
});
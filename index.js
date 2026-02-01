const apiKey = '99baf33dc7ad6921883d110b2ca11d7f';

const locButton = document.querySelector('.loc-button');
const todayInfo = document.querySelector('.today-info');
const todayWeatherIcon = document.querySelector('.today-weather i');
const todayTemp = document.querySelector('.weather-temp');
const daysList = document.querySelector('.days-list');

// Соответствие кодов погодных условий классам иконок
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

// 🔥 Функция смены фона по сезонам (стрелочная)
const changeSeasonalBackground = (todayItem, cityTimezone) => {
    const leftInfo = document.querySelector('.left-info');

    // Локальное время города для определения месяца
    const localTimestampMs = (todayItem.dt + cityTimezone) * 1000;
    const localDate = new Date(localTimestampMs);
    const month = localDate.getUTCMonth(); // 0–11

    // Сезон по месяцу (реалистично!)
    let season = 'winter';
    if (month >= 2 && month <= 4) season = 'spring';     // март–май
    else if (month >= 5 && month <= 7) season = 'summer'; // июнь–август
    else if (month >= 8 && month <= 10) season = 'autumn'; // сентябрь–ноябрь
    else season = 'winter'; // декабрь–февраль

    // Базовый класс по сезону
    let bgClass = `background-${season}`;

    // Уточняем по погоде (если есть такие картинки)
    const main = todayItem.weather[0].main.toLowerCase();
    if (main === 'clear') bgClass = `background-${season}-clear`;
    else if (main === 'clouds') bgClass = `background-${season}-cloudy`;
    else if (main === 'rain' || main === 'drizzle') bgClass = `background-${season}-rainy`;
    else if (main === 'snow') bgClass = `background-${season}-snowy`;

    // Плавная смена фона
    leftInfo.classList.add('changing-bg');
    leftInfo.className = leftInfo.className.replace(/background-[\w-]+/g, '').trim();

    setTimeout(() => {
        leftInfo.classList.add(bgClass);
        leftInfo.classList.remove('changing-bg');
    }, 400);
};

// 🔥 Главная функция получения погоды (стрелочная)
const fetchWeatherData = location => {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric&lang=ru`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Сегодняшние данные
            const todayItem = data.list[0];
            const todayWeather = todayItem.weather[0].description;
            const todayTemperature = `${Math.round(todayItem.main.temp)}°`;
            const todayWeatherIconCode = todayItem.weather[0].icon;

            // Дата и время
            todayInfo.querySelector('h2').textContent = new Date().toLocaleDateString('ru', { weekday: 'long' });
            todayInfo.querySelector('span').textContent = new Date().toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' });
            
            // Иконка и температура
            todayWeatherIcon.className = `bx bx-${weatherIconMap[todayWeatherIconCode]}`;
            todayTemp.textContent = todayTemperature;

            // Локация и описание
            document.querySelector('.today-info > div > span').textContent = `${data.city.name}, ${data.city.country}`;
            document.querySelector('.today-weather > h3').textContent = todayWeather;

            // 🔥 Смена фона по сезону (февраль = зима!)
            changeSeasonalBackground(todayItem, data.city.timezone);

            // Детали погоды
            const todayPrecipitation = `${(todayItem.pop || 0).toFixed(0)}%`;
            const todayHumidity = `${todayItem.main.humidity}%`;
            const todayWindSpeed = `${Math.round(todayItem.wind.speed)} км/ч`;

            document.querySelector('.day-info').innerHTML = `
                <div><span class="title">Осадки</span><span class="value">${todayPrecipitation}</span></div>
                <div><span class="title">Влажность</span><span class="value">${todayHumidity}</span></div>
                <div><span class="title">Скорость ветра</span><span class="value">${todayWindSpeed}</span></div>
            `;

            // Прогноз на 4 дня
            const today = new Date();
            const nextDaysData = data.list.slice(1);
            const uniqueDays = new Set();
            let count = 0;
            daysList.innerHTML = '';

            nextDaysData.forEach(dayData => {
                const forecastDate = new Date(dayData.dt_txt);
                const dayAbbreviation = forecastDate.toLocaleDateString('ru', { weekday: 'short' });
                const dayTemp = `${Math.round(dayData.main.temp)}°`;
                const iconCode = dayData.weather[0].icon;

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

                if (count === 4) return;
            });
        })
        .catch(error => {
            alert(`Ошибка загрузки погоды: ${error}`);
            console.error('API Error:', error);
        });
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    fetchWeatherData('Saint Petersburg, RU');
});

// Кнопка поиска
locButton.addEventListener('click', () => {
    const location = prompt('Введите название города:');
    if (!location || location.trim() === '') return;
    fetchWeatherData(location.trim());
});

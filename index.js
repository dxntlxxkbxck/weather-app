const apiKey = '99baf33dc7ad6921883d110b2ca11d7f';

const locButton = document.querySelector('.loc-button');
const todayInfo = document.querySelector('.today-info');
const todayWeatherIcon = document.querySelector('.today-weather i');
const todayTemp = document.querySelector('.weather-temp');
const daysList = document.querySelector('.days-list');

// соответствие кодов погодных условий классам иконок
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

// плавное размытие (без opacity, только blur + scale)
const changeSeasonalBackground = (todayItem, cityTimezone) => {
    const leftInfo = document.querySelector('.left-info');

    // определяем сезон и погоду
    const localTimestampMs = (todayItem.dt + cityTimezone) * 1000;
    const localDate = new Date(localTimestampMs);
    const month = localDate.getMonth();
    
    let season = 'winter';
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'autumn';

    const main = todayItem.weather[0].main.toLowerCase();
    let bgClass = `background-${season}`;
    if (main === 'clear') bgClass = `background-${season}-clear`;
    else if (main === 'clouds' || main === 'snow') bgClass = `background-${season}-cloudy`;

    // размытие + притёмнение (без opacity контейнера!)
    
    // 1. размываем текущую картинку (0.3s)
    leftInfo.style.transition = 'filter 0.3s ease-in-out, transform 0.3s ease-in-out';
    leftInfo.style.filter = 'blur(3px) brightness(0.7)';
    leftInfo.style.transform = 'scale(1.02)';
    
    // 2. меняем картинку (мгновенно, но размыто)
    setTimeout(() => {
        // очищаем классы
        leftInfo.classList.remove(
            'background-winter', 'background-spring', 'background-summer', 'background-autumn',
            'background-winter-clear', 'background-spring-clear', 'background-summer-clear', 'background-autumn-clear',
            'background-winter-cloudy', 'background-spring-cloudy', 'background-summer-cloudy', 'background-autumn-cloudy'
        );
        
        // добавляем новую картинку
        leftInfo.classList.add(bgClass);
        
        // лёгкое размытие новой + scale назад
        leftInfo.style.filter = 'blur(2px) brightness(0.8)';
        leftInfo.style.transform = 'scale(1.01)';
        leftInfo.style.transition = 'filter 0.4s ease-out, transform 0.4s ease-out';
    }, 300);

    // 3. плавное увеличение чёткости новой картинки (0.6s)
    setTimeout(() => {
        leftInfo.style.filter = 'blur(0px) brightness(1.05)';
        leftInfo.style.transform = 'scale(1.03)';
        leftInfo.style.transition = 'filter 0.6s ease-out, transform 0.3s ease-out';
    }, 700);

    // 4. финальная норма (1.3s)
    setTimeout(() => {
        leftInfo.style.filter = '';
        leftInfo.style.transform = '';
        leftInfo.style.transition = 'all 0.3s ease, background-image 0.8s ease-in-out';
    }, 1300);
};

// главная функция получения погоды
const fetchWeatherData = location => {
    console.log('🔍 поиск:', location);
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric&lang=ru`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data.cod !== "200") {
                alert(`город не найден: ${location}`);
                return;
            }

            const todayItem = data.list[0];
            const todayWeather = todayItem.weather[0].description;
            const todayTemperature = `${Math.round(todayItem.main.temp)}°`;
            const todayWeatherIconCode = todayItem.weather[0].icon;

            // дата и время
            todayInfo.querySelector('h2').textContent = new Date().toLocaleDateString('ru', { weekday: 'long' });
            todayInfo.querySelector('span').textContent = new Date().toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' });
            
            todayWeatherIcon.className = `bx bx-${weatherIconMap[todayWeatherIconCode]}`;
            todayTemp.textContent = todayTemperature;

            document.querySelector('.today-info > div > span').textContent = `${data.city.name}, ${data.city.country}`;
            document.querySelector('.today-weather > h3').textContent = todayWeather;

            // плавная смена фона
            changeSeasonalBackground(todayItem, data.city.timezone);

            // детали погоды
            const todayPrecipitation = `${(todayItem.pop || 0).toFixed(0)}%`;
            const todayHumidity = `${todayItem.main.humidity}%`;
            const todayWindSpeed = `${Math.round(todayItem.wind.speed)} км/ч`;

            document.querySelector('.day-info').innerHTML = `
                <div><span class="title">Осадки</span><span class="value">${todayPrecipitation}</span></div>
                <div><span class="title">Влажность</span><span class="value">${todayHumidity}</span></div>
                <div><span class="title">Скорость ветра</span><span class="value">${todayWindSpeed}</span></div>
            `;

            // прогноз на 4 дня
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
            alert(`ошибка загрузки погоды: ${error}`);
            console.error('api error:', error);
        });
};

// инициализация
document.addEventListener('DOMContentLoaded', () => {
    fetchWeatherData('Saint Petersburg, RU');
});

// кнопка поиска
locButton.addEventListener('click', () => {
    const location = prompt('введите название города:');
    if (!location || location.trim() === '') return;
    fetchWeatherData(location.trim());
});

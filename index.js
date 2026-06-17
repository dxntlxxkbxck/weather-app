const apiKey = '99baf33dc7ad6921883d110b2ca11d7f';

const locButton = document.querySelector('.loc-button');
const todayInfo = document.querySelector('.today-info');
const todayWeatherIcon = document.querySelector('.today-weather i');
const todayTemp = document.querySelector('.weather-temp');
const daysList = document.querySelector('.days-list');
const statusMessage = document.querySelector('.status-message');
const historyList = document.querySelector('.history-list');

const backgroundClasses = [
    'background-winter', 'background-spring', 'background-summer', 'background-autumn',
    'background-winter-clear', 'background-spring-clear', 'background-summer-clear', 'background-autumn-clear',
    'background-winter-cloudy', 'background-spring-cloudy', 'background-summer-cloudy', 'background-autumn-cloudy'
];

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

// плавное размытие фона (без opacity, только blur + scale)
const changeSeasonalBackground = (todayItem, cityTimezone) => {
    const leftInfo = document.querySelector('.left-info');

    // определяем сезон по месяцу
    const localTimestampMs = (todayItem.dt + cityTimezone) * 1000;
    const localDate = new Date(localTimestampMs);
    const month = localDate.getUTCMonth();
    
    let season = 'winter';
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'autumn';

    const main = todayItem.weather[0].main.toLowerCase();
    let bgClass = `background-${season}`;
    if (main === 'clear') bgClass = `background-${season}-clear`;
    else if (main === 'clouds' || main === 'snow') bgClass = `background-${season}-cloudy`;

    // размытие + scale анимация
    
    // 1. размываем текущую (0.3s)
    leftInfo.style.transition = 'filter 0.3s ease-in-out, transform 0.3s ease-in-out';
    leftInfo.style.filter = 'blur(3px) brightness(0.7)';
    leftInfo.style.transform = 'scale(1.02)';
    
    // 2. меняем картинку через 300мс
    setTimeout(() => {
        leftInfo.classList.remove(...backgroundClasses);
        
        // новая картинка
        leftInfo.classList.add(bgClass);
        
        // лёгкое размытие новой
        leftInfo.style.filter = 'blur(2px) brightness(0.8)';
        leftInfo.style.transform = 'scale(1.01)';
        leftInfo.style.transition = 'filter 0.4s ease-out, transform 0.4s ease-out';
    }, 300);

    // 3. чёткость (0.6s)
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

function setStatus(message = '') {
    statusMessage.textContent = message;
}

function readHistory() {
    try {
        const history = JSON.parse(localStorage.getItem('weatherHistory') || '[]');
        return Array.isArray(history) ? history : [];
    } catch {
        localStorage.removeItem('weatherHistory');
        return [];
    }
}

function renderHistory() {
    const history = readHistory();
    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<li class="history-empty">Пока нет сохраненных городов</li>';
        return;
    }

    history.forEach(city => {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = city;
        button.addEventListener('click', () => fetchWeatherData(city));
        item.appendChild(button);
        historyList.appendChild(item);
    });
}

// сохраняем историю поиска в localStorage
function saveToHistory(city) {
    const normalizedCity = city.trim();
    const history = readHistory()
        .filter(item => item.toLowerCase() !== normalizedCity.toLowerCase());

    history.unshift(normalizedCity);
    localStorage.setItem('weatherHistory', JSON.stringify(history.slice(0, 10)));
    renderHistory();
}

function getCityDate(timestamp, timezone) {
    return new Date((timestamp + timezone) * 1000);
}

function getLocalDateOptions(date) {
    return {
        weekday: date.toLocaleDateString('ru', { weekday: 'long', timeZone: 'UTC' }),
        fullDate: date.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
        day: date.toLocaleDateString('ru', { weekday: 'short', timeZone: 'UTC' }),
        dayNumber: date.getUTCDate()
    };
}

// главная функция получения погоды
const fetchWeatherData = location => {
    setStatus('Загрузка данных о погоде...');
    locButton.disabled = true;

    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric&lang=ru`;

    fetch(apiUrl)
        .then(async response => {
            const data = await response.json();

            if (!response.ok) {
                const error = new Error(data.message || `HTTP ${response.status}`);
                error.status = response.status;
                throw error;
            }

            return data;
        })
        .then(data => {

            // сохраняем в историю
            saveToHistory(location);

            const todayItem = data.list[0];
            const todayWeather = todayItem.weather[0].description;
            const todayTemperature = `${Math.round(todayItem.main.temp)}°`;
            const todayWeatherIconCode = todayItem.weather[0].icon;

            // дата по часовому поясу выбранного города
            const cityDate = getCityDate(todayItem.dt, data.city.timezone);
            const cityDateOptions = getLocalDateOptions(cityDate);
            todayInfo.querySelector('h2').textContent = cityDateOptions.weekday;
            todayInfo.querySelector('span').textContent = cityDateOptions.fullDate;
            
            todayWeatherIcon.className = `bx bx-${weatherIconMap[todayWeatherIconCode] || 'cloud'}`;
            todayTemp.textContent = todayTemperature;

            document.querySelector('.today-info > div > span').textContent = `${data.city.name}, ${data.city.country}`;
            document.querySelector('.today-weather > h3').textContent = todayWeather;

            // плавная смена фона
            changeSeasonalBackground(todayItem, data.city.timezone);

            // детали погоды
            const todayPrecipitation = `${Math.round((todayItem.pop || 0) * 100)}%`;
            const todayHumidity = `${todayItem.main.humidity}%`;
            // м/с в км/ч
            const todayWindSpeed = `${Math.round(todayItem.wind.speed * 3.6)} км/ч`;

            document.querySelector('.day-info').innerHTML = `
                <div><span class="title">Осадки</span><span class="value">${todayPrecipitation}</span></div>
                <div><span class="title">Влажность</span><span class="value">${todayHumidity}</span></div>
                <div><span class="title">Скорость ветра</span><span class="value">${todayWindSpeed}</span></div>
            `;

            // прогноз на 5 дней
            const today = getCityDate(todayItem.dt, data.city.timezone);
            const todayDayNumber = getLocalDateOptions(today).dayNumber;
            const nextDaysData = data.list.slice(1);
            const uniqueDays = new Set();
            let count = 0;
            daysList.innerHTML = '';

            for (const dayData of nextDaysData) {
                const forecastDate = getCityDate(dayData.dt, data.city.timezone);
                const forecastOptions = getLocalDateOptions(forecastDate);
                const dayAbbreviation = forecastOptions.day;
                const dayTemp = `${Math.round(dayData.main.temp)}°`;
                const iconCode = dayData.weather[0].icon;

                if (!uniqueDays.has(dayAbbreviation) && forecastOptions.dayNumber !== todayDayNumber) {
                    uniqueDays.add(dayAbbreviation);
                    daysList.innerHTML += `
                        <li>
                            <i class='bx bx-${weatherIconMap[iconCode] || 'cloud'}'></i>
                            <span>${dayAbbreviation}</span>
                            <span class="day-temp">${dayTemp}</span>
                        </li>
                    `;
                    count++;
                }
                // прогноз на 5 дней
                if (count === 5) break;
            }

            setStatus(`Данные обновлены: ${data.city.name}`);
        })
        .catch(error => {
            if (error.status === 404) {
                setStatus(`Город не найден: ${location}`);
                alert(`Город не найден: ${location}`);
                return;
            }

            setStatus('Не удалось загрузить данные. Проверьте интернет или API-ключ.');
            alert(`Ошибка загрузки погоды: ${error.message}`);
            console.error('API error:', error);
        })
        .finally(() => {
            locButton.disabled = false;
        });
};

// инициализация + показ истории
document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
    fetchWeatherData('Saint Petersburg, RU');
});

// кнопка поиска с валидацией
locButton.addEventListener('click', () => {
    const location = prompt('введите название города:');
    
    // валидация: не пустой + только буквы и пробелы (рус+лат)
    if (!location || !/^[a-zA-Zа-яёА-ЯЁ\s,.-]+$/.test(location.trim())) {
        alert('введите корректное название города (только буквы)');
        return;
    }
    
    fetchWeatherData(location.trim());
});

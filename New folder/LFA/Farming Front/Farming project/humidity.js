// This is a simplified example. A real app would use a weather API.
const weatherData = {
    location: "Ahmedabad, GJ",
    temperature: 32,
    feelsLike: 38,
    humidity: 57,
    wind: "10 km/h",
    recommendations: ["Umbrella ☔️", "Clothes 👕"],
    news: [{
        title: "Flood relief to be disbursed by Diwali, says Punjab CM Mann",
        source: "Hindustan Times"
    }]
};

function updateWeatherUI(data) {
    // Update current weather section
    document.querySelector('.current-weather h2').textContent = data.location;
    document.querySelector('.temp').textContent = data.temperature + '°';
    document.querySelector('.feels-like').textContent = `Feels like ${data.feelsLike}°`;
    document.querySelector('.weather-details p:nth-child(1)').textContent = `Humidity: ${data.humidity}%`;
    document.querySelector('.weather-details p:nth-child(2)').textContent = `Wind: ${data.wind}`;

    // Update recommendations
    const recList = document.querySelector('.recommendations ul');
    recList.innerHTML = '';
    data.recommendations.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        recList.appendChild(li);
    });

    // Update news feed
    const newsFeed = document.querySelector('.news');
    newsFeed.innerHTML = '<h3>News Feed</h3>'; // Clear previous news
    data.news.forEach(item => {
        const newsItemDiv = document.createElement('div');
        newsItemDiv.className = 'news-item';
        newsItemDiv.innerHTML = `<p>${item.title}</p><span class="source">${item.source}</span>`;
        newsFeed.appendChild(newsItemDiv);
    });
}

// Simulate fetching data after the page loads
document.addEventListener('DOMContentLoaded', () => {
    // In a real application, you would fetch from an API here
    // For example: fetch('https://api.weather.com/...')
    // .then(response => response.json())
    // .then(data => updateWeatherUI(data));

    // For this example, we'll use the hardcoded data
    updateWeatherUI(weatherData);
});
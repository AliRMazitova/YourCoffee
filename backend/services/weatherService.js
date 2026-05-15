const KAZAN_COORDS = {
  city: 'Казань',
  latitude: 55.7963,
  longitude: 49.1088,
  timezone: 'Europe/Moscow',
};

const WEATHER_TTL_MS = 20 * 60 * 1000;

let weatherCache = {
  fetchedAt: 0,
  data: null,
};

function buildForecastUrl() {
  const url = new URL('https://api.open-meteo.com/v1/forecast');

  url.searchParams.set('latitude', String(KAZAN_COORDS.latitude));
  url.searchParams.set('longitude', String(KAZAN_COORDS.longitude));
  url.searchParams.set(
    'current',
    [
      'temperature_2m',
      'relative_humidity_2m',
      'wind_speed_10m',
      'precipitation',
      'rain',
      'weather_code',
    ].join(',')
  );
  url.searchParams.set('timezone', KAZAN_COORDS.timezone);

  return url.toString();
}

function normalizeWeatherPayload(payload) {
  const current = payload?.current ?? {};

  return {
    city: KAZAN_COORDS.city,
    latitude: KAZAN_COORDS.latitude,
    longitude: KAZAN_COORDS.longitude,
    timezone: KAZAN_COORDS.timezone,
    observedAt: current.time ?? null,
    temperature: Number(current.temperature_2m ?? 0),
    humidity: Number(current.relative_humidity_2m ?? 0),
    windSpeed: Number(current.wind_speed_10m ?? 0),
    precipitation: Number(current.precipitation ?? 0),
    rain: Number(current.rain ?? 0),
    weatherCode: Number(current.weather_code ?? 0),
  };
}

export async function getCurrentKazanWeather(options = {}) {
  const { forceRefresh = false } = options;
  const now = Date.now();

  if (
    !forceRefresh &&
    weatherCache.data &&
    now - weatherCache.fetchedAt < WEATHER_TTL_MS
  ) {
    return {
      ...weatherCache.data,
      source: 'cache',
      cacheTtlMs: WEATHER_TTL_MS,
      cacheAgeMs: now - weatherCache.fetchedAt,
    };
  }

  if (typeof fetch !== 'function') {
    throw new Error('Global fetch is not available in the current Node runtime');
  }

  const response = await fetch(buildForecastUrl());

  if (!response.ok) {
    throw new Error(`Weather API failed with status ${response.status}`);
  }

  const payload = await response.json();
  const weather = normalizeWeatherPayload(payload);

  weatherCache = {
    fetchedAt: now,
    data: weather,
  };

  return {
    ...weather,
    source: 'live',
    cacheTtlMs: WEATHER_TTL_MS,
    cacheAgeMs: 0,
  };
}

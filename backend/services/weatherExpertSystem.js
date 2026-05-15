function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function triangle(x, a, b, c) {
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  if (x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

function grade(x, a, b) {
  if (x <= a) return 0;
  if (x >= b) return 1;
  return (x - a) / (b - a);
}

function reverseGrade(x, a, b) {
  if (x <= a) return 1;
  if (x >= b) return 0;
  return (b - x) / (b - a);
}

const DRINK_TYPE_LABELS = {
  warming: 'согревающие',
  neutral: 'универсальные',
  refreshing: 'освежающие',
};

const RULES = [
  {
    id: 'warming_cold_rain',
    output: 'warming',
    text: 'Если на улице холодно и дождливо, то рекомендуются согревающие напитки.',
    evaluate: (fuzzy) => Math.min(fuzzy.temperature.cold, fuzzy.precipitation.rainy),
  },
  {
    id: 'warming_cold_windy',
    output: 'warming',
    text: 'Если на улице холодно и ветрено, то рекомендуются согревающие напитки.',
    evaluate: (fuzzy) => Math.min(fuzzy.temperature.cold, fuzzy.wind.strong),
  },
  {
    id: 'warming_comfortable_rain',
    output: 'warming',
    text: 'Если температура умеренная, но идет дождь, то лучше подойдут уютные горячие напитки.',
    evaluate: (fuzzy) =>
      Math.min(fuzzy.temperature.comfortable, fuzzy.precipitation.rainy),
  },
  {
    id: 'neutral_comfortable_medium_humidity',
    output: 'neutral',
    text: 'Если температура комфортная и влажность средняя, то рекомендуются нейтральные напитки.',
    evaluate: (fuzzy) =>
      Math.min(fuzzy.temperature.comfortable, fuzzy.humidity.medium),
  },
  {
    id: 'neutral_comfortable_weak_wind',
    output: 'neutral',
    text: 'Если температура комфортная и ветер слабый, то подойдут универсальные напитки.',
    evaluate: (fuzzy) => Math.min(fuzzy.temperature.comfortable, fuzzy.wind.weak),
  },
  {
    id: 'refreshing_hot_dry',
    output: 'refreshing',
    text: 'Если жарко и осадков нет, то рекомендуются освежающие напитки.',
    evaluate: (fuzzy) => Math.min(fuzzy.temperature.hot, fuzzy.precipitation.none),
  },
  {
    id: 'refreshing_hot_humid',
    output: 'refreshing',
    text: 'Если жарко и влажность высокая, то рекомендуются легкие холодные напитки.',
    evaluate: (fuzzy) => Math.min(fuzzy.temperature.hot, fuzzy.humidity.high),
  },
  {
    id: 'refreshing_comfortable_low_humidity',
    output: 'refreshing',
    text: 'Если температура умеренная и воздух сухой, то можно рекомендовать освежающие напитки.',
    evaluate: (fuzzy) =>
      Math.min(fuzzy.temperature.comfortable, fuzzy.humidity.low),
  },
];

function describeWeatherCode(weatherCode) {
  if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) return 'дождь';
  if ([51, 53, 55].includes(weatherCode)) return 'морось';
  if ([71, 73, 75].includes(weatherCode)) return 'снег';
  if ([0, 1].includes(weatherCode)) return 'ясно';
  if ([2, 3].includes(weatherCode)) return 'облачно';
  return 'переменная погода';
}

function topStates(stateMap) {
  return Object.entries(stateMap)
    .map(([name, degree]) => ({
      name,
      degree: round2(clamp01(degree)),
    }))
    .sort((a, b) => b.degree - a.degree);
}

function normalizeTags(tags) {
  return Array.isArray(tags) ? tags.map((tag) => String(tag).toLowerCase()) : [];
}

export function fuzzifyWeather(weather) {
  const temperature = Number(weather.temperature ?? 0);
  const humidity = Number(weather.humidity ?? 0);
  const windSpeed = Number(weather.windSpeed ?? 0);
  const precipitation = Number(weather.precipitation ?? 0);

  return {
    temperature: {
      cold: clamp01(reverseGrade(temperature, 5, 15)),
      comfortable: clamp01(triangle(temperature, 10, 20, 27)),
      hot: clamp01(grade(temperature, 22, 32)),
    },
    humidity: {
      low: clamp01(reverseGrade(humidity, 35, 50)),
      medium: clamp01(triangle(humidity, 40, 60, 80)),
      high: clamp01(grade(humidity, 70, 90)),
    },
    wind: {
      weak: clamp01(reverseGrade(windSpeed, 2, 6)),
      moderate: clamp01(triangle(windSpeed, 4, 8, 12)),
      strong: clamp01(grade(windSpeed, 10, 18)),
    },
    precipitation: {
      none: clamp01(reverseGrade(precipitation, 0.2, 1.0)),
      rainy: clamp01(grade(precipitation, 0.5, 3.0)),
    },
  };
}

export function inferDrinkType(fuzzy) {
  const firedRules = RULES.map((rule) => ({
    id: rule.id,
    output: rule.output,
    text: rule.text,
    activation: round2(clamp01(rule.evaluate(fuzzy))),
  }));

  const scores = {
    warming: 0,
    neutral: 0,
    refreshing: 0,
  };

  for (const rule of firedRules) {
    scores[rule.output] = Math.max(scores[rule.output], rule.activation);
  }

  return {
    scores: {
      warming: round2(scores.warming),
      neutral: round2(scores.neutral),
      refreshing: round2(scores.refreshing),
    },
    firedRules: firedRules.sort((a, b) => b.activation - a.activation),
  };
}

export function selectBestDrinkType(scores) {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

export function buildDetailedExplanation(weather, fuzzy, inference, mood = null) {
  const bestType = selectBestDrinkType(inference.scores);
  const bestLabel = DRINK_TYPE_LABELS[bestType];
  const strongestRules = inference.firedRules.filter((rule) => rule.activation > 0).slice(0, 3);

  const temperatureStates = topStates(fuzzy.temperature);
  const humidityStates = topStates(fuzzy.humidity);
  const windStates = topStates(fuzzy.wind);
  const precipitationStates = topStates(fuzzy.precipitation);

  const weatherSummary =
    `Сейчас в ${weather.city} ${round2(weather.temperature)}°C, ` +
    `влажность ${round2(weather.humidity)}%, ` +
    `ветер ${round2(weather.windSpeed)} м/с, ` +
    `осадки ${round2(weather.precipitation)} мм/ч. ` +
    `Общее состояние: ${describeWeatherCode(weather.weatherCode)}.`;

  const interpretationSummary =
    `Наиболее выраженные оценки: температура "${temperatureStates[0].name}" ` +
    `(${temperatureStates[0].degree}), влажность "${humidityStates[0].name}" ` +
    `(${humidityStates[0].degree}), ветер "${windStates[0].name}" ` +
    `(${windStates[0].degree}), осадки "${precipitationStates[0].name}" ` +
    `(${precipitationStates[0].degree}).`;

  const moodSummary = mood?.name
    ? `Дополнительно учтено настроение "${mood.name}", поэтому подходящие напитки этого mood получают бонус при ранжировании.`
    : 'Настроение не выбрано, поэтому рекомендации опираются только на погоду и свойства напитков.';

  const finalSummary =
    `Итог системы: лучше всего подходят ${bestLabel} напитки, ` +
    `так как максимальную степень активации получил класс "${bestType}" ` +
    `со значением ${round2(inference.scores[bestType])}.`;

  return {
    bestType,
    bestTypeLabel: bestLabel,
    visualTheme: bestType,
    summary: `${weatherSummary} ${interpretationSummary} ${moodSummary} ${finalSummary}`,
    facts: {
      city: weather.city,
      observedAt: weather.observedAt ?? null,
      temperature: round2(weather.temperature),
      humidity: round2(weather.humidity),
      windSpeed: round2(weather.windSpeed),
      precipitation: round2(weather.precipitation),
      rain: round2(weather.rain),
      weatherCode: weather.weatherCode,
      weatherLabel: describeWeatherCode(weather.weatherCode),
    },
    fuzzyStates: {
      temperature: temperatureStates,
      humidity: humidityStates,
      wind: windStates,
      precipitation: precipitationStates,
    },
    mood,
    scores: inference.scores,
    strongestRules,
    explanationLines: [
      weatherSummary,
      interpretationSummary,
      moodSummary,
      ...strongestRules.map(
        (rule, index) =>
          `Правило ${index + 1}: ${rule.text} Степень активации: ${rule.activation}.`
      ),
      finalSummary,
    ],
  };
}

function scoreDrinkByWeatherType(drink, scores) {
  const tags = normalizeTags(drink.tags);
  let score = 0;

  score += scores.warming * (drink.is_hot ? 4 : 0);
  score += scores.refreshing * (!drink.is_hot ? 4 : 0);
  score += scores.neutral * 1;

  if (tags.includes('шоколадный')) score += scores.warming * 2;
  if (tags.includes('пряный')) score += scores.warming * 2;
  if (tags.includes('сливочный')) score += scores.warming * 1;
  if (tags.includes('уютный')) score += scores.warming * 1.5;

  if (tags.includes('цитрус')) score += scores.refreshing * 2;
  if (tags.includes('ягодный')) score += scores.refreshing * 2;
  if (tags.includes('тоник')) score += scores.refreshing * 1.5;

  if (tags.includes('кофе')) score += scores.neutral * 1.2;
  if (tags.includes('чай')) score += scores.neutral * 1.1;
  if (tags.includes('молочный')) score += scores.neutral * 1.1;
  if (tags.includes('матча')) score += scores.neutral * 1.1;

  return round2(score);
}

export function rankDrinksByWeather(drinks, inference, options = {}) {
  const { moodDrinkIds = [] } = options;
  const moodSet = new Set(moodDrinkIds.map(Number));

  return drinks
    .map((drink) => {
      const weatherScore = scoreDrinkByWeatherType(drink, inference.scores);
      const moodBonus = moodSet.has(Number(drink.id)) ? 2 : 0;
      const finalScore = round2(weatherScore + moodBonus);

      return {
        ...drink,
        weatherScore,
        moodBonus,
        finalScore,
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore || a.id - b.id);
}

export function buildWeatherRecommendationPayload(weather, drinks, options = {}) {
  const { mood = null, moodDrinkIds = [] } = options;
  const fuzzy = fuzzifyWeather(weather);
  const inference = inferDrinkType(fuzzy);
  const explanation = buildDetailedExplanation(weather, fuzzy, inference, mood);
  const rankedDrinks = rankDrinksByWeather(drinks, inference, { moodDrinkIds });

  return {
    weather,
    explanation,
    recommendations: rankedDrinks.slice(0, 5),
    rankedDrinkIds: rankedDrinks.map((drink) => Number(drink.id)),
    scoreMap: Object.fromEntries(
      rankedDrinks.map((drink) => [
        Number(drink.id),
        {
          weatherScore: drink.weatherScore,
          moodBonus: drink.moodBonus,
          finalScore: drink.finalScore,
        },
      ])
    ),
  };
}

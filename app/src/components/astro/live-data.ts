export type IssPosition = {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
  footprint: number;
  timestamp: number;
};

export type LaunchItem = {
  id: string;
  name: string;
  net: string;
  status: string;
  vehicle: string;
  pad: string;
  location: string;
  url: string;
};

export type ForecastHour = {
  time: string;
  cloud: number;
  visibilityKm: number | null;
  tempC: number | null;
  rain: number | null;
};

export type SkyForecast = {
  place: string;
  latitude: number;
  longitude: number;
  timezone: string;
  hours: ForecastHour[];
  bestHour: ForecastHour | null;
};

export type AsteroidItem = {
  id: string;
  name: string;
  diameterM: number;
  lunarDistance: number;
  closeTime: string;
  velocityKph: number;
  x: number;
  y: number;
};

export type MoonInfo = {
  name: string;
  illumination: number;
  ageDays: number;
};

const jsonHeaders = { Accept: "application/json" };

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { headers: jsonHeaders, signal });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

function dayStamp(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function formatTime(value: string | number | Date, options: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    ...options,
  }).format(new Date(value));
}

export function formatDateTime(value: string | number | Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export async function getIssPosition(signal?: AbortSignal): Promise<IssPosition> {
  return fetchJson<IssPosition>("https://api.wheretheiss.at/v1/satellites/25544", signal);
}

export async function getUpcomingLaunches(signal?: AbortSignal): Promise<LaunchItem[]> {
  type LaunchResponse = {
    results?: Array<{
      id?: string;
      name?: string;
      net?: string;
      status?: { name?: string };
      rocket?: { configuration?: { name?: string } };
      pad?: { name?: string; location?: { name?: string } };
      url?: string;
    }>;
  };

  const data = await fetchJson<LaunchResponse>(
    "https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=4",
    signal,
  );

  return (data.results ?? [])
    .filter((launch) => launch.net)
    .map((launch, index) => ({
      id: launch.id ?? `launch-${index}`,
      name: launch.name ?? "Launch pending name",
      net: launch.net!,
      status: launch.status?.name ?? "Upcoming",
      vehicle: launch.rocket?.configuration?.name ?? "Vehicle TBD",
      pad: launch.pad?.name ?? "Pad TBD",
      location: launch.pad?.location?.name ?? "Location TBD",
      url: launch.url ?? "https://thespacedevs.com",
    }));
}

export async function getForecastForCity(city: string, signal?: AbortSignal): Promise<SkyForecast> {
  type GeoResponse = {
    results?: Array<{
      name: string;
      latitude: number;
      longitude: number;
      country_code?: string;
      admin1?: string;
    }>;
  };
  type ForecastResponse = {
    timezone: string;
    hourly: {
      time: string[];
      cloud_cover: number[];
      visibility?: number[];
      temperature_2m?: number[];
      precipitation_probability?: number[];
    };
  };

  const geo = await fetchJson<GeoResponse>(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
    signal,
  );
  const place = geo.results?.[0];
  if (!place) {
    throw new Error(`No forecast location found for ${city}`);
  }

  const forecast = await fetchJson<ForecastResponse>(
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&hourly=cloud_cover,visibility,temperature_2m,precipitation_probability&forecast_days=2&timezone=auto`,
    signal,
  );

  const now = Date.now();
  const hours = forecast.hourly.time
    .map((time, index) => ({
      time,
      cloud: forecast.hourly.cloud_cover[index] ?? 0,
      visibilityKm: forecast.hourly.visibility?.[index] != null
        ? Math.round((forecast.hourly.visibility[index] / 1000) * 10) / 10
        : null,
      tempC: forecast.hourly.temperature_2m?.[index] ?? null,
      rain: forecast.hourly.precipitation_probability?.[index] ?? null,
    }))
    .filter((hour) => new Date(hour.time).getTime() >= now - 60 * 60 * 1000)
    .slice(0, 12);

  const bestHour = [...hours].sort((a, b) => {
    const rainA = a.rain ?? 0;
    const rainB = b.rain ?? 0;
    return a.cloud + rainA * 0.8 - (b.cloud + rainB * 0.8);
  })[0] ?? null;

  const placeName = [place.name, place.admin1, place.country_code].filter(Boolean).join(", ");
  return {
    place: placeName,
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: forecast.timezone,
    hours,
    bestHour,
  };
}

export async function getForecastForCoords(
  latitude: number,
  longitude: number,
  label = "your location",
  signal?: AbortSignal,
): Promise<SkyForecast> {
  type ForecastResponse = {
    timezone: string;
    hourly: {
      time: string[];
      cloud_cover: number[];
      visibility?: number[];
      temperature_2m?: number[];
      precipitation_probability?: number[];
    };
  };

  const forecast = await fetchJson<ForecastResponse>(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=cloud_cover,visibility,temperature_2m,precipitation_probability&forecast_days=2&timezone=auto`,
    signal,
  );
  const now = Date.now();
  const hours = forecast.hourly.time
    .map((time, index) => ({
      time,
      cloud: forecast.hourly.cloud_cover[index] ?? 0,
      visibilityKm: forecast.hourly.visibility?.[index] != null
        ? Math.round((forecast.hourly.visibility[index] / 1000) * 10) / 10
        : null,
      tempC: forecast.hourly.temperature_2m?.[index] ?? null,
      rain: forecast.hourly.precipitation_probability?.[index] ?? null,
    }))
    .filter((hour) => new Date(hour.time).getTime() >= now - 60 * 60 * 1000)
    .slice(0, 12);

  const bestHour = [...hours].sort((a, b) => {
    const rainA = a.rain ?? 0;
    const rainB = b.rain ?? 0;
    return a.cloud + rainA * 0.8 - (b.cloud + rainB * 0.8);
  })[0] ?? null;

  return { place: label, latitude, longitude, timezone: forecast.timezone, hours, bestHour };
}

export async function getAsteroids(signal?: AbortSignal): Promise<AsteroidItem[]> {
  type NeoResponse = {
    near_earth_objects?: Record<string, Array<{
      id?: string;
      name?: string;
      estimated_diameter?: { meters?: { estimated_diameter_min?: number; estimated_diameter_max?: number } };
      close_approach_data?: Array<{
        close_approach_date_full?: string;
        miss_distance?: { lunar?: string };
        relative_velocity?: { kilometers_per_hour?: string };
      }>;
    }>>;
  };

  const today = dayStamp();
  const data = await fetchJson<NeoResponse>(
    `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=DEMO_KEY`,
    signal,
  );

  const items = Object.values(data.near_earth_objects ?? {}).flat();
  return items
    .map((item, index) => {
      const approach = item.close_approach_data?.[0];
      const min = item.estimated_diameter?.meters?.estimated_diameter_min ?? 0;
      const max = item.estimated_diameter?.meters?.estimated_diameter_max ?? min;
      const hash = Array.from(item.id ?? item.name ?? `${index}`).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return {
        id: item.id ?? `neo-${index}`,
        name: (item.name ?? "Near-Earth object").replace(/[()]/g, ""),
        diameterM: Math.round((min + max) / 2),
        lunarDistance: Number(approach?.miss_distance?.lunar ?? 0),
        closeTime: approach?.close_approach_date_full ?? today,
        velocityKph: Math.round(Number(approach?.relative_velocity?.kilometers_per_hour ?? 0)),
        x: 22 + (hash % 58),
        y: 20 + ((hash * 7) % 60),
      };
    })
    .sort((a, b) => a.lunarDistance - b.lunarDistance)
    .slice(0, 5);
}

export function getMoonInfo(date = new Date()): MoonInfo {
  const synodicMonth = 29.53058867;
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const age = (((date.getTime() - knownNewMoon) / 86400000) % synodicMonth + synodicMonth) % synodicMonth;
  const phase = age / synodicMonth;
  const illumination = Math.round(((1 - Math.cos(2 * Math.PI * phase)) / 2) * 100);
  const names = [
    { max: 1.5, name: "New moon" },
    { max: 6.4, name: "Waxing crescent" },
    { max: 8.4, name: "First quarter" },
    { max: 13.8, name: "Waxing gibbous" },
    { max: 16.2, name: "Full moon" },
    { max: 21.1, name: "Waning gibbous" },
    { max: 23.1, name: "Last quarter" },
    { max: 28.0, name: "Waning crescent" },
    { max: synodicMonth, name: "New moon" },
  ];
  return {
    name: names.find((item) => age <= item.max)?.name ?? "Moon phase",
    illumination,
    ageDays: Math.round(age * 10) / 10,
  };
}

export function cToF(celsius: number | null): string {
  if (celsius == null) return "n/a";
  return `${Math.round((celsius * 9) / 5 + 32)}F`;
}

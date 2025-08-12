import axios from 'axios';

// Fuente activa y mantenida: disease.sh (NovelCOVID API)
// Docs: https://disease.sh/docs/
const BASE_URL = 'https://disease.sh/v3/covid-19';

// Normaliza los datos al shape esperado por los componentes existentes
// { confirmed: { value }, recovered: { value }, deaths: { value }, lastUpdate }
const normalizeSnapshot = (data) => ({
  confirmed: { value: Number(data && data.cases != null ? data.cases : 0) },
  recovered: { value: Number(data && data.recovered != null ? data.recovered : 0) },
  deaths: { value: Number(data && data.deaths != null ? data.deaths : 0) },
  lastUpdate: new Date(Number(data && data.updated != null ? data.updated : Date.now())).toISOString(),
});

export const fetchData = async (country) => {
  try {
    // Global o por país
    const endpoint = country && country.trim()
      ? `${BASE_URL}/countries/${encodeURIComponent(country)}?strict=false`
      : `${BASE_URL}/all`;

    const { data } = await axios.get(endpoint);
    return normalizeSnapshot(data);
  } catch (error) {
    // Devuelve un objeto vacío para que los componentes muestren Loading...
    return {};
  }
};

// Datos históricos globales para la gráfica de línea
export const fetchDailyData = async () => {
  try {
  const { data } = await axios.get(`${BASE_URL}/historical/all?lastdays=all`);
  const timeline = (data && data.timeline) ? data.timeline : data; // algunos despliegan dentro de timeline
  const cases = timeline && timeline.cases ? timeline.cases : {};
  const deaths = timeline && timeline.deaths ? timeline.deaths : {};
  const recovered = timeline && timeline.recovered ? timeline.recovered : {};

    // Convierte claves 'M/D/YY' a ISO 'YYYY-MM-DD' y arma array ordenado
    const toISO = (mdy) => {
      // mdy como '1/22/20'
      const [m, d, yy] = String(mdy).split('/').map((x) => parseInt(x, 10));
      const yyyy = 2000 + (yy || 0);
      const pad = (n) => String(n).padStart(2, '0');
      return `${yyyy}-${pad(m)}-${pad(d)}`;
    };

    const dates = Object.keys(cases);
    dates.sort((a, b) => new Date(toISO(a)) - new Date(toISO(b)));

    return dates.map((k) => ({
      confirmed: Number(cases[k] != null ? cases[k] : 0),
      deaths: Number(deaths[k] != null ? deaths[k] : 0),
      recovered: Number(recovered[k] != null ? recovered[k] : 0),
      date: toISO(k),
    }));
  } catch (error) {
    return [];
  }
};

export const fetchCountries = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/countries`);
    return (Array.isArray(data) ? data : []).map((c) => c.country).filter(Boolean).sort();
  } catch (error) {
    return [];
  }
};

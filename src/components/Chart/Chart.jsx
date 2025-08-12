import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';

import { fetchDailyData } from '../../api';

import styles from './Chart.module.css';

const Chart = ({ data: { confirmed, recovered, deaths }, country }) => {
  // Mantener tipo consistente (array) para evitar condiciones raras de render
  const [dailyData, setDailyData] = useState([]);
  // Tipo de gráfica realmente renderizado; permite una transición limpia entre Line/Bar
  const [renderType, setRenderType] = useState(country ? 'bar' : 'line');

  useEffect(() => {
    const fetchMyAPI = async () => {
      const initialDailyData = await fetchDailyData();
      setDailyData(Array.isArray(initialDailyData) ? initialDailyData : []);
    };

    fetchMyAPI();
  }, []);

  const barChart = (
    confirmed ? (
      <Bar
        key={`bar-${country || 'global'}`}
        redraw
        datasetKeyProvider={(dataset) => `bar-${dataset.label}`}
        data={{
          labels: ['Infected', 'Recovered', 'Deaths'],
          datasets: [
            {
              label: 'People',
              backgroundColor: ['rgba(0, 0, 255, 0.5)', 'rgba(0, 255, 0, 0.5)', 'rgba(255, 0, 0, 0.5)'],
              data: [confirmed.value, recovered.value, deaths.value],
            },
          ],
        }}
        options={{
          legend: { display: false },
          title: { display: true, text: `Current state in ${country}` },
        }}
      />
    ) : null
  );

  const lineChart = (
    dailyData[0] ? (
      <Line
        key="line-global"
        redraw
        datasetKeyProvider={(dataset) => `line-${dataset.label}`}
        data={{
          labels: dailyData.map(({ date }) => new Date(date).toLocaleDateString()),
          datasets: [{
            data: dailyData.map((d) => d.confirmed),
            label: 'Infected',
            borderColor: '#3333ff',
            fill: true,
          }, {
            data: dailyData.map((d) => d.deaths),
            label: 'Deaths',
            borderColor: 'red',
            backgroundColor: 'rgba(255, 0, 0, 0.5)',
            fill: true,
          }, {
            data: dailyData.map((d) => d.recovered),
            label: 'Recovered',
            borderColor: 'green',
            backgroundColor: 'rgba(0, 255, 0, 0.5)',
            fill: true,
          }],
        }}
      />
    ) : null
  );

  // Transición controlada de tipo para evitar que React y Chart.js retiren canvas simultáneamente
  useEffect(() => {
    const desired = country ? 'bar' : 'line';
    if (desired !== renderType) {
      // Vaciar primero
      setRenderType(null);
      const id = setTimeout(() => setRenderType(desired), 0);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [country, renderType]);

  return (
    <div className={styles.container}>
      {renderType === 'bar' && barChart}
      {renderType === 'line' && lineChart}
    </div>
  );
};

export default Chart;

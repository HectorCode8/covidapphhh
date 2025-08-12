import React, { useState, useEffect } from 'react';
import { NativeSelect, FormControl } from '@material-ui/core';

import { fetchCountries } from '../../api';

import styles from './CountryPicker.module.css';

const Countries = ({ handleCountryChange }) => {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchAPI = async () => {
      try {
        const list = await fetchCountries();
        setCountries(Array.isArray(list) ? list : []);
      } catch (e) {
        setCountries([]);
      }
    };

    fetchAPI();
  }, []);

  return (
    <FormControl className={styles.formControl}>
      <NativeSelect defaultValue="" onChange={(e) => handleCountryChange(e.target.value)}>
        <option value="">Global</option>
        {Array.isArray(countries) && countries.map((country, i) => (
          <option key={i} value={country}>{country}</option>
        ))}
      </NativeSelect>
    </FormControl>
  );
};

export default Countries;

# WeatherGuide — Tehran Weather Dashboard

A Persian, responsive weather dashboard for Tehran, powered by Open-Meteo.

## Features
- Current conditions: temperature, feels-like, humidity, dew point, pressure, cloud cover, precipitation, wind, gusts and visibility.
- 24-hour hourly forecast.
- 7-day daily forecast with high/low temperatures, precipitation chance, wind and weather codes.
- Sunrise, sunset, daylight duration, moonrise and moonset.
- UV index and solar radiation.
- Air quality: US AQI / European AQI, PM2.5, PM10, ozone, NO2, SO2, CO, dust and aerosol optical depth when provided by the model.
- Automatic weather alerts based on forecast thresholds.
- Persian RTL interface and Tehran local time.
- Manual refresh; weather and air quality requests run in parallel. Air quality failure does not block the weather dashboard.

## Data sources
- Forecast API: https://open-meteo.com/en/docs
- Air Quality API: https://open-meteo.com/en/docs/air-quality-api

The app is static and can be hosted on GitHub Pages. No API key is required for non-commercial use under Open-Meteo's applicable terms. Always review the provider's current attribution and usage requirements.

## Files
- index.html — page structure
- styles.css — responsive dashboard styling
- app.js — Open-Meteo requests, rendering and alert rules

## Notes
Forecast and air-quality values are model estimates, not direct observations from every street or a substitute for official warnings. Some variables may be unavailable at certain times or locations; unavailable values are displayed as dashes.

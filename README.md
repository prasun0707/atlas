# Land and Water Atlas

An interactive atlas of rivers and their tributaries, peaks, passes, valleys, coasts and national parks. It has a common **World** section and a section for each country.

## Run it

No build step. Open `index.html` in a browser, or serve the folder:

    python3 -m http.server 8000

then visit http://localhost:8000.

## Structure

    index.html      page markup
    css/style.css   styles
    js/data.js      shared DATA registry
    data/world.js   built-in global features
    data/india.js   built-in India features
    js/app.js       map drawing, add-data form, country picker

## Data format

Coordinates are `[longitude, latitude]`.

- River: `[name, parentRiverNameOrNull, [[lon,lat], ...], note]`
- Point: `[kind, name, lon, lat, note]` where kind is `peak`, `pass`, `valley`, `coast` or `park`

To give a country built-in data, create `data/<country>.js` and assign its object to `DATA.CountryName` (see `data/india.js`). Add a script tag for that file in `index.html` before `js/app.js`, and make sure the country is listed in `COUNTRIES` in `js/app.js`. Countries without a data file open as blank maps until then.

## Roadmap

- Add one data file per country under `data/`
- Replace the schematic outline with real map tiles and boundaries (MapLibre GL JS)
- Load rivers from HydroRIVERS, peaks and passes from OpenStreetMap, parks from Protected Planet
- Terrain and hillshade view for valleys and passes
- Import and export of user-added data

## Deploy with GitHub Pages

Push to GitHub, then Settings > Pages > deploy from branch `main`, folder `/ (root)`.

Positions are approximate. Check facts before relying on them.

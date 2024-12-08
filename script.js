// Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoiY2FwcmlzdW5qYSIsImEiOiJjbTQwYWZjNGIyN2VnMmpzOXV3aGV4NjQ4In0.go8XJeTWAFPTrT9rWGLpIg";

// Initialize the map
const map = new mapboxgl.Map({
  container: "map",
  style: 'mapbox://styles/caprisunja/cm40bckd500so01sigr2p8bv7', // Custom Map Style
  center: [79.8573018, 6.9289617], // Default center position
  zoom: 0.75, // Default zoom level
});

map.addControl(new mapboxgl.NavigationControl()); // Add navigation controls

let popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false,
});
const countriesWithRecipes = ["netherlands"]; // List of countries with recipes

// Load and render GeoJSON data for countries
map.on("load", function () {
  map.addSource("cbs", {
    type: "geojson",
    data: "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson",
  });

  map.addLayer({
    id: "cf",
    type: "fill",
    source: "cbs",
    layout: {},
    paint: {
      "fill-opacity": 0,
      "fill-color": "#ff8190",
    },
  });

  map.addLayer({
    id: "cb",
    type: "line",
    source: "cbs",
    layout: {},
    paint: {
      "line-color": "#ffffff",
      "line-width": 1,
    },
  });

  map.addLayer({
    id: "cfh",
    type: "fill",
    source: "cbs",
    layout: {},
    paint: {
      "fill-color": "#a31621",
      "fill-opacity": 0.8,
    },
    filter: ["==", "name", ""],
  });

  map.addLayer({
    id: "countries-no-recipes",
    type: "fill",
    source: "cbs", // Use the correct source ID
    layout: {},
    paint: {
      "fill-color": "#B0B0B0", // Grayed-out color for countries without recipes
      "fill-opacity": 1.0,
    },
    filter: ["!in", "name", ...countriesWithRecipes], // Exclude countries with recipes
  });
});

// Event listener for mousemove to show country name and apply filter logic
map.on("mousemove", function (e) {
  const features = map.queryRenderedFeatures(e.point, {
    layers: ["cf"], // Specify the layer ID you're interested in
  });

  console.log(features);

  if (features.length) {
    const countryName = features[0].properties.name;
    map.getCanvas().style.cursor = "pointer";

    // Check if country is in the countriesWithRecipes list
    if (countriesWithRecipes.includes(countryName.toLowerCase())) {
      // If the country is in the list, show country with recipes in normal color
      map.setFilter("cfh", ["==", "name", countryName]);
    } else {
      // If the country is NOT in the list, make it gray
      map.setFilter("cfh", ["==", "name", ""]);
      map.setFilter("countries-no-recipes", ["==", "name", countryName]); // Apply gray color
    }

    const text = `${countryName}`;
    popup.setLngLat(e.lngLat).setText(text).addTo(map);
  } else {
    popup.remove();
    map.setFilter("cfh", ["==", "name", ""]);
    map.setFilter("countries-no-recipes", ["==", "name", ""]);
    map.getCanvas().style.cursor = "";
  }
});

// Event listener for map click to open country page
map.on("click", function (e) {
  const features = map.queryRenderedFeatures(e.point, {
    layers: ["cf"], // Replace "cf" with the actual layer ID if different
  });

  if (features.length > 0) {
    const countryName = features[0].properties.name; // Access the 'name' property
    console.log(countryName);
    openCountryPage(countryName);
  } else {
    console.log("No features found at this location.");
  }
});

// Function to open country page dynamically based on clicked country
function openCountryPage(countryName) {
  // Convert the country name to lowercase and replace spaces with dashes
  const formattedName = countryName.toLowerCase().replace(/\s+/g, "-");

  // List of countries with recipe pages
  const countriesWithPages = ["netherlands", "mexico"];

  // Check if the formatted name exists in the list of countries with recipe pages
  if (countriesWithPages.includes(formattedName)) {
    // If the country is in the list, go to its page
    window.location.href = `${formattedName}.html`;
  } else {
    // If the country is not in the list, show the "Not Added Yet" page
    window.location.href = "not-added-yet.html";
  }
}

// Function to pause globe rotation (not implemented in this code, but placeholder)
const secondsPerRevolution = 120;
const maxSpinZoom = 5;
const slowSpinZoom = 3;
let userInteracting = false;
let spinEnabled = true;

function spinGlobe() {
  const zoom = map.getZoom();
  if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
    let distancePerSecond = 360 / secondsPerRevolution;
    if (zoom > slowSpinZoom) {
      const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
      distancePerSecond *= zoomDif;
    }
    const center = map.getCenter();
    center.lng -= distancePerSecond;
    map.easeTo({ center, duration: 1000, easing: (n) => n });
  }
}

map.on('mousedown', () => { userInteracting = true; });
map.on('mouseup', () => { userInteracting = false; spinGlobe(); });
map.on('dragend', () => { userInteracting = false; spinGlobe(); });
map.on('pitchend', () => { userInteracting = false; spinGlobe(); });
map.on('rotateend', () => { userInteracting = false; spinGlobe(); });
map.on('moveend', () => { spinGlobe(); });

document.getElementById('btn-spin').addEventListener('click', (e) => {
  spinEnabled = !spinEnabled;
  if (spinEnabled) {
    spinGlobe();
    e.target.innerHTML = 'Pause rotation';
  } else {
    map.stop(); // Immediately end ongoing animation
    e.target.innerHTML = 'Start rotation';
  }
});

spinGlobe();

const originalCenter = [79.8573018, 6.9289617];
document.getElementById('recenter-btn').addEventListener('click', function () {
  map.setCenter(originalCenter);
  map.setZoom(1); // Adjust the zoom level if needed
});

// Sample list of countries with their coordinates (longitude, latitude)
const countriesList = [
  { name: "Brazil", coordinates: [-51.9253, -14.2350] },
  { name: "Canada", coordinates: [-106.3468, 56.1304] },
  { name: "China", coordinates: [104.1954, 35.8617] },
  { name: "India", coordinates: [78.9629, 20.5937] },
  { name: "United States", coordinates: [-98.5795, 39.8283] },
  { name: "Australia", coordinates: [133.7751, -25.2744] },
  { name: "Mexico", coordinates: [-102.5528, 23.6345] },
  { name: "France", coordinates: [2.2137, 46.6034] },
  // Add more countries as needed
];

// Function to choose a random country and recenter the map
document.getElementById('random-country-btn').addEventListener('click', function() {
  const randomCountry = countriesList[Math.floor(Math.random() * countriesList.length)];
  
  // Center the map on the chosen country's coordinates
  map.setCenter(randomCountry.coordinates);
  
  // Optionally, set a zoom level for a better view
  map.setZoom(4);
});

// Constants
const START_BUTTON = document.getElementById("startBtn");
const STOP_BUTTON = document.getElementById("stopBtn");
const OUTPUT_ELEMENT = document.getElementById("output");

// Global variables
let watchID;
let positions = [];
let startTime;

// Event listeners
START_BUTTON.addEventListener("click", startTracking);
STOP_BUTTON.addEventListener("click", stopTracking);

/**
 * Starts GPS tracking.
 */
function startTracking() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by this browser.");
        return;
    }

    // Reset positions and start time
    positions = [];
    startTime = new Date();

    // Start watching position
    watchID = navigator.geolocation.watchPosition(
        (position) => {
            // Store each position
            positions.push({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                time: new Date(),
            });

            // Update stats if more than one position is recorded
            if (positions.length > 1) {
                updateStats();
            }
        },
        (error) => alert("Error getting location: " + error.message),
        {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 5000,
        }
    );

    // Display tracking started message
    OUTPUT_ELEMENT.innerHTML = "Tracking started...";
    OUTPUT_ELEMENT.classList.add("pulse");
}

/**
 * Stops GPS tracking and displays final stats.
 */
function stopTracking() {
    if (watchID) {
        navigator.geolocation.clearWatch(watchID);
    }

    // Remove pulse effect
    OUTPUT_ELEMENT.classList.remove("pulse");

    // Check if enough data was collected
    if (positions.length < 2) {
        OUTPUT_ELEMENT.innerHTML = "Not enough data collected.";
        return;
    }

    // Calculate final stats
    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000 / 60; // Convert to minutes
    const totalDistance = calculateTotalDistance();
    const avgSpeed = totalDistance / (timeTaken / 60); // km/h

    // Display final stats
    OUTPUT_ELEMENT.innerHTML = `Total Distance: ${totalDistance.toFixed(2)} km
                                Time Taken: ${timeTaken.toFixed(2)} mins
                                Average Speed: ${avgSpeed.toFixed(2)} km/h`;
}

/**
 * Updates tracking stats in real-time.
 */
function updateStats() {
    const totalDistance = calculateTotalDistance();
    const timeTaken = (new Date() - startTime) / 1000 / 60;
    const avgSpeed = totalDistance / (timeTaken / 60);

    OUTPUT_ELEMENT.innerHTML = `Tracking...
                                Distance: ${totalDistance.toFixed(2)} km
                                Time: ${timeTaken.toFixed(2)} mins
                                Speed: ${avgSpeed.toFixed(2)} km/h`;
}

/**
 * Calculates the total distance traveled.
 * @returns {number} Total distance in kilometers.
 */
function calculateTotalDistance() {
    let totalDistance = 0;
    for (let i = 1; i < positions.length; i++) {
        totalDistance += haversine(
            positions[i - 1].lat,
            positions[i - 1].lon,
            positions[i].lat,
            positions[i].lon
        );
    }
    return totalDistance;
}

/**
 * Calculates the distance between two points using the Haversine formula.
 * @param {number} lat1 Latitude of the first point.
 * @param {number} lon1 Longitude of the first point.
 * @param {number} lat2 Latitude of the second point.
 * @param {number} lon2 Longitude of the second point.
 * @returns {number} Distance between the two points in kilometers.
 */
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
}

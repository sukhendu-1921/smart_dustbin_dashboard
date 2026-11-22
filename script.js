// Smart Dustbin Dashboard - beginner-friendly JavaScript

// 1. Sample dustbin data
let bins = [
  {id:"BIN-01",location:"Park Street",lat:22.5523,lng:88.3512,fill:92,waste:"Organic",zone:"Central",lastPickup:"Today, 07:40",battery:78,temp:31},
  {id:"BIN-02",location:"Salt Lake Sector V",lat:22.5732,lng:88.4315,fill:64,waste:"Plastic",zone:"East",lastPickup:"Today, 08:15",battery:86,temp:30},
  {id:"BIN-03",location:"Howrah Station Road",lat:22.5850,lng:88.3426,fill:84,waste:"Paper",zone:"West",lastPickup:"Yesterday, 18:20",battery:62,temp:32},
  {id:"BIN-04",location:"Ballygunge Place",lat:22.5240,lng:88.3651,fill:47,waste:"Organic",zone:"South",lastPickup:"Today, 09:05",battery:91,temp:29},
  {id:"BIN-05",location:"Jadavpur University Area",lat:22.4986,lng:88.3716,fill:28,waste:"Paper",zone:"South",lastPickup:"Today, 06:50",battery:74,temp:30},
  {id:"BIN-06",location:"New Town Action Area I",lat:22.5809,lng:88.4690,fill:76,waste:"E-waste",zone:"East",lastPickup:"Yesterday, 20:10",battery:68,temp:31},
  {id:"BIN-07",location:"Gariahat Market",lat:22.5151,lng:88.3658,fill:88,waste:"Organic",zone:"South",lastPickup:"Yesterday, 16:40",battery:55,temp:33},
  {id:"BIN-08",location:"Shyambazar Five-Point",lat:22.6021,lng:88.3754,fill:38,waste:"Glass",zone:"North",lastPickup:"Today, 08:55",battery:83,temp:29},
  {id:"BIN-09",location:"College Street",lat:22.5758,lng:88.3630,fill:71,waste:"Paper",zone:"Central",lastPickup:"Today, 07:10",battery:79,temp:30},
  {id:"BIN-10",location:"Dum Dum Cantonment",lat:22.6395,lng:88.4238,fill:19,waste:"Plastic",zone:"North",lastPickup:"Today, 09:30",battery:95,temp:28},
  {id:"BIN-11",location:"Alipore Zoo Road",lat:22.5357,lng:88.3335,fill:81,waste:"Glass",zone:"South",lastPickup:"Yesterday, 19:05",battery:61,temp:32},
  {id:"BIN-12",location:"Rajarhat Main Road",lat:22.6104,lng:88.4852,fill:54,waste:"E-waste",zone:"East",lastPickup:"Today, 06:20",battery:88,temp:30}
];

let alerts = [
  {id:"A-1",binId:"BIN-01",location:"Park Street",fill:92,time:"09:42",message:"Bin BIN-01 at Park Street is 92% full. Dispatch cleaning team.",ack:false,channel:"SMS + WhatsApp"},
  {id:"A-2",binId:"BIN-07",location:"Gariahat Market",fill:88,time:"08:57",message:"Bin BIN-07 at Gariahat Market is 88% full. Dispatch cleaning team.",ack:false,channel:"SMS"}
];

const wasteTypes = ["Organic", "Plastic", "Paper", "Glass", "E-waste"];
const wasteColors = ["#16a34a", "#f59e0b", "#0ea5e9", "#8b5cf6", "#ef4444"];
let simulationRunning = true;
let sortDescending = true;
let collectionsToday = 18;
let toastTimer;
let cityCenter = { lat: 22.5523, lng: 88.3512 };

// 2. Small helper functions
function getStatus(fill) {
  if (fill > 80) return "Full";
  if (fill >= 50) return "Half-Full";
  return "Empty";
}

function getFillColor(fill) {
  if (fill > 80) return "#dc2626";
  if (fill >= 50) return "#f59e0b";
  return "#16a34a";
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent =
    now.toLocaleTimeString("en-IN");
  document.getElementById("date").textContent =
    now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// Change the sample dashboard data when a different city is selected.
const cityData = {
  "Kolkata": {
    center: [22.5523, 88.3512], municipality: "Kolkata Municipal Corporation", teams: 4,
    places: ["Park Street", "Salt Lake Sector V", "Howrah Station Road", "Ballygunge Place", "Jadavpur University Area", "New Town Action Area I", "Gariahat Market", "Shyambazar Five-Point", "College Street", "Dum Dum Cantonment", "Alipore Zoo Road", "Rajarhat Main Road"],
    fills: [92,64,84,47,28,76,88,38,71,19,81,54]
  },
  "Howrah": {
    center: [22.5958, 88.2636], municipality: "Howrah Municipal Corporation", teams: 3,
    places: ["Howrah Maidan", "Shibpur Botanical Garden", "Santragachi Station", "Bally Khal", "Avani Riverside", "Kadamtala Market", "Liluah Station", "Belur Math Road", "Salkia Chowrasta", "Andul Road", "Domjur Market", "Uluberia Station"],
    fills: [86,58,91,43,32,72,88,39,67,24,82,51]
  },
  "Salt Lake": {
    center: [22.5867, 88.4170], municipality: "Bidhannagar Municipal Corporation", teams: 3,
    places: ["Sector I Central Park", "Sector II Tank No. 4", "Sector III BD Market", "Sector IV Karunamoyee", "Sector V College More", "CA Block Community Park", "BJ Block Market", "CK Block Playground", "FD Block Market", "Nicco Park Gate", "City Centre Salt Lake", "Karunamoyee Bus Stand"],
    fills: [73,48,89,61,94,35,56,82,42,68,27,77]
  },
  "New Town": {
    center: [22.5809, 88.4690], municipality: "New Town Kolkata Development Authority", teams: 2,
    places: ["Action Area I Eco Park Gate", "Biswa Bangla Gate", "Eco Park Road", "DLF IT Park", "Tata Medical Centre Road", "Action Area II Market", "Rabindra Tirtha", "Swapno Bhor", "Axis Mall", "Akankha More", "City Centre New Town", "Action Area III Park"],
    fills: [81,52,69,93,44,75,31,86,57,23,72,48]
  }
};

function changeCity(city) {
  const data = cityData[city];
  if (!data) return;

  const [baseLat, baseLng] = data.center;
  cityCenter = { lat: baseLat, lng: baseLng };
  bins = bins.map((bin, index) => ({
    ...bin,
    location: data.places[index],
    lat: Number((baseLat + ((index % 4) - 1.5) * 0.009 + Math.floor(index / 4) * 0.002).toFixed(4)),
    lng: Number((baseLng + ((index % 3) - 1) * 0.012 + Math.floor(index / 3) * 0.001).toFixed(4)),
    fill: data.fills[index],
    lastPickup: index % 2 === 0 ? "Today, 08:30" : "Yesterday, 18:20"
  }));

  alerts = bins.filter(bin => bin.fill > 80).map((bin, index) => ({
    id: `A-${index + 1}`, binId: bin.id, location: bin.location, fill: bin.fill,
    time: index === 0 ? "09:42" : "08:57",
    message: `Bin ${bin.id} at ${bin.location} is ${bin.fill}% full. Dispatch cleaning team.`,
    ack: false, channel: "SMS + WhatsApp"
  }));

  document.querySelector(".city-card h3").textContent = `${city} — ${data.places[0]}`;
  document.querySelector(".city-card p:nth-of-type(1)").textContent =
    `${cityCenter.lat.toFixed(4)}, ${cityCenter.lng.toFixed(4)} · ${data.teams} teams on shift`;
  document.querySelector(".city-card .city-name").textContent = data.municipality;
  collectionsToday = 18;
  refreshDashboard();
  showToast(`Dashboard data changed to ${city}.`);
}

document.getElementById("city-select").addEventListener("change", event => {
  changeCity(event.target.value);
});

// 3. Change between dashboard pages
function openPage(pageName) {
  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.remove("active");
  });
  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle("active", button.dataset.page === pageName);
  });

  document.getElementById("page-" + pageName).classList.add("active");
  document.getElementById("page-title").textContent =
    pageName === "Overview" ? "Smart Dustbin Dashboard" : pageName;
}

document.querySelectorAll(".nav-link").forEach(button => {
  button.addEventListener("click", () => openPage(button.dataset.page));
});
document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => openPage(button.dataset.go));
});

// 4. Update the summary cards
function updateSummary() {
  const full = bins.filter(bin => bin.fill > 80).length;
  const half = bins.filter(bin => bin.fill >= 50 && bin.fill <= 80).length;
  const empty = bins.filter(bin => bin.fill < 50).length;
  const average = bins.reduce((sum, bin) => sum + bin.fill, 0) / bins.length;
  const overdue = alerts.filter(alert => !alert.ack).length;

  document.getElementById("network-total").textContent = bins.length;
  document.getElementById("stat-total").textContent = bins.length;
  document.getElementById("stat-full").textContent = full;
  document.getElementById("stat-half").textContent = half;
  document.getElementById("stat-empty").textContent = empty;
  document.getElementById("stat-average").textContent = Math.round(average) + "%";
  document.getElementById("stat-pickups").textContent = collectionsToday;
  document.getElementById("stat-overdue").textContent = overdue;
  document.getElementById("alert-count").textContent = overdue;
}

// 5. Show fill levels on the overview page
function renderOverviewBins() {
  const container = document.getElementById("overview-bins");
  const highestBins = [...bins].sort((a, b) => b.fill - a.fill).slice(0, 6);

  container.innerHTML = highestBins.map(bin => `
    <div class="fill-row">
      <div><span class="fill-name">${bin.id}</span><span class="fill-location">${bin.location}</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${bin.fill}%;background:${getFillColor(bin.fill)}"></div></div>
      <div class="fill-value">${bin.fill}%</div>
    </div>
  `).join("");
}

// 6. Show alerts and acknowledge them
function renderAlerts() {
  const activeAlerts = alerts.filter(alert => !alert.ack);
  const makeAlert = alert => `
    <div class="alert-item">
      <div class="alert-symbol">!</div>
      <div>
        <strong>${alert.binId} · ${alert.location}</strong>
        <p>${alert.message}</p>
        <small>${alert.time} · ${alert.channel}</small>
      </div>
      ${alert.ack ? "<span>Done</span>" : `<button data-ack="${alert.id}">Acknowledge</button>`}
    </div>
  `;

  document.getElementById("overview-alerts").innerHTML =
    activeAlerts.length ? activeAlerts.slice(0, 3).map(makeAlert).join("") :
    '<p class="empty-state">No active alerts. All clear!</p>';
  document.getElementById("all-alerts").innerHTML =
    alerts.length ? alerts.map(makeAlert).join("") :
    '<p class="empty-state">No alerts available.</p>';

  document.querySelectorAll("[data-ack]").forEach(button => {
    button.addEventListener("click", () => {
      const alert = alerts.find(item => item.id === button.dataset.ack);
      if (alert) alert.ack = true;
      renderAlerts();
      updateSummary();
      showToast("Alert acknowledged.");
    });
  });
}

// 7. Search, filter and sort bins
function renderBinsTable() {
  const search = document.getElementById("search-input").value.toLowerCase();
  const zone = document.getElementById("zone-filter").value;
  const waste = document.getElementById("waste-filter").value;
  const status = document.getElementById("status-filter").value;
  const sortBy = document.getElementById("sort-filter").value;

  let filteredBins = bins.filter(bin => {
    const matchesSearch = bin.id.toLowerCase().includes(search) ||
      bin.location.toLowerCase().includes(search);
    const matchesZone = zone === "All zones" || bin.zone === zone;
    const matchesWaste = waste === "All waste" || bin.waste === waste;
    const matchesStatus = status === "All status" || getStatus(bin.fill) === status;
    return matchesSearch && matchesZone && matchesWaste && matchesStatus;
  });

  filteredBins.sort((a, b) => {
    let result = sortBy === "location" ? a.location.localeCompare(b.location) :
      sortBy === "lastPickup" ? a.lastPickup.localeCompare(b.lastPickup) : a.fill - b.fill;
    return sortDescending ? -result : result;
  });

  document.getElementById("bins-table").innerHTML = filteredBins.map(bin => {
    const statusClass = bin.fill > 80 ? "status-full" : bin.fill >= 50 ? "status-half" : "status-empty";
    return `
      <tr>
        <td><strong>${bin.id}</strong><span class="subtext">${bin.waste} · ${bin.zone}</span></td>
        <td><strong>${bin.location}</strong><span class="subtext">Battery ${bin.battery}% · ${bin.temp}°C</span></td>
        <td>${bin.lat.toFixed(4)}, ${bin.lng.toFixed(4)}</td>
        <td><strong>${bin.fill}%</strong><div class="mini-bar"><span style="width:${bin.fill}%;background:${getFillColor(bin.fill)}"></span></div></td>
        <td><span class="status-pill ${statusClass}">${getStatus(bin.fill)}</span></td>
        <td>${bin.lastPickup}</td>
        <td><button class="row-action" data-pickup="${bin.id}">Mark picked up</button></td>
      </tr>
    `;
  }).join("");

  document.getElementById("table-count").textContent =
    `Showing ${filteredBins.length} of ${bins.length} bins`;

  document.querySelectorAll("[data-pickup]").forEach(button => {
    button.addEventListener("click", () => {
      const bin = bins.find(item => item.id === button.dataset.pickup);
      if (bin) {
        bin.fill = 4;
        bin.lastPickup = "Just now";
        bin.battery = Math.max(20, bin.battery - 1);
        collectionsToday++;
        alerts.forEach(alert => {
          if (alert.binId === bin.id) alert.ack = true;
        });
        refreshDashboard();
        showToast(`${bin.id} marked as picked up.`);
      }
    });
  });
}

// 8. Add a new dustbin
function showAddForm() {
  document.getElementById("add-panel").classList.remove("hidden");
  document.getElementById("add-panel").scrollIntoView({behavior:"smooth", block:"center"});
}
document.getElementById("show-add-form").addEventListener("click", showAddForm);
document.querySelector("[data-open-add]").addEventListener("click", () => {
  openPage("Bins");
  showAddForm();
});
document.getElementById("close-add-form").addEventListener("click", () => {
  document.getElementById("add-panel").classList.add("hidden");
});

document.getElementById("add-bin-form").addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.target);
  const id = form.get("id").trim().toUpperCase();
  const lat = Number(form.get("lat"));
  const lng = Number(form.get("lng"));

  if (bins.some(bin => bin.id === id)) {
    showToast("This Bin ID already exists. Use a new ID.");
    return;
  }
  if (lat < 20 || lat > 25 || lng < 86 || lng > 91) {
    showToast("Enter valid Kolkata-area coordinates (latitude 20–25, longitude 86–91).");
    return;
  }

  bins.push({
    id, location:form.get("location"), lat, lng, fill:12,
    waste:form.get("waste"), zone:form.get("zone"),
    lastPickup:"Just added", battery:96, temp:30
  });
  event.target.reset();
  document.getElementById("add-panel").classList.add("hidden");
  refreshDashboard();
  showToast(`${id} added successfully.`);
});

// 9. Optimize a simple collection route using nearest locations
function distanceKm(pointA, pointB) {
  const toRadians = degree => degree * Math.PI / 180;
  const dLat = toRadians(pointB.lat - pointA.lat);
  const dLng = toRadians(pointB.lng - pointA.lng);
  const lat1 = toRadians(pointA.lat);
  const lat2 = toRadians(pointB.lat);
  const value = Math.sin(dLat/2)**2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng/2)**2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1-value));
}

function optimizeRoute() {
  let remaining = bins.filter(bin => bin.fill > 80);
  if (!remaining.length) {
    document.getElementById("route-list").innerHTML =
      '<li class="empty-state">No full bins need collection right now.</li>';
    showToast("All bins are below the full level.");
    return;
  }

  const start = cityCenter;
  let current = start;
  const route = [];
  let totalDistance = 0;

  while (remaining.length) {
    remaining.sort((a, b) => distanceKm(current, a) - distanceKm(current, b));
    const next = remaining.shift();
    totalDistance += distanceKm(current, next);
    route.push(next);
    current = next;
  }
  totalDistance += distanceKm(current, start);

  document.getElementById("route-stops").textContent = route.length;
  document.getElementById("route-distance").textContent = totalDistance.toFixed(1) + " km";
  document.getElementById("route-time").textContent = Math.round(totalDistance * 2.6 + route.length * 8) + " min";
  document.getElementById("route-summary").querySelector("h2").textContent = "Route optimized";
  document.getElementById("route-summary").querySelector("p").textContent = "Suggested order for collecting full bins.";
  document.getElementById("route-list").innerHTML = route.map((bin, index) => `
    <li><span class="stop-number">${index + 1}</span><strong>${bin.id} — ${bin.location}</strong>
      <small>${bin.fill}% full · ${bin.lat.toFixed(4)}, ${bin.lng.toFixed(4)} · ${bin.waste}</small>
    </li>
  `).join("");
  showToast(`Route optimized for ${route.length} full bins.`);
}

document.getElementById("optimize-route").addEventListener("click", optimizeRoute);
document.getElementById("route-from-bins").addEventListener("click", () => {
  openPage("Routes");
  optimizeRoute();
});

// 10. Draw simple analytics charts
function renderAnalytics() {
  const counts = wasteTypes.map(type => bins.filter(bin => bin.waste === type).length);
  const total = bins.length || 1;
  let current = 0;
  const segments = counts.map((count, index) => {
    const start = current;
    current += count / total * 100;
    return `${wasteColors[index]} ${start}% ${current}%`;
  });
  document.getElementById("waste-donut").style.background =
    `conic-gradient(${segments.join(",")})`;
  document.getElementById("waste-total").textContent = bins.length;
  document.getElementById("waste-legend").innerHTML = wasteTypes.map((type, index) => `
    <div class="legend-item"><span class="legend-dot" style="background:${wasteColors[index]}"></span>${type}: ${counts[index]}</div>
  `).join("");

  const collections = [12, 16, 14, 19, 17, 21, collectionsToday];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];
  document.getElementById("collection-chart").innerHTML = collections.map((value, index) => `
    <div class="bar-column"><span style="height:${value / 24 * 100}%"></span><small>${days[index]}</small></div>
  `).join("");

  const trend = [35, 42, 39, 55, 48, 62, Math.round(bins.reduce((sum, bin) => sum + bin.fill, 0) / total)];
  document.getElementById("trend-chart").innerHTML = trend.map((value, index) => `
    <div class="trend-point"><i style="height:${value * 2.2}px"></i><small>${["9 AM","10 AM","11 AM","12 PM","1 PM","2 PM","Now"][index]}</small></div>
  `).join("");
}

// 11. Export current bin data as a CSV file
document.getElementById("download-report").addEventListener("click", () => {
  const headings = ["Bin ID","Location","Latitude","Longitude","Fill %","Waste type","Zone","Status","Last pickup"];
  const rows = bins.map(bin => [bin.id,bin.location,bin.lat,bin.lng,bin.fill,bin.waste,bin.zone,getStatus(bin.fill),bin.lastPickup]);
  const csv = [headings, ...rows].map(row =>
    row.map(value => `"${String(value).replaceAll('"','""')}"`).join(",")
  ).join("\n");
  const file = new Blob([csv], {type:"text/csv"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = "smart-dustbin-report.csv";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("CSV report downloaded.");
});

// 12. Demo simulation: update a bin reading every four seconds
function runSimulation() {
  if (!simulationRunning) return;
  const bin = bins[Math.floor(Math.random() * bins.length)];
  if (bin.fill < 96) {
    bin.fill = Math.min(99, bin.fill + Math.floor(Math.random() * 3) + 1);
    if (bin.fill > 80 && !alerts.some(alert => alert.binId === bin.id && !alert.ack)) {
      alerts.unshift({
        id:"A-" + Date.now(), binId:bin.id, location:bin.location,
        fill:bin.fill, time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}),
        message:`Bin ${bin.id} at ${bin.location} is ${bin.fill}% full. Dispatch cleaning team.`,
        ack:false, channel:"Simulation"
      });
    }
    refreshDashboard();
  }
}

document.getElementById("simulate-alert").addEventListener("click", () => {
  const bin = bins.find(item => item.fill <= 80);
  if (!bin) {
    showToast("All bins are already full.");
    return;
  }
  bin.fill = 92;
  alerts.unshift({
    id:"A-" + Date.now(), binId:bin.id, location:bin.location, fill:92,
    time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}),
    message:`Bin ${bin.id} at ${bin.location} is 92% full. Dispatch cleaning team.`,
    ack:false, channel:"SMS + WhatsApp"
  });
  refreshDashboard();
  showToast(`Simulated alert for ${bin.id}.`);
});

// 13. Refresh all dashboard information
function refreshDashboard() {
  updateSummary();
  renderOverviewBins();
  renderAlerts();
  renderBinsTable();
  renderAnalytics();
}

document.getElementById("search-input").addEventListener("input", renderBinsTable);
["zone-filter","waste-filter","status-filter","sort-filter"].forEach(id => {
  document.getElementById(id).addEventListener("change", renderBinsTable);
});
document.getElementById("sort-direction").addEventListener("click", event => {
  sortDescending = !sortDescending;
  event.target.textContent = sortDescending ? "↕ Descending" : "↕ Ascending";
  renderBinsTable();
});
document.getElementById("simulation-label").addEventListener("click", () => {
  simulationRunning = !simulationRunning;
  document.getElementById("simulation-label").textContent =
    simulationRunning ? "Simulation running" : "Simulation paused";
  showToast(simulationRunning ? "Simulation resumed." : "Simulation paused.");
});

// Start the dashboard
refreshDashboard();
updateClock();
setInterval(updateClock, 1000);
setInterval(runSimulation, 4000);

let bannersData = [];
let unitsData = [];
let userUnits = [];

const csvUrlUnits = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8d4uolEOro3DVb2_I--8AU3SMpji6Ox0udMrSnh3tJ2Q1LILcgTO98UBHsrC5ElONOhnpHDloXvZz/pub?gid=667587167&single=true&output=csv";
const csvUrlBanners = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8d4uolEOro3DVb2_I--8AU3SMpji6Ox0udMrSnh3tJ2Q1LILcgTO98UBHsrC5ElONOhnpHDloXvZz/pub?gid=1312119616&single=true&output=csv";

const STATUS_UNOBTAINED = 0;
const STATUS_OBTAINED = 1;
const STATUS_WISHLIST = 2;

document.addEventListener('DOMContentLoaded', function() {
	loadBannersData();
	loadUserData();
	setupEventListeners();
	updateWishlistDisplay();
});

//Initializes all data from the cache (if any is present)
function loadUserData() {
	const savedData = localStorage.getItem('battleCatsTrackerData');
	
	if (savedData) {
		userUnits = JSON.parse(savedData);
	}
}

function saveUserData() {
	localStorage.setItem('battleCatsTrackerData', JSON.stringify(userUnits));
	updateStatusCounters();
}

function loadBannersData() {
	//fetch the banners data from the csv and put it in an array
	fetch(csvUrlBanners).then(response => response.text()).then(data => {
		const csvBannersData = data;
		bannersData = csvBannersData.split('\n').map(line => {const [id, name, image] = line.split(',');
			return {
				id: parseInt(id),
				name: name,
				image: image
			};
		});
		renderBanners();
		updateWishlistDisplay();
		updateStatusCounters();
	})
	.then(
	//same as above with but with units
	fetch(csvUrlUnits).then(response => response.text()).then(data => {
		const csvUnitsData = data;
		unitsData = csvUnitsData.split('\n').map(line => {const [id, name, rarity, bIds, image] = line.split(',');
			return {
				id: parseInt(id),
				name: name,
				rarity: rarity,
				bIds: bIds.replace('.', ','),
				image: image
			};
		});
		renderBanners();
		updateWishlistDisplay();
		updateStatusCounters();
	})
	)
}

function setupEventListeners() {
	document.getElementById('bannersGrid').addEventListener('click', function(e) {
		const bannerElement = e.target.closest('.banner');
		
		if (bannerElement) {
			const bannerId = parseInt(bannerElement.dataset.bannerId);
			toggleBannerUnits(bannerId);
		}
	});

	document.addEventListener('click', function(e) {
		const unitElement = e.target.closest('.unit-image');
		
		if (unitElement) {
			const unitId = parseInt(unitElement.dataset.unitId);
			cycleUnitStatus(unitId);
		}
	});

	document.getElementById('expandAllBtn').addEventListener('click', function() {
		bannersData.forEach(banner => {const unitsContainer = document.getElementById(`units-${banner.id}`); unitsContainer.style.display = 'flex';});
	});

	document.getElementById('collapseAllBtn').addEventListener('click', function() {
		bannersData.forEach(banner => {const unitsContainer = document.getElementById(`units-${banner.id}`); unitsContainer.style.display = 'none';});
	});

	document.getElementById('resetDataBtn').addEventListener('click', function() {
		if (confirm('Are you sure you want to reset all your data? This cannot be undone.')) {
			userUnits = [];
			saveUserData();
			renderBanners();
			updateWishlistDisplay();
		}
	});
	
	document.getElementById('searchBanners').addEventListener('input', function(e) {filterBanners(e.target.value);});
	
	document.getElementById('searchUnits').addEventListener('input', function(e) {filterBannersByUnit(e.target.value);});
}

function renderBanners() {
	const bannersGrid = document.getElementById('bannersGrid');
	bannersGrid.innerHTML = '';

	//Duplicates this piece of html for each banner in the list
	bannersData.forEach(banner => {const bannerItem = document.createElement('div'); bannerItem.className = 'banner-item';

	bannerItem.innerHTML = `
	<div class="banner" data-banner-id="${banner.id}">
		<img src="${banner.image}" alt="${banner.name}" class="banner-image">
		<h3 class="banner-title">${banner.name}</h3>
	</div>
	<div class="units-container" id="units-${banner.id}">
		${renderBannerUnits(banner.id)}
	</div>
	`;

	bannersGrid.appendChild(bannerItem);
	});
}

//Called by the renderBanners() function, does the same as that function, but with units
function renderBannerUnits(bannerId) {
	let unitsHTML = '';

	//Filter units that belong to this banner
	//Had to be Updated to fix a bug where units in some banners would appear in other banners they didn't belong
	const bannerUnits = unitsData.filter(unit => {const bannerIds = unit.bIds.split(',').map(id => parseInt(id)); return bannerIds.includes(bannerId);});

	bannerUnits.forEach(unit => {const status = userUnits[unit.id] || STATUS_UNOBTAINED; const statusClass = getStatusClass(status);

	unitsHTML += `
	<div class="unit ${statusClass}" data-unit-id="${unit.id}">
		${unit.rarity === 'L' ? '<span class="unit-rarity">Legendary</span>' : unit.rarity === 'S' ? '<span class="unit-rarity">Super</span>' : '<span class="unit-rarity">Uber</span>'}
		<img src="${unit.image}" alt="${unit.name}" class="unit-image" data-unit-id="${unit.id}">
		<span class="unit-name">${unit.name}</span>
	</div>
	`;
	});

	return unitsHTML;
}

//Toggles if units are displayed in a banner
function toggleBannerUnits(bannerId) {
	const unitsContainer = document.getElementById(`units-${bannerId}`);
	
	if (unitsContainer.style.display === 'flex') {
		unitsContainer.style.display = 'none';
	} else {
		unitsContainer.style.display = 'flex';
	}
}

function cycleUnitStatus(unitId) {
	const currentStatus = userUnits[unitId] || STATUS_UNOBTAINED;
	const newStatus = (currentStatus + 1) % 3;

	userUnits[unitId] = newStatus;
	saveUserData();

	updateUnitDisplay(unitId);
	updateWishlistDisplay();
}

//Updates the visual display of a unit
function updateUnitDisplay(unitId) {
	const status = userUnits[unitId] || STATUS_UNOBTAINED;
	const statusClass = getStatusClass(status);
	const unitElements = document.querySelectorAll(`.unit[data-unit-id="${unitId}"]`);
	
	unitElements.forEach(unitElement => {unitElement.className = `unit ${statusClass}`;unitElement.dataset.unitId = unitId;});
}

function getStatusClass(status) {
	switch(status) {
		case STATUS_OBTAINED: return 'obtained';
		case STATUS_WISHLIST: return 'wishlist';
		default: return '';
	}
}

function updateWishlistDisplay() {
	const wishlistContainer = document.getElementById('wishlistContainer');
	const wishlistedUnits = Object.keys(userUnits)
	.filter(unitId => userUnits[unitId] === STATUS_WISHLIST)
	.map(unitId => parseInt(unitId));

	if (wishlistedUnits.length === 0) {
		wishlistContainer.innerHTML = '<div class="wishlist-empty">No units in your wishlist yet. Click on units to add them!</div>';
		return;
	}

let wishlistHTML = '';

wishlistedUnits.forEach(unitId => {const unit = unitsData.find(u => u.id === unitId);
	if (unit) {
		wishlistHTML += `
		<div class="wishlist-unit">
			<img src="${unit.image}" alt="${unit.name}" class="unit-image" data-unit-id="${unit.id}">
			<span class="unit-name">${unit.name}</span>
		</div>
		`;
	}
});

wishlistContainer.innerHTML = wishlistHTML;
}

function updateStatusCounters() {
	let unobtained = 0;
	let obtained = 0;
	let wishlist = 0;

	//Count statuses for all units in unitsData
	unitsData.forEach(unit => {const status = userUnits[unit.id] || STATUS_UNOBTAINED;
		switch(status) {
			case STATUS_UNOBTAINED: unobtained++; break;
			case STATUS_OBTAINED: obtained++; break;
			case STATUS_WISHLIST: wishlist++; break;
		}
	});

document.getElementById('unobtainedCount').textContent = unobtained;
document.getElementById('obtainedCount').textContent = obtained;
document.getElementById('wishlistCount').textContent = wishlist;
}

function filterBanners(searchTerm) {
	const banners = document.querySelectorAll('.banner-item');
	const term = searchTerm.toLowerCase();

	banners.forEach(banner => {const title = banner.querySelector('.banner-title').textContent.toLowerCase(); banner.style.display = title.includes(term) ? 'block' : 'none';});
}

function filterBannersByUnit(searchTerm) {
	const banners = document.querySelectorAll('.banner-item');
	const term = searchTerm.toLowerCase();

	if (!term) {
		banners.forEach(banner => banner.style.display = 'block');
		return;
	}

	banners.forEach(banner => {
		const bannerId = parseInt(banner.querySelector('.banner').dataset.bannerId);
		const bannerUnits = unitsData.filter(unit => {const bannerIds = unit.bIds.split(',').map(id => parseInt(id));return bannerIds.includes(bannerId);});
		const hasMatchingUnit = bannerUnits.some(unit => unit.name.toLowerCase().includes(term));

		banner.style.display = hasMatchingUnit ? 'block' : 'none';
	});
}
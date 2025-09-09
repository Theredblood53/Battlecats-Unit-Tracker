let bannersData = [];
let unitsData = [];
let userUnits = [];

const STATUS_UNOBTAINED = 0;
const STATUS_OBTAINED = 1;
const STATUS_WISHLIST = 2;

document.addEventListener('DOMContentLoaded', function() {
	loadUserData();
	loadBannersData();
	setupEventListeners();
	updateStatusCounters();
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
//Banners data
bannersData = [
	{ 
		id: 1, 
		name: "Nekoluga",
		image: "neko",
		units: [1,2,3,4,5,6,7,8,9,10,11,12]
	},
	{ 
		id: 2, 
		name: "The Dynamites",
		image: "dynamite",
		units: [13,14,15,16,17,18,19,20,21,22,23,24]
	},
	{ 
		id: 3, 
		name: "Sengoku Wargods Vajiras",
		image: "vajiras",
		units: [1,2,3,4,5,6,7,8,9,10,11,12]
	},
	{ 
		id: 4, 
		name: "Cyber Academy Galaxy Gals",
		image: "academy",
		units: [1,2,3,4,5,6,7,8,9,10,11,12]
	},
	{ 
		id: 5, 
		name: "Lords of Destruction Dragon Emperors",
		image: "emperor",
		units: [1,2,3,4,5,6,7,8,9,10,11,12]
	},
	{ 
		id: 6, 
		name: "Ancient Heroes Ultra Souls",
		image: "ultra",
		units: [1,2,3,4,5,6,7,8,9,10,11,12]
	}
];

//Units data
unitsData = [
	{ id: 1, name: "Nekoluga", rarity: "U",},
	{ id: 2, name: "Asiluga", rarity: "U",},
	{ id: 3, name: "Kubiluga", rarity: "U",},
	{ id: 4, name: "Tecoluga", rarity: "U",},
	{ id: 5, name: "Balaluga", rarity: "U",},
	{ id: 6, name: "Togeluga", rarity: "U",},
	{ id: 7, name: "Nobiluga", rarity: "U",},
	{ id: 8, name: "Papaluga", rarity: "U",},
	{ id: 9, name: "Furiluga", rarity: "U",},
	{ id: 10, name: "Kaoluga", rarity: "U",},
	{ id: 11, name: "Mamoluga", rarity: "U",},
	{ id: 12, name: "Legeluga", rarity: "L",},
	{ id: 13, name: "Ice Cat", rarity: "U",},
	{ id: 14, name: "Cat Machine", rarity: "U",},
	{ id: 15, name: "Lesser Demon Cat", rarity: "U",},
	{ id: 16, name: "Marauder Cat", rarity: "U",},
	{ id: 17, name: "Baby Cat", rarity: "U",},
	{ id: 18, name: "Nurse Cat", rarity: "U",},
	{ id: 19, name: "Cat Clan Heroes", rarity: "U",},
	{ id: 20, name: "Lasvoss", rarity: "U",},
	{ id: 21, name: "Summoner Satoru", rarity: "U",},
	{ id: 22, name: "Cat Tengu", rarity: "U",},
	{ id: 23, name: "Dynasaurus Cat", rarity: "U",},
	{ id: 24, name: "Wonder MOMOCO", rarity: "L",}
];

renderBanners();
updateWishlistDisplay();
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
			userUnits = {};
			saveUserData();
			renderBanners();
			updateWishlistDisplay();
		}
	});
	
	document.getElementById('searchBanners').addEventListener('input', function(e) {filterBanners(e.target.value);});
}

function renderBanners() {
	const bannersGrid = document.getElementById('bannersGrid');
	bannersGrid.innerHTML = '';

	//Duplicates this piece of html for each banner in the list
	bannersData.forEach(banner => {const bannerItem = document.createElement('div'); bannerItem.className = 'banner-item';

	bannerItem.innerHTML = `
	<div class="banner" data-banner-id="${banner.id}">
		<img src="banners/${banner.image}.png" alt="${banner.name}" class="banner-image">
		<h3 class="banner-title">${banner.name}</h3>
	</div>
	<div class="units-container" id="units-${banner.id}">
		${renderBannerUnits(banner.units)}
	</div>
	`;

	bannersGrid.appendChild(bannerItem);
	});
}

//Called by the renderBanners() function, does the same as that function, but with units
function renderBannerUnits(unitIds) {
	let unitsHTML = '';

	unitIds.forEach(unitId => {const unit = unitsData.find(u => u.id === unitId);
	if (unit) {
		const status = userUnits[unitId] || STATUS_UNOBTAINED;
		const statusClass = getStatusClass(status);

		unitsHTML += `
		<div class="unit ${statusClass}" data-unit-id="${unit.id}">
			${unit.rarity === 'L' ? '<span class="unit-rarity">Legendary</span>' : unit.rarity === 'U' ? '<span class="unit-rarity">Uber</span>' : '<span class="unit-rarity">Super</span>'}
			<img src="units/${unit.name}.png" alt="${unit.name}" class="unit-image" data-unit-id="${unit.id}">
			<span class="unit-name">${unit.name}</span>
		</div>
		`;
	}
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
			<img src="units/${unit.name}.png" alt="${unit.name}" class="unit-image" data-unit-id="${unit.id}">
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
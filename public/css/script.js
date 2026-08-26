// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

const listingMap = document.querySelector('#listing-map')

if (listingMap) {
  const showMapStatus = message => {
    listingMap.innerHTML = `<p class="map-status">${message}</p>`
  }

  if (typeof L === 'undefined') {
    showMapStatus('The map could not be loaded.')
  } else {
  const location = listingMap.dataset.location
  const country = listingMap.dataset.country
  const searchQuery = [location, country].filter(Boolean).join(', ')
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  if (!searchQuery) {
    showMapStatus('No location is available for this listing.')
  } else {
    fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(searchQuery)}`, {
      signal: controller.signal
    })
      .then(response => {
        if (!response.ok) throw new Error('Geocoding failed')
        return response.json()
      })
      .then(results => {
        if (!results.length) throw new Error('Location not found')

        const result = results[0]
        listingMap.replaceChildren()
        const map = L.map(listingMap, {
          worldCopyJump: false,
          maxBounds: [[-85.0511, -180], [85.0511, 180]],
          maxBoundsViscosity: 1
        }).setView([Number(result.lat), Number(result.lon)], 13)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          noWrap: true
        }).addTo(map)
        const pointerIcon = L.divIcon({
          className: 'listing-marker-icon',
          html: '<i class="fa-solid fa-location-dot"></i>',
          iconSize: [32, 40],
          iconAnchor: [16, 40],
          popupAnchor: [0, -40]
        })
        const airbnbIcon = L.divIcon({
          className: 'listing-marker-icon listing-marker-airbnb',
          html: '<i class="fa-brands fa-airbnb"></i>',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40]
        })
        const marker = L.marker([Number(result.lat), Number(result.lon)], { icon: pointerIcon })
          .addTo(map)
          .bindPopup(searchQuery)
          .openPopup()
        marker.on('mouseover', () => marker.setIcon(airbnbIcon))
        marker.on('mouseout', () => marker.setIcon(pointerIcon))
      })
      .catch(() => {
        showMapStatus('We could not load this location on the map.')
      })
      .finally(() => clearTimeout(timeoutId))
    }
  }
}
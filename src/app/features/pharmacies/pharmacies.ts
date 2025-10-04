import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as L from 'leaflet';
import { PharmacyService, Pharmacy } from './pharmacy.service';

interface City {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
}

interface Filters {
  isOpenNow: boolean;
  sortBy: 'name' | 'distance';
}

@Component({
  selector: 'app-pharmacies',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './pharmacies.html',
  styleUrl: './pharmacies.scss'
})
export class Pharmacies implements OnInit, AfterViewInit {
  private map!: L.Map;
  private markers: L.Marker[] = [];

  locationForm!: FormGroup;
  pharmacies: Pharmacy[] = [];
  filteredPharmacies: Pharmacy[] = [];
  loading = false;
  error: string | null = null;
  hasSearched = false;
  availableCities: City[] = [];

  // Filters for pharmacies
  filters: Filters = {
    isOpenNow: false,
    sortBy: 'name'
  };

  // Default location - Warsaw city center
  defaultLocation: [number, number] = [52.229676, 21.012229];
  currentLocation: [number, number] = this.defaultLocation;

  // Fixed search radius for all cities (in km)
  private readonly searchRadius: number = 10;

  constructor(
    private formBuilder: FormBuilder,
    private pharmacyService: PharmacyService
  ) {
    // Initialize the list of cities based on service data
    this.initCities();
  }

  ngOnInit() {
    this.initForm();
  }

  ngAfterViewInit() {
    this.initMap();
  }

  private initCities() {
    // The same cities as in PharmacyService
    this.availableCities = [
      { name: 'warszawa', displayName: 'Warsaw', lat: 52.229676, lng: 21.012229 },
      { name: 'poznań', displayName: 'Poznan', lat: 52.406374, lng: 16.925168 },
      { name: 'kraków', displayName: 'Krakow', lat: 50.049683, lng: 19.944544 },
      { name: 'gdańsk', displayName: 'Gdansk', lat: 54.372158, lng: 18.638306 },
      { name: 'wrocław', displayName: 'Wroclaw', lat: 51.107885, lng: 17.038538 },
      { name: 'łódź', displayName: 'Lodz', lat: 51.759445, lng: 19.457216 },
      { name: 'szczecin', displayName: 'Szczecin', lat: 53.428543, lng: 14.552812 },
      { name: 'katowice', displayName: 'Katowice', lat: 50.259640, lng: 19.023781 },
      { name: 'lublin', displayName: 'Lublin', lat: 51.246452, lng: 22.568445 },
      { name: 'bydgoszcz', displayName: 'Bydgoszcz', lat: 53.123482, lng: 18.008438 },
      { name: 'białystok', displayName: 'Bialystok', lat: 53.132489, lng: 23.159891 }
    ];
  }

  private initForm() {
    this.locationForm = this.formBuilder.group({
      city: ['warszawa', Validators.required]
    });
  }

  private initMap() {
    this.map = L.map('map').setView(this.defaultLocation, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Add marker for default location
    this.addUserMarker(this.defaultLocation);
  }

  searchPharmacies() {
    if (this.locationForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.hasSearched = true;
    const formValue = this.locationForm.value;
    const cityName = formValue.city;

    // Find selected city
    const selectedCity = this.availableCities.find(city => city.name === cityName);

    if (selectedCity) {
      const lat = selectedCity.lat;
      const lng = selectedCity.lng;
      this.currentLocation = [lat, lng];

      // Update map
      this.map.setView(this.currentLocation, 13);
      this.clearMarkers();
      this.addUserMarker(this.currentLocation);

      // Search for pharmacies near the selected city
      this.getPharmaciesNearLocation(lat, lng);
    } else {
      this.error = 'Could not find the selected city.';
      this.loading = false;
    }
  }

  private getPharmaciesNearLocation(lat: number, lng: number) {
    this.pharmacyService.getPharmaciesNearLocation(lat, lng, this.searchRadius)
      .subscribe({
        next: (pharmacies) => {
          this.loading = false;

          if (pharmacies.length === 0) {
            this.pharmacies = [];
            this.filteredPharmacies = [];
            this.error = `No pharmacies found in the selected location.`;
            return;
          }

          // Calculate distance for each pharmacy
          this.pharmacies = pharmacies.map(pharmacy => {
            return {
              ...pharmacy,
              distance: this.calculateDistance(
                lat,
                lng,
                pharmacy.location.lat,
                pharmacy.location.lng
              )
            };
          });

          // Apply filters to pharmacies
          this.applyFilters();

          // Add markers to the map
          this.addPharmacyMarkers(this.pharmacies);
        },
        error: (error) => {
          console.error('Error fetching pharmacies:', error);
          this.error = 'An error occurred while fetching pharmacy data.';
          this.loading = false;
        }
      });
  }

  isPharmacyOpenNow(pharmacy: Pharmacy): boolean {
    if (!pharmacy.openingHours) {
      return false;
    }

    const openingHours = pharmacy.openingHours.toLowerCase();

    // Sprawdzanie, czy apteka jest całodobowa
    if (openingHours.includes('całodob') || openingHours.includes('24h') || openingHours.includes('24/7')) {
      return true;
    }

    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hour + minutes / 60; // czas w formacie dziesiętnym, np. 15.5 to 15:30

    // Sprawdzamy, jaki dziś jest dzień tygodnia
    const daysOfWeek = ['nd', 'pon', 'wt', 'śr', 'czw', 'pt', 'sb'];
    const today = daysOfWeek[now.getDay()];

    // Próbujemy dopasować godziny dla aktualnego dnia
    // Szukamy wzorców jak "Pon-Pt: 8:00-20:00" lub podobnych
    let timeRanges: {start: number, end: number}[] = [];

    // Sprawdzamy, czy dziś jest weekend
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    if (isWeekend && (openingHours.includes('sb') || openingHours.includes('nd') ||
        openingHours.includes('weekend') || openingHours.includes('sob'))) {
      // Wzorce dla weekendów
      if (openingHours.includes('sb') || openingHours.includes('sob')) {
        timeRanges = this.extractTimeRanges(openingHours, 'sb');
        if (timeRanges.length === 0) {
          timeRanges = this.extractTimeRanges(openingHours, 'sob');
        }
      } else if (openingHours.includes('nd')) {
        timeRanges = this.extractTimeRanges(openingHours, 'nd');
      } else if (openingHours.includes('weekend')) {
        timeRanges = this.extractTimeRanges(openingHours, 'weekend');
      }
    } else {
      // Wzorce dla dni powszednich
      if (openingHours.includes('pon-pt') || openingHours.includes('pon - pt')) {
        timeRanges = this.extractTimeRanges(openingHours, 'pon-pt');
        if (timeRanges.length === 0) {
          timeRanges = this.extractTimeRanges(openingHours, 'pon - pt');
        }
      } else {
        // Próbujemy dopasować konkretny dzień
        timeRanges = this.extractTimeRanges(openingHours, today);
      }
    }

    // Jeśli nie znaleźliśmy konkretnych wzorców, używamy domyślnych godzin
    if (timeRanges.length === 0) {
      if (isWeekend) {
        // Domyślne godziny dla weekendów
        return currentTime >= 10 && currentTime < 14;
      } else {
        // Domyślne godziny dla dni powszednich
        return currentTime >= 8 && currentTime < 18; // Zmieniłem na 18:00 zamiast 17:00
      }
    }

    // Sprawdzamy, czy aktualny czas mieści się w którymś z zakresów godzin
    return timeRanges.some(range => {
      return currentTime >= range.start && currentTime < range.end;
    });
  }

  applyFilters() {
    let filtered = [...this.pharmacies];

    // Apply "open now" filter if enabled
    if (this.filters.isOpenNow) {
      filtered = filtered.filter(pharmacy => this.isPharmacyOpenNow(pharmacy));
    }

    // Apply sorting
    switch(this.filters.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'distance':
        filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
    }

    this.filteredPharmacies = filtered;
  }

  showDirections(pharmacy: Pharmacy) {
    const userLat = this.currentLocation[0];
    const userLng = this.currentLocation[1];
    const pharmacyLat = pharmacy.location.lat;
    const pharmacyLng = pharmacy.location.lng;

    // Open directions in Google Maps
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${pharmacyLat},${pharmacyLng}&travelmode=driving`;
    window.open(url, '_blank');
  }

  // Calculate distance between two points using Haversine formula
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  private clearMarkers() {
    // Remove all existing markers from the map
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];
  }

  private addUserMarker(position: [number, number]) {
    // Icon for user location
    const userIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const marker = L.marker(position, { icon: userIcon })
      .addTo(this.map)
      .bindPopup('Selected location')
      .openPopup();

    this.markers.push(marker);
  }

  private addPharmacyMarkers(pharmacies: Pharmacy[]) {
    // Icon for pharmacies
    const pharmacyIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    pharmacies.forEach(pharmacy => {
      const position: [number, number] = [pharmacy.location.lat, pharmacy.location.lng];

      const marker = L.marker(position, {
        icon: pharmacyIcon
      })
        .addTo(this.map)
        .bindPopup(`
          <strong>${pharmacy.name}</strong><br>
          ${pharmacy.address}<br>
          ${pharmacy.city}<br>
          ${pharmacy.phone || ''}<br>
          <em>${pharmacy.openingHours || ''}</em>
          <br><br>
          <strong>${this.isPharmacyOpenNow(pharmacy) ? 'Open now' : 'Closed'}</strong>
          ${pharmacy.distance ? `<br>Distance: ${pharmacy.distance.toFixed(1)} km` : ''}
        `);

      this.markers.push(marker);
    });
  }

  // Pomocnicza funkcja do wyciągania zakresów godzin z tekstu
  private extractTimeRanges(text: string, dayPattern: string): {start: number, end: number}[] {
    const ranges: {start: number, end: number}[] = [];

    // Szukamy fragmentów tekstu zawierających wzorzec dnia i godziny po nim
    // np. dla "pon-pt: 8:00-20:00", dayPattern="pon-pt"
    const regex = new RegExp(`${dayPattern}[^\\d]*(\\d{1,2})[:.]?(\\d{2})?[^\\d]*(\\d{1,2})[:.]?(\\d{2})?`, 'i');
    const matches = text.match(regex);

    if (matches) {
      const startHour = parseInt(matches[1]);
      const startMinute = matches[2] ? parseInt(matches[2]) : 0;
      const endHour = parseInt(matches[3]);
      const endMinute = matches[4] ? parseInt(matches[4]) : 0;

      ranges.push({
        start: startHour + startMinute / 60,
        end: endHour + endMinute / 60
      });
    }

    return ranges;
  }
}

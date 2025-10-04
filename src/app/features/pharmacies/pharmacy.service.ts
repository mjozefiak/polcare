import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  city: string;
  location: {
    lat: number;
    lng: number;
  };
  phone?: string;
  openingHours?: string;
  distance?: number;  // Odległość od użytkownika w kilometrach
}

export interface CityLocation {
  city: string;
  location: {
    lat: number;
    lng: number;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PharmacyService {
  // Mapowanie miast na ich lokalizacje geograficzne
  private cityLocations: CityLocation[] = [
    { city: 'warszawa', location: { lat: 52.229676, lng: 21.012229 } },
    { city: 'poznań', location: { lat: 52.406374, lng: 16.925168 } },
    { city: 'kraków', location: { lat: 50.049683, lng: 19.944544 } },
    { city: 'gdańsk', location: { lat: 54.372158, lng: 18.638306 } },
    { city: 'wrocław', location: { lat: 51.107885, lng: 17.038538 } },
    { city: 'łódź', location: { lat: 51.759445, lng: 19.457216 } },
    { city: 'szczecin', location: { lat: 53.428543, lng: 14.552812 } },
    { city: 'katowice', location: { lat: 50.259640, lng: 19.023781 } },
    { city: 'lublin', location: { lat: 51.246452, lng: 22.568445 } },
    { city: 'bydgoszcz', location: { lat: 53.123482, lng: 18.008438 } },
    { city: 'białystok', location: { lat: 53.132489, lng: 23.159891 } }
  ];

  // Mockowe dane aptek dla różnych miast
  private mockPharmacies: Pharmacy[] = [
    // Warszawa
    {
      id: 1,
      name: 'Apteka Centralna',
      address: 'ul. Warszawska 15',
      city: 'Warszawa',
      location: { lat: 52.229676, lng: 21.012229 },
      phone: '+48 123 456 789',
      openingHours: 'Pon-Pt: 8:00-20:00, Sb: 9:00-15:00'
    },
    {
      id: 2,
      name: 'Apteka Pod Słońcem',
      address: 'ul. Krakowska 45',
      city: 'Warszawa',
      location: { lat: 52.236272, lng: 20.995256 },
      phone: '+48 987 654 321',
      openingHours: 'Pon-Pt: 7:00-21:00, Sb-Nd: 9:00-18:00'
    },
    {
      id: 3,
      name: 'Apteka DOZ',
      address: 'ul. Marszałkowska 104',
      city: 'Warszawa',
      location: { lat: 52.232145, lng: 21.015678 },
      phone: '+48 221 345 678',
      openingHours: 'Całodobowa'
    },
    // Poznań
    {
      id: 4,
      name: 'Apteka Poznańska',
      address: 'ul. Półwiejska 42',
      city: 'Poznań',
      location: { lat: 52.400872, lng: 16.923679 },
      phone: '+48 111 222 333',
      openingHours: 'Pon-Pt: 8:00-21:00, Sb: 9:00-15:00'
    },
    {
      id: 5,
      name: 'Apteka Familia',
      address: 'ul. Święty Marcin 75',
      city: 'Poznań',
      location: { lat: 52.408050, lng: 16.916672 },
      phone: '+48 444 555 666',
      openingHours: 'Całodobowa'
    },
    {
      id: 6,
      name: 'Apteka Dr. Max',
      address: 'ul. Głogowska 150',
      city: 'Poznań',
      location: { lat: 52.396325, lng: 16.908237 },
      phone: '+48 618 765 432',
      openingHours: 'Pon-Pt: 8:00-20:00, Sb: 8:00-16:00'
    },
    // Kraków
    {
      id: 7,
      name: 'Apteka pod Wawelem',
      address: 'ul. Grodzka 8',
      city: 'Kraków',
      location: { lat: 50.057678, lng: 19.937458 },
      phone: '+48 111 333 555',
      openingHours: 'Pon-Pt: 7:00-22:00, Sb-Nd: 8:00-20:00'
    },
    {
      id: 8,
      name: 'Apteka Krakowska',
      address: 'Rynek Główny 25',
      city: 'Kraków',
      location: { lat: 50.061732, lng: 19.936623 },
      phone: '+48 122 344 566',
      openingHours: 'Pon-Pt: 8:00-21:00, Sb-Nd: 9:00-18:00'
    },
    {
      id: 9,
      name: 'Apteka Pod Opatrznością',
      address: 'ul. Karmelicka 23',
      city: 'Kraków',
      location: { lat: 50.064827, lng: 19.929662 },
      phone: '+48 126 738 293',
      openingHours: 'Pon-Pt: 8:00-20:00, Sb: 9:00-15:00'
    },
    // Gdańsk
    {
      id: 10,
      name: 'Apteka Nadmorska',
      address: 'ul. Długa 67',
      city: 'Gdańsk',
      location: { lat: 54.349378, lng: 18.652389 },
      phone: '+48 777 888 999',
      openingHours: 'Pon-Pt: 8:00-20:00, Sb: 9:00-14:00'
    },
    {
      id: 11,
      name: 'Apteka Portowa',
      address: 'ul. Szeroka 12',
      city: 'Gdańsk',
      location: { lat: 54.350678, lng: 18.649831 },
      phone: '+48 583 472 901',
      openingHours: 'Pon-Pt: 7:00-21:00, Sb: 8:00-16:00'
    },
    {
      id: 12,
      name: 'Apteka Morska',
      address: 'ul. Piwna 15',
      city: 'Gdańsk',
      location: { lat: 54.348234, lng: 18.653567 },
      phone: '+48 584 938 475',
      openingHours: 'Pon-Pt: 8:00-20:00, Sb-Nd: 9:00-15:00'
    },
    // Wrocław
    {
      id: 13,
      name: 'Apteka Wrocławska',
      address: 'ul. Świdnicka 40',
      city: 'Wrocław',
      location: { lat: 51.106117, lng: 17.032585 },
      phone: '+48 222 444 666',
      openingHours: 'Pon-Pt: 8:00-21:00, Sb: 8:00-15:00'
    },
    {
      id: 14,
      name: 'Apteka pod Orłem',
      address: 'Rynek 56',
      city: 'Wrocław',
      location: { lat: 51.109788, lng: 17.031862 },
      phone: '+48 713 455 677',
      openingHours: 'Pon-Pt: 8:00-20:00, Sb: 9:00-15:00'
    },
    {
      id: 15,
      name: 'Apteka Przy Rynku',
      address: 'ul. Ruska 15',
      city: 'Wrocław',
      location: { lat: 51.108123, lng: 17.029012 },
      phone: '+48 713 498 721',
      openingHours: 'Pon-Pt: 8:00-21:00, Sb: 9:00-16:00'
    },
    // Łódź
    {
      id: 16,
      name: 'Apteka Łódzka',
      address: 'ul. Piotrkowska 104',
      city: 'Łódź',
      location: { lat: 51.759445, lng: 19.457216 },
      phone: '+48 333 222 111',
      openingHours: 'Pon-Pt: 8:00-20:00, Sb: 9:00-15:00'
    },
    {
      id: 17,
      name: 'Apteka Piotrkowska',
      address: 'ul. Piotrkowska 67',
      city: 'Łódź',
      location: { lat: 51.764892, lng: 19.459345 },
      phone: '+48 426 789 012',
      openingHours: 'Pon-Pt: 7:00-22:00, Sb: 8:00-18:00'
    },
    {
      id: 18,
      name: 'Apteka Manufaktura',
      address: 'ul. Drewnowska 58',
      city: 'Łódź',
      location: { lat: 51.779562, lng: 19.444864 },
      phone: '+48 426 715 983',
      openingHours: 'Pon-Nd: 9:00-21:00'
    },
    // Szczecin
    {
      id: 19,
      name: 'Apteka Szczecińska',
      address: 'ul. Bogurodzicy 3',
      city: 'Szczecin',
      location: { lat: 53.428543, lng: 14.552812 },
      phone: '+48 444 333 222',
      openingHours: 'Pon-Pt: 8:00-20:00, Sb: 9:00-15:00'
    },
    {
      id: 20,
      name: 'Apteka Centrum',
      address: 'al. Niepodległości 18',
      city: 'Szczecin',
      location: { lat: 53.426781, lng: 14.551234 },
      phone: '+48 914 865 234',
      openingHours: 'Pon-Pt: 8:00-20:00, Sb: 8:00-16:00'
    },
    {
      id: 21,
      name: 'Apteka Pod Kotwicą',
      address: 'ul. Jagiellońska 20',
      city: 'Szczecin',
      location: { lat: 53.425126, lng: 14.557689 },
      phone: '+48 918 976 532',
      openingHours: 'Pon-Pt: 8:00-21:00, Sb: 9:00-15:00'
    },
    // Katowice
    {
      id: 22,
      name: 'Apteka Katowicka',
      address: 'ul. 3 Maja 30',
      city: 'Katowice',
      location: { lat: 50.259640, lng: 19.023781 },
      phone: '+48 555 444 333',
      openingHours: 'Pon-Pt: 8:00-20:00, Sb: 9:00-15:00'
    },
    {
      id: 23,
      name: 'Apteka Śląska',
      address: 'ul. Mikołowska 26',
      city: 'Katowice',
      location: { lat: 50.257345, lng: 19.018963 },
      phone: '+48 325 673 981',
      openingHours: 'Pon-Pt: 7:00-21:00, Sb: 8:00-16:00'
    },
    {
      id: 24,
      name: 'Apteka Spodek',
      address: 'al. Korfantego 35',
      city: 'Katowice',
      location: { lat: 50.266721, lng: 19.023142 },
      phone: '+48 327 891 234',
      openingHours: 'Pon-Nd: 8:00-22:00'
    },
    // Lublin
    {
      id: 25,
      name: 'Apteka Lubelska',
      address: 'ul. Narutowicza 5',
      city: 'Lublin',
      location: { lat: 51.246452, lng: 22.568445 },
      phone: '+48 666 555 444',
      openingHours: 'Pon-Pt: 8:00-20:00, Sb: 9:00-15:00'
    },
    {
      id: 26,
      name: 'Apteka Zamkowa',
      address: 'ul. Zamkowa 8',
      city: 'Lublin',
      location: { lat: 51.249816, lng: 22.566721 },
      phone: '+48 817 654 329',
      openingHours: 'Pon-Pt: 8:00-20:00, Sb: 9:00-14:00'
    },
    {
      id: 27,
      name: 'Apteka Akademicka',
      address: 'ul. Akademicka 13',
      city: 'Lublin',
      location: { lat: 51.245123, lng: 22.544567 },
      phone: '+48 816 543 219',
      openingHours: 'Pon-Pt: 7:30-20:30, Sb: 8:00-15:00'
    },
    // Bydgoszcz
    {
      id: 28,
      name: 'Apteka Bydgoska',
      address: 'ul. Gdańska 50',
      city: 'Bydgoszcz',
      location: { lat: 53.123482, lng: 18.008438 },
      phone: '+48 777 666 555',
      openingHours: 'Pon-Pt: 8:00-20:00, Sb: 9:00-15:00'
    },
    {
      id: 29,
      name: 'Apteka nad Brdą',
      address: 'ul. Długa 12',
      city: 'Bydgoszcz',
      location: { lat: 53.124567, lng: 18.005123 },
      phone: '+48 523 456 789',
      openingHours: 'Pon-Pt: 8:00-20:00, Sb: 8:00-16:00'
    },
    {
      id: 30,
      name: 'Apteka Centralna',
      address: 'ul. Dworcowa 25',
      city: 'Bydgoszcz',
      location: { lat: 53.121789, lng: 18.012345 },
      phone: '+48 528 765 432',
      openingHours: 'Pon-Pt: 7:00-21:00, Sb: 9:00-15:00'
    },
    // Białystok
    {
      id: 31,
      name: 'Apteka Białostocka',
      address: 'ul. Lipowa 10',
      city: 'Białystok',
      location: { lat: 53.132489, lng: 23.159891 },
      phone: '+48 888 777 666',
      openingHours: 'Pon-Pt: 8:00-20:00, Sb: 9:00-15:00'
    },
    {
      id: 32,
      name: 'Apteka Pod Lwem',
      address: 'ul. Sienkiewicza 20',
      city: 'Białystok',
      location: { lat: 53.130123, lng: 23.158456 },
      phone: '+48 857 654 321',
      openingHours: 'Pon-Pt: 8:00-21:00, Sb: 9:00-16:00'
    },
    {
      id: 33,
      name: 'Apteka Słoneczna',
      address: 'ul. Legionowa 5',
      city: 'Białystok',
      location: { lat: 53.134567, lng: 23.162345 },
      phone: '+48 856 789 123',
      openingHours: 'Pon-Pt: 7:30-20:30, Sb: 8:00-15:00, Nd: 9:00-14:00'
    }
  ];

  constructor(private http: HttpClient) { }

  // Metoda do pobierania aptek w określonej odległości od podanej lokalizacji
  getPharmaciesNearLocation(lat: number, lng: number, radius: number = 5): Observable<Pharmacy[]> {
    // W rzeczywistej aplikacji tutaj byłoby zapytanie do API
    // return this.http.get<Pharmacy[]>(`api/pharmacies?lat=${lat}&lng=${lng}&radius=${radius}`);

    // Dla przykładu filtrujemy apteki na podstawie odległości
    return of(this.mockPharmacies.filter(pharmacy =>
      this.getDistance(lat, lng, pharmacy.location.lat, pharmacy.location.lng) <= radius
    ));
  }

  // Metoda do wyszukiwania aptek po adresie lub mieście
  searchPharmaciesByAddress(address: string): Observable<Pharmacy[]> {
    // W rzeczywistej aplikacji tu byłoby zapytanie do API
    // return this.http.get<Pharmacy[]>(`api/pharmacies?address=${encodeURIComponent(address)}`);

    const normalizedAddress = address.toLowerCase().trim();

    // Najpierw sprawdzamy, czy adres zawiera nazwę miasta
    const cityMatch = this.cityLocations.find(city =>
      normalizedAddress === city.city || normalizedAddress.includes(city.city)
    );

    if (cityMatch) {
      // Jeśli znaleźliśmy miasto, zwracamy apteki w tym mieście
      const cityPharmacies = this.mockPharmacies.filter(pharmacy =>
        pharmacy.city.toLowerCase() === cityMatch.city
      );
      return of(cityPharmacies);
    } else {
      // Jeśli nie znaleźliśmy miasta, wyszukujemy po dokładnym adresie
      const foundPharmacies = this.mockPharmacies.filter(pharmacy =>
        pharmacy.address.toLowerCase().includes(normalizedAddress) ||
        (pharmacy.address + ' ' + pharmacy.city).toLowerCase().includes(normalizedAddress)
      );
      return of(foundPharmacies);
    }
  }

  // Metoda do uzyskiwania lokalizacji geograficznej na podstawie tekstu (symulacja geocodingu)
  geocodeAddress(address: string): Observable<{lat: number, lng: number} | null> {
    const normalizedAddress = address.toLowerCase().trim();

    // Sprawdzamy, czy adres pasuje do któregoś z miast w naszej bazie
    const cityMatch = this.cityLocations.find(city =>
      normalizedAddress === city.city || normalizedAddress.includes(city.city)
    );

    if (cityMatch) {
      return of(cityMatch.location);
    }

    // Sprawdzamy, czy adres pasuje do którejś apteki
    const pharmacyMatch = this.mockPharmacies.find(pharmacy =>
      pharmacy.address.toLowerCase().includes(normalizedAddress) ||
      (pharmacy.address + ' ' + pharmacy.city).toLowerCase().includes(normalizedAddress)
    );

    if (pharmacyMatch) {
      return of(pharmacyMatch.location);
    }

    // Jeśli nie znaleziono lokalizacji, zwracamy null
    return of(null);
  }

  // Pomocnicza metoda do obliczania odległości między dwoma punktami (w km) przy użyciu wzoru haversine
  private getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Promień Ziemi w kilometrach
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Odległość w kilometrach
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Metoda do pobierania aktualnej lokalizacji użytkownika
  getUserLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolokalizacja nie jest wspierana przez tę przeglądarkę.');
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  }
}

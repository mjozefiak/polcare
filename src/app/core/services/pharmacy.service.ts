import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import {
  PharmacyRecommendation,
  DrugRecommendation,
} from '../../pattern/chat/models';

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  openingHours: {
    [key: string]: string; // day: hours
  };
  distance?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PharmacyService {
  private readonly mockPharmacies: Pharmacy[] = [
    {
      id: 'ph_001',
      name: 'Apteka Pod Orionem',
      address: 'ul. Marszałkowska 144, Warszawa',
      phone: '+48 22 537 72 64',
      coordinates: { latitude: 52.2297, longitude: 21.0122 },
      openingHours: {
        monday: '8:00-22:00',
        tuesday: '8:00-22:00',
        wednesday: '8:00-22:00',
        thursday: '8:00-22:00',
        friday: '8:00-22:00',
        saturday: '9:00-20:00',
        sunday: '10:00-18:00',
      },
    },
    {
      id: 'ph_002',
      name: 'Apteka Główna',
      address: 'ul. Krakowskie Przedmieście 15, Warszawa',
      phone: '+48 22 826 83 58',
      coordinates: { latitude: 52.2392, longitude: 21.0144 },
      openingHours: {
        monday: '7:00-23:00',
        tuesday: '7:00-23:00',
        wednesday: '7:00-23:00',
        thursday: '7:00-23:00',
        friday: '7:00-23:00',
        saturday: '8:00-22:00',
        sunday: '9:00-21:00',
      },
    },
    {
      id: 'ph_003',
      name: 'Farmacja Zdrowia',
      address: 'ul. Nowy Świat 45, Warszawa',
      phone: '+48 22 829 14 23',
      coordinates: { latitude: 52.2246, longitude: 21.0186 },
      openingHours: {
        monday: '7:30-22:30',
        tuesday: '7:30-22:30',
        wednesday: '7:30-22:30',
        thursday: '7:30-22:30',
        friday: '7:30-22:30',
        saturday: '8:30-21:00',
        sunday: '9:00-20:00',
      },
    },
    {
      id: 'ph_004',
      name: 'Medicina Plus',
      address: 'ul. Złota 39, Warszawa',
      phone: '+48 22 826 94 47',
      coordinates: { latitude: 52.2291, longitude: 21.0065 },
      openingHours: {
        monday: '6:00-24:00',
        tuesday: '6:00-24:00',
        wednesday: '6:00-24:00',
        thursday: '6:00-24:00',
        friday: '6:00-24:00',
        saturday: '7:00-23:00',
        sunday: '8:00-22:00',
      },
    },
    {
      id: 'ph_005',
      name: 'Społeczny Dom Farmacja',
      address: 'ul. Chmielna 13, Warszawa',
      phone: '+48 22 827 39 27',
      coordinates: { latitude: 52.2367, longitude: 21.0089 },
      openingHours: {
        monday: '8:00-21:00',
        tuesday: '8:00-21:00',
        wednesday: '8:00-21:00',
        thursday: '8:00-21:00',
        friday: '8:00-21:00',
        saturday: '9:00-19:00',
        sunday: '10:00-18:00',
      },
    },
  ];

  private readonly commonDrugs: DrugRecommendation[] = [
    {
      drugName: 'Ibuprofen',
      description: 'Non-steroidal anti-inflammatory drug for pain and fever',
      dosage: '400mg every 6-8 hours (adult)',
      warnings: [
        'May cause stomach upset',
        'Do not exceed 2400mg per day',
        'Avoid if allergic to aspirin',
      ],
    },
    {
      drugName: 'Paracetamol',
      description: 'Pain reliever and fever reducer',
      dosage: '500mg-1000mg every 4-6 hours',
      warnings: [
        'Do not exceed 4000mg per day',
        'Safe for most people but check liver function',
      ],
    },
    {
      drugName: 'Nurofen Cold & Flu',
      description: 'Cold and flu relief medication',
      dosage: '1-2 tablets every 4-6 hours',
      warnings: ['May cause drowsiness', 'Contains pseudoephedrine'],
    },
    {
      drugName: 'Claritin',
      description: 'Antihistamine for allergies',
      dosage: '10mg once daily',
      warnings: ['May cause mild drowsiness', 'Avoid alcohol'],
    },
    {
      drugName: 'Pepto-Bismol',
      description: 'Over-the-counter medicine for stomach upset',
      dosage: 'As directed on package',
      warnings: ['May turn stool black', 'Contains bismuth subsalicylate'],
    },
  ];

  /**
   * Finds nearby pharmacies (mock implementation)
   */
  findNearbyPharmacies(
    location?: { latitude: number; longitude: number },
    maxDistance: number = 5
  ): Observable<Pharmacy[]> {
    // In real implementation, this would use Google Places API or similar
    const pharmaciesWithDistance = this.mockPharmacies
      .map((pharmacy) => ({
        ...pharmacy,
        distance: location
          ? this.calculateDistance(location, pharmacy.coordinates)
          : Math.random() * 3,
      }))
      .filter((pharmacy) => pharmacy.distance! <= maxDistance)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return of(pharmaciesWithDistance).pipe(delay(500)); // Simulate API delay
  }

  /**
   * Gets recommended drugs for specific symptoms
   */
  getDrugRecommendations(symptoms: string): Observable<DrugRecommendation[]> {
    const symptomsLower = symptoms.toLowerCase();
    const recommended: DrugRecommendation[] = [];

    if (symptomsLower.includes('pain') || symptomsLower.includes('ache')) {
      recommended.push(this.commonDrugs[0]); // Ibuprofen
      recommended.push(this.commonDrugs[1]); // Paracetamol
    }

    if (
      symptomsLower.includes('cold') ||
      symptomsLower.includes('flu') ||
      symptomsLower.includes('runny nose')
    ) {
      recommended.push(this.commonDrugs[2]); // Nurofen Cold &. Flu
      recommended.push(this.commonDrugs[3]); // Claritin (for allergies)
    }

    if (
      symptomsLower.includes('stomach') ||
      symptomsLower.includes('nausea') ||
      symptomsLower.includes('diarrhea')
    ) {
      recommended.push(this.commonDrugs[4]); // Pepto-Bismol
    }

    if (symptomsLower.includes('fever')) {
      recommended.push(this.commonDrugs[1]); // Paracetamol
      recommended.push(this.commonDrugs[0]); // Ibuprofen
    }

    // If no specific symptoms, return general pain relief
    if (recommended.length === 0) {
      recommended.push(this.commonDrugs[1]); // Paracetamol
    }

    return of(recommended).pipe(delay(300));
  }

  /**
   * Creates pharmacy recommendation with drug suggestions
   */
  createPharmacyRecommendation(
    pharmacy: Pharmacy,
    symptoms: string
  ): Observable<PharmacyRecommendation> {
    return this.getDrugRecommendations(symptoms).pipe(
      map((drugs) => ({
        pharmacyId: pharmacy.id,
        name: pharmacy.name,
        address: pharmacy.address,
        distance: pharmacy.distance || 0,
        recommendedDrugs: drugs,
      }))
    );
  }

  /**
   * Gets all mock pharmacies (for testing/development)
   */
  getAllPharmacies(): Observable<Pharmacy[]> {
    return of([...this.mockPharmacies]);
  }

  /**
   * Gets pharmacy details by ID
   */
  getPharmacyById(id: string): Observable<Pharmacy | undefined> {
    const pharmacy = this.mockPharmacies.find((p) => p.id === id);
    return of(pharmacy);
  }

  /**
   * Calculates distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(point2.latitude - point1.latitude);
    const dLon = this.deg2rad(point2.longitude - point1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.latitude)) *
        Math.cos(this.deg2rad(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

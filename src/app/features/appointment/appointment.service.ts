import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface Language {
  code: string;
  name: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  languages: Language[];
  availableDates: Date[];
}

export interface AppointmentForm {
  doctorId: number;
  date: Date;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  foreignerId?: string;
  nationality?: string;
  interpreter?: boolean;
  insuranceType: string;
  notes: string;
}

export interface Appointment extends AppointmentForm {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  // Available languages
  private availableLanguages: Language[] = [
    { code: 'en', name: 'English' }
  ];

  // Insurance types
  private insuranceTypes = [
    'European Health Insurance Card (EHIC)',
    'Private Insurance',
    'Travel Insurance',
    'Polish NFZ Insurance',
    'No Insurance (Self-pay)'
  ];

  // Mock data for doctors
  private doctors: Doctor[] = [
    {
      id: 1,
      name: 'dr Anna Kowalska',
      specialty: 'Cardiology',
      languages: [
        { code: 'en', name: 'English' }
      ],
      availableDates: [
        new Date(2025, 9, 5, 10, 0), // October 5, 2025, 10:00
        new Date(2025, 9, 5, 12, 0),
        new Date(2025, 9, 6, 9, 0),
        new Date(2025, 9, 6, 14, 0)
      ]
    },
    {
      id: 2,
      name: 'dr Jan Nowak',
      specialty: 'Pediatrics',
      languages: [
        { code: 'en', name: 'English' }
      ],
      availableDates: [
        new Date(2025, 9, 5, 9, 0),
        new Date(2025, 9, 5, 13, 0),
        new Date(2025, 9, 7, 11, 0),
        new Date(2025, 9, 7, 16, 0)
      ]
    },
    {
      id: 3,
      name: 'dr Maria Wiśniewska',
      specialty: 'Dermatology',
      languages: [
        { code: 'en', name: 'English' }
      ],
      availableDates: [
        new Date(2025, 9, 6, 10, 0),
        new Date(2025, 9, 6, 15, 0),
        new Date(2025, 9, 8, 9, 0),
        new Date(2025, 9, 8, 14, 0)
      ]
    },
    {
      id: 4,
      name: 'dr Adam Smith',
      specialty: 'Orthopedics',
      languages: [
        { code: 'en', name: 'English' }
      ],
      availableDates: [
        new Date(2025, 9, 4, 11, 0),
        new Date(2025, 9, 4, 14, 0),
        new Date(2025, 9, 9, 10, 0),
        new Date(2025, 9, 9, 16, 0)
      ]
    }
  ];

  // BehaviorSubject for storing and sharing appointments
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  appointments$ = this.appointmentsSubject.asObservable();

  constructor() {}

  // Asynchronous methods with delay
  getDoctors(): Observable<Doctor[]> {
    // Simulate server response delay
    return of(this.doctors).pipe(delay(500));
  }

  getDoctor(id: number): Observable<Doctor | undefined> {
    return this.getDoctors().pipe(
      map(doctors => doctors.find(doctor => doctor.id === id))
    );
  }

  getAvailableLanguages(): Observable<Language[]> {
    return of(this.availableLanguages).pipe(delay(300));
  }

  getInsuranceTypes(): Observable<string[]> {
    return of(this.insuranceTypes).pipe(delay(300));
  }

  // Synchronous methods for immediate access without delay
  getDoctorsSync(): Doctor[] {
    return [...this.doctors];
  }

  getDoctorSync(id: number): Doctor | undefined {
    return this.doctors.find(doctor => doctor.id === id);
  }

  getAvailableLanguagesSync(): Language[] {
    return [...this.availableLanguages];
  }

  getInsuranceTypesSync(): string[] {
    return [...this.insuranceTypes];
  }

  createAppointment(form: AppointmentForm): Observable<Appointment> {
    // Simulate appointment creation and ID generation
    const newAppointment: Appointment = {
      ...form,
      id: `app-${Date.now()}`,
      status: 'pending',
      createdAt: new Date()
    };

    // Add new appointment to the list
    const currentAppointments = this.appointmentsSubject.getValue();
    this.appointmentsSubject.next([...currentAppointments, newAppointment]);

    // Return immediately without delay
    return of(newAppointment);
  }

  // Method to simulate appointment status change
  updateAppointmentStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled'): Observable<Appointment> {
    const currentAppointments = this.appointmentsSubject.getValue();
    const updatedAppointments = currentAppointments.map(app =>
      app.id === id ? { ...app, status } : app
    );

    const updatedAppointment = updatedAppointments.find(app => app.id === id);
    if (!updatedAppointment) {
      throw new Error('Appointment not found');
    }

    this.appointmentsSubject.next(updatedAppointments);
    return of(updatedAppointment);
  }
}

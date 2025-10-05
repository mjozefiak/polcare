import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface ServiceCardData {
  title: string;
  price: string;
  people: string;
  description: string;
  buttonText: string;
  route: string;
}

@Component({
  selector: 'app-services-card',
  imports: [CommonModule],
  templateUrl: './services-card.component.html',
  styleUrl: './services-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesCardComponent {
  private router = inject(Router);

  services: ServiceCardData[] = [
    {
      title: 'Health Insurance',
      price: 'from 99 zł',
      people: 'per month',
      description: 'Comprehensive health insurance plans tailored for Polish residents. Coverage includes AI consultations, pharmacy benefits, and medical appointments across Poland.',
      buttonText: 'View Insurance Plans',
      route: '/insurance'
    },
    {
      title: 'Medical Appointments',
      price: 'from 120 zł',
      people: 'per visit',
      description: 'Book appointments with qualified healthcare professionals across Poland. Fast scheduling, verified doctors, and seamless integration with your insurance plan.',
      buttonText: 'Book Appointment',
      route: '/appointment'
    },
    {
      title: 'Pharmacy Network',
      price: 'Free',
      people: 'service',
      description: 'Access our extensive pharmacy network across Poland. Find medications, check availability, get prescription deliveries, and manage your medication history.',
      buttonText: 'Find Pharmacies',
      route: '/pharmacies'
    }
  ];

  onServiceClick(route: string): void {
    this.router.navigate([route]);
  }
}

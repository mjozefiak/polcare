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
      title: 'Insurance',
      price: '150 zł',
      people: 'per month',
      description: 'Comprehensive health insurance coverage with access to top medical facilities and specialists.',
      buttonText: 'View Plans',
      route: '/insurance'
    },
    {
      title: 'Appointments',
      price: '80 zł',
      people: 'per visit',
      description: 'Book appointments with qualified doctors and specialists. Fast and convenient scheduling.',
      buttonText: 'Book Now',
      route: '/appointment'
    },
    {
      title: 'Pharmacies',
      price: 'Free',
      people: 'service',
      description: 'Find nearby pharmacies, check medication availability, and get prescription information.',
      buttonText: 'Find Pharmacy',
      route: '/pharmacies'
    }
  ];

  onServiceClick(route: string): void {
    this.router.navigate([route]);
  }
}

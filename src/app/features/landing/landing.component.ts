import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChatComponent } from '../../pattern/chat/chat.component';
import { CardComponent, InsuranceCardData } from '../../ui/card/card.component';
import { ServicesCardComponent } from '../../ui/services-card/services-card.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CardComponent, ChatComponent, ServicesCardComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  insuranceCards: InsuranceCardData[] = [
    {
      title: 'Basic Health Plan',
      price: 'from 99 zł',
      people: 'per month',
      description:
        'Essential healthcare coverage including AI consultations, basic pharmacy access, and emergency care. Perfect for individuals seeking affordable protection.',
      buttonText: 'Get Started',
    },
    {
      title: 'Family Care Plus',
      price: 'from 249 zł',
      people: 'for family',
      description:
        'Comprehensive family coverage with unlimited AI consultations, prescription delivery, and priority appointment booking for up to 4 family members.',
      buttonText: 'Choose Plan',
    },
    {
      title: 'Premium Health',
      price: 'from 199 zł',
      people: 'per month',
      description:
        'Complete healthcare solution with 24/7 AI support, express pharmacy delivery, specialist consultations, and premium insurance benefits.',
      buttonText: 'Learn More',
    },
  ];

  onCardButtonClick(): void {
    console.log('Card button clicked');
  }
}

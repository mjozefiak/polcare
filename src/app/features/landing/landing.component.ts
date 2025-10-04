import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChatComponent } from '../../pattern/chat/chat.component';
import { CardComponent, InsuranceCardData } from '../../ui/card/card.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CardComponent, ChatComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  insuranceCards: InsuranceCardData[] = [
    {
      title: 'Buy insurance',
      price: 'from 130 zł',
      people: '2 people',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      buttonText: 'Learn more',
    },
    {
      title: 'Buy insurance',
      price: 'from 130 zł',
      people: '2 people',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      buttonText: 'Learn more',
    },
    {
      title: 'Buy insurance',
      price: 'from 230 zł',
      people: '2 people',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.',
      buttonText: 'Learn more',
    },
  ];

  onCardButtonClick(): void {
    console.log('Card button clicked');
  }
}

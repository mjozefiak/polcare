import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface InsuranceCardData {
  title: string;
  price: string;
  people: string;
  description: string;
  buttonText: string;
}

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  cardData = input.required<InsuranceCardData>();
  buttonClick = output<void>();

  onButtonClick(): void {
    this.buttonClick.emit();
  }
}

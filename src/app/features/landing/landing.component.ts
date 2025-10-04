import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChatComponent } from '../../pattern/chat/chat.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [ChatComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <button class="lang-switcher" (click)="switchLanguage()">
      {{ 'lang.switch' | translate }}
    </button>
  `,
  styles: [`
    .lang-switcher {
      position: fixed;
      top: 35px;
      right: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px 20px;
      background: white;
      border: 2px solid #1e3a8a;
      border-radius: 8px;
      color: #1e3a8a;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      z-index: 1000;

      &:hover {
        background: #1e3a8a;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
      }

      &:active {
        transform: translateY(0);
      }
    }

    @media (max-width: 600px) {
      .lang-switcher {
        top: 50px;
        right: 10px;
        padding: 8px 16px;
        font-size: 12px;
      }
    }
  `]
})
export class LanguageSwitcherComponent {
  constructor(public translationService: TranslationService) {}

  switchLanguage(): void {
    this.translationService.switchLanguage();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketDetails } from '../models/booking.model';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.scss']
})
export class TicketDetailsComponent implements OnInit {
  ticket: TicketDetails | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get ticket data from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.ticket = navigation.extras.state['ticket'];
    }

    // If no ticket data, try to get from history state
    if (!this.ticket && history.state.ticket) {
      this.ticket = history.state.ticket;
    }

    // If still no ticket, redirect back to booking form
    if (!this.ticket) {
      this.router.navigate(['/']);
    }
  }

  formatDateTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  printTicket(): void {
    window.print();
  }
}

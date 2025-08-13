import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qb',
  imports: [CommonModule],
  templateUrl: './qb.component.html',
  styleUrls: ['./qb.component.sass']
})
export class QbComponent {
  isConnected = false;
  result: any = null;

  connectQuickBooks() {
    window.open('http://localhost:3000/auth/qb/', '_blank');
    // After you complete the auth in the popup, manually set this for testing:
    setTimeout(() => { this.isConnected = true; }, 2000);
  }

  createInvoice() {
    const sampleInvoice = {
      "CustomerRef": { "value": "1" },   // Replace "1" with your sandbox Customer ID
      "Line": [
        {
          "Amount": 100.0,
          "DetailType": "SalesItemLineDetail",
          "SalesItemLineDetail": {
            "ItemRef": { "value": "1" } // Replace "1" with your sandbox Item ID
          }
        }
      ]
    };

    fetch('http://localhost:3000/api/qb/create-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleInvoice)
    })
      .then(res => res.json())
      .then(data => this.result = data)
      .catch(err => this.result = err);
  }
}

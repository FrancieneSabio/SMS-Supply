import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="page">
      <h1>Distribution report</h1>
      <div class="panel">
        <div class="row noprint" style="margin-top:0">
          <input placeholder="Search employee or item" [ngModel]="q()" (ngModelChange)="q.set($event)">
          <label style="flex-direction:row;align-items:center;gap:.4rem">From <input type="date" [ngModel]="from()" (ngModelChange)="from.set($event)"></label>
          <label style="flex-direction:row;align-items:center;gap:.4rem">To <input type="date" [ngModel]="to()" (ngModelChange)="to.set($event)"></label>
          <span style="margin-left:auto"></span>
          <button class="ghost" (click)="csv()">Download CSV</button>
          <button (click)="print()">Print</button>
        </div>
        <p class="muted">{{ rows().length }} record(s)</p>
        @if (rows().length === 0) {
          <p class="muted">No records match. Clear the search or widen the dates.</p>
        } @else {
          <div class="tablewrap"><table>
            <tr><th>Date</th><th>Emp. no.</th><th>Employee</th><th>Item</th><th>Size</th><th>Qty</th><th>Type</th><th>Issued by</th></tr>
            @for (d of rows(); track d.id) {
              <tr><td>{{ d.date | date:'short' }}</td><td>{{ d.empNo }}</td><td>{{ d.employeeName }}</td>
                  <td>{{ d.itemName }}</td><td>{{ d.size }}</td><td>{{ d.qty }}</td>
                  <td>{{ d.reissue ? 'Replacement' : 'First issue' }}</td><td>{{ d.issuedBy }}</td></tr>
            }
          </table></div>
        }
      </div>
    </div>
  `,
})
export class ReportsComponent {
  data = inject(DataService);
  q = signal(''); from = signal(''); to = signal('');

  rows = computed(() => {
    const s = this.q().toLowerCase();
    const f = this.from() ? new Date(this.from() + 'T00:00:00').getTime() : 0;
    const t = this.to() ? new Date(this.to() + 'T23:59:59').getTime() : Infinity;
    return this.data.distributions().filter(d => {
      const time = new Date(d.date).getTime();
      return time >= f && time <= t && `${d.employeeName} ${d.empNo} ${d.itemName}`.toLowerCase().includes(s);
    });
  });

  print() { window.print(); }

  csv() {
    const head = ['Date', 'Emp no', 'Employee', 'Item', 'Size', 'Qty', 'Type', 'Issued by'];
    const esc = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = this.rows().map(d =>
      [d.date, d.empNo, d.employeeName, d.itemName, d.size, d.qty, d.reissue ? 'Replacement' : 'First issue', d.issuedBy].map(esc).join(','));
    const blob = new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'distribution-report.csv';
    a.click();
  }
}
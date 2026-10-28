import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { DataService } from '../data.service';

@Component({
  selector: 'app-distribution',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="page">
      <h1>Issue supplies</h1>

      <form class="panel" (ngSubmit)="issue()">
        <div class="grid">
          <label>Employee
            <select name="emp" [(ngModel)]="empId" required>
              <option value="" disabled>Choose employee</option>
              @for (e of data.employees(); track e.id) {
                <option [value]="e.id">{{ e.empNo }} · {{ e.name }}</option>
              }
            </select>
          </label>
          <label>Item
            <select name="item" [(ngModel)]="itemId" required>
              <option value="" disabled>Choose item</option>
              @for (i of data.items(); track i.id) {
                <option [value]="i.id">{{ i.name }} · {{ i.size }} · {{ i.color }} ({{ i.quantity }} left)</option>
              }
            </select>
          </label>
          <label>Quantity <input type="number" min="1" name="qty" [(ngModel)]="qty" required></label>
        </div>
        <div class="row">
          <label style="flex-direction:row;align-items:center;gap:.5rem">
            <input type="checkbox" name="reissue" [(ngModel)]="reissue"> This is a replacement (allow a second issue)
          </label>
        </div>
        @if (msg) { <div class="msg" [class.err]="msg.err" [class.good]="!msg.err">{{ msg.text }}</div> }
        <button type="submit" [disabled]="busy">Record distribution</button>
      </form>

      <div class="panel">
        <h2>Latest distributions</h2>
        @if (data.distributions().length === 0) {
          <p class="muted">Nothing issued yet.</p>
        } @else {
          <div class="tablewrap"><table>
            <tr><th>Date</th><th>Employee</th><th>Item</th><th>Qty</th><th>Issued by</th></tr>
            @for (d of data.distributions().slice(0, 8); track d.id) {
              <tr><td>{{ d.date | date:'medium' }}</td><td>{{ d.employeeName }}</td>
                  <td>{{ d.itemName }} ({{ d.size }})</td><td>{{ d.qty }}</td><td>{{ d.issuedBy }}</td></tr>
            }
          </table></div>
        }
      </div>
    </div>
  `,
})
export class DistributionComponent {
  data = inject(DataService);
  private auth = inject(AuthService);
  empId = ''; itemId = ''; qty = 1; reissue = false; busy = false;
  msg: { text: string; err: boolean } | null = null;

  async issue() {
    const emp = this.data.employees().find(e => e.id === this.empId);
    const item = this.data.items().find(i => i.id === this.itemId);
    if (!emp || !item) {
      this.msg = { err: true, text: 'Choose an employee and an item first. No employees yet? Add one on the Employees page.' };
      return;
    }
    this.busy = true; this.msg = null;
    try {
      await this.data.distribute(emp, item, Number(this.qty), this.auth.user()?.email ?? 'unknown', this.reissue);
      const left = item.quantity - Number(this.qty);
      this.msg = {
        err: false,
        text: `Recorded: ${item.name} (${item.size}) issued to ${emp.name}.` +
          (left <= item.minStock ? ` Warning: only ${left} left, running low!` : '')
      };
      this.itemId = ''; this.qty = 1; this.reissue = false;
    } catch (e: any) {
      if (e.message === 'DUPLICATE') this.msg = { err: true, text: `${emp.name} already received ${item.name} (${item.size}). Tick "replacement" if this is a re-issue.` };
      else if (e.message === 'NOSTOCK') this.msg = { err: true, text: `Not enough stock. Only ${item.quantity} left.` };
      else this.msg = { err: true, text: 'Could not save: ' + (e?.message ?? e) };
    }
    this.busy = false;
  }
}
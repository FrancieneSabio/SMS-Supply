import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService, Item } from '../data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <div class="dash">
      <div class="hero">
        <h1>Welcome back</h1>
        <p>{{ now() | date:'fullDate' }} · Here is your supply overview.</p>
        <div class="actions">
          <a class="btn" routerLink="/distribution">Issue supplies</a>
          <a class="btn soft" routerLink="/inventory">Add stock</a>
          <button class="btn soft" type="button" (click)="refresh()" [disabled]="refreshing()">
            <svg class="ic" [class.spin]="refreshing()" viewBox="0 0 24 24" style="vertical-align:-4px;margin-right:4px"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>
            {{ refreshing() ? 'Refreshing…' : 'Refresh' }}
          </button>
        </div>
      </div>

      <div class="tiles">
        <div class="stat-card">
          <div class="chip"><svg class="ic" viewBox="0 0 24 24"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 8.7 5 8.7-5"/></svg></div>
          <div>
            <div class="label">Item types</div>
            <div class="num">{{ data.items().length }}</div>
            @if (low().length > 0) { <div class="note warn">{{ low().length }} running low</div> }
          </div>
        </div>

        <div class="stat-card">
          <div class="chip"><svg class="ic" viewBox="0 0 24 24"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg></div>
          <div>
            <div class="label">Total units in stock</div>
            <div class="num">{{ totalStock() }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="chip"><svg class="ic" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          <div>
            <div class="label">Employees</div>
            <div class="num">{{ data.employees().length }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="chip"><svg class="ic" viewBox="0 0 24 24"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg></div>
          <div>
            <div class="label">Issued today</div>
            <div class="num">{{ issuedToday() }}</div>
            @if (issuedToday() > 0) { <div class="note">{{ issuedUnits() }} units</div> }
          </div>
        </div>
      </div>

      <div class="cols">
        <div class="panel">
          <div class="panel-head">
            <h2>Latest distributions</h2>
            @if (data.distributions().length > 0) { <a routerLink="/reports">View all</a> }
          </div>
          @if (data.distributions().length === 0) {
            <div class="empty">No supplies issued yet.<br>Go to Issue supplies to record the first one.</div>
          } @else {
            <div class="tablewrap"><table>
              <tr><th>Date</th><th>Employee</th><th>Item</th><th>Qty</th></tr>
              @for (d of recent(); track d.id) {
                <tr>
                  <td>{{ d.date | date:'MMM d, h:mm a' }}</td>
                  <td><div class="who-cell"><span class="mini-av">{{ initials(d.employeeName) }}</span>{{ d.employeeName }}</div></td>
                  <td>{{ d.itemName }}@if (d.size) { ({{ d.size }}) }</td>
                  <td>{{ d.qty }}</td>
                </tr>
              }
            </table></div>
          }
        </div>

        <div>
          <div class="panel">
            <div class="panel-head">
              <h2>
                <svg class="ic" viewBox="0 0 24 24" style="color:#f59e0b"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                Running low
              </h2>
              @if (low().length > 0) { <a routerLink="/inventory">Restock</a> }
            </div>
            @if (low().length === 0) {
              <p class="muted">Nothing is below its minimum stock.</p>
            } @else {
              @for (i of low(); track i.id) {
                <div class="li">
                  <div class="top">
                    <span>{{ i.name }} · {{ i.size }} · {{ i.color }}</span>
                    <span class="badge" [class.low]="isCritical(i)" [class.warn]="!isCritical(i)">{{ i.quantity }} left</span>
                  </div>
                  <div class="bar" [class.low]="isCritical(i)" [class.warn]="!isCritical(i)"><i [style.width.%]="pct(i)"></i></div>
                  <div class="foot"><span>Minimum: {{ i.minStock }}</span><span>{{ isCritical(i) ? 'Critical' : 'Low' }}</span></div>
                </div>
              }
            }
          </div>

          <div class="panel">
            <h2>Stock by category</h2>
            <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
              <div style="position:relative;width:150px;height:150px;flex:0 0 150px">
                <svg viewBox="0 0 200 200" width="150" height="150">
                  <g transform="rotate(-90 100 100)" fill="none" stroke-width="26">
                    <circle cx="100" cy="100" r="70" stroke="#e2e8f0"></circle>
                    @for (s of donut(); track s.name) {
                      @if (s.qty > 0) {
                        <circle cx="100" cy="100" r="70" pathLength="100"
                                [attr.stroke]="s.color"
                                [attr.stroke-dasharray]="s.dash + ' ' + s.rest"
                                [attr.stroke-dashoffset]="s.offset">
                          <title>{{ s.name }}: {{ s.qty }} units</title>
                        </circle>
                      }
                    }
                  </g>
                </svg>
                <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;text-align:center">
                  @if (totalStock() === 0) {
                    <span class="muted" style="font-size:13px">No stock yet</span>
                  } @else {
                    <span style="font-size:24px;font-weight:700;line-height:1.1">{{ totalStock() }}</span>
                    <span class="muted" style="font-size:12px">total units</span>
                  }
                </div>
              </div>

              <div style="flex:1;min-width:150px;display:flex;flex-direction:column;gap:4px">
                @for (s of donut(); track s.name) {
                  <div class="legend-row">
                    <span style="width:10px;height:10px;border-radius:2px;flex:0 0 10px" [style.background]="s.color"></span>
                    <span style="flex:1">{{ s.name }}</span>
                    <span class="muted">{{ s.qty }} units · {{ s.pct }}%</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  data = inject(DataService);
  now = signal(new Date());
  refreshing = signal(false);
  private colors = ['#2563eb', '#f97316', '#10b981'];

  ngOnInit() {
    this.refresh();
  }

  totalStock = computed(() => this.data.items().reduce((s, i) => s + Number(i.quantity), 0));

  low = computed(() =>
    this.data.items()
      .filter(i => i.quantity <= i.minStock)
      .sort((a, b) => this.ratio(a) - this.ratio(b))
  );

  recent = computed(() =>
    [...this.data.distributions()]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)
  );

  private today = computed(() => {
    const t = new Date().toDateString();
    return this.data.distributions().filter(d => new Date(d.date).toDateString() === t);
  });
  issuedToday = computed(() => this.today().length);
  issuedUnits = computed(() => this.today().reduce((s, d) => s + Number(d.qty ?? d.quantity ?? 0), 0));

  byCategory = computed(() => {
    const items = this.data.items();
    const total = items.reduce((s, i) => s + Number(i.quantity), 0);
    return ['Uniform', 'Shoes', 'Other'].map(name => {
      const qty = items.filter(i => i.category === name).reduce((s, i) => s + Number(i.quantity), 0);
      return { name, qty, pct: total ? Math.round((qty / total) * 100) : 0 };
    });
  });

  donut = computed(() => {
    const cats = this.byCategory();
    const total = cats.reduce((s, c) => s + c.qty, 0);
    let acc = 0;
    return cats.map((c, i) => {
      const share = total ? (c.qty / total) * 100 : 0;
      const gap = share >= 99.9 ? 0 : 0.6;
      const dash = Math.max(0, share - gap);
      const seg = { ...c, color: this.colors[i], dash, rest: 100 - dash, offset: -acc };
      acc += share;
      return seg;
    });
  });

  async refresh() {
    this.refreshing.set(true);
    try {
      await this.data.loadData();
      this.now.set(new Date());
    } finally {
      this.refreshing.set(false);
    }
  }

  private ratio(i: Item) { return i.quantity / Math.max(i.minStock, 1); }
  isCritical(i: Item) { return i.quantity === 0 || this.ratio(i) <= 0.5; }
  pct(i: Item) { return Math.max(4, Math.min(100, Math.round(this.ratio(i) * 100))); }
  initials(name?: string) {
    return (name ?? '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  }
}
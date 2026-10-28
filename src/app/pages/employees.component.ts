import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService, Employee } from '../data.service';

const blank = (): Employee => ({ empNo: '', name: '', position: '', uniformSize: '', shoeSize: '' });

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <h1>Employees</h1>

      <form class="panel" (ngSubmit)="save()">
        <h2>{{ editingId ? 'Edit employee' : 'Add employee' }}</h2>
        <div class="grid">
          <label>Employee no. <input name="empNo" [(ngModel)]="form.empNo" required></label>
          <label>Full name <input name="name" [(ngModel)]="form.name" required></label>
          <label>Position <input name="position" [(ngModel)]="form.position" placeholder="Security guard"></label>
          <label>Uniform size <input name="uniformSize" [(ngModel)]="form.uniformSize"></label>
          <label>Shoe size <input name="shoeSize" [(ngModel)]="form.shoeSize"></label>
        </div>
        <div class="row">
          <button type="submit">{{ editingId ? 'Save changes' : 'Add employee' }}</button>
          @if (editingId) { <button type="button" class="ghost" (click)="reset()">Cancel</button> }
        </div>
      </form>

      <div class="panel">
        <div class="row" style="margin:0 0 .75rem">
          <h2 style="margin:0">All employees</h2>
          <input style="margin-left:auto" placeholder="Search name or number" [ngModel]="q()" (ngModelChange)="q.set($event)">
        </div>
        @if (shown().length === 0) {
          <p class="muted">No employees found. Add one above.</p>
        } @else {
          <div class="tablewrap"><table>
            <tr><th>No.</th><th>Name</th><th>Position</th><th>Uniform</th><th>Shoes</th><th>Received</th><th></th></tr>
            @for (e of shown(); track e.id) {
              <tr>
                <td>{{ e.empNo }}</td><td>{{ e.name }}</td><td>{{ e.position }}</td>
                <td>{{ e.uniformSize }}</td><td>{{ e.shoeSize }}</td><td>{{ received(e.id!) }}</td>
                <td>
                  <button class="ghost" (click)="edit(e)">Edit</button>
                  <button class="danger" (click)="remove(e)">Delete</button>
                </td>
              </tr>
            }
          </table></div>
        }
      </div>
    </div>
  `,
})
export class EmployeesComponent {
  data = inject(DataService);
  form: Employee = blank();
  editingId: string | null = null;
  q = signal('');
  shown = computed(() => {
    const s = this.q().toLowerCase();
    return this.data.employees().filter(e => `${e.name} ${e.empNo}`.toLowerCase().includes(s));
  });

  received(id: string) {
    return this.data.distributions().filter(d => d.employeeId === id).length;
  }
  async save() {
    if (this.editingId) await this.data.updateEmployee(this.editingId, this.form);
    else await this.data.addEmployee(this.form);
    this.reset();
  }
  edit(e: Employee) { this.form = { ...e }; this.editingId = e.id!; window.scrollTo({ top: 0 }); }
  reset() { this.form = blank(); this.editingId = null; }
  async remove(e: Employee) {
    if (confirm(`Delete ${e.name}? Their distribution records are kept.`)) await this.data.deleteEmployee(e.id!);
  }
}
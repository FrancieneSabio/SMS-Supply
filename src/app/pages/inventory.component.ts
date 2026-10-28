import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService, Item } from '../data.service';

const blank = (): Item => ({ name: '', category: 'Uniform', size: '', color: '', quantity: 0, minStock: 5 });

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <h1>Inventory</h1>

      <form class="panel" (ngSubmit)="save()">
        <h2>{{ editingId ? 'Edit item' : 'Add item' }}</h2>
        <div class="grid">
          <label>Name <input name="name" [(ngModel)]="form.name" required placeholder="Polo shirt"></label>
          <label>Category
            <select name="category" [(ngModel)]="form.category">
              <option>Uniform</option><option>Shoes</option><option>Other</option>
            </select>
          </label>
          <label>Size <input name="size" [(ngModel)]="form.size" required placeholder="M or 8"></label>
          <label>Color <input name="color" [(ngModel)]="form.color" placeholder="Navy"></label>
          <label>Quantity <input type="number" min="0" name="quantity" [(ngModel)]="form.quantity" required></label>
          <label>Minimum stock <input type="number" min="0" name="minStock" [(ngModel)]="form.minStock" required></label>
        </div>
        <div class="row">
          <button type="submit">{{ editingId ? 'Save changes' : 'Add item' }}</button>
          @if (editingId) { <button type="button" class="ghost" (click)="reset()">Cancel</button> }
        </div>
      </form>

      <div class="panel">
        <div class="row" style="margin:0 0 .75rem">
          <h2 style="margin:0">All items</h2>
          <input style="margin-left:auto" placeholder="Search name, size, color" [ngModel]="q()" (ngModelChange)="q.set($event)">
        </div>
        @if (shown().length === 0) {
          <p class="muted">No items found. Add one above.</p>
        } @else {
          <div class="tablewrap"><table>
            <tr><th>Name</th><th>Category</th><th>Size</th><th>Color</th><th>Stock</th><th></th></tr>
            @for (i of shown(); track i.id) {
              <tr>
                <td>{{ i.name }}</td><td>{{ i.category }}</td><td>{{ i.size }}</td><td>{{ i.color }}</td>
                <td><span class="badge" [class.low]="i.quantity <= i.minStock" [class.ok]="i.quantity > i.minStock">{{ i.quantity }}</span></td>
                <td>
                  <button class="ghost" (click)="edit(i)">Edit</button>
                  <button class="danger" (click)="remove(i)">Delete</button>
                </td>
              </tr>
            }
          </table></div>
        }
      </div>
    </div>
  `,
})
export class InventoryComponent {
  data = inject(DataService);
  form: Item = blank();
  editingId: string | null = null;
  q = signal('');
  shown = computed(() => {
    const s = this.q().toLowerCase();
    return this.data.items().filter(i => `${i.name} ${i.size} ${i.color} ${i.category}`.toLowerCase().includes(s));
  });

  async save() {
    const item = { ...this.form, quantity: Number(this.form.quantity), minStock: Number(this.form.minStock) };
    try {
      if (this.editingId) await this.data.updateItem(this.editingId, item);
      else await this.data.addItem(item);
      this.reset();
    } catch (err: any) {
      alert('Could not save: ' + (err?.message ?? err));
    }
  }

  edit(i: Item) {
    this.form = { ...i };
    this.editingId = i.id!;
    window.scrollTo({ top: 0 });
  }

  reset() {
    this.form = blank();
    this.editingId = null;
  }

  async remove(i: Item) {
    if (confirm(`Delete ${i.name} (${i.size})? Past distribution records are kept.`)) {
      try {
        await this.data.deleteItem(i.id!);
      } catch (err: any) {
        alert('Could not delete: ' + (err?.message ?? err));
      }
    }
  }
}
import { Injectable, signal } from '@angular/core';
import { supabase } from './supabase';

export interface Item {
  id?: string;
  name: string;
  category: string;
  size?: string;
  color?: string;
  quantity: number;
  minStock: number;
  unit?: string;
}

export interface Employee {
  id?: string;
  empNo: string;
  name: string;
  department?: string;
  position: string;
  uniformSize?: string;
  shoeSize?: string;
}

export interface Distribution {
  id?: string;
  employeeId: string;
  itemId: string;
  qty: number;
  quantity?: number;
  date: string;
  employeeName?: string;
  empNo?: string;
  itemName?: string;
  size?: string;
  issuedBy?: string;
  reissue?: boolean;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  items = signal<Item[]>([]);
  employees = signal<Employee[]>([]);
  distributions = signal<Distribution[]>([]);

  constructor() {
    this.loadData();
  }

  async loadData() {
    try {
      const [itemsRes, empRes, distRes] = await Promise.all([
        supabase.from('items').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('distributions').select('*')
      ]);

      if (itemsRes.data) this.items.set(itemsRes.data);
      if (empRes.data) this.employees.set(empRes.data);
      if (distRes.data) this.distributions.set(distRes.data);
    } catch (err) {
      console.error('Error loading data from Supabase:', err);
    }
  }

  // --- Items Management ---
  async addItem(item: Item) {
    const { data, error } = await supabase.from('items').insert([item]).select();
    if (error) throw error;
    if (data) this.items.update(list => [...list, data[0]]);
  }

  async updateItem(id: string, item: Partial<Item>) {
    const { error } = await supabase.from('items').update(item).eq('id', id);
    if (error) throw error;
    this.items.update(list => list.map(i => i.id === id ? { ...i, ...item } : i));
  }

  async deleteItem(id: string) {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) throw error;
    this.items.update(list => list.filter(i => i.id !== id));
  }

  // --- Employees Management ---
  async addEmployee(emp: Employee) {
    const { data, error } = await supabase.from('employees').insert([emp]).select();
    if (error) throw error;
    if (data) this.employees.update(list => [...list, data[0]]);
  }

  async updateEmployee(id: string, emp: Partial<Employee>) {
    const { error } = await supabase.from('employees').update(emp).eq('id', id);
    if (error) throw error;
    this.employees.update(list => list.map(e => e.id === id ? { ...e, ...emp } : e));
  }

  async deleteEmployee(id: string) {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
    this.employees.update(list => list.filter(e => e.id !== id));
  }

  // --- Distributions Management ---
  async distribute(emp: Employee, item: Item, qty: number, issuedBy: string, reissue: boolean = false) {
    const newDist: Distribution = {
      employeeId: emp.id!,
      itemId: item.id!,
      qty: qty,
      quantity: qty,
      date: new Date().toISOString(),
      employeeName: emp.name,
      empNo: emp.empNo,
      itemName: item.name,
      size: item.size,
      issuedBy: issuedBy,
      reissue: reissue
    };

    const { data, error } = await supabase.from('distributions').insert([newDist]).select();
    if (error) throw error;

    const newQty = Math.max(0, item.quantity - qty);
    await this.updateItem(item.id!, { quantity: newQty });

    if (data) {
      this.distributions.update(list => [data[0], ...list]);
    }
  }
}
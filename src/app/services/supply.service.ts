import { Injectable } from '@angular/core';
import { supabase } from '../supabase';

export interface SupplyItem {
  id?: number;
  item_name: string;
  quantity: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupplyService {

  // 1. Fetch all items (SELECT * FROM supplies)
  async getSupplies(): Promise<SupplyItem[]> {
    const { data, error } = await supabase
      .from('supplies')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching supplies:', error.message);
      return [];
    }

    return data as SupplyItem[];
  }

  // 2. Add a new item (INSERT INTO supplies ...)
  async addSupply(newItem: Omit<SupplyItem, 'id'>) {
    const { data, error } = await supabase
      .from('supplies')
      .insert([newItem])
      .select();

    if (error) {
      console.error('Error adding supply:', error.message);
      return null;
    }

    return data;
  }

  // 3. Delete an item (DELETE FROM supplies WHERE id = ...)
  async deleteSupply(id: number) {
    const { error } = await supabase
      .from('supplies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting supply:', error.message);
    }
  }
}
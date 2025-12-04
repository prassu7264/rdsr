import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

  getFieldLabels(data: any[]): { id: string; label: string }[] {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0])
      .filter(key =>
        !(key === "id" ||
          key.startsWith("is") ||
          key.toLowerCase().includes("url"))
      )
      .map(key => ({
        id: key,
        label: `viewed by ${key}`
      }));
  }
}

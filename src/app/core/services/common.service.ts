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
  formatForTabulatorObj(list: any[], key: string, value: string): any {
    const obj: any = {};
    list.forEach(item => {
      obj[item[key]] = item[value];
    });
    return obj;
  }
  formatForTabulator(list: any[], value: string): any[] {
    return list.map(item => item[value]);
  }
  getObjectByField(list: any[], field: string, value: any): any | null {
    if (!Array.isArray(list) || !field) return null;
    return list.find(item => item[field] === value) || null;
  }
}

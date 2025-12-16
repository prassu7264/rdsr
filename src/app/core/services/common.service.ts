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
        !(key.includes("id") ||
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

  taskNameFormatter = function (cell: any) {
    const row = cell.getData();
    return `
        <div class="flex items-center gap-2">
            <span class="text-gray-400"><i class="fa-regular fa-file-lines"></i></span>
            <div class="flex flex-col">
                <span class="font-medium text-gray-700 hover:text-blue-600 cursor-pointer">${row.firstname} ${row.lastname}</span>
                <span class="text-[10px] text-gray-400">${row.position}</span>
            </div>
        </div>
    `;
  };

  getFieldValuesByTasks(data: any[], keyname: string): { id: string; label: string }[] {
    if (!data || data.length === 0) return [];

    return data.map(item => ({
      id: item.id,
      label: item[keyname],
    
    }));
  }

}

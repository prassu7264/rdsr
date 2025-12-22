import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

declare var Chart: any;

/* ================= VALUE INSIDE BAR PLUGIN ================= */
const valueInsideBarPlugin = {
  id: 'valueInsideBar',
  afterDatasetsDraw(chart: any) {
    const { ctx } = chart;

    chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
      const meta = chart.getDatasetMeta(datasetIndex);

      meta.data.forEach((bar: any, index: number) => {
        const value = dataset.data[index];
        if (!value) return;

        ctx.save();
        ctx.fillStyle = '#ffffff'; // white text inside colored bar
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle'; // vertical center
        ctx.fillText(value, bar.x, bar.y + bar.height / 2);
        ctx.restore();
      });
    });
  }
};
/* ====================================================== */

@Component({
  selector: 'app-project-team-report',
  templateUrl: './project-team-report.component.html',
  styleUrls: ['./project-team-report.component.scss']
})
export class ProjectTeamReportComponent implements OnChanges {

  @Input() projectData: any[] = [];
  chart: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectData'] && this.projectData?.length > 0) {
      this.updateChartByDepartments([this.projectData[0].departmen_name]);
    } else {
      this.renderEmptyChart();
    }
  }

  onDepartmentChange(event: Event): void {
    const selected = Array.from(
      (event.target as HTMLSelectElement).selectedOptions
    ).map(opt => opt.value);

    if (selected.length === 0) {
      this.renderEmptyChart();
      return;
    }

    this.updateChartByDepartments(selected);
  }

  updateChartByDepartments(departments: string[]): void {
    const filtered = this.projectData.filter(d =>
      departments.includes(d.departmen_name)
    );

    if (!filtered.length) {
      this.renderEmptyChart();
      return;
    }

    this.renderChart(filtered);
  }

  renderChart(data: any[]): void {
    const labels = data.map(d => d.departmen_name);
    const active = data.map(d => d.active_project);
    const completed = data.map(d => d.completed_project);
    const dropped = data.map(d => d.dropped_projects);

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart('teamReportChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Active', data: active, backgroundColor: '#3b82f6', borderRadius: 4 },
          { label: 'Completed', data: completed, backgroundColor: '#14b8a6', borderRadius: 4 },
          { label: 'Dropped', data: dropped, backgroundColor: '#ef4444', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1200,
          easing: 'easeOutQuart'
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            align: 'center',
          }
        }
      },
      plugins: [valueInsideBarPlugin] // 🔥 COUNTS INSIDE BAR
    });
  }

  renderEmptyChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart('teamReportChart', {
      type: 'bar',
      data: {
        labels: ['No Data'],
        datasets: [{
          label: 'Projects',
          data: [0],
          backgroundColor: '#e5e7eb'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
}

import { Component, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';

declare var Chart: any;

@Component({
  selector: 'app-project-status',
  templateUrl: './project-status.component.html',
  styleUrls: ['./project-status.component.scss']
})
export class ProjectStatusComponent implements AfterViewInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataValues'] && !changes['dataValues'].firstChange) {
      console.log(this.dataValues);
      this.initChart();
    }
  }
  pjStatusChart: any;
  @Input() dataValues: any = [];

  ngAfterViewInit(): void {
    this.initChart();
  }

  initChart() {
    if (this.pjStatusChart) {
      this.pjStatusChart.destroy()
    }
    const canvas = document.getElementById('pjStatusChart') as HTMLCanvasElement;

    const centerTextPlugin = {
      id: 'centerText',
      beforeDraw(chart: any) {
        const { ctx, chartArea } = chart;
        const data = chart.data.datasets[0].data;
        const total = data.reduce((a: number, b: number) => a + b, 0);

        ctx.save();
        ctx.font = 'bold 22px Arial';
        ctx.fillStyle = '#111827';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          total,
          (chartArea.left + chartArea.right) / 2,
          (chartArea.top + chartArea.bottom) / 2
        );
        ctx.restore();
      }
    };

    const data = {
      labels: [
        'Active',
        'Completed',
        'Dropped'
      ],
      datasets: [{
        label: 'Project Status',
        data: this.dataValues,
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)'
        ],
        hoverOffset: 4
      }]
    };

    this.pjStatusChart = new Chart(canvas, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        // cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      },
      plugins: [centerTextPlugin]
    });
  }
}

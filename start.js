const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const fs = require("fs");

const dane_pomiarowe = require("./dane/wyniki-pomiarow.json");

const width = 1200;
const height = 1000;

(async () => {
    let idx = 1;
    for (const set of dane_pomiarowe.pomiary) {
        const x = set.F;
        const y = set.delX;
        const err = set.blad;

        const canvas = new ChartJSNodeCanvas({ width, height });

        const krzywaViaZeroZero = (x, y) => {
            const n = x.length;
            let num = 0, den = 0;

            for (let i = 0; i < n; i++) {
                num += x[i] * y[i];
                den += x[i] * x[i];
            }

            const a = num / den;
            return { a, b: 0 };
        }

        const { a: A, b: B } = krzywaViaZeroZero(x, y);
        const krzywaRegresu = x.map(v => A * v + B);


        const wahaniaBleduPlg = {
            id: "wahaniaBledu",
            afterDatasetsDraw(chart) {
                const ctx = chart.ctx;
                const dataset = chart.getDatasetMeta(0);

                ctx.save();
                ctx.lineWidth = 2;

                dataset.data.forEach((point, i) => {
                    const v = y[i];
                    const e = Array.isArray(err) ? err[i] : err;

                    const yTop = chart.scales.y.getPixelForValue(v + e);
                    const yBottom = chart.scales.y.getPixelForValue(v - e);
                    const xCenter = point.x;

                    ctx.beginPath();
                    ctx.moveTo(xCenter, yTop);
                    ctx.lineTo(xCenter, yBottom);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(xCenter - 6, yTop);
                    ctx.lineTo(xCenter + 6, yTop);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(xCenter - 6, yBottom);
                    ctx.lineTo(xCenter + 6, yBottom);
                    ctx.stroke();
                });

                ctx.restore();
            }
        };

        const lepszeTloPlg = {
            id: "lepszeTlo",
            beforeDraw: (chart) => {
                const ctx = chart.ctx;
                ctx.save();
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
            }
        };

        const config = {
            type: "line",
            data: {
                labels: x,
                datasets: [
                    {
                        label: "Punkty pomiarowe",
                        data: y,
                        showLine: false,
                        pointRadius: 6,
                        borderWidth: 0
                    },
                    {
                        label: "Krzywa regresu",
                        data: krzywaRegresu,
                        borderWidth: 2,
                        fill: false
                    }
                ]
            },
            options: {
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    x: {
                        title: { display: true, text: "F (N)" },
                        ticks: { stepSize: 1 },
                        grid: {
                            lineWidth: 0.5,
                            color: "#00000088"
                        }
                    },
                    y: {
                        title: { display: true, text: "ΔX (m)" },
                        ticks: { stepSize: 0.02 },
                        grid: {
                            lineWidth: 0.5,
                            color: "#00000088"
                        }
                    }
                }
            },
            plugins: [wahaniaBleduPlg, lepszeTloPlg]
        };

        const png = await canvas.renderToBuffer(config);
        fs.writeFileSync(`./wyniki/wykres_${idx}.png`, png);

        console.log("wykres zostal otoz tak wygenerated");

        idx++;
    }
})();
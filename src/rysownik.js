const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

const width = 1200;
const height = 800;

const regresjaPrzezZero = (x, y) => {
    let num = 0, den = 0;
    for (let i = 0; i < x.length; i++) {
        num += x[i] * y[i];
        den += x[i] * x[i];
    }
    return num / den;
}

const errorPlugin = (y, blad) => {
    return {
        id: "bledyPomiarowe",
        afterDatasetsDraw(chart) {
            const ctx = chart.ctx;
            const meta = chart.getDatasetMeta(0);

            ctx.save();
            ctx.lineWidth = 2;

            meta.data.forEach((point, i) => {
                const v = y[i];
                const yTop = chart.scales.y.getPixelForValue(v + blad);
                const yBottom = chart.scales.y.getPixelForValue(v - blad);

                ctx.beginPath();
                ctx.moveTo(point.x, yTop);
                ctx.lineTo(point.x, yBottom);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(point.x - 5, yTop);
                ctx.lineTo(point.x + 5, yTop);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(point.x - 5, yBottom);
                ctx.lineTo(point.x + 5, yBottom);
                ctx.stroke();
            });

            ctx.restore();
        }
    };
}

const bgPlugin = () => {
    return {
        id: "whiteBg",
        beforeDraw(chart) {
            const ctx = chart.ctx;
            ctx.save();
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        }
    }
}

async function rysownik({
    x,
    y,
    blad,
    showRegression,
    xLabel,
    yLabel
}) {
    if (x.length !== y.length) {
        throw new Error("x i y muszą mieć tę samą długość");
    }

    const canvas = new ChartJSNodeCanvas({ width, height });

    const datasets = [{
        label: "Punkty pomiarowe",
        data: y,
        showLine: false,
        pointRadius: 6
    }];

    if (showRegression) {
        const a = regresjaPrzezZero(x, y);

        const xMax = Math.max(...x);
        const regresjaData = [
            { x: 0, y: 0 },
            { x: xMax, y: a * xMax }
        ];

        datasets.push({
            label: "Krzywa regresji",
            data: regresjaData,
            parsing: false,
            borderWidth: 2,
            fill: false,
            pointRadius: 0
        });
    }

    const config = {
        type: "line",
        data: {
            labels: x,
            datasets
        },
        options: {
            scales: {
                x: { type: "linear", min: 0, title: { display: true, text: xLabel } },
                y: { min: 0, title: { display: true, text: yLabel } }
            }
        },
        plugins: [bgPlugin(), errorPlugin(y, blad)]
    };

    return canvas.renderToBuffer(config);
}

module.exports = { rysownik };
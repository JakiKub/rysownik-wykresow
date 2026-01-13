const parseArray = (str) => {
    return str
        .split(",")
        .map(v => Number(v.trim()))
        .filter(v => !Number.isNaN(v));
}

const getPayload = () => {
    return {
        x: parseArray(document.getElementById("x").value),
        y: parseArray(document.getElementById("y").value),
        blad: Number(document.getElementById("blad").value),
        showRegression: document.getElementById("regresja").checked,
        xLabel: document.getElementById("xLabel").value || "X",
        yLabel: document.getElementById("yLabel").value || "Y"
    };
}

const generate = async () => {
    const res = await fetch("/wykres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getPayload())
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const img = document.getElementById("wykres");
    img.src = url;
    img.dataset.url = url;
}

const save = () => {
    const img = document.getElementById("wykres");
    if (!img.dataset.url) return;

    const a = document.createElement("a");
    a.href = img.dataset.url;
    a.download = "wykres.png";
    a.click();
}

const bodyScale = () => {
    if (window.innerWidth <= 600) return

    const scale = 1 / window.devicePixelRatio;
    const app = document.getElementById('app');
    app.style.transform = `scale(${scale})`;
    app.style.transformOrigin = 'top left';
    app.style.width = `${100 * window.devicePixelRatio}%`;
    app.style.height = `${100 * window.devicePixelRatio}%`;
    app.style.position = 'relative';
    app.style.top = 0;
    app.style.left = 0;
}

document.addEventListener('DOMContentLoaded', () => {
    bodyScale();
});
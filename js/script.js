// Black-Scholes Calculator Implementation
class BlackScholesCalculator {
    // Standard normal cumulative distribution function
    static normalCDF(x) {
        const t = 1.0 / (1.0 + 0.2316419 * Math.abs(x));
        const d = 0.3989423 * Math.exp(-x * x / 2.0);
        let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        if (x > 0) prob = 1.0 - prob;
        return prob;
    }

    // Standard normal probability density function
    static normalPDF(x) {
        return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
    }

    // Calculate d1 and d2 for Black-Scholes
    static calculateD1D2(S, K, T, r, sigma) {
        const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
        const d2 = d1 - sigma * Math.sqrt(T);
        return { d1, d2 };
    }

    // Calculate call option price
    static callPrice(S, K, T, r, sigma) {
        const { d1, d2 } = this.calculateD1D2(S, K, T, r, sigma);
        return S * this.normalCDF(d1) - K * Math.exp(-r * T) * this.normalCDF(d2);
    }

    // Calculate put option price
    static putPrice(S, K, T, r, sigma) {
        const { d1, d2 } = this.calculateD1D2(S, K, T, r, sigma);
        return K * Math.exp(-r * T) * this.normalCDF(-d2) - S * this.normalCDF(-d1);
    }

    // Calculate Greeks
    static calculateGreeks(S, K, T, r, sigma) {
        const { d1, d2 } = this.calculateD1D2(S, K, T, r, sigma);
        
        // Call Greeks
        const callDelta = this.normalCDF(d1);
        const callGamma = this.normalPDF(d1) / (S * sigma * Math.sqrt(T));
        const callVega = S * this.normalPDF(d1) * Math.sqrt(T) / 100; // Divided by 100 for percentage
        const callTheta = -(S * this.normalPDF(d1) * sigma / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * this.normalCDF(d2)) / 365;
        const callRho = K * T * Math.exp(-r * T) * this.normalCDF(d2) / 100; // Divided by 100 for percentage

        // Put Greeks
        const putDelta = this.normalCDF(d1) - 1;
        const putGamma = callGamma; // Gamma is the same for calls and puts
        const putVega = callVega; // Vega is the same for calls and puts
        const putTheta = -(S * this.normalPDF(d1) * sigma / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * this.normalCDF(-d2)) / 365;
        const putRho = -K * T * Math.exp(-r * T) * this.normalCDF(-d2) / 100; // Divided by 100 for percentage

        return {
            call: { delta: callDelta, gamma: callGamma, vega: callVega, theta: callTheta, rho: callRho },
            put: { delta: putDelta, gamma: putGamma, vega: putVega, theta: putTheta, rho: putRho }
        };
    }
}

// Application state
let greeksChart;
let callHeatmapData = [];
let putHeatmapData = [];

// Initialize the application
function init() {
    setupEventListeners();
    setupGreeksChart();
    calculateAndUpdate();
    // Ensure axis ticks are generated on initial load
    updateHeatmaps();
}

// Setup event listeners for all inputs
function setupEventListeners() {
    const inputs = ['stockPrice', 'strikePrice', 'timeToMaturity', 'riskFreeRate', 'volatility'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', calculateAndUpdate);
    });

    const heatmapInputs = ['stockPriceMin', 'stockPriceMax', 'volatilityMin', 'volatilityMax'];
    heatmapInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', updateHeatmaps);
    });

    // Setup volatility slider value display
    document.getElementById('volatilityMin').addEventListener('input', function() {
        document.getElementById('volMinValue').textContent = this.value;
        updateHeatmaps();
    });

    document.getElementById('volatilityMax').addEventListener('input', function() {
        document.getElementById('volMaxValue').textContent = this.value;
        updateHeatmaps();
    });

    setupHeatmapInteraction();
}

// Get current input values
function getInputValues() {
    return {
        S: parseFloat(document.getElementById('stockPrice').value),
        K: parseFloat(document.getElementById('strikePrice').value),
        T: parseFloat(document.getElementById('timeToMaturity').value) / 365, // Convert days to years
        r: parseFloat(document.getElementById('riskFreeRate').value) / 100, // Convert percentage to decimal
        sigma: parseFloat(document.getElementById('volatility').value) / 100 // Convert percentage to decimal
    };
}

// Calculate and update all components
function calculateAndUpdate() {
    const { S, K, T, r, sigma } = getInputValues();

    // Calculate option prices
    const callPrice = BlackScholesCalculator.callPrice(S, K, T, r, sigma);
    const putPrice = BlackScholesCalculator.putPrice(S, K, T, r, sigma);

    // Update price display
    document.getElementById('callPrice').textContent = `$${callPrice.toFixed(2)}`;
    document.getElementById('putPrice').textContent = `$${putPrice.toFixed(2)}`;

    // Calculate and update Greeks
    const greeks = BlackScholesCalculator.calculateGreeks(S, K, T, r, sigma);
    updateGreeksChart(greeks);

    // Update heatmaps
    updateHeatmaps();
}

// Setup Greeks chart
function setupGreeksChart() {
    const ctx = document.getElementById('greeksChart').getContext('2d');
    greeksChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Delta', 'Gamma', 'Vega', 'Theta', 'Rho'],
            datasets: [{
                label: 'Call Greeks',
                data: [0, 0, 0, 0, 0],
                backgroundColor: 'rgba(230, 126, 34, 0.8)',
                borderColor: 'rgba(230, 126, 34, 1)',
                borderWidth: 1
            }, {
                label: 'Put Greeks',
                data: [0, 0, 0, 0, 0],
                backgroundColor: 'rgba(52, 73, 94, 0.8)',
                borderColor: 'rgba(52, 73, 94, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Option Greeks Comparison'
                }
            }
        }
    });
}

// Update Greeks chart
function updateGreeksChart(greeks) {
    greeksChart.data.datasets[0].data = [
        greeks.call.delta,
        greeks.call.gamma,
        greeks.call.vega,
        greeks.call.theta,
        greeks.call.rho
    ];
    greeksChart.data.datasets[1].data = [
        greeks.put.delta,
        greeks.put.gamma,
        greeks.put.vega,
        greeks.put.theta,
        greeks.put.rho
    ];
    greeksChart.update();
}

// Update heatmaps
function updateHeatmaps() {
    const { K, T, r } = getInputValues();
    
    const stockPriceMin = parseFloat(document.getElementById('stockPriceMin').value);
    const stockPriceMax = parseFloat(document.getElementById('stockPriceMax').value);
    const volatilityMin = parseFloat(document.getElementById('volatilityMin').value) / 100;
    const volatilityMax = parseFloat(document.getElementById('volatilityMax').value) / 100;

    generateHeatmapData(stockPriceMin, stockPriceMax, volatilityMin, volatilityMax, K, T, r);
    drawHeatmap('callHeatmap', callHeatmapData);
    drawHeatmap('putHeatmap', putHeatmapData);
    
    // Update axis ticks
    updateAxisTicks(stockPriceMin, stockPriceMax, volatilityMin * 100, volatilityMax * 100);
}

// Generate and display axis ticks
function updateAxisTicks(stockPriceMin, stockPriceMax, volatilityMin, volatilityMax) {
    // Generate X-axis ticks (Stock Price)
    const xTicks = [];
    const xRange = stockPriceMax - stockPriceMin;
    const xStep = xRange / 4; // 5 ticks total
    for (let i = 0; i <= 4; i++) {
        xTicks.push(stockPriceMin + i * xStep);
    }
    
    // Generate Y-axis ticks (Volatility) - note: Y-axis is inverted
    const yTicks = [];
    const yRange = volatilityMax - volatilityMin;
    const yStep = yRange / 4; // 5 ticks total
    for (let i = 0; i <= 4; i++) {
        yTicks.push(volatilityMax - i * yStep); // Inverted for display
    }
    
    // Update call heatmap ticks
    updateTicksForHeatmap('callXTicks', 'callYTicks', xTicks, yTicks);
    
    // Update put heatmap ticks
    updateTicksForHeatmap('putXTicks', 'putYTicks', xTicks, yTicks);
}

// Update ticks for a specific heatmap
function updateTicksForHeatmap(xTicksId, yTicksId, xTicks, yTicks) {
    const xTicksContainer = document.getElementById(xTicksId);
    const yTicksContainer = document.getElementById(yTicksId);
    
    // Clear existing ticks
    xTicksContainer.innerHTML = '';
    yTicksContainer.innerHTML = '';
    
    // Add X-axis ticks
    xTicks.forEach(tick => {
        const tickElement = document.createElement('span');
        tickElement.textContent = `$${tick.toFixed(0)}`;
        xTicksContainer.appendChild(tickElement);
    });
    
    // Add Y-axis ticks
    yTicks.forEach(tick => {
        const tickElement = document.createElement('span');
        tickElement.textContent = `${tick.toFixed(0)}%`;
        yTicksContainer.appendChild(tickElement);
    });
}

// Generate heatmap data
function generateHeatmapData(stockPriceMin, stockPriceMax, volatilityMin, volatilityMax, K, T, r) {
    const gridSize = 10; // 10x10 grid for discrete values
    callHeatmapData = [];
    putHeatmapData = [];

    for (let i = 0; i < gridSize; i++) {
        callHeatmapData[i] = [];
        putHeatmapData[i] = [];
        
        for (let j = 0; j < gridSize; j++) {
            const S = stockPriceMin + (stockPriceMax - stockPriceMin) * i / (gridSize - 1);
            const sigma = volatilityMin + (volatilityMax - volatilityMin) * j / (gridSize - 1);
            
            callHeatmapData[i][j] = {
                value: BlackScholesCalculator.callPrice(S, K, T, r, sigma),
                S: S,
                sigma: sigma
            };
            
            putHeatmapData[i][j] = {
                value: BlackScholesCalculator.putPrice(S, K, T, r, sigma),
                S: S,
                sigma: sigma
            };
        }
    }
}

// Draw heatmap on canvas
function drawHeatmap(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find min and max values for color scaling
    let minValue = Infinity;
    let maxValue = -Infinity;
    
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            minValue = Math.min(minValue, data[i][j].value);
            maxValue = Math.max(maxValue, data[i][j].value);
        }
    }

    // Draw heatmap
    const cellWidth = width / data.length;
    const cellHeight = height / data[0].length;

    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            const value = data[i][j].value;
            const normalizedValue = (value - minValue) / (maxValue - minValue);
            const color = getHeatmapColor(normalizedValue);
            
            // Draw cell background
            ctx.fillStyle = color;
            ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
            
            // Draw cell border
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
            
            // Draw option price text on every cell in 10x10 grid
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const optionPrice = data[i][j].value;
            ctx.fillText(`$${optionPrice.toFixed(2)}`, 
                       i * cellWidth + cellWidth/2, 
                       j * cellHeight + cellHeight/2);
        }
    }
}

// Get color for heatmap based on normalized value
function getHeatmapColor(value) {
    // Create a color gradient from red (low) to green (high)
    const r = Math.floor(255 * (1 - value));
    const g = Math.floor(255 * value);
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
}

// Setup heatmap interaction
function setupHeatmapInteraction() {
    const callCanvas = document.getElementById('callHeatmap');
    const putCanvas = document.getElementById('putHeatmap');
    const tooltip = document.getElementById('tooltip');

    [callCanvas, putCanvas].forEach((canvas, index) => {
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const data = index === 0 ? callHeatmapData : putHeatmapData;
            const i = Math.floor(x / canvas.width * data.length);
            const j = Math.floor(y / canvas.height * data[0].length);
            
            if (i >= 0 && i < data.length && j >= 0 && j < data[0].length) {
                const point = data[i][j];
                const optionType = index === 0 ? 'Call' : 'Put';
                
                tooltip.innerHTML = `
                    ${optionType} Price: $${point.value.toFixed(2)}<br>
                    Stock Price: $${point.S.toFixed(2)}<br>
                    Volatility: ${(point.sigma * 100).toFixed(1)}%
                `;
                tooltip.style.display = 'block';
                tooltip.style.left = e.clientX + 10 + 'px';
                tooltip.style.top = e.clientY - 10 + 'px';
            }
        });

        canvas.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    });
}

// Initialize the application when the page loads
window.addEventListener('load', init); 

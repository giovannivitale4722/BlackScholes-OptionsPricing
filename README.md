# Interactive Black-Scholes Options Pricing Calculator

A comprehensive, web-based options pricing calculator built with HTML, CSS, and JavaScript. This educational tool provides real-time Black-Scholes calculations with interactive visualizations.

***

## 🚀 Features

### Core Calculator
* **Real-time Pricing**: Calculate theoretical call and put option prices instantly.
* **Five Key Parameters**:
    * **Stock Price ($S$)**: Current market price of the underlying asset.
    * **Strike Price ($K$)**: Exercise price of the option.
    * **Time to Maturity ($T$)**: Days until expiration (auto-converted to years).
    * **Risk-Free Rate ($r$)**: Annualized risk-free interest rate (%).
    * **Volatility ($\sigma$)**: Implied volatility of the underlying asset (%).

### Greeks Dashboard
An interactive bar chart visualizes the "Greeks":
* **Delta**: Price sensitivity to stock price changes.
* **Gamma**: Rate of change of Delta.
* **Vega**: Sensitivity to volatility changes.
* **Theta**: Time decay (sensitivity to time passage).
* **Rho**: Sensitivity to interest rate changes.

### Price Heatmaps
* **Dual Heatmaps**: Separate visualizations for call and put prices.
* **User-Defined Ranges**: Customize stock price and volatility ranges.
* **Interactive Tooltips**: Hover over any cell to see exact values.
* **Color-Coded**: Intuitive color gradient from low to high prices.

***

## 🎯 Usage

1.  **Open** `index.html` in your web browser.
2.  **Adjust Parameters** using the input fields on the left.
3.  **View Results** instantly in the calculated prices section.
4.  **Explore Greeks** in the bar chart visualization.
5.  **Analyze Scenarios** using the interactive heatmaps.

***

## 📊 Default Values

* **Stock Price**: $100
* **Strike Price**: $105
* **Time to Maturity**: 30 days
* **Risk-Free Rate**: 5%
* **Volatility**: 20%

***

***

## 🔧 Technical Details

* **Client-Side Only**: No server required; runs entirely in the browser.
* **Modular Structure**: Clean separation of HTML, CSS, and JavaScript.
* **Chart.js Integration**: Professional-quality charts and visualizations.
* **Responsive Design**: Works on desktop and mobile devices.
* **Real-Time Updates**: All calculations update automatically on input change.

***

## 📈 Educational Value

This calculator helps users understand:
* How different parameters affect option prices.
* The relationship between volatility and option value.
* Time decay effects on option pricing.
* The Greeks and their practical significance.
* Visual patterns in option pricing across different scenarios.

***

## 🌐 Browser Compatibility

Works in all modern browsers including:
* Chrome
* Firefox
* Safari
* Edge

***

## 📝 Mathematical Foundation

The calculator implements the complete Black-Scholes model.

The price of a **call option** $C$ is given by:
$$C(S, T) = S N(d_1) - K e^{-rT} N(d_2)$$

The price of a **put option** $P$ is given by:
$$P(S, T) = K e^{-rT} N(-d_2) - S N(-d_1)$$

Where:
$$d_1 = \frac{\ln(S/K) + (r + \frac{\sigma^2}{2})T}{\sigma\sqrt{T}}$$
$$d_2 = d_1 - \sigma\sqrt{T}$$

And:
* $N(x)$ is the standard normal cumulative distribution function.
* $S$ is the current stock price.
* $K$ is the strike price.
* $T$ is the time to maturity in years.
* $r$ is the annualized risk-free interest rate.
* $\sigma$ is the volatility of the stock's returns.

All "Greeks" are calculated using the standard partial derivatives of these formulas.

---

*Disclaimer: This tool is built for educational and analytical purposes only and is not intended for making actual trading decisions.*

import { LightningElement, track } from 'lwc';

export default class PerformanceMonitoring extends LightningElement {
    @track metrics = []; // Stores performance metrics
    @track cpuUsage = 0; // Tracks CPU usage percentage
    @track memoryUsage = 0; // Tracks memory usage percentage

    connectedCallback() {
        this.startMonitoring();
    }

    /**
     * Starts monitoring performance metrics and resource usage.
     */
    startMonitoring() {
        // Simulate metric logging every 2 seconds
        setInterval(() => {
            const now = new Date().toLocaleTimeString();
            const metricType = this.getRandomMetricType();
            const metricValue = Math.floor(Math.random() * 1000);

            this.metrics = [
                ...this.metrics,
                { timestamp: now, type: metricType, value: `${metricValue} ms` },
            ];

            // Limit table rows to the last 10 entries
            if (this.metrics.length > 10) {
                this.metrics.shift();
            }

            // Simulate CPU and memory usage updates
            this.cpuUsage = Math.floor(Math.random() * 100);
            this.memoryUsage = Math.floor(Math.random() * 100);
        }, 2000);
    }

    /**
     * Randomly generates a metric type for simulation.
     * @returns {string} The metric type.
     */
    getRandomMetricType() {
        const types = ['Load Time', 'Interaction Delay', 'API Response'];
        return types[Math.floor(Math.random() * types.length)];
    }
}
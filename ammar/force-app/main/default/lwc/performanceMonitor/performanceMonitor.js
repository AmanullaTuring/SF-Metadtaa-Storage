import { LightningElement, track, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import ALERT_CHANNEL from '@salesforce/messageChannel/SystemAlert__c';
import logPerformanceData from '@salesforce/apex/PerformanceDataLogger.logPerformanceData';
import getThresholds from '@salesforce/apex/PerformanceDataLogger.getThresholds';

export default class PerformanceMonitor extends LightningElement {
    @track cpuUsage = 0;
    @track memoryUsage = 0;
    @track status = 'Normal';
    thresholds = {};

    @wire(MessageContext) messageContext;

    connectedCallback() {
        getThresholds()
            .then((thresholds) => (this.thresholds = thresholds))
            .catch((error) => console.error('Error fetching thresholds', error));
    }

    get statusColor() {
        return this.status === 'Critical' ? '#d0021b' : this.status === 'Warning' ? '#ff9800' : '#0070d2';
    }
    

    simulateMetrics() {
        this.cpuUsage = Math.floor(Math.random() * 100);
        this.memoryUsage = Math.floor(Math.random() * 100);

        const cpuSeverity = this.getSeverity(this.cpuUsage, this.thresholds.CPU);
        const memorySeverity = this.getSeverity(this.memoryUsage, this.thresholds.Memory);

        if (cpuSeverity || memorySeverity) {
            this.status = cpuSeverity === 'Critical' || memorySeverity === 'Critical' ? 'Critical' : 'Warning';
            this.publishAlert();
        } else {
            this.status = 'Normal';
        }
    }

    getSeverity(value, thresholds) {
        if (value >= thresholds.CriticalThreshold__c) return 'Critical';
        if (value >= thresholds.WarningThreshold__c) return 'Warning';
        return null;
    }

    publishAlert() {
        const payload = {
            title: `${this.status} Alert`,
            message: `CPU: ${this.cpuUsage}%, Memory: ${this.memoryUsage}%`,
            timestamp: new Date().toISOString(),
        };
        publish(this.messageContext, ALERT_CHANNEL, payload);

        logPerformanceData({
            cpuUsage: this.cpuUsage,
            memoryUsage: this.memoryUsage,
            status: this.status,
        }).catch((error) => console.error('Error logging data', error));
    }
}
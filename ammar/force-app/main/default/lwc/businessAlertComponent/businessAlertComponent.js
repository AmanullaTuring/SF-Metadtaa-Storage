import { LightningElement, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import BUSINESS_ALERTS_CHANNEL from '@salesforce/messageChannel/BusinessAlertsChannel__c';

export default class BusinessAlertComponent extends LightningElement {
    @track alerts = []; // All incoming alerts
    @track filteredAlerts = []; // Alerts after applying filters

    // Filter selections
    @track selectedTypes = [];
    @track selectedPriorities = [];

    // Subscription reference
    subscription = null;

    @wire(MessageContext)
    messageContext;

    // Define filter options
    get typeOptions() {
        return [
            { label: 'Transaction', value: 'transaction' },
            { label: 'Account Update', value: 'account update' },
            { label: 'General Notification', value: 'general notification' },
            // Add more types as needed
        ];
    }

    get priorityOptions() {
        return [
            { label: 'High', value: 'high' },
            { label: 'Medium', value: 'medium' },
            { label: 'Low', value: 'low' },
        ];
    }

    // Determine if there are alerts to display
    get hasAlerts() {
        return this.filteredAlerts.length > 0;
    }

    // Subscribe when component is inserted
    connectedCallback() {
        this.subscribeToAlerts();
    }

    // Subscribe to message channel
    subscribeToAlerts() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                BUSINESS_ALERTS_CHANNEL,
                (message) => this.handleIncomingAlert(message)
            );
        }
    }

    // Process incoming alert messages
    handleIncomingAlert(msg) {
        if (!msg || !msg.priority || !msg.alertType || !msg.message || !msg.timestamp) {
            console.warn('Incomplete alert data', msg);
            return;
        }

        // Create a new alert entry
        const newAlert = {
            id: Date.now(), // Unique identifier
            title: this.getTitleForType(msg.alertType),
            message: msg.message,
            timestamp: msg.timestamp,
            iconName: this.getIconForType(msg.alertType),
            cssClass: this.getCssClassForPriority(msg.priority)
        };

        // Add new alert on top
        this.alerts = [newAlert, ...this.alerts];

        // Apply filters to update the displayed alerts
        this.applyFilters();
    }

    // Convert alert type to a user-friendly title
    getTitleForType(alertType) {
        const type = alertType.toLowerCase();
        if (type === 'transaction') {
            return 'Transaction Alert';
        } else if (type === 'account update') {
            return 'Account Update';
        }
        return 'General Notification';
    }

    // Convert alert type to an icon
    getIconForType(alertType) {
        const type = alertType.toLowerCase();
        if (type === 'transaction') {
            return 'utility:moneybag';
        } else if (type === 'account update') {
            return 'utility:settings';
        }
        return 'utility:announcement';
    }

    // Convert priority to a CSS class
    getCssClassForPriority(priority) {
        const level = priority.toLowerCase();
        let baseClass = 'alert__banner slds-notify slds-notify_alert';

        if (level === 'high') {
            return `${baseClass} alert__banner--high`;
        } else if (level === 'medium') {
            return `${baseClass} alert__banner--medium`;
        }
        return `${baseClass} alert__banner--low`;
    }

    // Dismiss an alert
    handleClose(event) {
        const alertId = event.target.dataset.id;
        this.alerts = this.alerts.filter(alert => String(alert.id) !== alertId);
        this.applyFilters();
    }

    // View alert details (toast for demo)
    handleViewDetails(event) {
        const alertId = event.target.dataset.id;
        const foundAlert = this.alerts.find(a => String(a.id) === alertId);
        if (foundAlert) {
            // Show details in a toast for demonstration
            this.dispatchEvent(
                new ShowToastEvent({
                    title: foundAlert.title,
                    message: 'Details:\n' + foundAlert.message,
                    variant: 'info'
                })
            );
        }
    }

    // Handle changes in Alert Type filter
    handleTypeFilterChange(event) {
        this.selectedTypes = event.detail.value;
        this.applyFilters();
    }

    // Handle changes in Priority filter
    handlePriorityFilterChange(event) {
        this.selectedPriorities = event.detail.value;
        this.applyFilters();
    }

    // Apply filters to alerts
    applyFilters() {
        this.filteredAlerts = this.alerts.filter(alert => {
            // Check if alert type matches the selected types
            const matchesType = this.selectedTypes.length === 0 || this.selectedTypes.includes(alert.title.toLowerCase().replace(' alert', '').replace(' update', ''));

            // Check if alert priority matches the selected priorities
            const matchesPriority = this.selectedPriorities.length === 0 || this.selectedPriorities.includes(alert.cssClass.split('--')[1]);

            return matchesType && matchesPriority;
        });
    }
}
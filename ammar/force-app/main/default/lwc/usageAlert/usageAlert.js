import { LightningElement, api, wire } from 'lwc';
import getUsageStatus from '@salesforce/apex/SubscriptionController.getUsageStatus';

export default class UsageAlert extends LightningElement {
    @api userId; // The User ID passed from the parent component or context
    usageType = 'API Calls'; // Example usage type
    usageLimit = 1000; // Example usage limit
    currentUsage = 0; // Current usage value
    isUsageAlert = false; // Flag to indicate if usage alert should be shown

    // Wire the Apex method to fetch usage status for the user
    @wire(getUsageStatus, { userId: '$userId' })
    wiredUsageStatus({ error, data }) {
        if (data) {
            // Update the current usage and check if an alert is needed
            this.currentUsage = data[this.usageType];
            this.isUsageAlert = this.currentUsage >= this.usageLimit * 0.8; // Show alert if usage exceeds 80% of the limit
        } else if (error) {
            // Handle any errors from the wire adapter
            console.error('Error fetching usage status:', error);
        }
    }

    // Lifecycle hook to check usage status when the component is initialized
    connectedCallback() {
        // No need to manually call checkUsageStatus anymore as it's handled by @wire
    }
}
import { LightningElement, wire } from 'lwc';
import getTierFeatures from '@salesforce/apex/SubscriptionController.getTierFeatures';

export default class SubscriptionManagement extends LightningElement {
    tierName = 'Free'; // Default tier selection
    tierOptions = [
        { label: 'Free', value: 'Free' },
        { label: 'Premium', value: 'Premium' },
        { label: 'Enterprise', value: 'Enterprise' }
    ]; // Tier options for the combobox
    tierFeatures = []; // Array to hold the features for the selected tier

    // Wire the Apex method to fetch features for the selected tier
    @wire(getTierFeatures, { tierName: '$tierName' })
    wiredTierFeatures({ error, data }) {
        if (data) {
            this.tierFeatures = data; // Update tierFeatures with data from Apex
        } else if (error) {
            // Handle errors from the Apex call
            console.error('Error fetching tier features:', error);
        }
    }

    // Method to handle tier selection change
    handleTierChange(event) {
        this.tierName = event.detail.value; // Update tier name based on user selection
    }
}
import { LightningElement, api } from 'lwc';
import renewSubscription from '@salesforce/apex/SubscriptionController.renewSubscription';

export default class SubscriptionRenewal extends LightningElement {
    @api userId; // User ID
    tierName = 'Premium'; // Subscription tier
    expiryDate = '2024-12-31'; // Expiry date
    isSubscriptionExpiring = false;

    connectedCallback() {
        this.checkExpiryDate();
    }

    checkExpiryDate() {
        const expiry = new Date(this.expiryDate);
        const today = new Date();
        const diffDays = Math.ceil((expiry - today) / (1000 * 3600 * 24));
        
        if (diffDays <= 7) {
            this.isSubscriptionExpiring = true;
        }
    }

    renewSubscription() {
        renewSubscription({ userId: this.userId })
            .then(() => {
                // Notify user that the subscription was renewed
                this.dispatchEvent(new CustomEvent('subscriptionrenewed'));
            })
            .catch(error => {
                console.error('Error renewing subscription:', error);
            });
    }
}
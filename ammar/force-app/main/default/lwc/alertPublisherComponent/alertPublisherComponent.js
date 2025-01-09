import { LightningElement, track, wire } from 'lwc';
import publishAlert from '@salesforce/apex/AlertPublisher.publishAlert';
import { publish, MessageContext } from 'lightning/messageService';
import BUSINESS_ALERTS_CHANNEL from '@salesforce/messageChannel/BusinessAlertsChannel__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AlertPublisherComponent extends LightningElement {
    @track alertType = '';  // Tracks the value of the alert type input
    @track priority = '';   // Tracks the value of the priority input
    @track message = '';    // Tracks the value of the message input

    // Options for the Priority Combobox
    priorityOptions = [
        { label: 'High', value: 'High' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Low', value: 'Low' },
    ];

    @wire(MessageContext)
    messageContext; // Provides context for LMS

    // Handles changes to the Alert Type input
    handleAlertTypeChange(event) {
        this.alertType = event.target.value;
    }

    // Handles changes to the Priority Combobox
    handlePriorityChange(event) {
        this.priority = event.target.value;
    }

    // Handles changes to the Message textarea
    handleMessageChange(event) {
        this.message = event.target.value;
    }

    // Publishes the alert to the server (email) and message channel
    handlePublish() {
        // Validate input fields
        if (!this.alertType || !this.priority || !this.message) {
            this.showToast('Validation Error', 'All fields are required.', 'error');
            return;
        }

        // Call Apex to send email notification
        publishAlert({
            alertType: this.alertType,
            priority: this.priority,
            message: this.message
        })
        .then(() => {
            // Publish the alert to the message channel with a timestamp
            const messagePayload = {
                alertType: this.alertType,
                priority: this.priority,
                message: this.message,
                timestamp: new Date().toLocaleString() // Adds a timestamp
            };

            publish(this.messageContext, BUSINESS_ALERTS_CHANNEL, messagePayload);

            // Clears the input fields
            this.alertType = '';
            this.priority = '';
            this.message = '';

            // Shows a success toast
            this.showToast('Success', 'Alert published successfully.', 'success');
        })
        .catch(error => {
            // Logs and shows an error toast if the Apex call fails
            console.error('Error publishing alert:', error);
            this.showToast('Error', 'Failed to publish alert: ' + error.body.message, 'error');
        });
    }

    // Displays toast messages
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(evt);
    }
}
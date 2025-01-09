import { LightningElement, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import ALERT_CHANNEL from '@salesforce/messageChannel/SystemAlert__c';

export default class AdminAlertDashboard extends LightningElement {
    @track alerts = [];

    @wire(MessageContext) messageContext;

    connectedCallback() {
        subscribe(this.messageContext, ALERT_CHANNEL, (message) => this.handleAlert(message));
    }

    handleAlert(message) {
        this.alerts = [...this.alerts, message];
    }

    clearAlerts() {
        this.alerts = [];
    }
}
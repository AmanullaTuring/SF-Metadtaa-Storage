import { LightningElement, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import BUSINESS_ALERTS_CHANNEL from '@salesforce/messageChannel/BusinessAlertsChannel__c';

export default class BusinessAlertPublisher extends LightningElement {
    // Inject MessageContext
    @wire(MessageContext)
    messageContext;

    sendAlert() {
        const message = {
            message: 'Your account balance has been updated.'
        };
        publish(this.messageContext, BUSINESS_ALERTS_CHANNEL, message);
    }
}
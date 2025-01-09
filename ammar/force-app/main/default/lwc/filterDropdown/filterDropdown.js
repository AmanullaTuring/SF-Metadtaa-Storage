import { LightningElement, track, wire } from 'lwc';
import getGroupNames from '@salesforce/apex/ContactController.getGroupNames';

export default class FilterDropdown extends LightningElement {
    @track accountOptions = []; // List of Account options

    @wire(getGroupNames)
    wiredAccounts({ error, data }) {
        if (data) {
            this.accountOptions = data.map(account => ({ label: account, value: account }));
        } else {
            this.accountOptions = [];
        }
    }

    handleAccountChange(event) {
        const accountName = event.detail.value;
        const filterChangeEvent = new CustomEvent('filterchange', { detail: { accountName } });
        this.dispatchEvent(filterChangeEvent);
    }
}
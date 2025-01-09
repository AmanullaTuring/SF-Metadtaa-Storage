import { LightningElement, api } from 'lwc';

export default class ContactTable extends LightningElement {
    @api contacts = []; // List of Contacts
    @api columns = [
        { label: 'Name', fieldName: 'Name', sortable: true },
        { label: 'Email', fieldName: 'Email', type: 'email', sortable: true },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' }
    ];

    handleSort(event) {
        const { fieldName: sortBy, sortDirection } = event.detail;
        const sortChangeEvent = new CustomEvent('sortchange', { detail: { sortBy, sortDirection } });
        this.dispatchEvent(sortChangeEvent);
    }
}
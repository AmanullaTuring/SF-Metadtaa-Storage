import { LightningElement, track, wire } from 'lwc';
import getGroupNames from '@salesforce/apex/ContactController.getGroupNames';
import getContactsByGroup from '@salesforce/apex/ContactController.getContactsByGroup';

export default class ContactList extends LightningElement {
    // Tracks the list of Contacts displayed in the table
    @track contacts = [];
    
    // Error state and message
    @track showError = false;
    @track errorMessage = '';

    // Default sorting field and direction
    @track sortBy = 'Name';
    @track sortDirection = 'asc';

    // Defines the columns for the datatable, enabling sorting on Name and Email
    columns = [
        {
            label: 'Name',
            fieldName: 'Name',
            sortable: true, // Enables sorting for this column
        },
        {
            label: 'Email',
            fieldName: 'Email',
            type: 'email',
            sortable: true, // Enables sorting for this column
        },
        {
            label: 'Phone',
            fieldName: 'Phone',
            type: 'phone', // No sorting required for this column
        },
    ];

      // Fetch group names dynamically
      @wire(getGroupNames)
      wiredGroups({ error, data }) {
          if (data) {
              this.groupOptions = data.map(account => ({
                  label: account,
                  value: account
              }));
              this.showError = false;
          } else if (error) {
              this.showError = true;
              this.errorMessage = 'Failed to fetch Account names.';
          }
      }

    /**
     * Wire service to fetch Contacts dynamically.
     * Defaults to a group (e.g., 'Default Account').
     */

    @wire(getContactsByGroup, { groupName: 'Default Account' })
    wiredContacts({ error, data }) {
        if (data) {
            // Apply default sorting on fetched data
            this.contacts = this.sortData(data, this.sortBy, this.sortDirection);
            this.showError = false;
        } else if (error) {
            this.showError = true;
            this.errorMessage = 'Failed to fetch Contacts.';
        }
    }

    /**
     * Handles the sorting logic triggered by the table's sortable headers.
     * @param {Object} event The event object containing sorting details.
     */
    handleSort(event) {
        const { fieldName: sortBy, sortDirection } = event.detail;
        this.sortBy = sortBy;
        this.sortDirection = sortDirection;

        // Sort the Contacts dynamically based on the selected column and direction
        this.contacts = this.sortData(this.contacts, sortBy, sortDirection);
    }

    /**
     * Sorts the data in a case-insensitive manner.
     * @param {Array} data The data to sort.
     * @param {String} fieldName The field to sort by.
     * @param {String} sortDirection The sorting direction ('asc' or 'desc').
     * @return {Array} Sorted data.
     */
    sortData(data, fieldName, sortDirection) {
        const sortedData = [...data];
        sortedData.sort((a, b) => {
            // Case-insensitive comparison of field values
            const valA = a[fieldName] ? a[fieldName].toLowerCase() : '';
            const valB = b[fieldName] ? b[fieldName].toLowerCase() : '';
            return sortDirection === 'asc'
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        });
        return sortedData;
    }
}
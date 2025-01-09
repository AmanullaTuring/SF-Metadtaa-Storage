import { LightningElement, track } from 'lwc';
import getContacts from '@salesforce/apex/ContactController.getContacts';

export default class ContactListParent extends LightningElement {
    @track contacts = []; // List of fetched contacts
    @track totalRecords = 0; // Total records for pagination
    @track currentPage = 1; // Current page number
    @track pageSize = 10; // Number of records per page
    @track sortBy = 'Name'; // Default sorting field
    @track sortDirection = 'asc'; // Default sorting direction
    @track selectedAccount = ''; // Selected account name for filtering
    @track showError = false; // Indicates if there's an error
    @track errorMessage = ''; // Error message to display

    connectedCallback() {
        // Fetch contacts when the component is initialized
        this.fetchContacts();
    }

    /**
     * Fetch Contacts with current filters, sorting, and pagination.
     */
    fetchContacts() {
        getContacts({
            accountName: this.selectedAccount,
            sortBy: this.sortBy,
            sortDirection: this.sortDirection,
            pageSize: this.pageSize,
            pageNumber: this.currentPage
        })
            .then(result => {
                // Populate the contacts and total records from the server response
                this.contacts = result.contacts;
                this.totalRecords = result.totalRecords;
                this.showError = false;
            })
            .catch(error => {
                // Handle errors by clearing data and showing an error message
                this.contacts = [];
                this.totalRecords = 0;
                this.showError = true;
                this.errorMessage = 'Failed to fetch contacts. Please try again.';
            });
    }

    /**
     * Handle search term changes from the search box.
     * @param {Event} event - The event containing the new search term.
     */
    handleSearchChange(event) {
        this.selectedAccount = event.detail.searchTerm; // Update the account name
        this.currentPage = 1; // Reset to the first page
        this.fetchContacts();
    }

    /**
     * Handle sorting changes from the table component.
     * @param {Event} event - The event containing sort details.
     */
    handleSortChange(event) {
        this.sortBy = event.detail.sortBy; // Update the sorting field
        this.sortDirection = event.detail.sortDirection; // Update the sorting direction
        this.fetchContacts();
    }

    /**
     * Handle pagination changes from the pagination controls.
     * @param {Event} event - The event containing the new page number.
     */
    handlePageChange(event) {
        this.currentPage = event.detail.pageNumber; // Update the current page
        this.fetchContacts();
    }
}
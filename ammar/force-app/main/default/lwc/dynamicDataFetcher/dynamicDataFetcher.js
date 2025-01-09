import { LightningElement, wire, track } from 'lwc';
import fetchRecords from '@salesforce/apex/DynamicDataFetcherController.fetchRecords';

export default class DynamicDataFetcher extends LightningElement {
    @track objectType = 'Account';  // Default object type
    @track filterName = '';         // Default filter value
    @track records = [];            // Array to hold fetched records
    @track columns = [];            // Columns for the datatable
    @track error = '';              // For displaying error messages
    @track currentPage = 1;         // Track current page
    recordsPerPage = 10;            // Number of records per page

    // Options for the object type dropdown
    objectOptions = [
        { label: 'Account', value: 'Account' },
        { label: 'Contact', value: 'Contact' },
        { label: 'Opportunity', value: 'Opportunity' }
    ];

    // Wire method to fetch data from Apex based on current parameters
    @wire(fetchRecords, { 
        objectType: '$objectType', 
        filterName: '$filterName', 
        offset: '$offset', 
        limits: '$recordsPerPage'  // Ensure it's 'limits' in Apex
    })
    wiredRecords({ error, data }) {
        if (data) {
            // Dynamically set columns based on object type
            if (this.objectType === 'Account') {
                this.columns = [
                    { label: 'Name', fieldName: 'Name' },
                    { label: 'Phone', fieldName: 'Phone' },
                    { label: 'Website', fieldName: 'Website' }
                ];
            } else if (this.objectType === 'Contact') {
                this.columns = [
                    { label: 'First Name', fieldName: 'FirstName' },
                    { label: 'Last Name', fieldName: 'LastName' },
                    { label: 'Email', fieldName: 'Email' },
                    { label: 'Phone', fieldName: 'Phone' }
                ];
            } else if (this.objectType === 'Opportunity') {
                this.columns = [
                    { label: 'Opportunity Name', fieldName: 'Name' },
                    { label: 'Amount', fieldName: 'Amount' },
                    { label: 'Close Date', fieldName: 'CloseDate' },
                    { label: 'Stage', fieldName: 'StageName' }
                ];
            }
            // Store the records
            this.records = data;
            this.error = ''; // Reset error on successful fetch
        } else if (error) {
            this.error = error.body.message; // Display error message
        }
        console.log('Data:', data);
        console.log('Error:', JSON.stringify(error));
    }

    // Handle object type change from dropdown
    handleObjectChange(event) {
        this.objectType = event.detail.value;
        this.currentPage = 1; // Reset to first page when changing object type
    }

    // Handle filter input change
    handleFilterChange(event) {
        this.filterName = event.detail.value;
        this.currentPage = 1; // Reset to first page when changing filter
    }

    // Calculate the offset for pagination
    get offset() {
        return (this.currentPage - 1) * this.recordsPerPage;
    }

    // Navigate to previous page
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    // Navigate to next page
    nextPage() {
        this.currentPage++;
    }

    // Check if it's the first page
    get isFirstPage() {
        return this.currentPage === 1;
    }

    // Check if it's the last page
    get isLastPage() {
        return this.records.length < this.recordsPerPage;
    }
}
import { LightningElement } from 'lwc';
import searchAccounts from '@salesforce/apex/ContactController.searchAccounts';

export default class SearchBox extends LightningElement {
    searchTimeout; // Timeout for debouncing API calls

    /**
     * Handle input in the search box and fetch matching accounts dynamically.
     * @param {Event} event - The input event from the search box.
     */
    handleSearchInput(event) {
        const searchTerm = event.target.value;

        // Clear any existing timeout to debounce API calls
        clearTimeout(this.searchTimeout);

        // Delay API call to optimize performance
        this.searchTimeout = setTimeout(() => {
            searchAccounts({ searchTerm })
                .then(() => {
                    // Dispatch event with the updated search term
                    const searchChangeEvent = new CustomEvent('searchchange', {
                        detail: { searchTerm }
                    });
                    this.dispatchEvent(searchChangeEvent);
                })
                .catch(error => {
                    console.error('Error fetching accounts:', error);
                });
        }, 300); // Debounce delay
    }
}
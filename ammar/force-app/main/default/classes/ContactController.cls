public with sharing class ContactController {

    /**
     * Fetch Account names dynamically based on search term.
     * @param searchTerm The term to search Account names.
     * @return List<String> of matching Account names.
     */
    @AuraEnabled(cacheable=true)
    public static List<String> searchAccounts(String searchTerm) {
        // Use a LIKE operator to search for account names containing the search term.
        String searchPattern = '%' + searchTerm + '%';

        // Query matching accounts
        List<Account> accounts = [
            SELECT Name 
            FROM Account 
            WHERE Name LIKE :searchPattern 
            ORDER BY Name 
            LIMIT 20
        ];

        // Collect Account names into a list of strings
        List<String> accountNames = new List<String>();
        for (Account acc : accounts) {
            accountNames.add(acc.Name);
        }
        
        return accountNames;
    }

    /**
     * Fetch Contacts based on filtering, sorting, and pagination parameters.
     * Handles dynamic sorting, filtering by Account Name, and pagination.
     * Fetches contacts where Account Name starts with the given input.
     */
    @AuraEnabled
    public static Map<String, Object> getContacts(String accountName, String sortBy, String sortDirection, Integer pageSize, Integer pageNumber) {
        if (String.isEmpty(accountName)) {
            throw new AuraHandledException('Account name is required.');
        }

        if (String.isEmpty(sortBy)) {
            sortBy = 'Name'; // Default sort field
        }

        if (String.isEmpty(sortDirection)) {
            sortDirection = 'asc'; // Default sort direction
        }

        if (pageSize <= 0) pageSize = 10; // Default page size
        if (pageNumber <= 0) pageNumber = 1; // Default page number

        // Use LIKE operator to find accounts starting with the input
        String searchPattern = accountName + '%';

        // Base query with dynamic sorting and filtering
        String query = 'SELECT Id, Name, Email, Phone FROM Contact WHERE Account.Name LIKE :searchPattern ORDER BY ' + sortBy + ' ' + sortDirection;

        // Calculate offset for pagination
        Integer offset = (pageNumber - 1) * pageSize;

        // Query contacts with limit and offset for pagination
        List<Contact> contacts = Database.query(query + ' LIMIT :pageSize OFFSET :offset');

        // Query the total number of records for pagination controls
        Integer totalRecords = [SELECT COUNT() FROM Contact WHERE Account.Name LIKE :searchPattern];

        // Prepare result map to include contacts and total records
        Map<String, Object> result = new Map<String, Object>();
        result.put('contacts', contacts);
        result.put('totalRecords', totalRecords);

        return result;
    }
}
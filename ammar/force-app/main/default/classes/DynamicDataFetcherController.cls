public with sharing class DynamicDataFetcherController {

    /**
     * Fetch records dynamically for Account, Contact, or Opportunity
     * Supports filtering by Name and pagination using OFFSET and LIMIT.
     * 
     * @param objectType - The object type to query (Account, Contact, Opportunity)
     * @param filterName - The name filter criteria
     * @param offset - The offset for pagination
     * @param limits - The number of records to fetch per page
     * @return List<SObject> - List of records for the selected object type
     */
    @AuraEnabled(cacheable=true)
    public static List<SObject> fetchRecords(String objectType, String filterName, Integer offset, Integer limits) {
        // Ensure objectType is not null or empty
        if (String.isEmpty(objectType)) {
            throw new AuraHandledException('Object type cannot be null or empty.');
        }
    
        // Ensure offset and limits are provided and valid
        if (offset == null || offset < 0 || limits == null || limits <= 0) {
            throw new AuraHandledException('Offset and limits must be provided and must be positive integers.');
        }
    
        // Escape special characters in filterName to prevent SOQL injection
        if (String.isEmpty(filterName)) {
            filterName = '%';  // Default to '%' if no filter is provided
        } else {
            filterName = '%' + filterName + '%';  // Add wildcards for LIKE clause
        }
    
        String query = '';
        
        // Construct dynamic SOQL query based on selected object type
        if (objectType == 'Account') {
            query = 'SELECT Id, Name, Phone, Website FROM Account WHERE Name LIKE :filterName ORDER BY Name LIMIT :limits OFFSET :offset';
        } else if (objectType == 'Contact') {
            query = 'SELECT Id, FirstName, LastName, Email, Phone, AccountId FROM Contact WHERE Name LIKE :filterName ORDER BY Name LIMIT :limits OFFSET :offset';
        } else if (objectType == 'Opportunity') {
            query = 'SELECT Id, Name, Amount, CloseDate, StageName FROM Opportunity WHERE Name LIKE :filterName ORDER BY Name LIMIT :limits OFFSET :offset';
        } else {
            // Return empty list if objectType is invalid
            return new List<SObject>();
        }
    
        try {
            // Execute the query and return results
            return Database.query(query);
        } catch (Exception e) {
            // Log the exception and throw a handled exception for better error reporting
            System.debug('Error executing query: ' + e.getMessage());
            throw new AuraHandledException('Error fetching records: ' + e.getMessage());
        }
    }
}
public with sharing class SpecialsController {
    /**
     * Fetches the list of paths for today's specials.
     * @return List<String> - The paths of today's special menu items.
     */
    @AuraEnabled(cacheable=true)
    public static List<String> getSpecials() {
        // Mock implementation: Replace this with actual logic to fetch specials from objects or custom metadata
        return new List<String>{
            '/appetizers/spring-rolls',
            '/main-course/steak',
            '/desserts/cheesecake'
        };
    }
}
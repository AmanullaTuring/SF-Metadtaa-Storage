public with sharing class AlertPublisher {

    /**
     * Publishes a business alert by sending an email to the current user.
     * @param alertType The type of alert (e.g., Transaction, Account Update).
     * @param priority The priority of the alert (High, Medium, Low).
     * @param message The message content of the alert.
     */
    @AuraEnabled
    public static void publishAlert(String alertType, String priority, String message) {
        // Validate that all parameters are provided
        if (String.isBlank(alertType) || String.isBlank(priority) || String.isBlank(message)) {
            throw new AuraHandledException('All parameters must be provided.');
        }

        // Fetch the current user's email
        User currentUser = [SELECT Id, Email FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        String currentUserEmail = currentUser.Email;

        // Validate that the email exists
        if (String.isBlank(currentUserEmail)) {
            throw new AuraHandledException('The current user does not have an email address defined.');
        }

        // Attempt to send an email alert to the current user
        try {
            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            email.setToAddresses(new List<String>{ currentUserEmail });
            email.setSubject('Business Alert: ' + alertType);
            email.setPlainTextBody(
                'Priority: ' + priority +
                '\nMessage: ' + message
            );
            //Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{ email });
        } catch (Exception e) {
            // Provide a descriptive error message if email fails
            throw new AuraHandledException('Error sending email: ' + e.getMessage());
        }
    }
}
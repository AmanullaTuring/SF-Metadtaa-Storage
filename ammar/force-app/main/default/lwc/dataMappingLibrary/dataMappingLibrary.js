import { LightningElement, track, wire } from 'lwc';
import getMarketingFields from '@salesforce/apex/FieldMappingController.getMarketingFields';
import getLeadFields from '@salesforce/apex/FieldMappingController.getLeadFields';
import getCurrentMappings from '@salesforce/apex/FieldMappingController.getCurrentMappings';
import saveMappings from '@salesforce/apex/FieldMappingController.saveMappings';
import validateData from '@salesforce/apex/FieldMappingController.validateData';

import getTemplates from '@salesforce/apex/FieldMappingController.getTemplates';
import getTemplateData from '@salesforce/apex/FieldMappingController.getTemplateData';
import saveTemplate from '@salesforce/apex/FieldMappingController.saveTemplate';

export default class DataMappingLibrary extends LightningElement {
    // Field data
    @track marketingFields = []; 
    @track leadFields = [];
    @track currentMappings = [];

    // Selected fields
    @track selectedMarketingField = '';
    @track selectedLeadField = '';

    // UI feedback
    @track showSuccessMessage = false;
    @track errorMessage = '';

    // Templates
    @track templates = [];            // Array of {label, value} for templates
    @track selectedTemplateId = '';   // Currently selected template
    @track showTemplateNamePrompt = false;

    // Wire calls to load data
    @wire(getMarketingFields)
    wiredMktFields({data, error}) {
        if (data) {
            this.marketingFields = data;
        } else if (error) {
            this.errorMessage = 'Error retrieving marketing fields.';
        }
    }

    @wire(getLeadFields)
    wiredLdFields({data, error}) {
        if (data) {
            this.leadFields = data;
        } else if (error) {
            this.errorMessage = 'Error retrieving lead fields.';
        }
    }

    @wire(getCurrentMappings)
    wiredCurrentMappings({data, error}) {
        if (data) {
            this.currentMappings = data;
        } else if (error) {
            this.errorMessage = 'Error retrieving existing mappings.';
        }
    }

    @wire(getTemplates)
    wiredTemplates({data, error}) {
        if (data) {
            this.templates = data; // [{label, value}]
        } else if (error) {
            this.errorMessage = 'Error retrieving templates.';
        }
    }

    // Computed properties for comboboxes
    get marketingFieldOptions() {
        return this.marketingFields;
    }

    get leadFieldOptions() {
        return this.leadFields.map(f => {
            return { label: f.label, value: f.value };
        });
    }

    get templateOptions() {
        return this.templates;
    }

    // Buttons states
    get disableAddButton() {
        return !(this.selectedMarketingField && this.selectedLeadField);
    }

    get disableApplyTemplateButton() {
        return !this.selectedTemplateId;
    }

    // Mappings count checks
    get hasMappings() {
        return this.currentMappings.length > 0;
    }

    get noMappings() {
        return this.currentMappings.length === 0;
    }

    get totalLeadFieldsCount() {
        return this.leadFields.length;
    }

    get currentMappingsCount() {
        return this.currentMappings.length;
    }

    // Handlers for field selection
    handleMarketingFieldChange(event) {
        this.selectedMarketingField = event.detail.value;
        this.clearMessages();
    }

    handleLeadFieldChange(event) {
        this.selectedLeadField = event.detail.value;
        this.clearMessages();
    }

    // Add a new mapping
    handleAddMapping() {
        const exists = this.currentMappings.find(m => m.mktField === this.selectedMarketingField);
        if (exists) {
            this.errorMessage = 'This marketing field is already mapped.';
            return;
        }

        this.currentMappings = [
            ...this.currentMappings,
            { mktField: this.selectedMarketingField, leadField: this.selectedLeadField }
        ];

        // Reset selections
        this.selectedMarketingField = '';
        this.selectedLeadField = '';
        this.clearMessages();
    }

    // Save mappings after validation
    handleSaveMappings() {
        this.clearMessages();
        let mappingObj = this.convertToMappingObj();

        validateData({ fieldMappings: mappingObj })
            .then(validationErrorMsg => {
                if (validationErrorMsg) {
                    this.errorMessage = validationErrorMsg;
                } else {
                    return saveMappings({ fieldMappings: mappingObj });
                }
            })
            .then(() => {
                if (!this.errorMessage) {
                    this.showSuccessMessage = true;
                }
            })
            .catch(error => {
                this.errorMessage = 'Error saving mappings: ' + (error.body ? error.body.message : error);
            });
    }

    // Template handling
    handleTemplateChange(event) {
        this.selectedTemplateId = event.detail.value;
        this.clearMessages();
    }

    handleApplyTemplate() {
        this.clearMessages();
        if (!this.selectedTemplateId) {
            return; // No template selected
        }

        getTemplateData({ templateId: this.selectedTemplateId })
            .then(jsonData => {
                // jsonData is a serialized map {mktField: leadField}
                const templateMappings = JSON.parse(jsonData);
                // Convert to array of {mktField, leadField}
                const newMappings = [];
                for (let key in templateMappings) {
                    newMappings.push({ mktField: key, leadField: templateMappings[key] });
                }
                this.currentMappings = newMappings;
            })
            .catch(error => {
                this.errorMessage = 'Error applying template: ' + (error.body ? error.body.message : error);
            });
    }

    handleSaveAsTemplate() {
        // Prompt user for a template name (for simplicity, just prompt using window.prompt)
        // In a real scenario, you'd use a lightning modal or input
        const templateName = window.prompt('Enter a name for the template:');
        if (!templateName || templateName.trim() === '') {
            return; // User cancelled or empty name
        }

        let mappingObj = this.convertToMappingObj();
        saveTemplate({ templateName: templateName.trim(), mappings: mappingObj })
            .then(() => {
                this.showSuccessMessage = true;
                // Refresh templates list
                return getTemplates();
            })
            .then(data => {
                if (data) {
                    this.templates = data;
                }
            })
            .catch(error => {
                this.errorMessage = 'Error saving template: ' + (error.body ? error.body.message : error);
            });
    }

    convertToMappingObj() {
        let mappingObj = {};
        this.currentMappings.forEach(m => {
            mappingObj[m.mktField] = m.leadField;
        });
        return mappingObj;
    }

    clearMessages() {
        this.showSuccessMessage = false;
        this.errorMessage = '';
    }
}
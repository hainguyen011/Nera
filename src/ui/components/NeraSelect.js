/**
 * NeraSelect - Modern Custom Select Component
 * Transforms native <select> into a premium UI component.
 */

export class NeraSelect {
    constructor(selectElement) {
        if (!selectElement) return;
        this.nativeSelect = selectElement;
        this.options = Array.from(this.nativeSelect.options);
        this.container = null;
        this.trigger = null;
        this.optionsList = null;
        this.isOpen = false;

        this.init();
    }

    init() {
        // Create custom structure
        this.container = document.createElement('div');
        this.container.className = 'nera-select-container';

        // Trigger
        this.trigger = document.createElement('div');
        this.trigger.className = 'nera-select-trigger';
        this.updateTriggerText();

        // Options list
        this.optionsList = document.createElement('div');
        this.optionsList.className = 'nera-select-options';

        this.options.forEach(option => {
            const optDiv = document.createElement('div');
            optDiv.className = 'nera-select-option';
            if (option.selected) optDiv.classList.add('selected');
            optDiv.innerText = option.innerText;
            optDiv.dataset.value = option.value;

            optDiv.onclick = (e) => {
                e.stopPropagation();
                this.select(option.value);
                this.close();
            };

            this.optionsList.appendChild(optDiv);
        });

        // Assemble
        this.container.appendChild(this.trigger);
        this.container.appendChild(this.optionsList);

        // Hide native, insert custom
        this.nativeSelect.classList.add('nera-select-native');
        this.nativeSelect.parentNode.insertBefore(this.container, this.nativeSelect);
        this.container.appendChild(this.nativeSelect);

        // Listeners
        this.trigger.onclick = (e) => {
            e.stopPropagation();
            this.toggle();
        };

        // Close when clicking outside
        document.addEventListener('click', () => this.close());
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    open() {
        // Close all other NeraSelects first
        document.querySelectorAll('.nera-select-container.open').forEach(el => {
            el.classList.remove('open');
        });
        
        this.isOpen = true;
        this.container.classList.add('open');
    }

    close() {
        this.isOpen = false;
        this.container.classList.remove('open');
    }

    select(value) {
        this.nativeSelect.value = value;
        // Trigger native change event
        this.nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        
        this.updateTriggerText();
        this.updateOptionsList();
    }

    updateTriggerText() {
        const selectedOption = this.nativeSelect.options[this.nativeSelect.selectedIndex];
        this.trigger.innerText = selectedOption ? selectedOption.innerText : 'Select...';
    }

    updateOptionsList() {
        const val = this.nativeSelect.value;
        this.optionsList.querySelectorAll('.nera-select-option').forEach(opt => {
            if (opt.dataset.value === val) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
    }

    refresh() {
        // Clear current options list
        this.optionsList.innerHTML = '';
        this.options = Array.from(this.nativeSelect.options);

        this.options.forEach(option => {
            const optDiv = document.createElement('div');
            optDiv.className = 'nera-select-option';
            if (option.selected) optDiv.classList.add('selected');
            optDiv.innerText = option.innerText;
            optDiv.dataset.value = option.value;

            optDiv.onclick = (e) => {
                e.stopPropagation();
                this.select(option.value);
                this.close();
            };

            this.optionsList.appendChild(optDiv);
        });

        this.updateTriggerText();
    }

    /**
     * Static helper to init all selects with a specific class
     */
    static createAll(selector = 'select.nera-modern') {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map(el => new NeraSelect(el));
    }
}

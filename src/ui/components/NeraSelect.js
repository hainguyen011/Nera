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
        
        const label = document.createElement('span');
        label.className = 'nera-select-label';
        this.trigger.appendChild(label);

        const arrow = document.createElement('div');
        arrow.className = 'nera-select-arrow';
        arrow.innerHTML = `
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        `;
        this.trigger.appendChild(arrow);

        this.updateTriggerText();

        // Options list
        this.optionsList = document.createElement('div');
        this.optionsList.className = 'nera-select-options';

        this.renderOptions();

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
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.close();
            }
        });
    }

    renderOptions() {
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
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    open() {
        // Close all other NeraSelects first
        document.querySelectorAll('.nera-select-container.open').forEach(el => {
            if (el !== this.container) {
                el.classList.remove('open');
            }
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
        const label = this.trigger.querySelector('.nera-select-label');
        if (label) {
            label.innerText = selectedOption ? selectedOption.innerText : 'Select...';
        }
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
        this.renderOptions();
        this.updateTriggerText();
    }

    /**
     * Static helper to init all selects
     */
    static createAll(selector = 'select') {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map(el => {
            // Avoid double initialization
            if (el.classList.contains('nera-select-native')) return null;
            return new NeraSelect(el);
        }).filter(Boolean);
    }
}

// DOM Elements
const form = document.getElementById('leadForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const titlesInput = document.getElementById('titles');
const locationInput = document.getElementById('location');
const purposeInput = document.getElementById('purpose');
const keywordsInput = document.getElementById('keywords');
const orgLocationInput = document.getElementById('orgLocation');
const seniorityInput = document.getElementById('seniority');
const generateBtn = document.getElementById('generateBtn');
const saveInputsBtn = document.getElementById('saveInputsBtn');
const savedInputsSection = document.getElementById('savedInputsSection');
const savedInputsList = document.getElementById('savedInputsList');
const logo = document.getElementById('logo');

// Check if logo exists, hide if not
logo.onerror = function() {
    this.classList.add('hidden');
};


// Validate required fields and show/hide Generate button
function validateForm() {
    const requiredFields = [
        nameInput,
        emailInput,
        titlesInput,
        locationInput,
        purposeInput,
        orgLocationInput,
        seniorityInput
    ];

    // Check if all required fields are filled
    const allFilled = requiredFields.every(field => {
        if (field.type === 'email') {
            return field.value.trim() !== '' && field.validity.valid;
        }
        return field.value.trim() !== '';
    });

    // Show/hide Generate button
    if (allFilled) {
        generateBtn.style.display = 'block';
    } else {
        generateBtn.style.display = 'none';
    }
}

// Add event listeners to all inputs
[nameInput, emailInput, titlesInput, locationInput, purposeInput, keywordsInput,
 orgLocationInput, seniorityInput].forEach(input => {
    input.addEventListener('input', validateForm);
    input.addEventListener('change', validateForm);
    input.addEventListener('blur', validateForm);
});

// Initial validation
validateForm();

// Save inputs to localStorage
function saveInputs() {
    const formData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        titles: titlesInput.value.trim(),
        location: locationInput.value.trim(),
        purpose: purposeInput.value.trim(),
        keywords: keywordsInput.value.trim(),
        orgLocation: orgLocationInput.value.trim(),
        seniority: seniorityInput.value.trim(),
        timestamp: new Date().toISOString()
    };

    // Check if at least one field has value
    const hasValues = Object.values(formData).some((value, index) => {
        // Skip timestamp
        return index < Object.keys(formData).length - 1 && value !== '';
    });

    if (!hasValues) {
        alert('Please fill in at least one field before saving.');
        return;
    }

    // Get existing saved inputs
    let savedInputs = JSON.parse(localStorage.getItem('savedInputs') || '[]');
    
    // Add new saved input
    savedInputs.push(formData);
    
    // Keep only last 10 saved inputs
    if (savedInputs.length > 10) {
        savedInputs = savedInputs.slice(-10);
    }
    
    // Save to localStorage
    localStorage.setItem('savedInputs', JSON.stringify(savedInputs));
    
    // Update UI
    displaySavedInputs();
    
    // Show success message
    showMessage('Inputs saved successfully!', 'success');
}

// Load saved inputs from localStorage
function loadSavedInputs() {
    const savedInputs = JSON.parse(localStorage.getItem('savedInputs') || '[]');
    return savedInputs;
}

// Display saved inputs
function displaySavedInputs() {
    const savedInputs = loadSavedInputs();
    
    if (savedInputs.length === 0) {
        savedInputsSection.style.display = 'none';
        return;
    }
    
    savedInputsSection.style.display = 'block';
    savedInputsList.innerHTML = '';
    
    // Display in reverse order (newest first)
    savedInputs.reverse().forEach((input, index) => {
        const card = document.createElement('div');
        card.className = 'saved-input-card';
        
        const date = new Date(input.timestamp);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        card.innerHTML = `
            <h3>Saved Input ${savedInputs.length - index} - ${dateStr}</h3>
            <p><strong>Name:</strong> ${input.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${input.email || 'N/A'}</p>
            <p><strong>Title:</strong> ${input.titles || 'N/A'}</p>
            <p><strong>Location:</strong> ${input.location || 'N/A'}</p>
            <div class="actions">
                <button class="btn btn-primary btn-small" onclick="useSavedInput(${savedInputs.length - 1 - index})">Use</button>
                <button class="btn btn-danger btn-small" onclick="deleteSavedInput(${savedInputs.length - 1 - index})">Delete</button>
            </div>
        `;
        
        savedInputsList.appendChild(card);
    });
}

// Use saved input
function useSavedInput(index) {
    const savedInputs = loadSavedInputs();
    const input = savedInputs[index];
    
    if (!input) return;
    
    nameInput.value = input.name || '';
    emailInput.value = input.email || '';
    titlesInput.value = input.titles || '';
    locationInput.value = input.location || '';
    purposeInput.value = input.purpose || '';
    keywordsInput.value = input.keywords || '';
    orgLocationInput.value = input.orgLocation || '';
    seniorityInput.value = input.seniority || '';
    
    // Validate form
    validateForm();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showMessage('Saved input loaded!', 'success');
}

// Delete saved input
function deleteSavedInput(index) {
    if (!confirm('Are you sure you want to delete this saved input?')) {
        return;
    }
    
    let savedInputs = loadSavedInputs();
    savedInputs.splice(index, 1);
    localStorage.setItem('savedInputs', JSON.stringify(savedInputs));
    
    displaySavedInputs();
    showMessage('Saved input deleted!', 'success');
}

// Make functions globally available
window.useSavedInput = useSavedInput;
window.deleteSavedInput = deleteSavedInput;

// Show message
function showMessage(text, type = 'success') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = type === 'success' ? 'success-message' : 'error-message';
    message.textContent = text;
    
    form.insertBefore(message, form.firstChild);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Handle form submission using fetch with JSON (works on Vercel and with local server)
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Prepare webhook data - matching exact webhook JSON format
    // Mapping: email → email, name → Name, titles → Titles, keywords → Keywords, 
    // location → location, seniority → Seniority, orgLocation → 'Organization Location', 
    // purpose → 'Job Description', message → Message
    // Note: Frontend shows "Industry" (maps to Keywords in webhook) and "Purpose" (maps to Job Description)
    // IMPORTANT: Industry field (keywordsInput) maps to Keywords, Purpose (purposeInput) maps to Job Description (separate fields)
    
    // Get values directly from DOM elements at submission time to ensure accuracy
    const keywordsElement = document.getElementById('keywords');
    const purposeElement = document.getElementById('purpose');
    
    // Get the actual values - Industry field maps to Keywords, Purpose maps to Job Description
    const keywordsValue = keywordsElement ? keywordsElement.value.trim() : '';
    const purposeValue = purposeElement ? purposeElement.value.trim() : '';
    
    // Debug: Log the raw values before processing
    console.log('=== DEBUG: Field Values ===');
    console.log('Industry field (keywordsElement) found:', !!keywordsElement);
    console.log('Purpose field (purposeElement) found:', !!purposeElement);
    console.log('Industry field value (raw):', keywordsElement ? keywordsElement.value : 'ELEMENT NOT FOUND');
    console.log('Purpose field value (raw):', purposeElement ? purposeElement.value : 'ELEMENT NOT FOUND');
    console.log('Industry value (trimmed):', keywordsValue);
    console.log('Purpose value (trimmed):', purposeValue);
    
    const webhookData = {
        email: emailInput.value.trim().toLowerCase(),
        Name: nameInput.value.trim(),
        Titles: titlesInput.value.trim(), // Singular input (title) → Plural output (Titles)
        Keywords: keywordsValue, // Industry field (keywordsInput) maps to Keywords in webhook (NOT purpose)
        location: locationInput.value.trim(),
        Seniority: seniorityInput.value.trim(),
        'Organization Location': orgLocationInput.value.trim(), // orgLocation → 'Organization Location'
        'Job Description': purposeValue, // Purpose from purposeInput field ONLY (NOT keywords)
        Message: '' // Message field removed from frontend
    };
    
    // Debug: Verify the final webhook data
    console.log('=== Final Webhook Data ===');
    console.log('Keywords (from Industry field) in webhook:', webhookData.Keywords);
    console.log('Job Description (from Purpose field) in webhook:', webhookData['Job Description']);
    console.log('Full webhook data:', JSON.stringify(webhookData, null, 2));
    
    // Show loading state
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    
    try {
        const webhookUrl = 'https://toobasparkai.app.n8n.cloud/webhook/gener';
        
        // Check if running from file:// protocol (only needed for local testing)
        if (window.location.protocol === 'file:') {
            showMessage('⚠️ For local testing, use a server: npx --yes http-server -p 8080 -o\nOnce deployed to Vercel, this will work automatically!', 'error');
            generateBtn.classList.remove('loading');
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Leads';
            return;
        }
        
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData)
        });
        
        if (response.ok) {
            // Redirect to result page with data
            const params = new URLSearchParams({
                name: webhookData.Name,
                email: webhookData.email,
                titles: webhookData.Titles,
                location: webhookData.location,
                seniority: webhookData.Seniority
            });
            
            window.location.href = `result.html?${params.toString()}`;
        } else {
            throw new Error('Webhook request failed');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to generate leads. Please try again.', 'error');
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Leads';
    }
});

// Event listener for save button
saveInputsBtn.addEventListener('click', saveInputs);

// Load and display saved inputs on page load
displaySavedInputs();


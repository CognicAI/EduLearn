document.addEventListener('DOMContentLoaded', function () {
    const backendTypeSelect = document.getElementById('backendType');
    const webhookUrlInput = document.getElementById('webhookUrl');
    const saveConfigButton = document.getElementById('saveConfig');
    const statusMessage = document.getElementById('statusMessage');
    const webhookGroup = document.getElementById('webhookGroup');
    const localBackendInfo = document.getElementById('localBackendInfo');
    const webhookWarning = document.getElementById('webhookWarning');
  
    // Load saved configuration
    chrome.storage.local.get(['backendType', 'webhookUrl'], function (result) {
      const backendType = result.backendType || 'local';
      backendTypeSelect.value = backendType;
      
      if (result.webhookUrl) {
        webhookUrlInput.value = result.webhookUrl;
      } else {
        // Set default webhook URL
        webhookUrlInput.value = 'https://harsha1234.app.n8n.cloud/webhook/user-query';
      }
      
      updateUIBasedOnBackendType(backendType);
    });

    // Handle backend type changes
    backendTypeSelect.addEventListener('change', function() {
      updateUIBasedOnBackendType(this.value);
    });

    function updateUIBasedOnBackendType(backendType) {
      if (backendType === 'local') {
        webhookGroup.style.display = 'none';
        localBackendInfo.style.display = 'block';
        webhookWarning.style.display = 'none';
      } else {
        webhookGroup.style.display = 'block';
        localBackendInfo.style.display = 'none';
        webhookWarning.style.display = 'block';
      }
    }
  
    // Save configuration
    saveConfigButton.addEventListener('click', function () {
      const backendType = backendTypeSelect.value;
      const webhookUrl = webhookUrlInput.value.trim();
      
      if (backendType === 'webhook' && !webhookUrl) {
        statusMessage.textContent = 'Please enter a webhook URL for external webhook mode.';
        statusMessage.style.color = 'red';
        setTimeout(() => { statusMessage.textContent = ''; }, 5000);
        return;
      }
      
      // Validate webhook URL if in webhook mode
      if (backendType === 'webhook') {
        try {
          let parsedUrl = new URL(webhookUrl);
          if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
              throw new Error("Webhook URL must start with http:// or https://");
          }
        } catch (e) {
          statusMessage.textContent = `Invalid Webhook URL: ${e.message}. Please enter a valid URL.`;
          statusMessage.style.color = 'red';
          setTimeout(() => { statusMessage.textContent = ''; }, 5000);
          return;
        }
      }
        
      chrome.storage.local.set({ 
        backendType: backendType,
        webhookUrl: webhookUrl 
      }, function () {
        const configType = backendType === 'local' ? 'Local Backend' : 'External Webhook';
        statusMessage.textContent = `EduLearn chatbot configuration saved successfully! Using: ${configType}`;
        statusMessage.style.color = 'green';
        setTimeout(() => { statusMessage.textContent = ''; }, 3000);
      });
    });
  });
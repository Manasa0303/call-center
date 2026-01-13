document.getElementById('callForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const ngrokUrl = document.getElementById('ngrokUrl').value.trim();
    const targetNumber = document.getElementById('targetNumber').value.trim();
    const btn = document.getElementById('callBtn');
    const statusDiv = document.getElementById('statusMessage');

    if (!ngrokUrl) {
        showStatus('Please enter your Ngrok URL.', 'error');
        return;
    }

    // Prepare UI
    btn.disabled = true;
    btn.innerHTML = '<span class="icon">⌛</span> Initiating...';
    statusDiv.classList.add('hidden');

    try {
        const response = await fetch('/api/call', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                answerUrl: ngrokUrl,
                targetNumber: targetNumber
            })
        });

        const data = await response.json();

        if (response.ok) {
            showStatus(`✅ Call Initiated! UUID: ${data.data.requestUuid}`, 'success');
        } else {
            showStatus(`❌ Error: ${data.error}`, 'error');
        }

    } catch (err) {
        showStatus(`❌ Network Error: ${err.message}`, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span class="icon">📲</span> Make Call';
    }
});

function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`; // reset classes
}

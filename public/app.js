const baseURL = 'http://localhost:8001/photos/upload/';

document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
        const response = await fetch(baseURL, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('response').innerText = `Upload started. Checking status...`;
            await checkUploadStatus(Date.now()); // Await the function to complete long polling
        } else {
            document.getElementById('response').innerText = `Error: ${JSON.stringify(result)}`;
        }
    } catch (error) {
        document.getElementById('response').innerText = `Error: ${error.message}`;
    }
});

async function checkUploadStatus(startTime) {
    try {
        const response = await fetch(baseURL, {
            method: 'GET',
        });

        const result = await response.json();
        console.log(result);

        if (response.ok) {
            if (result.status === 'pending') {
                // Check if 30 seconds have passed
                if (Date.now() - startTime < 30000) { // 30000ms = 30 seconds
                    setTimeout(() => checkUploadStatus(startTime), 1000); // Polling interval: 1000ms (1 second)
                } else {
                    document.getElementById('response').innerText = 'Error: Upload status check timed out.';
                    alert('Error: Upload status check timed out.');
                }
            } else {
                // If the status is final (success or error), display it
                document.getElementById('response').innerText = `Upload status: ${result.status}`;
                if (result.status === 'success') {
                    alert('Image saved successfully!');
                    location.reload(); // Reload the page after successful upload
                } else {
                    alert('Error saving image');
                }
            }
        } else {
            document.getElementById('response').innerText = `Error: ${JSON.stringify(result)}`;
            alert('Error fetching upload status');
        }
    } catch (error) {
        document.getElementById('response').innerText = `Error: ${error.message}`;
    }
}

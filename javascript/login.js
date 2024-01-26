function submitForm(event) {
    event.preventDefault();

    // Get form values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Perform validation (you may want to add more validation checks)
    if (!email || !password) {
        alert("Please enter both email and password");
        return;
    }

    // Create an object with the form data (you can send this data to the server)
    const formData = {
        email: email,
        password: password,
    };

    // Display form data (for demonstration purposes)
    console.log(formData);

    // You can add code here to send the form data to the server using AJAX or fetch
    // Example: fetch('your-server-endpoint', { method: 'POST', body: JSON.stringify(formData) })
}
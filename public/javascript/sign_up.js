function submitForm(event) {
    event.preventDefault();

    // Get form values
    const fName = document.getElementById('fName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // const confirmPassword = document.getElementById('confirmPassword').value;

    // Perform validation (you may want to add more validation checks)
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }


    // Create an object with the form data (you can send this data to the server)
    const formData = {
        fname: fName,
        email: email,
        password: password,
    };

    // Display form data (for demonstration purposes)
    console.log(formData);

    // You can add code here to send the form data to the server using AJAX or fetch
    // Example: fetch('your-server-endpoint', { method: 'POST', body: JSON.stringify(formData) })
}
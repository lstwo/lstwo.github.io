function initializeCookieConsent() {
    const consentElement = document.getElementById('cookie-consent');
    
    if (consentElement) {
        document.getElementById('cookie-consent-accept').addEventListener('click', function() {
            document.getElementById('cookie-consent').style.display = 'none';
            document.getElementById('cookie-consent-overlay').remove();  // Remove the overlay from the DOM

            // Re-enable scrolling
            document.body.style.overflow = 'auto';
        });

        document.getElementById('cookie-consent-reject').addEventListener('click', function() {
            alert("You rejected cookies, the website will now close.");
            window.location.href = "about:blank";  // Redirects to a blank page, effectively closing the website.
        });

        document.getElementById('cookie-consent-customize').addEventListener('click', function() {
            window.location.reload();
        });

        document.getElementById('cookie-consent-more-info').addEventListener('click', function() {
            alert("There is no more information. This is all you get.");
            window.location.reload();
        });

        // Disable scrolling while the cookie consent is visible
        document.body.style.overflow = 'hidden';
    } else {
        // If the consentElement doesn't exist, try again after a short delay.
        setTimeout(initializeCookieConsent, 100);  // Try again in 100ms
    }
}

// Call the function to initialize the event listeners.
initializeCookieConsent();

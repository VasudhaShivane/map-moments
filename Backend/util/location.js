async function getCoordsForAddress(address) {
    if (!address) {
        throw new Error('Address not provided!');
    }

    // Simulate an API call delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ 
                lat: 40.345678, 
                lng: -34.34566
            });
        }, 1000); // 1-second delay
    });
}


module.exports = getCoordsForAddress;

async function test() {
    try {
        const response = await fetch("https://restcountries.com/v3.1/alpha/us?fields=name,translations");
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));

        // Check if translations.spa exists
        const country = Array.isArray(data) ? data[0] : data;
        if (country.translations && country.translations.spa) {
            console.log("Spanish Translation found:", country.translations.spa.common);
        } else {
            console.log("Spanish Translation NOT found");
            console.log("Keys:", Object.keys(country.translations || {}));
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

test();

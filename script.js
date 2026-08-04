const boardUrls = {
    biselahore: "https://result.biselahore.com/",
    biserwp: "https://biserawalpindi.edu.pk/",
    bisemultan: "https://web.bisemultan.edu.pk/",
    bisefsd: "http://result.bisefsd.edu.pk/",
    bisegrw: "https://bisegrw.edu.pk/",
    bisesgd: "https://bisesargodha.edu.pk/",
    bisebwp: "https://bisebwp.edu.pk/",
    bisesal: "https://bisesahiwal.edu.pk/",
    bisedgk: "https://bisedgkhan.edu.pk/"
};

document.getElementById('searchForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const selectedBoard = document.getElementById('board').value;
    const selectedClass = document.getElementById('class').value;
    const rollNo = document.getElementById('rollNo').value;

    const loader = document.getElementById('loader');
    const output = document.getElementById('output');
    const searchBtn = document.getElementById('btn');

    // Validation add ki
    if (!selectedBoard) {
        alert("Please select a Board first");
        return;
    }

    output.classList.add('hidden');
    loader.classList.remove('hidden');
    searchBtn.disabled = true;

    try {
        // encodeURIComponent add kiya
        const apiUrl = `/api/check?board=${encodeURIComponent(selectedBoard)}&class=${encodeURIComponent(selectedClass)}&rollNo=${encodeURIComponent(rollNo)}`;
        
        const response = await fetch(apiUrl);

        // Agar API 500/404 de to catch mein jaye
        if (!response.ok) throw new Error("API response not ok");

        const data = await response.json();

        loader.classList.add('hidden');
        searchBtn.disabled = false;

        const officialUrl = boardUrls[selectedBoard];

        if (data.success) {
            output.innerHTML = `
                <p><strong>Status:</strong> Connection Established</p>
                <p><strong>Student Name:</strong> ${data.name}</p>
                <p><strong>Roll No:</strong> ${rollNo}</p>
                <p><strong>Class:</strong> ${selectedClass}</p>
                <p><strong>Marks/Status:</strong> ${data.marks}</p>
                <a href="${officialUrl}" target="_blank" class="redirect-btn">View Detailed Sheet on Board Site</a>
            `;
        } else {
            output.innerHTML = `
                <p style="color: #ffa500;"><strong>Status:</strong> Security Handshake Required</p>
                <p>The board's server requires manual verification or is currently busy.</p>
                <p><strong>Board:</strong> ${selectedBoard.toUpperCase()}</p>
                <p><strong>Roll No:</strong> ${rollNo}</p>
                <a href="${officialUrl}" target="_blank" class="redirect-btn" style="background-color: #d97706;">Verify & Search on Official Portal</a>
            `;
        }
    } catch (error) {
        console.error("API Error:", error); // debug ke liye
        loader.classList.add('hidden');
        searchBtn.disabled = false;

        const officialUrl = boardUrls[selectedBoard];
        output.innerHTML = `
            <p style="color: #ff4a4a;"><strong>Connection Error:</strong> Unable to reach API.</p>
            <p>Please search directly on the official board server below:</p>
            <a href="${officialUrl}" target="_blank" class="redirect-btn">Go to Official Portal</a>
        `;
    }

    output.classList.remove('hidden');
});

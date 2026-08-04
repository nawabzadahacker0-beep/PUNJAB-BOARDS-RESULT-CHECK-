const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
   
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { board, class: selectedClass, rollNo } = req.query;

    if (!board || !rollNo) {
        return res.status(400).json({ success: false, message: "Missing board or rollNo parameter." });
    }

    try {
        if (board === 'biselahore') { // <-- yahan { add kiya
           
            // Step 1: Pehle page load karo taake VIEWSTATE mil jaye
            const page = await axios.get(`https://result.biselahore.com/Search.aspx`, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                timeout: 8000
            });

            const $ = cheerio.load(page.data);
            const viewstate = $('#__VIEWSTATE').val();
            const eventvalidation = $('#__EVENTVALIDATION').val();

            // Step 2: Ab POST karo tokens ke sath
            const response = await axios.post(`https://result.biselahore.com/Search.aspx`, 
                new URLSearchParams({
                    '__VIEWSTATE': viewstate,
                    '__EVENTVALIDATION': eventvalidation,
                    '__TextBoxRollNo': rollNo,
                    '__ButtonSearch': 'Search'
                }).toString(), 
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 8000
                }
            );

            const $2 = cheerio.load(response.data);
           
            const studentName = $2('#lblStudentName').text().trim();
            const marks = $2('#lblTotalMarks').text().trim();
            const fatherName = $2('#lblFatherName').text().trim();
            const status = $2('#lblStatus').text().trim();

            if (studentName) {
                return res.status(200).json({
                    success: true,
                    name: studentName,
                    father: fatherName,
                    marks: marks,
                    status: status
                });
            } else {
                return res.status(404).json({ 
                    success: false, 
                    message: "Record not found. Check roll number." 
                });
            }
        } // <-- yahan } 
        
        // Agar board biselahore nahi hai
        return res.status(200).json({ 
            success: false, 
            message: "Board portal requires manual verification. Use redirect." 
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Board server is busy or blocked scraping." 
        });
    }
};

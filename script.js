const API_URL =
    "https://uwqxsb2snf.execute-api.us-east-1.amazonaws.com";

async function loadEdition() {

    const technology = document.getElementById("technology");
    const generated = document.getElementById("generated");
    const content = document.getElementById("content");
    const status = document.getElementById("status");

    try {

        status.textContent = "Fetching latest edition...";

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const text = await response.text();

        if (!text.trim()) {
            throw new Error("Empty edition received");
        }

        renderEdition(text);

        status.textContent =
            "● Live • Latest edition loaded";

    } catch (error) {

        console.error(error);

        technology.textContent = "Unable to load";

        generated.textContent =
            "Could not connect to TECHPULSE";

        content.innerHTML = `
            <div class="loading">
                <strong>Connection problem</strong>
                <p>${error.message}</p>
                <p>Check the API Gateway connection and try again.</p>
            </div>
        `;

        status.textContent =
            "Connection failed";
    }
}


function renderEdition(text) {

    const lines = text.split("\n");

    let html = "";
    let currentSection = null;
    let question = "";
    let content = [];

    // Extract technology
    const technologyMatch =
        text.match(/Technology:\s*(.+)/);

    if (technologyMatch) {

        document.getElementById("technology").textContent =
            technologyMatch[1].trim();
    }


    // Extract generated time
    const generatedMatch =
        text.match(/Generated:\s*(.+)/);

    if (generatedMatch) {

        document.getElementById("generated").textContent =
            `Generated ${generatedMatch[1].trim()}`;
    }


    function closeSection() {

        if (!currentSection) return;

        html += `
            <section class="section">

                <h2>${currentSection}</h2>

                ${
                    question
                        ? `<div class="question">${question}</div>`
                        : ""
                }

                <div>
                    ${formatContent(content)}
                </div>

            </section>
        `;

        currentSection = null;
        question = "";
        content = [];
    }


    function formatContent(lines) {

        let result = "";
        let listItems = [];

        function closeList() {

            if (listItems.length === 0) return;

            result += "<ol>";

            listItems.forEach(item => {

                result += `<li>${item}</li>`;

            });

            result += "</ol>";

            listItems = [];
        }


        lines.forEach(line => {

            const trimmed = line.trim();

            if (!trimmed) return;


            // Numbered list
            if (/^\d+\.\s/.test(trimmed)) {

                listItems.push(
                    trimmed.replace(/^\d+\.\s/, "")
                );

                return;
            }


            closeList();


            // Connection arrows
            if (
                trimmed === "↓" ||
                trimmed === "→"
            ) {

                result +=
                    `<div class="connection">${trimmed}</div>`;

                return;
            }


            // Markdown bold
            const formatted =
                trimmed.replace(
                    /\*\*(.*?)\*\*/g,
                    "<strong>$1</strong>"
                );


            result += `<p>${formatted}</p>`;

        });


        closeList();

        return result;
    }


    lines.forEach(line => {

        const trimmed = line.trim();


        // Main title
        if (
            trimmed.startsWith("# ") &&
            !trimmed.startsWith("## ")
        ) {

            document.getElementById("technology").textContent =
                trimmed.substring(2);

            return;
        }


        // Section
        if (trimmed.startsWith("## ")) {

            closeSection();

            currentSection =
                trimmed.substring(3);

            return;
        }


        // Question
        if (
            trimmed.startsWith('"') &&
            trimmed.endsWith('"')
        ) {

            question = trimmed;

            return;
        }


        if (currentSection) {

            content.push(trimmed);

        }

    });


    closeSection();


    document.getElementById("content").innerHTML =
        html;
}


// Start TECHPULSE
loadEdition();
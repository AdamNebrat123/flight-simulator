export function createScenarioWindow() {
    const planes = [];

    const windowDiv = document.getElementById("scenarioWindow");
    windowDiv.classList.remove("hidden");
    windowDiv.innerHTML = ""; // Clear previous content if any

    const title = document.createElement("h3");
    title.innerText = "Trajectory Scenario Creator";
    title.style.marginBottom = "10px";
    windowDiv.appendChild(title);

    const addPlaneBtn = document.createElement("button");
    addPlaneBtn.innerText = "Add Plane";
    Object.assign(addPlaneBtn.style, {
        marginBottom: "10px",
        padding: "5px 10px",
        backgroundColor: "#007bff",
        border: "none",
        color: "white",
        borderRadius: "4px",
        cursor: "pointer"
    });

    windowDiv.appendChild(addPlaneBtn);

    const planesListDiv = document.createElement("div");
    planesListDiv.style.marginTop = "10px";
    windowDiv.appendChild(planesListDiv);

    addPlaneBtn.addEventListener("click", () => {
        const planeDiv = document.createElement("div");
        planeDiv.style.marginBottom = "10px";
        planeDiv.style.borderTop = "1px solid #ccc";
        planeDiv.style.paddingTop = "10px";

        const nameInput = document.createElement("input");
        nameInput.placeholder = "Plane name";
        nameInput.style.marginRight = "5px";

        const speedInput = document.createElement("input");
        speedInput.placeholder = "Speed (m/s)";
        speedInput.type = "number";
        speedInput.style.marginRight = "5px";

        const createBtn = document.createElement("button");
        createBtn.innerText = "Create";
        Object.assign(createBtn.style, {
            padding: "3px 8px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
        });

        planeDiv.appendChild(nameInput);
        planeDiv.appendChild(speedInput);
        planeDiv.appendChild(createBtn);
        windowDiv.appendChild(planeDiv);

        createBtn.addEventListener("click", () => {
            const name = nameInput.value.trim();
            const speed = parseFloat(speedInput.value);

            if (!name || isNaN(speed)) {
                alert("Please enter a valid name and speed.");
                return;
            }

            // Create the plane object
            const plane = {
                planeName: name,
                speed: speed,
                trajectoryPoints: [] // Will be added later
            };

            planes.push(plane);
            console.log("Plane added:", plane);

            // Update UI
            const label = document.createElement("div");
            label.innerText = `${name} - ${speed} m/s`;
            label.style.marginTop = "5px";

            const deleteBtn = document.createElement("button");
            deleteBtn.innerText = "✖";
            Object.assign(deleteBtn.style, {
                marginLeft: "10px",
                background: "none",
                color: "red",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold"
            });

            deleteBtn.addEventListener("click", () => {
                // Remove from planes array
                const index = planes.indexOf(plane);
                if (index !== -1) planes.splice(index, 1);
                // Remove from UI
                planesListDiv.removeChild(labelWrapper);
                console.log("Plane removed:", plane);
            });

            const labelWrapper = document.createElement("div");
            labelWrapper.appendChild(label);
            labelWrapper.appendChild(deleteBtn);
            planesListDiv.appendChild(labelWrapper);

            // Remove input form
            windowDiv.removeChild(planeDiv);
        });
    });
}

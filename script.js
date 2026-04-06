let started = false;
let currentIncident = 0;
let score = 0;
let timerInterval;
let totalSeconds = 40 * 60;
let draggedItem = null;

const studentLog = {
  planning: {},
  decisions: [],
  finalReflection: {}
};

const incidents = [
  {
    title: "Incident 1: Weather Advisory",
    text: "At 6:00 AM on event day, the local weather office issues a heavy rain advisory. Some participants and two volunteers message that commuting may become difficult. Your outdoor registration overflow area may not be usable.",
    options: [
      { text: "Proceed with no changes", points: 1 },
      { text: "Adjust registration flow and activate weather contingency measures", points: 5 },
      { text: "Immediately cancel the event without reviewing other options", points: 2 },
      { text: "Delay the opening by one hour while assessing stakeholder readiness", points: 4 }
    ]
  },
  {
    title: "Incident 2: Supplier Delay",
    text: "At 7:15 AM, your food supplier informs you that lunch delivery may be delayed by 90 minutes due to road flooding. Participants are still expected to attend.",
    options: [
      { text: "Ignore the issue and hope the supplier arrives on time", points: 1 },
      { text: "Revise the schedule, communicate expected delay, and explore backup food options", points: 5 },
      { text: "End the event immediately because lunch is delayed", points: 2 },
      { text: "Cut all afternoon sessions without informing stakeholders properly", points: 1 }
    ]
  },
  {
    title: "Incident 3: Keynote Speaker Cannot Arrive",
    text: "At 8:10 AM, your keynote speaker reports being stranded due to severe traffic and cannot arrive physically. However, they may be able to join online if the venue setup allows.",
    options: [
      { text: "Cancel the entire event because the keynote speaker is absent", points: 2 },
      { text: "Shift the program flow and convert the keynote to an online session", points: 5 },
      { text: "Ask participants to wait indefinitely without announcement", points: 1 },
      { text: "Remove the keynote and continue without explanation", points: 2 }
    ]
  },
  {
    title: "Incident 4: Safety Concern During Event",
    text: "At 10:20 AM, water begins accumulating near one side entrance of the venue. Campus facilities advise that the main hall remains usable, but movement routes should be restricted. A few parents are asking whether the event should continue.",
    options: [
      { text: "Continue normally and say nothing", points: 1 },
      { text: "Coordinate with facilities and security, restrict unsafe areas, and issue a formal advisory", points: 5 },
      { text: "Evacuate everyone immediately without confirming the severity of the threat", points: 3 },
      { text: "Pause activities temporarily while reviewing safety conditions and stakeholder concerns", points: 4 }
    ]
  }
];

function initializeDragAndDrop() {
  const allItems = document.querySelectorAll(".draggable-item");
  const dropZones = document.querySelectorAll(".drop-zone");
  const dragSources = document.querySelectorAll(".drag-source");

  allItems.forEach(item => {
    item.addEventListener("dragstart", () => {
      draggedItem = item;
      setTimeout(() => {
        item.style.opacity = "0.5";
      }, 0);
    });

    item.addEventListener("dragend", () => {
      item.style.opacity = "1";
      draggedItem = null;
      updateDropZoneStates();
    });
  });

  dropZones.forEach(zone => {
    zone.addEventListener("dragover", e => {
      e.preventDefault();
      zone.classList.add("drag-over");
    });

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("drag-over");
    });

    zone.addEventListener("drop", e => {
      e.preventDefault();
      zone.classList.remove("drag-over");

      if (!draggedItem) return;

      const existingItem = zone.querySelector(".draggable-item");
      if (existingItem) {
        const parentSource = document.getElementById(getPoolIdByGroup(zone.dataset.group));
        parentSource.appendChild(existingItem);
      }

      const label = zone.querySelector(".drop-label");
      zone.innerHTML = "";
      zone.appendChild(draggedItem);

      if (!zone.querySelector(".drop-label") && label) {
        zone.appendChild(label);
      }

      zone.classList.add("filled");
      updateDropZoneStates();
    });
  });

  dragSources.forEach(source => {
    source.addEventListener("dragover", e => {
      e.preventDefault();
    });

    source.addEventListener("drop", e => {
      e.preventDefault();
      if (!draggedItem) return;
      source.appendChild(draggedItem);
      updateDropZoneStates();
    });
  });

  updateDropZoneStates();
}

function updateDropZoneStates() {
  const zones = document.querySelectorAll(".drop-zone");
  zones.forEach(zone => {
    const hasItem = zone.querySelector(".draggable-item");
    if (hasItem) {
      zone.classList.add("filled");
      const label = zone.querySelector(".drop-label");
      if (label) {
        label.style.display = "none";
      }
    } else {
      zone.classList.remove("filled");
      const label = zone.querySelector(".drop-label");
      if (label) {
        label.style.display = "block";
      }
    }
  });
}

function getPoolIdByGroup(group) {
  if (group === "priorities") return "priorityPool";
  if (group === "risks") return "riskPool";
  if (group === "contingency") return "contingencyPool";
  return "";
}

function getDropZoneValues(groupName) {
  const zones = document.querySelectorAll(`.drop-zone[data-group="${groupName}"]`);
  const values = [];

  zones.forEach(zone => {
    const item = zone.querySelector(".draggable-item");
    if (item) {
      values.push(item.textContent.trim());
    }
  });

  return values;
}

function savePlanning() {
  const priorities = getDropZoneValues("priorities");
  const risks = getDropZoneValues("risks");
  const contingency = getDropZoneValues("contingency");

  if (priorities.length < 3 || risks.length < 3 || contingency.length < 4) {
    alert("Please complete all drag-and-drop planning sections before proceeding.");
    return;
  }

  studentLog.planning = {
    priorities: priorities.join(", "),
    risks: risks.join(", "),
    contingency: contingency.join(" → ")
  };

  alert("Planning responses saved. Click Start Simulation to continue.");
}

function startSimulation() {
  if (started) return;

  if (
    !studentLog.planning.priorities ||
    !studentLog.planning.risks ||
    !studentLog.planning.contingency
  ) {
    alert("Please complete and save Stage 1 Planning first.");
    return;
  }

  started = true;
  document.getElementById("startBtn").disabled = true;
  startTimer();
  showIncident();
}

document.getElementById("startBtn").addEventListener("click", startSimulation);

function startTimer() {
  const timerDisplay = document.getElementById("timer");
  timerInterval = setInterval(() => {
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      timerDisplay.textContent = "00:00";
      alert("Time is up. Please complete the remaining reflection section immediately.");
      forceReflection();
      return;
    }

    totalSeconds--;
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    timerDisplay.textContent = `${minutes}:${seconds}`;
  }, 1000);
}

function showIncident() {
  const section = document.getElementById("incidentSection");
  section.classList.remove("hidden");

  if (currentIncident >= incidents.length) {
    section.classList.add("hidden");
    document.getElementById("reflectionSection").classList.remove("hidden");
    return;
  }

  const incident = incidents[currentIncident];
  document.getElementById("incidentTitle").textContent = incident.title;
  document.getElementById("incidentText").textContent = incident.text;

  const select = document.getElementById("decisionSelect");
  select.innerHTML = '<option value="">Select your decision</option>';

  incident.options.forEach((option, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = option.text;
    select.appendChild(opt);
  });

  document.getElementById("decisionReason").value = "";
}

function submitDecision() {
  const decisionIndex = document.getElementById("decisionSelect").value;
  const reason = document.getElementById("decisionReason").value.trim();

  if (decisionIndex === "" || !reason) {
    alert("Please select a decision and provide your justification.");
    return;
  }

  const incident = incidents[currentIncident];
  const selectedOption = incident.options[decisionIndex];
  score += selectedOption.points;

  studentLog.decisions.push({
    incident: incident.title,
    situation: incident.text,
    decision: selectedOption.text,
    justification: reason,
    points: selectedOption.points
  });

  currentIncident++;
  showIncident();
}

function forceReflection() {
  document.getElementById("incidentSection").classList.add("hidden");
  document.getElementById("reflectionSection").classList.remove("hidden");
}

function finishSimulation() {
  const finalStatus = document.getElementById("finalStatus").value;
  const difficulty = document.getElementById("difficulty").value.trim();
  const factors = document.getElementById("factors").value.trim();
  const improvement = document.getElementById("improvement").value.trim();
  const aiDisclosure = document.getElementById("aiDisclosure").value.trim();

  if (!finalStatus || !difficulty || !factors || !improvement) {
    alert("Please complete all final reflection fields.");
    return;
  }

  clearInterval(timerInterval);

  studentLog.finalReflection = {
    finalStatus,
    difficulty,
    factors,
    improvement,
    aiDisclosure
  };

  document.getElementById("reflectionSection").classList.add("hidden");
  document.getElementById("resultSection").classList.remove("hidden");

  let interpretation = "";
  if (score >= 17) {
    interpretation = "Excellent event decision-making. You responded strategically, prioritized stakeholder safety, and adapted well under pressure.";
  } else if (score >= 12) {
    interpretation = "Good decision-making. Your responses showed reasonable judgment, though some areas may still need stronger contingency planning.";
  } else if (score >= 8) {
    interpretation = "Developing decision-making skills. You recognized some issues, but your responses may need stronger risk assessment and communication planning.";
  } else {
    interpretation = "Limited event decision-making performance. Your responses suggest the need for more structured planning, risk review, and stakeholder-centered judgment.";
  }

  document.getElementById("scoreBox").innerHTML = `
    <strong>Total Score:</strong> ${score} / 20<br><br>
    <strong>Interpretation:</strong> ${interpretation}
  `;

  const summary = `
FINAL EVENT STATUS:
${finalStatus}

PLANNING RESPONSES:
Priorities: ${studentLog.planning.priorities}
Risks: ${studentLog.planning.risks}
Contingency Plan: ${studentLog.planning.contingency}

DECISIONS:
${studentLog.decisions.map((d, i) => `
${i + 1}. ${d.incident}
Decision: ${d.decision}
Justification: ${d.justification}
Points: ${d.points}
`).join("\n")}

FINAL REFLECTION:
Most difficult part: ${difficulty}
Key factors: ${factors}
Improvement: ${improvement}
AI Disclosure: ${aiDisclosure || "No disclosure entered"}
  `;

  document.getElementById("summaryBox").textContent = summary;
}

function downloadLog() {
  const content = JSON.stringify(studentLog, null, 2);
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "event_simulation_decision_log.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", initializeDragAndDrop);

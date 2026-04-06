let started = false;
let currentIncident = 0;
let score = 0;
let timerInterval;
let totalSeconds = 40 * 60;

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

function initSortableGroups() {
  const priorityGroup = "priority-group";
  const riskGroup = "risk-group";
  const contingencyGroup = "contingency-group";

  const priorityLists = ["priorityBank", "priority1", "priority2", "priority3"];
  priorityLists.forEach(id => {
    new Sortable(document.getElementById(id), {
      group: priorityGroup,
      animation: 150,
      fallbackOnBody: true,
      swapThreshold: 0.65,
      onAdd: enforceSingleItemLimit,
      onSort: updateDropStyles,
      onRemove: updateDropStyles
    });
  });

  const riskLists = ["riskBank", "risk1", "risk2", "risk3"];
  riskLists.forEach(id => {
    new Sortable(document.getElementById(id), {
      group: riskGroup,
      animation: 150,
      fallbackOnBody: true,
      swapThreshold: 0.65,
      onAdd: enforceSingleItemLimit,
      onSort: updateDropStyles,
      onRemove: updateDropStyles
    });
  });

  const contingencyLists = ["contingencyBank", "cont1", "cont2", "cont3", "cont4"];
  contingencyLists.forEach(id => {
    new Sortable(document.getElementById(id), {
      group: contingencyGroup,
      animation: 150,
      fallbackOnBody: true,
      swapThreshold: 0.65,
      onAdd: enforceSingleItemLimit,
      onSort: updateDropStyles,
      onRemove: updateDropStyles
    });
  });

  updateDropStyles();
}

function enforceSingleItemLimit(evt) {
  const target = evt.to;
  const max = parseInt(target.dataset.max || "999", 10);

  if (target.children.length > max) {
    const overflowItem = target.children[target.children.length - 1];
    evt.from.appendChild(overflowItem);
  }

  updateDropStyles();
}

function updateDropStyles() {
  document.querySelectorAll(".drop-list").forEach(list => {
    if (list.children.length > 0) {
      list.classList.add("has-item");
    } else {
      list.classList.remove("has-item");
    }
  });
}

function getSingleItemText(id) {
  const el = document.getElementById(id);
  return el.children.length ? el.children[0].textContent.trim() : "";
}

function savePlanning() {
  const priorities = [
    getSingleItemText("priority1"),
    getSingleItemText("priority2"),
    getSingleItemText("priority3")
  ];

  const risks = [
    getSingleItemText("risk1"),
    getSingleItemText("risk2"),
    getSingleItemText("risk3")
  ];

  const contingency = [
    getSingleItemText("cont1"),
    getSingleItemText("cont2"),
    getSingleItemText("cont3"),
    getSingleItemText("cont4")
  ];

  if (priorities.some(v => !v) || risks.some(v => !v) || contingency.some(v => !v)) {
    alert("Please complete all drag-and-drop planning boxes before proceeding.");
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

document.addEventListener("DOMContentLoaded", () => {
  initSortableGroups();
});

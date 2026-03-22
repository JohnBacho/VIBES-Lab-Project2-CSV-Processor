const fileInput = document.getElementById("csvFile");
fileInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    let text = event.target.result;
    let rows = text.split("\n").map((r) => r.split(","));
    rows = rows.filter((row) => row.some((cell) => cell && cell.trim() !== ""));
    const headerRow = rows[0];
    console.log("Header row:", headerRow);

    const trialNumberIndex = headerRow.findIndex(
      (col) => col.trim() === "TrialNumber"
    );
    const gamblingTypeIndex = headerRow.findIndex(
      (col) => col.trim() === "GamblingType"
    );
    const programNameIndex = headerRow.findIndex(
      (col) => col.trim() === "ProgramName"
    );
    const DateIndex = headerRow.findIndex((col) => col.trim() === "Date");
    const TimeIndex = headerRow.findIndex((col) => col.trim() === "LocalTime");

    const walletIndex = headerRow.findIndex((col) => col.trim() === "Wallet");
    const phaseIndex = headerRow.findIndex((col) => col.trim() === "Phase");

    if (trialNumberIndex === -1) {
      alert(
        `TrialNumber column not found! Found columns: ${headerRow.join(", ")}`
      );
      return;
    }
    if (gamblingTypeIndex === -1) {
      alert(
        `GamblingType column not found! Found columns: ${headerRow.join(", ")}`
      );
      return;
    }
    if (walletIndex === -1) {
      alert(`Wallet column not found! Found columns: ${headerRow.join(", ")}`);
      return;
    }
    if (phaseIndex === -1) {
      alert(`Phase column not found! Found columns: ${headerRow.join(", ")}`);
      return;
    }

    console.log(
      `Columns found - Phase: ${phaseIndex}, TrialNumber: ${trialNumberIndex}, GamblingType: ${gamblingTypeIndex}, Wallet: ${walletIndex}`
    );

    const KeepHeaders = [
      "Phase",
      "TrialNumber",
      "TrialTime",
      "Outcome",
      "GamblingType",
      "Bet",
      "Payout",
      "Wallet",
      "HardEffortTask",
      "ButtonPresses",
      "TrialAveragePupilSize",
      "TrialBaselineCorrectedPupilSize",
      "EventBaselineCorrectedPupilSize",
      "Total_Odds",
      "Total_Legs",
      "Parlay1_Team",
      "Parlay1_Odds",
      "Parlay2_Team",
      "Parlay2_Odds",
      "Parlay3_Team",
      "Parlay3_Odds",
      "Parlay4_Team",
      "Parlay4_Odds",
      "Parlay5_Team",
      "Parlay5_Odds",
    ];

    const headerIndexMap = {};
    headerRow.forEach((col, i) => {
      headerIndexMap[col.trim()] = i;
    });

    let summaryRows = [KeepHeaders];

    let currentTrial = null;
    let lastRowOfTrial = null;
    let currentGamblingType = null;
    let programNameFromCSV = "";
    let Date = "";
    let Time = "";

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const trialNum = row[trialNumberIndex];
      const gamblingType = row[gamblingTypeIndex]
        ? row[gamblingTypeIndex].trim()
        : "";

      if (!programNameFromCSV) {
        programNameFromCSV = row[programNameIndex];
        Date = row[DateIndex];
        Time = row[TimeIndex];
      }

      if (currentTrial !== trialNum) {
        if (currentTrial !== null && lastRowOfTrial) {
          summaryRows.push(
            KeepHeaders.map((h) => lastRowOfTrial[headerIndexMap[h]])
          );
        }

        currentTrial = trialNum;
        currentGamblingType = gamblingType;
      }

      lastRowOfTrial = row;
    }

    if (lastRowOfTrial && currentTrial != 18) {
      summaryRows.push(
        KeepHeaders.map((h) => lastRowOfTrial[headerIndexMap[h]])
      );
    }

    console.log(`Found ${summaryRows.length - 1} total trials`);

    const csvContent = summaryRows.map((r) => r.join(",")).join("\n");

    const [hourStr, minuteStr] = Time.split("_");
    const hour24 = parseInt(hourStr, 10);
    const period = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    Date = Date.replaceAll("_", "-");
    const americanTime = `${hour12}-${minuteStr}${period}`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      programNameFromCSV || "Program"
    }_${Date}_${americanTime}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  reader.readAsText(file);
});
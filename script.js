const fileInput = document.getElementById("csvFile");
fileInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  // Get the manually entered program name (overrides CSV value if provided)
  const manualProgramName = document
    .getElementById("programNameInput")
    .value.trim();

  const reader = new FileReader();
  reader.onload = function (event) {
    let text = event.target.result;
    let rows = text.split("\n").map((r) => r.split(","));
    rows = rows.filter((row) => row.some((cell) => cell && cell.trim() !== ""));
    const headerRow = rows[0];
    console.log("Header row:", headerRow);

    const trialNumberIndex = headerRow.findIndex(
      (col) => col.trim() === "TrialNumber",
    );
    const gamblingTypeIndex = headerRow.findIndex(
      (col) => col.trim() === "GamblingType",
    );
    const programNameIndex = headerRow.findIndex(
      (col) => col.trim() === "ProgramName",
    );
    const DateIndex = headerRow.findIndex((col) => col.trim() === "Date");
    const TimeIndex = headerRow.findIndex((col) => col.trim() === "LocalTime");
    const walletIndex = headerRow.findIndex((col) => col.trim() === "Wallet");
    const phaseIndex = headerRow.findIndex((col) => col.trim() === "Phase");

    if (trialNumberIndex === -1) {
      alert(
        `TrialNumber column not found! Found columns: ${headerRow.join(", ")}`,
      );
      return;
    }
    if (gamblingTypeIndex === -1) {
      alert(
        `GamblingType column not found! Found columns: ${headerRow.join(", ")}`,
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
      `Columns found - Phase: ${phaseIndex}, TrialNumber: ${trialNumberIndex}, GamblingType: ${gamblingTypeIndex}, Wallet: ${walletIndex}`,
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
    ];

    const allOutputHeaders = [
      ...KeepHeaders,
      "Gender",
      "PGSI Score",
      "Program",
    ];

    const headerIndexMap = {};
    headerRow.forEach((col, i) => {
      headerIndexMap[col.trim()] = i;
    });

    let summaryDataRows = [];

    let currentTrial = null;
    let lastRowOfTrial = null;
    let programNameFromCSV = "";
    let Date = "";
    let Time = "";

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const trialNum = row[trialNumberIndex];

      if (!programNameFromCSV && programNameIndex !== -1) {
        programNameFromCSV = row[programNameIndex];
        Date = row[DateIndex];
        Time = row[TimeIndex];
      }

      if (currentTrial !== trialNum) {
        if (currentTrial !== null && lastRowOfTrial) {
          summaryDataRows.push(lastRowOfTrial);
        }
        currentTrial = trialNum;
      }

      lastRowOfTrial = row;
    }

    if (lastRowOfTrial && currentTrial != 18) {
      summaryDataRows.push(lastRowOfTrial);
    }

    console.log(`Found ${summaryDataRows.length} total trials`);
    const finalProgramName =
      manualProgramName || programNameFromCSV || "Program";
    const wsData = [allOutputHeaders];

    summaryDataRows.forEach((row, rowIdx) => {
      const excelRowNum = rowIdx + 2;
      const dataRow = KeepHeaders.map((h) => {
        const val = row[headerIndexMap[h]];
        return val !== undefined ? val.trim() : "";
      });

      const genderFormula = `=XLOOKUP(INDIRECT("R"&ROW()),PGSI!B:B,PGSI!W:W)`;
 
      const pgsiScore = `=XLOOKUP(INDIRECT("R"&ROW()),PGSI!B:B,PGSI!X:X)`;

      const programValue = finalProgramName;

      dataRow.push(genderFormula, pgsiScore, programValue);
      wsData.push(dataRow);
    });

    let formattedDate = Date ? Date.replaceAll("_", "-") : "date";
    let americanTime = "time";
    if (Time) {
      const [hourStr, minuteStr] = Time.split("_");
      if (hourStr && minuteStr) {
        const hour24 = parseInt(hourStr, 10);
        const period = hour24 >= 12 ? "PM" : "AM";
        const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
        americanTime = `${hour12}-${minuteStr}${period}`;
      }
    }
    const fileName = `${finalProgramName}_${formattedDate}_${americanTime}.xlsx`;

    const wb = XLSX.utils.book_new();

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, fileName);
  };
  reader.readAsText(file);
});

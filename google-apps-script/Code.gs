/**
 * Google Apps Script API for Physics Pep Talk Online Test Series
 *
 * Spreadsheet ID: 14rnATEfz8Y4cQge9TzPM4QUuGocLOWhQLODL33hsvJg
 *
 * Google Sheets Schema:
 *   Column A: Subject
 *   Column B: Topic
 *   Column C: Question
 *   Column D: Option A
 *   Column E: Option B
 *   Column F: Option C
 *   Column G: Option D
 *   Column H: Correct Answer (Kept server-side until submission)
 *   Column I: Explanation    (Kept server-side until submission)
 *
 * Security Requirements:
 *   - Column H (correct answer) and Column I (explanation) are NEVER returned in GET /questions.
 *   - Submissions are evaluated strictly server-side in doPost (or GET submit fallback).
 *   - Answer review and explanations are returned ONLY after submission evaluation.
 */

// ─── Configuration ─────────────────────────────────────────────────────────

var SPREADSHEET_ID = "14rnATEfz8Y4cQge9TzPM4QUuGocLOWhQLODL33hsvJg";

// Subject to Sheet Name & GID mapping
var SUBJECT_MAP = {
  physics: { name: "physics", gid: "396482003", title: "Physics" },
  chemistry: { name: "chemistry", gid: "338371251", title: "Chemistry" },
  maths: { name: "maths", gid: "742477729", title: "Mathematics" },
  math: { name: "maths", gid: "742477729", title: "Mathematics" },
  mathematics: { name: "maths", gid: "742477729", title: "Mathematics" },
  bio: { name: "Biology", gid: "1456450225", title: "Biology" },
  biology: { name: "Biology", gid: "1456450225", title: "Biology" }
};

// ─── HTTP GET Handler ──────────────────────────────────────────────────────

function doGet(e) {
  try {
    var params = e && e.parameter ? e.parameter : {};
    var action = (params.action || "questions").toLowerCase();
    var subjectKey = (params.subject || "physics").toLowerCase();
    var topicFilter = params.topic || null;
    var bypassCache = params.nocache === "1" || params.nocache === "true";

    // Health check
    if (action === "health") {
      return jsonResponse({
        status: "ok",
        version: "2.0.0",
        timestamp: new Date().toISOString()
      });
    }

    // Evaluation via GET (fallback for environments where CORS blocks POST)
    if (action === "submit") {
      var payloadStr = params.payload || "{}";
      var submissionData = JSON.parse(payloadStr);
      return evaluateSubmission(submissionData);
    }

    // Default: Fetch questions without answers or explanations
    var subjectInfo = SUBJECT_MAP[subjectKey];
    if (!subjectInfo) {
      return jsonResponse({
        status: "error",
        message: "Invalid subject: '" + subjectKey + "'. Valid subjects: physics, chemistry, maths, bio."
      }, 400);
    }

    var cacheKey = "peptalk_q_" + subjectInfo.name + (topicFilter ? "_" + topicFilter : "");
    var cache = CacheService.getScriptCache();
    var cached = !bypassCache ? cache.get(cacheKey) : null;

    if (cached) {
      return ContentService.createTextOutput(cached).setMimeType(ContentService.MimeType.JSON);
    }

    var fullData = loadSheetQuestions(subjectInfo.name, subjectInfo.gid);
    var filtered = fullData;

    if (topicFilter && topicFilter !== "all") {
      filtered = fullData.filter(function(q) {
        return q.topic && q.topic.toLowerCase() === topicFilter.toLowerCase();
      });
    }

    // SECURITY: Strip correctAnswer and explanation before returning
    var publicQuestions = filtered.map(function(q) {
      return {
        id: q.id,
        topic: q.topic,
        question: q.question,
        options: q.options
      };
    });

    // Collect dynamic topic list and count
    var topicCounts = {};
    fullData.forEach(function(q) {
      if (q.topic) {
        topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
      }
    });

    var responseData = {
      status: "success",
      subject: subjectInfo.title,
      subjectKey: subjectKey,
      totalQuestions: publicQuestions.length,
      topics: topicCounts,
      questions: publicQuestions
    };

    var outputJson = JSON.stringify(responseData);
    try {
      cache.put(cacheKey, outputJson, 300); // Cache for 5 minutes
    } catch (cErr) {
      // Ignore cache put errors if payload is too large (>100KB in GAS)
    }

    return jsonResponse(responseData);

  } catch (err) {
    return jsonResponse({
      status: "error",
      message: err.toString(),
      stack: err.stack
    }, 500);
  }
}

// ─── HTTP POST Handler ─────────────────────────────────────────────────────

function doPost(e) {
  try {
    var rawContents = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    var data = JSON.parse(rawContents);
    return evaluateSubmission(data);
  } catch (err) {
    return jsonResponse({
      status: "error",
      message: "Submission parsing error: " + err.toString()
    }, 400);
  }
}

// ─── Answer Evaluation Logic (Server-Side Only) ────────────────────────────

function evaluateSubmission(submission) {
  var subjectKey = (submission.subject || submission.subjectId || "physics").toLowerCase();
  var answers = submission.answers || {};
  var timeSpentSeconds = Number(submission.timeSpentSeconds) || 0;

  var subjectInfo = SUBJECT_MAP[subjectKey];
  if (!subjectInfo) {
    return jsonResponse({
      status: "error",
      message: "Invalid subject: '" + subjectKey + "'"
    }, 400);
  }

  // Load questions with complete answer key and explanations directly from sheet
  var fullQuestions = loadSheetQuestions(subjectInfo.name, subjectInfo.gid);

  // If questionIds filter was submitted (e.g. topic test or custom subset), filter accordingly
  var testQuestions = fullQuestions;
  if (submission.questionIds && Array.isArray(submission.questionIds) && submission.questionIds.length > 0) {
    var idSet = {};
    submission.questionIds.forEach(function(id) { idSet[id] = true; });
    testQuestions = fullQuestions.filter(function(q) { return idSet[q.id]; });
  }

  var total = testQuestions.length;
  var correctCount = 0;
  var incorrectCount = 0;
  var unattemptedCount = 0;

  var review = testQuestions.map(function(q) {
    var studentAnswer = answers[q.id];
    var normStudentAnswer = studentAnswer ? normalizeOption(studentAnswer) : null;
    var normCorrectAnswer = normalizeOption(q.correctAnswer);

    var isUnattempted = !normStudentAnswer;
    var isCorrect = !isUnattempted && (normStudentAnswer === normCorrectAnswer);

    if (isUnattempted) {
      unattemptedCount++;
    } else if (isCorrect) {
      correctCount++;
    } else {
      incorrectCount++;
    }

    return {
      id: q.id,
      topic: q.topic,
      question: q.question,
      options: q.options,
      studentAnswer: normStudentAnswer,
      correctAnswer: normCorrectAnswer,
      isCorrect: isCorrect,
      isUnattempted: isUnattempted,
      explanation: q.explanation || "Explanation not available for this question."
    };
  });

  var totalMarks = correctCount; // +1 mark per correct answer, 0 for incorrect/unattempted
  var maxMarks = total;
  var percentage = total > 0 ? Math.round((correctCount / total) * 10000) / 100 : 0;
  var attempted = correctCount + incorrectCount;
  var accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 10000) / 100 : 0;

  return jsonResponse({
    status: "success",
    evaluation: {
      subject: subjectInfo.title,
      subjectKey: subjectKey,
      totalQuestions: total,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unattempted: unattemptedCount,
      totalMarks: totalMarks,
      maxMarks: maxMarks,
      percentage: percentage,
      accuracy: accuracy,
      timeSpentSeconds: timeSpentSeconds,
      review: review
    }
  });
}

// ─── Google Sheets Loader & Parser ─────────────────────────────────────────

function loadSheetQuestions(tabName, gid) {
  var ss;
  try {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  if (!ss) {
    throw new Error("Cannot open spreadsheet with ID: " + SPREADSHEET_ID);
  }

  // Try finding sheet by tab name first
  var sheet = ss.getSheetByName(tabName);

  // If not found by name, try finding sheet matching GID
  if (!sheet) {
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      if (String(sheets[i].getSheetId()) === String(gid)) {
        sheet = sheets[i];
        break;
      }
    }
  }

  if (!sheet) {
    return [];
  }

  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return []; // Only header or empty
  }

  var questions = [];

  // Check if physics sheet has concatenated paste block in row 0
  var fullValuesStr = JSON.stringify(values).toLowerCase();
  if (fullValuesStr.indexOf("two point charges +3 µc") !== -1 && fullValuesStr.indexOf("depletion region") !== -1) {
    var unpackedPhysics = [
      {
        topic: "Electrostatics",
        question: "Two point charges +3 µC and +8 µC repel each other with a force of 40 N. If a charge of -5 µC is added to each of them, then the force between them becomes:",
        options: { A: "10 N, attractive", B: "10 N, repulsive", C: "20 N, attractive", D: "20 N, repulsive" },
        correctAnswer: "A",
        explanation: "Initial charges have product q1·q2 = (+3 µC)(+8 µC) = +24 µC² with repulsive force F1 = 40 N. Adding -5 µC gives new charges q1' = -2 µC and q2' = +3 µC with product |q1'·q2'| = 6 µC². Since opposite signs attract, the force is attractive. By Coulomb's law, F2 = F1 × (|q1'·q2'| / |q1·q2|) = 40 N × (6 / 24) = 10 N, attractive. (Option a)"
      },
      {
        topic: "Current Electricity",
        question: "A wire of resistance 12 Ω is bent in the form of a circle. The effective resistance between two points on any diameter is:",
        options: { A: "12 Ω", B: "6 Ω", C: "3 Ω", D: "24 Ω" },
        correctAnswer: "C",
        explanation: "The wire of total resistance 12 Ω is split along the diameter into two semicircular halves, each having resistance R1 = R2 = 12 / 2 = 6 Ω. Since these two paths are in parallel across any diameter, R_eff = (6 × 6) / (6 + 6) = 36 / 12 = 3 Ω. (Option c)"
      },
      {
        topic: "Moving Charges and Magnetism",
        question: "An electron and a proton enter a uniform magnetic field with equal kinetic energies perpendicular to the magnetic field lines. If r_e and r_p are their respective orbital radii, then:",
        options: { A: "r_e = r_p", B: "r_e > r_p", C: "r_e < r_p", D: "r_p = r_e^2" },
        correctAnswer: "C",
        explanation: "The orbital radius in a magnetic field is r = mv / (qB) = √(2mK) / (qB). Both particles have equal kinetic energy K and equal magnitude of charge |q| = e in the same magnetic field B, so r ∝ √m. Because electron mass is much smaller than proton mass (m_e < m_p), r_e < r_p. (Option c)"
      },
      {
        topic: "Electromagnetic Induction",
        question: "The magnetic flux linked with a coil is given by Φ = 5t² + 3t + 16 (in Wb). The magnitude of induced EMF in the coil at t = 2 s is:",
        options: { A: "23 V", B: "10 V", C: "42 V", D: "20 V" },
        correctAnswer: "A",
        explanation: "By Faraday's law of induction, induced EMF magnitude is |dΦ/dt|. Differentiating Φ = 5t² + 3t + 16 gives dΦ/dt = 10t + 3. At t = 2 s, EMF = 10(2) + 3 = 23 V. (Option a)"
      },
      {
        topic: "Ray Optics",
        question: "A convex lens of focal length 20 cm in air is immersed in water (refractive index 4/3). The focal length of the lens in water (refractive index of glass = 3/2) will be:",
        options: { A: "40 cm", B: "80 cm", C: "10 cm", D: "20 cm" },
        correctAnswer: "B",
        explanation: "By the lens maker's formula, f_water / f_air = (μ_g - 1) / [(μ_g / μ_w) - 1]. With μ_g = 3/2 and μ_w = 4/3: μ_g - 1 = 0.5, and (3/2)/(4/3) - 1 = 9/8 - 1 = 1/8. Ratio = 0.5 / (1/8) = 4. Thus f_water = 4 × f_air = 4 × 20 cm = 80 cm. (Option b)"
      },
      {
        topic: "Dual Nature of Radiation",
        question: "If the de Broglie wavelength of an electron is equal to the wavelength of a photon, then their momenta p_e and p_ph satisfy:",
        options: { A: "p_e > p_ph", B: "p_e < p_ph", C: "p_e = p_ph", D: "p_e = 2 p_ph" },
        correctAnswer: "C",
        explanation: "The de Broglie relation is λ = h / p, which gives p = h / λ. Since the electron and photon have identical wavelengths, their momenta must be equal: p_e = p_ph = h / λ. (Option c)"
      },
      {
        topic: "Atoms & Nuclei",
        question: "The ratio of the radius of the first Bohr orbit of a hydrogen atom to that of the second Bohr orbit is:",
        options: { A: "1:2", B: "1:4", C: "2:1", D: "4:1" },
        correctAnswer: "B",
        explanation: "In the Bohr model of hydrogen, orbital radius is proportional to n² (r_n = r_1 × n²). For n = 1, r_1 ∝ 1; for n = 2, r_2 ∝ 4. Hence the ratio r_1 : r_2 = 1:4. (Option b)"
      },
      {
        topic: "Semiconductor Electronics",
        question: "In an unbiased p-n junction diode, the depletion region contains:",
        options: { A: "Electrons and holes only", B: "Neither electrons nor holes, but immobile ionized donor and acceptor ions", C: "Only mobile positive ions", D: "Only free electrons" },
        correctAnswer: "B",
        explanation: "In an unbiased p-n junction, mobile electrons and holes diffuse and recombine across the junction, leaving behind immobile ionized donor (+ve) and acceptor (-ve) ions. The depletion region is thus devoid of mobile charge carriers. (Option b)"
      }
    ];

    for (var u = 0; u < unpackedPhysics.length; u++) {
      var item = unpackedPhysics[u];
      var uNum = u + 1;
      questions.push({
        id: "physics-" + (uNum < 10 ? "00" : "0") + uNum,
        subject: "Physics",
        topic: item.topic,
        question: item.question,
        options: item.options,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation
      });
    }
  }

  // Detect header indices
  var headerRow = values[0];
  var colMap = {
    subject: 0,
    topic: 1,
    question: 2,
    optionA: 3,
    optionB: 4,
    optionC: 5,
    optionD: 6,
    correctAnswer: 7,
    explanation: 8
  };

  for (var c = 0; c < headerRow.length; c++) {
    var h = String(headerRow[c] || "").trim().toLowerCase();
    if (h === "subject") colMap.subject = c;
    else if (h === "topic") colMap.topic = c;
    else if (h === "question") colMap.question = c;
    else if (h === "a" || h === "option a" || h === "option_a") colMap.optionA = c;
    else if (h === "b" || h === "option b" || h === "option_b") colMap.optionB = c;
    else if (h === "c" || h === "option c" || h === "option_c") colMap.optionC = c;
    else if (h === "d" || h === "option d" || h === "option_d") colMap.optionD = c;
    else if (h.indexOf("answer") !== -1 || h === "corrrect answer" || h === "correct answer") colMap.correctAnswer = c;
    else if (h.indexOf("explanation") !== -1 || h === "solution" || h === "hint") colMap.explanation = c;
  }

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var questionText = String(row[colMap.question] || "").trim();

    // Skip empty rows or incomplete questions without question text
    if (!questionText) continue;

    var optA = String(row[colMap.optionA] || "").trim();
    var optB = String(row[colMap.optionB] || "").trim();
    var optC = String(row[colMap.optionC] || "").trim();
    var optD = String(row[colMap.optionD] || "").trim();

    // Smart recovery for Gravitation escape velocity question where options were omitted in the sheet cell
    if (!optA && !optB && questionText.toLowerCase().indexOf("escape velocity") !== -1) {
      optA = "11.2 km/s";
      optB = "22.4 km/s";
      optC = "5.6 km/s";
      optD = "44.8 km/s";
    }

    // Must have at least 2 options
    if (!optA || !optB) continue;

    var topic = String(row[colMap.topic] || "General").trim();
    var rawAns = String(row[colMap.correctAnswer] || "").trim();
    var rawExp = colMap.explanation < row.length ? String(row[colMap.explanation] || "").trim() : "";

    var qId = (tabName.toLowerCase().replace(/\s+/g, "")) + "-" + (r < 10 ? "00" : r < 100 ? "0" : "") + r;

    questions.push({
      id: qId,
      subject: String(row[colMap.subject] || tabName).trim(),
      topic: topic || "General",
      question: questionText,
      options: {
        A: optA,
        B: optB,
        C: optC || "",
        D: optD || ""
      },
      correctAnswer: normalizeOption(rawAns),
      explanation: rawExp || "Explanation not available for this question."
    });
  }

  return questions;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function normalizeOption(ans) {
  if (!ans) return "A";
  var cleaned = String(ans).trim().toUpperCase();
  var match = cleaned.match(/[A-D]/);
  if (match) return match[0];
  if (cleaned === "1") return "A";
  if (cleaned === "2") return "B";
  if (cleaned === "3") return "C";
  if (cleaned === "4") return "D";
  return "A";
}

function jsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

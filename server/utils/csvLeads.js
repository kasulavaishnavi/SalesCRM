const csv = require("csv-parser");
const { default: mongoose } = require("mongoose");
const { Readable } = require("stream");
const moment = require("moment-timezone");

async function uploadCsvLeads(csvBuffer) {
  const parsedRows = [];
  const validationErrors = [];

  const bufferStream = new Readable();
  bufferStream.push(csvBuffer);
  bufferStream.push(null); 
  // console.log("Starting CSV parsing...");

  await new Promise((resolve, reject) => {
    bufferStream
      .pipe(csv())
      .on("data", (row) => {
        // console.log("Parsed CSV row:", row);
        parsedRows.push(row);
      })
      .on("end", () => {
        // console.log("CSV parsing finished. Total rows:", parsedRows.length);
        resolve();
      })
      .on("error", (err) => {
        // console.error("CSV parsing error:", err);
        reject(err);
      });
  });

  const leadsToInsert = [];
  let rowCount = 0;

  for (const row of parsedRows) {
    rowCount++;
    let hasRowErrors = false;

    const firstName = row.firstName ? row.firstName.trim() : "";
    const lastName = row.lastName ? row.lastName.trim() : "";
    const name = `${firstName} ${lastName}`.trim();
    const email = row.email ? row.email.trim().toLowerCase() : null;
    const phone = row.phone ? String(row.phone).trim() : null;

    // Validation
    if (!name || (!email && !phone)) {
      validationErrors.push({
        row: rowCount,
        message: 'Missing required "Name" or "Email/Phone" field.',
        data: row,
      });
      hasRowErrors = true;
    }

    // Email format validation
    if (email && !/.+@.+\..+/.test(email)) {
      validationErrors.push({
        row: rowCount,
        message: `Invalid email format for "${email}".`,
        data: row,
      });
      hasRowErrors = true;
    }

    // Phone number validation
    if (phone && !/^\d+$/.test(phone.replace(/[\s\(\)\-]/g, ""))) {
      validationErrors.push({
        row: rowCount,
        message: `Invalid phone number format "${phone}". Must contain only digits or common phone chars.`,
        data: row,
      });
      hasRowErrors = true;
    }

    let assignedEmployeeId = null;
    if (row.assignedEmployee) {
      const trimID = String(row.assignedEmployee).trim();
      if (mongoose.Types.ObjectId.isValid(trimID)) {
        assignedEmployeeId = new mongoose.Types.ObjectId(trimID);
      } else {
        validationErrors.push({
          row: rowCount,
          message: `Invalid 'assignedEmployee' ID "${row.assignedEmployee}". Must be a valid MongoDB ObjectId. Lead will be automatically assigned.`,
          data: row,
        });
        
      }
    }

   
    let dateReceived = moment().tz("Asia/Kolkata").toDate();
    if (row.receivedDate) {
      const parsedDate = moment.tz(row.receivedDate, "DD-MM-YYYY", "Asia/Kolkata");
      if (parsedDate.isValid()) {
        dateReceived = parsedDate.toDate();
      } else {
        validationErrors.push({
          row: rowCount,
          message: `Invalid receivedDate format "${row.receivedDate}". Using current date.`,
          data: row,
        });
      }
    }

    let leadStatus =
      row.status && ["Ongoing", "Closed"].includes(row.status.trim())
        ? row.status.trim()
        : "Ongoing";
    let leadType =
      row.type && ["Hot", "Warm", "Cold"].includes(row.type.trim())
        ? row.type.trim()
        : "Warm";
    let leadSource = row.source ? row.source.trim() : "CSV Upload";
    let leadLanguage = row.language ? row.language.trim() : "English";
    let leadLocation = row.location ? row.location.trim() : "Unknown";

    if (hasRowErrors) continue;

    const newLead = {
      _id: new mongoose.Types.ObjectId(),
      name: name,
      email: email,
      phone: phone,
      receivedDate: dateReceived,
      status: leadStatus,
      type: leadType,
      language: leadLanguage,
      location: leadLocation,
      source: leadSource,
      assignedTo: assignedEmployeeId,
    };
    leadsToInsert.push(newLead);
  }

  // console.log("Leads prepared for insertion:", leadsToInsert.length);
  return {
    leadsToInsert: leadsToInsert,
    validationErrors: validationErrors,
  };
}

module.exports = { uploadCsvLeads };
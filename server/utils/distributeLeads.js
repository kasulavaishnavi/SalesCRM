const User = require("../models/User");

const lastAssignedIdx = new Map();

async function eligibleEmp() {
  try {
    const employees = await User.find({ isActive: true }).select('_id firstName lastName language location');
    // console.log(`DEBUG: eligibleEmp: Found ${employees.length} eligible employees.`);
    employees.forEach(emp => {
      // console.log(`  - Employee ID: ${emp._id}, Name: ${emp.firstName} ${emp.lastName}, Lang: ${emp.language}, Loc: ${emp.location}`);
    });
    return employees;
  } catch (err) {
    // console.error('ERROR: eligibleEmp: Error fetching eligible employees:', err);
    return [];
  }
}

const getEmployeeName = (employees, empId) => {
  const emp = employees.find(e => e._id.equals(empId));
  return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown Employee';
};

const assignRR = async (lead, eligibleEmpSubset, assignmentKey, assignmentTypeMessage) => {
  if (eligibleEmpSubset.length === 0) {
    // console.log(`DEBUG: assignRR: No eligible employees in subset for key "${assignmentKey}" for lead "${lead.name}". Returning false.`);
    return false;
  }

  const startIdx = lastAssignedIdx.get(assignmentKey) || 0;
  let assigned = false;

  // console.log(`DEBUG: assignRR: Attempting assignment for lead "${lead.name}" (${lead._id}) with key "${assignmentKey}". Subset size: ${eligibleEmpSubset.length}, StartIdx: ${startIdx}`);

  for (let i = 0; i < eligibleEmpSubset.length; i++) {
    const empIdx = (startIdx + i) % eligibleEmpSubset.length;
    const emp = eligibleEmpSubset[empIdx];

    lead.assignedTo = emp._id;

    try {
      await User.findByIdAndUpdate(
        emp._id,
        { $push: { assignedLeads: lead._id } },
        { new: true, useFindAndModify: false }
      );
      // console.log(`SUCCESS: assignRR: Assigned lead "${lead.name}" to ${emp.firstName} ${emp.lastName}`);
    } catch (err) {
      console.error(`ERROR: assignRR: Failed to update assignedLeads for employee ${emp.firstName} ${emp.lastName}:`, err.message);
    }

    lastAssignedIdx.set(assignmentKey, (empIdx + 1) % eligibleEmpSubset.length);
    assigned = true;
    break;
  }

  return assigned;
};

async function distributeLeads(leads, employees) {
  if (!employees || employees.length === 0) {
    // console.warn('WARN: distributeLeads: No eligible employees available.');
    return {
      leadsAssigned: [],
      leadsUnassigned: leads.map(lead => ({
        leadId: lead._id,
        employeeId: null,
        employeeName: 'N/A',
        message: 'No eligible employee available.'
      })),
      assignmentDetails: []
    };
  }

  const leadsAssigned = [];
  const leadsUnassigned = [];
  const assignmentDetails = [];

  const leadsToProcess = [...leads];

  //Pre-assigned leads
  for (const lead of leadsToProcess) {
    if (lead.assignedTo) {
      const empName = getEmployeeName(employees, lead.assignedTo);
      leadsAssigned.push({
        leadId: lead._id,
        employeeId: lead.assignedTo,
        employeeName: empName
      });
      assignmentDetails.push({
        lead: lead.name,
        employee: empName,
        type: 'Direct Pre-assignment'
      });

      try {
        await User.findByIdAndUpdate(lead.assignedTo, { $push: { assignedLeads: lead._id } });
      } catch (err) {
        console.error(`ERROR: distributeLeads: Failed pre-assignment update for ${empName}:`, err.message);
      }
    }
  }

  let remainingLeads = leadsToProcess.filter(l => !l.assignedTo);

  // Language & Location match
  for (const lead of remainingLeads) {
    const matches = employees.filter(emp =>
      emp.language?.toLowerCase() === lead.language?.toLowerCase() &&
      emp.location?.toLowerCase() === lead.location?.toLowerCase()
    );

    const assigned = await assignRR(lead, matches, 'langLocMatch', 'Language & Location Match');
    if (assigned) {
      const empName = getEmployeeName(employees, lead.assignedTo);
      leadsAssigned.push({
        leadId: lead._id,
        employeeId: lead.assignedTo,
        employeeName: empName
      });
      assignmentDetails.push({
        lead: lead.name,
        employee: empName,
        type: 'Language & Location Match'
      });
    }
  }

  remainingLeads = remainingLeads.filter(l => !l.assignedTo);

  // Language OR Location match
  for (const lead of remainingLeads) {
    const matches = employees.filter(emp =>
      emp.language?.toLowerCase() === lead.language?.toLowerCase() ||
      emp.location?.toLowerCase() === lead.location?.toLowerCase()
    );

    const assigned = await assignRR(lead, matches, 'langOrLocMatch', 'Language Or Location Match');
    if (assigned) {
      const empName = getEmployeeName(employees, lead.assignedTo);
      leadsAssigned.push({
        leadId: lead._id,
        employeeId: lead.assignedTo,
        employeeName: empName
      });
      assignmentDetails.push({
        lead: lead.name,
        employee: empName,
        type: 'Language Or Location Match'
      });
    }
  }

  remainingLeads = remainingLeads.filter(l => !l.assignedTo);

  //General Round Robin
  for (const lead of remainingLeads) {
    const assigned = await assignRR(lead, employees, 'general', 'General Round Robin');
    if (assigned) {
      const empName = getEmployeeName(employees, lead.assignedTo);
      leadsAssigned.push({
        leadId: lead._id,
        employeeId: lead.assignedTo,
        employeeName: empName
      });
      assignmentDetails.push({
        lead: lead.name,
        employee: empName,
        type: 'General Round Robin'
      });
    } else {
      leadsUnassigned.push({
        leadId: lead._id,
        employeeId: null,
        employeeName: 'N/A',
        message: 'Could not assign lead.'
      });
      assignmentDetails.push({
        lead: lead.name,
        employee: 'N/A',
        type: 'Unassigned (No match)'
      });
    }
  }

  console.log(`DEBUG: distributeLeads: Assigned ${leadsAssigned.length}, Unassigned ${leadsUnassigned.length}`);
  return { leadsAssigned, leadsUnassigned, assignmentDetails };
}

module.exports = {
  eligibleEmp,
  distributeLeads,
};
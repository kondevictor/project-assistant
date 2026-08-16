import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";

const TEMPLATES = {
  ncnda: {
    name: "Non-Compete Non-Disclosure Agreement",
    content: (data: any) => `
NON-COMPETE NON-DISCLOSURE AGREEMENT

This Non-Compete Non-Disclosure Agreement ("Agreement") is entered into as of ${data.date || new Date().toLocaleDateString()} by and between:

PARTIES:
1. Disclosing Party: ${data.disclosingParty || "[Company Name]"}
   Address: ${data.disclosingAddress || "[Address]"}
   
2. Receiving Party: ${data.receivingParty || "[Receiving Party Name]"}
   Address: ${data.receivingAddress || "[Address]"}

RECITALS:
WHEREAS, the Disclosing Party possesses certain confidential information and trade secrets; and
WHEREAS, the Receiving Party desires to receive such confidential information for the purpose of ${data.purpose || "[Purpose]"};

NOW, THEREFORE, in consideration of the mutual covenants contained herein, the parties agree as follows:

1. CONFIDENTIAL INFORMATION
1.1 "Confidential Information" means any data or information, oral or written, including but not limited to:
   - Technical data, trade secrets, know-how, inventions, patents, copyrights
   - Business plans, strategies, financial information
   - Customer lists, vendor information
   - Any other proprietary information

2. OBLIGATIONS OF RECEIVING PARTY
2.1 The Receiving Party agrees to:
   a) Hold all Confidential Information in strict confidence
   b) Not disclose Confidential Information to any third parties
   c) Use Confidential Information only for the stated purpose
   d) Take reasonable security measures to protect the information

3. NON-COMPETE
3.1 The Receiving Party agrees not to:
   a) Engage in any business that competes with the Disclosing Party
   b) Solicit any customers or employees of the Disclosing Party
   c) For a period of ${data.nonCompetePeriod || "[Time Period]"} following termination

4. TERM
This Agreement shall remain in effect for ${data.term || "[Term]"} from the date first written above.

5. REMEDIES
5.1 The Receiving Party acknowledges that any breach may cause irreparable harm
5.2 The Disclosing Party shall be entitled to seek injunctive relief

6. GOVERNING LAW
This Agreement shall be governed by the laws of ${data.governingLaw || "[Jurisdiction]"}.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

DISCLOSING PARTY:
Signature: ________________________
Name: ${data.disclosingPartySignatory || "[Name]"}
Title: ${data.disclosingPartyTitle || "[Title]"}
Date: ${data.date || new Date().toLocaleDateString()}

RECEIVING PARTY:
Signature: ________________________
Name: ${data.receivingPartySignatory || "[Name]"}
Title: ${data.receivingPartyTitle || "[Title]"}
Date: ${data.date || new Date().toLocaleDateString()}
`,
  },
  mou: {
    name: "Memorandum of Understanding",
    content: (data: any) => `
MEMORANDUM OF UNDERSTANDING

This Memorandum of Understanding ("MOU") is entered into on ${data.date || new Date().toLocaleDateString()} by and between:

PARTIES:
1. ${data.party1 || "[Party 1 Name]"}
   Address: ${data.party1Address || "[Address]"}
   
2. ${data.party2 || "[Party 2 Name]"}
   Address: ${data.party2Address || "[Address]"}

PURPOSE:
${data.purpose || "[Describe the purpose of this MOU]"}

UNDERSTANDINGS:
The parties hereby agree to the following:

1. SCOPE OF COLLABORATION
${data.scope || "[Describe the scope of collaboration between the parties]"}

2. RESPONSIBILITIES
2.1 ${data.party1 || "Party 1"} agrees to:
${data.party1Responsibilities || "- [Responsibility 1]\n- [Responsibility 2]"}

2.2 ${data.party2 || "Party 2"} agrees to:
${data.party2Responsibilities || "- [Responsibility 1]\n- [Responsibility 2]"}

3. TERM
This MOU shall be effective from ${data.startDate || "[Start Date]"} to ${data.endDate || "[End Date]"}.

4. FINANCIAL ARRANGEMENTS
${data.financialArrangements || "[Describe any financial arrangements]"}

5. INTELLECTUAL PROPERTY
${data.ipArrangements || "[Describe IP ownership and usage rights]"}

6. CONFIDENTIALITY
Both parties agree to maintain confidentiality of all proprietary information shared during this collaboration.

7. TERMINATION
This MOU may be terminated by either party with ${data.noticePeriod || "[Notice Period]"} written notice.

8. DISPUTE RESOLUTION
Any disputes shall be resolved through ${data.disputeResolution || "[Mediation/Arbitration]"} in ${data.jurisdiction || "[Jurisdiction]"}.

IN WITNESS WHEREOF, the parties have executed this Memorandum of Understanding.

PARTY 1:
Signature: ________________________
Name: ${data.party1Signatory || "[Name]"}
Title: ${data.party1Title || "[Title]"}
Date: ${data.date || new Date().toLocaleDateString()}

PARTY 2:
Signature: ________________________
Name: ${data.party2Signatory || "[Name]"}
Title: ${data.party2Title || "[Title]"}
Date: ${data.date || new Date().toLocaleDateString()}
`,
  },
  mandate: {
    name: "Mandate Agreement",
    content: (data: any) => `
MANDATE AGREEMENT

This Mandate Agreement ("Agreement") is entered into on ${data.date || new Date().toLocaleDateString()} by and between:

MANDATOR: ${data.mandator || "[Mandator Name]"}
Address: ${data.mandatorAddress || "[Address]"}

MANDATARY: ${data.mandatary || "[Mandatary Name]"}
Address: ${data.mandataryAddress || "[Address]"}

1. APPOINTMENT
The Mandator hereby appoints the Mandatary to act as its authorized representative for the following purposes:

${data.scope || "[Describe the scope of the mandate]"}

2. AUTHORITY GRANTED
2.1 The Mandatary is authorized to:
${data.authorities || "- [Authority 1]\n- [Authority 2]\n- [Authority 3]"}

2.2 The Mandatary shall NOT:
${data.restrictions || "- [Restriction 1]\n- [Restriction 2]"}

3. DUTIES AND RESPONSIBILITIES
3.1 The Mandatary agrees to:
${data.duties || "- [Duty 1]\n- [Duty 2]\n- [Duty 3]"}

4. TERM
This mandate shall be effective from ${data.startDate || "[Start Date]"} to ${data.endDate || "[End Date]"}.

5. COMPENSATION
${data.compensation || "[Describe compensation structure]"}

6. REPORTING
The Mandatary shall provide regular reports to the Mandator:
${data.reportingRequirements || "[Describe reporting requirements]"}

7. TERMINATION
7.1 This mandate may be terminated by:
   a) Mutual written agreement
   b) ${data.terminationNotice || "[Notice Period]"} written notice by either party
   c) Immediate termination for cause

8. LIABILITY
8.1 The Mandatary shall be liable for actions taken within the scope of this mandate
8.2 The Mandatary shall indemnify the Mandator against losses caused by negligence or misconduct

9. GOVERNING LAW
This Agreement shall be governed by the laws of ${data.governingLaw || "[Jurisdiction]"}.

IN WITNESS WHEREOF, the parties have executed this Mandate Agreement.

MANDATOR:
Signature: ________________________
Name: ${data.mandatorSignatory || "[Name]"}
Title: ${data.mandatorTitle || "[Title]"}
Date: ${data.date || new Date().toLocaleDateString()}

MANDATARY:
Signature: ________________________
Name: ${data.mandatarySignatory || "[Name]"}
Title: ${data.mandataryTitle || "[Title]"}
Date: ${data.date || new Date().toLocaleDateString()}
`,
  },
  partnership: {
    name: "Partnership Agreement",
    content: (data: any) => `
PARTNERSHIP AGREEMENT

This Partnership Agreement ("Agreement") is entered into on ${data.date || new Date().toLocaleDateString()} by and between:

PARTNERS:
1. ${data.partner1 || "[Partner 1 Name]"}
   Address: ${data.partner1Address || "[Address]"}
   Capital Contribution: ${data.partner1Contribution || "[Amount/Assets]"}

2. ${data.partner2 || "[Partner 2 Name]"}
   Address: ${data.partner2Address || "[Address]"}
   Capital Contribution: ${data.partner2Contribution || "[Amount/Assets]"}

${data.additionalPartners || ""}

1. FORMATION
1.1 The partners hereby form a partnership under the name ${data.partnershipName || "[Partnership Name]"}
1.2 The principal place of business shall be ${data.principalPlace || "[Address]"}

2. PURPOSE
The purpose of this partnership is:
${data.purpose || "[Describe the purpose of the partnership]"}

3. CAPITAL CONTRIBUTIONS
3.1 Each partner shall contribute to the partnership as follows:
${data.capitalContributions || "[Detail capital contributions]"}

4. PROFIT AND LOSS DISTRIBUTION
4.1 Profits and losses shall be distributed as follows:
${data.distribution || "[Describe profit/loss sharing percentages]"}

5. MANAGEMENT
5.1 Each partner shall have equal rights in management
5.2 Major decisions require unanimous consent
5.3 Day-to-day operations may be handled by ${data.dayToDayManagement || "[Designated partner]"}

6. DUTIES OF PARTNERS
6.1 Each partner agrees to:
${data.duties || "- Devote full time and effort\n- Act in the best interest of the partnership\n- Account for all partnership property"}

7. RESTRICTIONS
7.1 No partner shall:
${data.restrictions || "- Compete with the partnership\n- Enter into contracts without approval\n- Assign partnership interests"}

8. TERM
This partnership shall commence on ${data.startDate || "[Start Date]"} and continue until:
${data.term || "[Describe term or termination conditions]"}

9. WITHDRAWAL AND ADMISSION
9.1 A partner may withdraw with ${data.withdrawalNotice || "[Notice Period]"} written notice
9.2 New partners may be admitted with unanimous consent

10. DISSOLUTION
10.1 The partnership shall dissolve upon:
${data.dissolutionEvents || "- Mutual agreement\n- Bankruptcy of a partner\n- Expiration of term"}

11. DISPUTE RESOLUTION
11.1 Disputes shall be resolved through:
${data.disputeResolution || "[Mediation then arbitration]"}

12. GOVERNING LAW
This Agreement shall be governed by the laws of ${data.governingLaw || "[Jurisdiction]"}.

IN WITNESS WHEREOF, the partners have executed this Partnership Agreement.

${data.partner1 || "Partner 1"}:
Signature: ________________________
Name: ${data.partner1Signatory || "[Name]"}
Date: ${data.date || new Date().toLocaleDateString()}

${data.partner2 || "Partner 2"}:
Signature: ________________________
Name: ${data.partner2Signatory || "[Name]"}
Date: ${data.date || new Date().toLocaleDateString()}
`,
  },
  contracts: {
    name: "Standard Service Contract",
    content: (data: any) => `
SERVICE CONTRACT AGREEMENT

This Service Contract Agreement ("Agreement") is made effective as of ${data.date || new Date().toLocaleDateString()} by and between:

CLIENT: ${data.clientName || data.disclosingParty || "[Client Name]"}
CONTRACTOR: ${data.contractorName || "[Contractor Name]"}
PROJECT: ${data.projectName || "[Project Name]"}

1. SERVICES PROVIDED
The Contractor agrees to perform the following services for the Client:
${data.services || data.projectDescription || "- Deliver project objectives as specified"}

2. DURATION & COMPENSATION
Commencing ${data.startDate || new Date().toLocaleDateString()}, services shall be billed and rendered upon mutual agreement.

IN WITNESS WHEREOF, the parties hereto have executed this Contract Agreement.

CLIENT SIGNATURE: ____________________ Date: ${data.date || new Date().toLocaleDateString()}
CONTRACTOR SIGNATURE: ________________ Date: ${data.date || new Date().toLocaleDateString()}
`,
  },
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, templateType, metadata } = body;

  if (!projectId || !templateType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { owner: true, stakeholders: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const template = TEMPLATES[templateType as keyof typeof TEMPLATES];
  if (!template) {
    return NextResponse.json({ error: "Invalid template type" }, { status: 400 });
  }

  // Prepare template data
  const templateData = {
    date: new Date().toLocaleDateString(),
    projectName: project.name,
    projectDescription: project.description || "",
    disclosingParty: project.owner?.name || project.owner?.email || "Project Owner",
    ...metadata,
  };

  // Generate document content
  const content = template.content(templateData);

  // Create DOCX
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: template.name,
                bold: true,
                size: 32,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [],
          }),
          ...content.split("\n").map(
            (line) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    size: 24,
                  }),
                ],
                spacing: {
                  after: 120,
                },
              })
          ),
        ],
      },
    ],
  });

  // Generate buffer
  const buffer = await Packer.toBuffer(doc);
  const base64 = buffer.toString("base64");

  // Save to database
  const document = await db.generatedDocument.create({
    data: {
      projectId,
      templateId: templateType,
      fileName: `${template.name.replace(/\s+/g, "_")}_${project.name.replace(/\s+/g, "_")}.docx`,
      status: "generated",
      metadata: {
        ...templateData,
        base64,
      },
    },
  });

  return NextResponse.json({
    document,
    base64,
    fileName: document.fileName,
  });
}

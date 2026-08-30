# Galactic Trust — Institution Accountability Model

Status: future-institution planning only  
Current operating posture: simulation-only fintech prototype  
Long-term goal: future chartered bank only if the applicable authorities approve it

## Why this exists

A bank-grade control framework cannot stop at “the software has a feature.” Every material control must eventually have a **qualified human or human-led function with real authority, independence where required, written responsibility, evidence, and escalation rights**.

The permanent rule is:

> software implemented ≠ human owner assigned ≠ authority granted ≠ control operating ≠ independently tested ≠ externally approved.

AI, Orbit, ChatGPT, autonomous agents, source code, CI, and software services may assist with drafting, evidence organization, testing, monitoring, and workflow. They cannot be the accountable bank board, bank officer, BSA/AML officer, compliance officer, risk officer, finance officer, internal audit function, organizer, regulator, or sponsor-bank accountable human.

## Machine-readable source

`lib/institution-accountability.ts` defines the future-institution accountability register. Every seeded role starts:

- `assignmentStatus: unassigned`
- `qualifiedHumanRequired: true`
- `aiMayServeAsAccountableOwner: false`
- `softwareMayServeAsAccountableOwner: false`
- qualifications, authority, independence, delegation, governance approval, operating evidence, and external review all unverified.

The register currently covers:

1. proposed bank board;
2. chief executive / bank president;
3. BSA/AML compliance officer;
4. consumer compliance owner;
5. enterprise / bank risk owner;
6. finance / capital / liquidity owner;
7. information security owner;
8. bank technology and operations owner;
9. privacy and data-governance owner;
10. complaints and customer-protection owner;
11. third-party risk owner;
12. business continuity / disaster recovery owner;
13. independent internal audit / assurance function;
14. sponsor-bank / regulated-program accountable function;
15. charter application / regulator coordination owner;
16. AI / model / automated-decision governance owner.

This is a planning taxonomy, not a representation that every listed role must be a separate employee. Actual structure, independence, dual-hatting, committee composition, delegation, and regulatory expectations depend on the final entity, charter, size, complexity, activities, program, and applicable law/guidance.

## Assignment evidence chain

Before a role can be treated as genuinely assigned, the private evidence package should establish, as applicable:

1. identity of the actual person, committee, function, or regulated-partner function;
2. role title and employing / contracting organization;
3. qualifications and relevant experience;
4. actual authority, reporting line, budget/resources, and escalation rights;
5. independence from activities the role must challenge or test;
6. written delegation, employment, committee charter, board resolution, contract, or other authority evidence;
7. governance / board approval where required;
8. operating procedures and evidence the role is performing its responsibilities;
9. independent testing or external review where required;
10. sponsor-bank, regulator, or other external acceptance where applicable.

A GitHub field, UI form, or operator assertion is never sufficient evidence by itself.

## AI boundary

AI may:

- draft role descriptions;
- map controls to proposed owners;
- identify missing evidence;
- summarize public supervisory materials;
- prepare meeting checklists;
- test whether a package is structurally complete;
- help track remediation.

AI may not:

- appoint a director or officer;
- serve as a director or officer;
- serve as the BSA/AML officer;
- approve a SAR decision or disclose SAR existence;
- provide the independent audit opinion;
- sign board minutes or resolutions;
- authenticate a person’s qualifications or background evidence;
- create legal authority or fiduciary duty;
- file or attest to a charter/deposit-insurance application as an organizer;
- speak to a regulator as though it were an authorized human representative;
- certify compliance or examination readiness.

## Sponsor-program vs. charter accountability

A sponsor/BaaS program may allocate responsibilities differently from a future chartered bank. The actual contract, program approval, law, and regulator/sponsor expectations control the allocation.

Therefore:

- sponsor responsibility allocation must be documented separately;
- sponsor accountability is not a substitute for a future bank board or bank management team;
- outsourcing a task does not automatically transfer legal accountability;
- vendor performance must not be mistaken for Galactic governance approval;
- a future transition from sponsor program to chartered operations requires a fresh responsibility review.

## Release gates

Keep live financial activity and charter-filing readiness false until the relevant rows have real assigned humans/functions and evidence. At minimum, this includes the applicable:

- board and executive management;
- BSA/AML and consumer-compliance ownership;
- risk and finance/capital/liquidity ownership;
- security / technology / operations ownership;
- complaints / customer protection;
- third-party risk and continuity;
- independent assurance;
- sponsor-program accountable functions;
- charter application coordination.

A blank, disputed, unqualified, under-resourced, or software-only owner is a blocker, not a completed control.

## Sensitive evidence

Do not commit personal background reports, government IDs, tax IDs, bank statements, source-of-funds documents, confidential regulator correspondence, privileged legal advice, employment records, or other sensitive diligence evidence to the public repository. Keep only non-sensitive references/metadata in the software where appropriate.

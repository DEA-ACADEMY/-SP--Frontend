export type StudentExtraFieldName =
    | "birthDate"
    | "nationality"
    | "residenceCountry"
    | "gender"
    | "studentStage"
    | "iqTestScore"
    | "maritalStatus"
    | "familyMembersCount"
    | "parentsMaritalStatus"
    | "familyObligations"
    | "familyObligationsDetails"
    | "volunteeringExperience"
    | "volunteeringDetails"
    | "paidWorkExperience"
    | "paidWorkDetails"
    | "universityPhase"
    | "major"
    | "university"
    | "academicNumber"
    | "latestGpa"
    | "annualTuitionFees"
    | "lowIncomeFamily"
    | "ataTrainingCost"
    | "housingCost"
    | "transportationCost"
    | "medicalCost"
    | "otherCosts";

export type StudentExtraFormState = Record<StudentExtraFieldName, string>;

export type StudentExtraField = {
    name: StudentExtraFieldName;
    labelKey: string;
    type?: "text" | "date" | "number";
    optionsKey?: string;
    required?: boolean;
};

export const emptyStudentExtraForm: StudentExtraFormState = {
    birthDate: "",
    nationality: "",
    residenceCountry: "",
    gender: "",
    studentStage: "",
    iqTestScore: "",
    maritalStatus: "",
    familyMembersCount: "",
    parentsMaritalStatus: "",
    familyObligations: "",
    familyObligationsDetails: "",
    volunteeringExperience: "",
    volunteeringDetails: "",
    paidWorkExperience: "",
    paidWorkDetails: "",
    universityPhase: "",
    major: "",
    university: "",
    academicNumber: "",
    latestGpa: "",
    annualTuitionFees: "",
    lowIncomeFamily: "",
    ataTrainingCost: "",
    housingCost: "",
    transportationCost: "",
    medicalCost: "",
    otherCosts: "",
};

export const studentExtraFields: StudentExtraField[] = [
    { name: "birthDate", labelKey: "students.intake.fields.birthDate", type: "date", required: true },
    { name: "nationality", labelKey: "students.intake.fields.nationality", required: true },
    { name: "residenceCountry", labelKey: "students.intake.fields.residenceCountry", required: true },
    { name: "gender", labelKey: "students.intake.fields.gender", optionsKey: "gender", required: true },
    { name: "studentStage", labelKey: "students.intake.fields.studentStage", optionsKey: "studentStage", required: true },
    { name: "iqTestScore", labelKey: "students.intake.fields.iqTestScore", required: true },
    { name: "maritalStatus", labelKey: "students.intake.fields.maritalStatus", optionsKey: "maritalStatus", required: true },
    { name: "familyMembersCount", labelKey: "students.intake.fields.familyMembersCount", type: "number", required: true },
    { name: "parentsMaritalStatus", labelKey: "students.intake.fields.parentsMaritalStatus", optionsKey: "parentsMaritalStatus", required: true },
    { name: "familyObligations", labelKey: "students.intake.fields.familyObligations", optionsKey: "yesNo", required: true },
    { name: "familyObligationsDetails", labelKey: "students.intake.fields.familyObligationsDetails" },
    { name: "volunteeringExperience", labelKey: "students.intake.fields.volunteeringExperience", optionsKey: "yesNo", required: true },
    { name: "volunteeringDetails", labelKey: "students.intake.fields.volunteeringDetails" },
    { name: "paidWorkExperience", labelKey: "students.intake.fields.paidWorkExperience", optionsKey: "yesNo", required: true },
    { name: "paidWorkDetails", labelKey: "students.intake.fields.paidWorkDetails" },
    { name: "universityPhase", labelKey: "students.intake.fields.universityPhase", optionsKey: "universityPhase", required: true },
    { name: "major", labelKey: "students.intake.fields.major", required: true },
    { name: "university", labelKey: "students.intake.fields.university", required: true },
    { name: "academicNumber", labelKey: "students.intake.fields.academicNumber", required: true },
    { name: "latestGpa", labelKey: "students.intake.fields.latestGpa", required: true },
    { name: "annualTuitionFees", labelKey: "students.intake.fields.annualTuitionFees", required: true },
    { name: "lowIncomeFamily", labelKey: "students.intake.fields.lowIncomeFamily", optionsKey: "yesNo", required: true },
    { name: "ataTrainingCost", labelKey: "students.intake.fields.ataTrainingCost" },
    { name: "housingCost", labelKey: "students.intake.fields.housingCost" },
    { name: "transportationCost", labelKey: "students.intake.fields.transportationCost" },
    { name: "medicalCost", labelKey: "students.intake.fields.medicalCost" },
    { name: "otherCosts", labelKey: "students.intake.fields.otherCosts" },
];

export const orderedStudentExtraFields: StudentExtraField[] = [
    ...studentExtraFields.slice(0, 10),
    studentExtraFields[11],
    studentExtraFields[10],
    studentExtraFields[13],
    studentExtraFields[12],
    studentExtraFields[15],
    studentExtraFields[14],
    ...studentExtraFields.slice(16),
].filter(Boolean) as StudentExtraField[];

const fieldByName = Object.fromEntries(
    studentExtraFields.map((field) => [field.name, field]),
) as Record<StudentExtraFieldName, StudentExtraField>;

export const beforeConditionalStudentExtraFields = studentExtraFields.slice(0, 9);

export const conditionalStudentExtraGroups = [
    {
        question: fieldByName.familyObligations,
        details: fieldByName.familyObligationsDetails,
    },
    {
        question: fieldByName.volunteeringExperience,
        details: fieldByName.volunteeringDetails,
    },
    {
        question: fieldByName.paidWorkExperience,
        details: fieldByName.paidWorkDetails,
    },
];

export const afterConditionalStudentExtraFields = [
    fieldByName.universityPhase,
    fieldByName.major,
    fieldByName.university,
    fieldByName.academicNumber,
    fieldByName.latestGpa,
    fieldByName.annualTuitionFees,
    fieldByName.lowIncomeFamily,
    fieldByName.ataTrainingCost,
    fieldByName.housingCost,
    fieldByName.transportationCost,
    fieldByName.medicalCost,
    fieldByName.otherCosts,
];

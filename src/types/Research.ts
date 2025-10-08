export type Project = {
    id: string;
    agency: string;
    beginDate: string;
    budget: string;
    budgetUnit: string;
    contents: string;
    endDate: string;
}

export type ProjectRequest = {
    agency: string;
    beginDate: string;
    budget: string;
    budgetUnit: string;
    contents: string;
    endDate: string;
}

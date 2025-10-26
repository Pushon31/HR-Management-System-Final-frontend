export interface SalaryStructure {
  id?: number;
  employeeId: number;
  employeeName?: string;
  employeeCode?: string;
  designation?: string;
  departmentName?: string;
  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  totalDeductions: number;
  grossSalary: number;
  netSalary: number;
  status: string;
}

export interface Payroll {
  id?: number;
  employeeId: number;
  employeeName?: string;
  employeeCode?: string;
  designation?: string;
  departmentName?: string;
  payPeriod: string; // Format: "2024-10"
  payDate: string;
  basicSalary: number;
  totalAllowances: number;
  overtimePay: number;
  bonus: number;
  taxDeduction: number;
  otherDeductions: number;
  grossSalary: number;
  netSalary: number;
  workingDays: number;
  presentDays: number;
  status: string;
  remarks?: string;
}

export interface Payslip {
  id?: number;
  payrollId: number;
  payslipCode: string;
  issueDate: string;
  employeeId: number;
  employeeName?: string;
  employeeCode?: string;
  designation?: string;
  departmentName?: string;
  basicSalary: number;
  totalAllowances: number;
  deductions: number;
  netSalary: number;
  payPeriod: string;
  isGenerated: boolean;
  status: string;
}

export interface Bonus {
  id?: number;
  employeeId: number;
  employeeName?: string;
  employeeCode?: string;
  designation?: string;
  departmentName?: string;
  bonusType: string;
  amount: number;
  bonusDate: string;
  reason: string;
  status: string;
}

export interface PayrollSummary {
  totalEmployees: number;
  totalExpense: number;
  pendingCount: number;
  payPeriod: string;
}

export interface PayrollDashboard {
  averageSalary: number;
  generatedPayslips: number;
  pendingPayrolls: number;
  totalEmployees: number;
}
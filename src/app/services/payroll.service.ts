import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  SalaryStructure, 
  Payroll, 
  Payslip, 
  Bonus, 
  PayrollSummary, 
  PayrollDashboard 
} from '../models/payroll.model';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private apiUrl = 'http://localhost:8080/api/payroll';

  constructor(private http: HttpClient) {}

  // ==================== SALARY STRUCTURE METHODS ====================

  getSalaryStructures(): Observable<SalaryStructure[]> {
    return this.http.get<SalaryStructure[]>(`${this.apiUrl}/salary-structures`);
  }

  getSalaryStructure(id: number): Observable<SalaryStructure> {
    return this.http.get<SalaryStructure>(`${this.apiUrl}/salary-structures/${id}`);
  }

  getSalaryStructureByEmployee(employeeId: number): Observable<SalaryStructure> {
    return this.http.get<SalaryStructure>(`${this.apiUrl}/salary-structures/employee/${employeeId}`);
  }

  createSalaryStructure(salaryStructure: SalaryStructure): Observable<SalaryStructure> {
    return this.http.post<SalaryStructure>(`${this.apiUrl}/salary-structures`, salaryStructure);
  }

  updateSalaryStructure(id: number, salaryStructure: SalaryStructure): Observable<SalaryStructure> {
    return this.http.put<SalaryStructure>(`${this.apiUrl}/salary-structures/${id}`, salaryStructure);
  }

  // ==================== PAYROLL METHODS ====================

  processPayroll(employeeId: number, payPeriod: string): Observable<Payroll> {
    const params = new HttpParams().set('payPeriod', payPeriod);
    return this.http.post<Payroll>(`${this.apiUrl}/process/${employeeId}`, {}, { params });
  }

  processBulkPayroll(payPeriod: string, employeeIds: number[]): Observable<Payroll[]> {
    const params = new HttpParams().set('payPeriod', payPeriod);
    return this.http.post<Payroll[]>(`${this.apiUrl}/process/bulk`, employeeIds, { params });
  }

  getPayroll(id: number): Observable<Payroll> {
    return this.http.get<Payroll>(`${this.apiUrl}/${id}`);
  }

  getEmployeePayrollForPeriod(employeeId: number, payPeriod: string): Observable<Payroll> {
    return this.http.get<Payroll>(`${this.apiUrl}/employee/${employeeId}/period/${payPeriod}`);
  }

  getPayrollsByPeriod(payPeriod: string): Observable<Payroll[]> {
    return this.http.get<Payroll[]>(`${this.apiUrl}/period/${payPeriod}`);
  }

  getEmployeePayrollHistory(employeeId: number): Observable<Payroll[]> {
    return this.http.get<Payroll[]>(`${this.apiUrl}/employee/${employeeId}/history`);
  }

  updatePayrollStatus(id: number, status: string): Observable<Payroll> {
    const params = new HttpParams().set('status', status);
    return this.http.put<Payroll>(`${this.apiUrl}/${id}/status`, {}, { params });
  }

  // ==================== PAYSLIP METHODS ====================

  generatePayslip(payrollId: number): Observable<Payslip> {
    return this.http.post<Payslip>(`${this.apiUrl}/payslips/generate/${payrollId}`, {});
  }

  getPayslip(id: number): Observable<Payslip> {
    return this.http.get<Payslip>(`${this.apiUrl}/payslips/${id}`);
  }

  getPayslipByPayroll(payrollId: number): Observable<Payslip> {
    return this.http.get<Payslip>(`${this.apiUrl}/payslips/payroll/${payrollId}`);
  }

  getEmployeePayslips(employeeId: number): Observable<Payslip[]> {
    return this.http.get<Payslip[]>(`${this.apiUrl}/payslips/employee/${employeeId}`);
  }

  getEmployeePayslipsByEmployeeId(employeeId: string): Observable<Payslip[]> {
    return this.http.get<Payslip[]>(`${this.apiUrl}/payslips/employee-code/${employeeId}`);
  }

  getPayslipsByPayPeriod(payPeriod: string): Observable<Payslip[]> {
    return this.http.get<Payslip[]>(`${this.apiUrl}/payslips/period/${payPeriod}`);
  }

  // ==================== BONUS METHODS ====================

  getBonuses(): Observable<Bonus[]> {
    // Note: You might need to create this endpoint or use date range
    return this.http.get<Bonus[]>(`${this.apiUrl}/bonuses`);
  }

  createBonus(bonus: Bonus): Observable<Bonus> {
    return this.http.post<Bonus>(`${this.apiUrl}/bonuses`, bonus);
  }

  updateBonus(id: number, bonus: Bonus): Observable<Bonus> {
    return this.http.put<Bonus>(`${this.apiUrl}/bonuses/${id}`, bonus);
  }

  getEmployeeBonuses(employeeId: number): Observable<Bonus[]> {
    return this.http.get<Bonus[]>(`${this.apiUrl}/bonuses/employee/${employeeId}`);
  }

  getBonusesByDateRange(startDate: string, endDate: string): Observable<Bonus[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<Bonus[]>(`${this.apiUrl}/bonuses/date-range`, { params });
  }

  deleteBonus(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bonuses/${id}`);
  }

  // ==================== REPORTS & DASHBOARD ====================

  getPayrollSummary(payPeriod: string): Observable<PayrollSummary> {
    return this.http.get<PayrollSummary>(`${this.apiUrl}/reports/summary/${payPeriod}`);
  }

  getPayrollDashboard(): Observable<PayrollDashboard> {
    return this.http.get<PayrollDashboard>(`${this.apiUrl}/dashboard`);
  }
}
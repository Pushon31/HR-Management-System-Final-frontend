// salary-structure-form.component.ts - Updated with your Employee model
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PayrollService } from '../../../services/payroll.service';
import { EmployeeService } from '../../../services/employee.service';
import { SalaryStructure } from '../../../models/payroll.model';
import { Employee } from '../../../models/employee.model';

@Component({
  selector: 'app-salary-structure-form',
  templateUrl: './salary-structure-form.component.html',
  styleUrls: ['./salary-structure-form.component.scss']
})
export class SalaryStructureFormComponent implements OnInit {
  salaryForm: FormGroup;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  structureId: number | null = null;

  employees: Employee[] = [];
  departments: string[] = [];
  designations: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private payrollService: PayrollService,
    private employeeService: EmployeeService
  ) {
    this.salaryForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadEmployees();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.structureId = +params['id'];
        this.loadSalaryStructure(this.structureId);
      }
    });
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        // ✅ Extract unique departments and designations from employees
        this.departments = [...new Set(employees.map(emp => emp.departmentName).filter(dept => dept))] as string[];
        this.designations = [...new Set(employees.map(emp => emp.designation).filter(desig => desig))] as string[];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.employees = [];
        this.isLoading = false;
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      employeeId: ['', Validators.required],
      employeeName: ['', Validators.required],
      employeeCode: ['', Validators.required],  // ✅ employeeId (business ID)
      departmentName: ['', Validators.required],
      designation: ['', Validators.required],
      basicSalary: [0, [Validators.required, Validators.min(0)]],
      houseRent: [0, [Validators.required, Validators.min(0)]],
      medicalAllowance: [0, [Validators.required, Validators.min(0)]],
      transportAllowance: [0, [Validators.required, Validators.min(0)]],
      otherAllowances: [0, [Validators.required, Validators.min(0)]],
      incomeTax: [0, [Validators.required, Validators.min(0)]],
      providentFund: [0, [Validators.required, Validators.min(0)]],
      otherDeductions: [0, [Validators.required, Validators.min(0)]],
      status: ['ACTIVE', Validators.required]
    });
  }

  loadSalaryStructure(id: number): void {
    this.isLoading = true;
    this.payrollService.getSalaryStructure(id).subscribe({
      next: (structure) => {
        this.salaryForm.patchValue(structure);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading salary structure:', error);
        this.isLoading = false;
      }
    });
  }

  onEmployeeSelect(event: any): void {
    const employeeId = event.target.value;
    const selectedEmployee = this.employees.find(emp => emp.id === +employeeId);
    
    if (selectedEmployee) {
      // ✅ আপনার Employee model অনুযায়ী adjustment
      this.salaryForm.patchValue({
        employeeName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`, // ✅ firstName + lastName
        employeeCode: selectedEmployee.employeeId, // ✅ business employeeId
        departmentName: selectedEmployee.departmentName,
        designation: selectedEmployee.designation,
        // ✅ যদি existing basic salary থাকে তাহলে সেটাও auto-fill করতে পারেন
        basicSalary: selectedEmployee.basicSalary || 0
      });
    }
  }

  calculateNetSalary(): number {
    const formValue = this.salaryForm.value;
    const totalAllowances = formValue.houseRent + formValue.medicalAllowance + 
                           formValue.transportAllowance + formValue.otherAllowances;
    const totalDeductions = formValue.incomeTax + formValue.providentFund + 
                           formValue.otherDeductions;
    
    return formValue.basicSalary + totalAllowances - totalDeductions;
  }

  onSubmit(): void {
    if (this.salaryForm.valid) {
      this.isSubmitting = true;
      const formData = this.salaryForm.value;
      
      // Calculate net salary
      formData.netSalary = this.calculateNetSalary();
      formData.totalAllowances = formData.houseRent + formData.medicalAllowance + 
                                formData.transportAllowance + formData.otherAllowances;
      formData.totalDeductions = formData.incomeTax + formData.providentFund + 
                                formData.otherDeductions;

      if (this.isEditMode && this.structureId) {
        this.payrollService.updateSalaryStructure(this.structureId, formData).subscribe({
          next: () => {
            this.isSubmitting = false;
            alert('Salary structure updated successfully!');
            this.router.navigate(['/admin/payroll/structures']);
          },
          error: (error) => {
            this.isSubmitting = false;
            console.error('Error updating salary structure:', error);
            alert('Error updating salary structure. Please try again.');
          }
        });
      } else {
        this.payrollService.createSalaryStructure(formData).subscribe({
          next: () => {
            this.isSubmitting = false;
            alert('Salary structure created successfully!');
            this.router.navigate(['/admin/payroll/structures']);
          },
          error: (error) => {
            this.isSubmitting = false;
            console.error('Error creating salary structure:', error);
            alert('Error creating salary structure. Please try again.');
          }
        });
      }
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  }
}
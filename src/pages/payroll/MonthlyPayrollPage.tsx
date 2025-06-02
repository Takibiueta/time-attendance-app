import React, { useState } from 'react';
import { format } from 'date-fns';
import { FileText, Download, Calendar } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { useEmployeeStore } from '../../stores/employeeStore';

// Helper to generate month options
const getMonthOptions = () => {
  const options = [];
  const today = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const value = format(date, 'yyyy-MM');
    const label = format(date, 'yyyy年MM月');
    
    options.push({ value, label });
  }
  
  return options;
};

const MonthlyPayrollPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const employees = useEmployeeStore(state => state.employees);
  const monthOptions = getMonthOptions();
  
  // In a real app, this would calculate actual payroll data based on
  // attendance records and employee information
  const generateMockPayrollData = () => {
    return employees.map(employee => {
      // Mock values for demonstration
      const workDays = Math.floor(Math.random() * 5) + 16; // 16-20 days
      const absentDays = Math.floor(Math.random() * 3); // 0-2 days
      const paidLeaveDays = Math.floor(Math.random() * 2); // 0-1 days
      
      const baseSalary = employee.baseSalary;
      const transportationAllowance = employee.transportationAllowance;
      
      // Calculate total allowances
      const allowancesTotal = employee.allowances.reduce((sum, allowance) => {
        return sum + (allowance.name ? allowance.amount : 0);
      }, 0);
      
      // Mock overtime pay
      const overtimePay = Math.round(baseSalary * 0.2 * (Math.random() * 10));
      
      // Calculate total pay
      const totalPay = baseSalary + transportationAllowance + allowancesTotal + overtimePay;
      
      // Calculate deductions
      const healthInsurance = employee.healthInsurance;
      const nursingInsurance = employee.nursingInsurance;
      const pensionInsurance = employee.pensionInsurance;
      
      const incomeTax = Math.round(totalPay * 0.05); // Mock income tax calculation
      const residentTax = selectedMonth.endsWith('-06') 
        ? employee.residentTax.june 
        : employee.residentTax.other;
      
      const insuranceTotal = healthInsurance + nursingInsurance + pensionInsurance;
      const totalDeductions = insuranceTotal + incomeTax + residentTax;
      
      // Net pay
      const netPay = totalPay - totalDeductions;
      
      return {
        id: employee.id,
        name: employee.name,
        employeeNumber: employee.employeeNumber,
        workDays,
        absentDays,
        paidLeaveDays,
        baseSalary,
        transportationAllowance,
        overtimePay,
        allowances: employee.allowances,
        totalPay,
        healthInsurance,
        nursingInsurance,
        pensionInsurance,
        insuranceTotal,
        incomeTax,
        residentTax,
        totalDeductions,
        netPay
      };
    });
  };
  
  const payrollData = generateMockPayrollData();
  
  const handleDownloadPdf = () => {
    alert('給与一覧のPDFをダウンロードする機能（未実装）');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">月次給与一覧</h1>
        <Button
          variant="primary"
          icon={<Download size={18} />}
          onClick={handleDownloadPdf}
        >
          PDF出力
        </Button>
      </div>
      
      <Card>
        <div className="mb-6 flex items-center space-x-4">
          <div className="w-64">
            <Select
              label="対象月"
              options={monthOptions}
              value={selectedMonth}
              onChange={setSelectedMonth}
              icon={<Calendar size={18} />}
            />
          </div>
          <div className="flex-grow"></div>
          <div className="text-right text-sm text-gray-500">
            <p>計算期間: {selectedMonth.replace('-', '/')} 26日 〜 翌月25日</p>
          </div>
        </div>
        
        <div className="table-container">
          <table className="data-table text-sm">
            <thead>
              <tr>
                <th rowSpan={2}>氏名</th>
                <th colSpan={3} className="text-center">勤怠</th>
                <th colSpan={4} className="text-center">支給</th>
                <th colSpan={5} className="text-center">控除</th>
                <th rowSpan={2}>差引支給額</th>
              </tr>
              <tr>
                <th>出勤日数</th>
                <th>欠勤日数</th>
                <th>有給使用</th>
                <th>基本給</th>
                <th>交通費</th>
                <th>残業手当</th>
                <th>支給合計</th>
                <th>社会保険</th>
                <th>所得税</th>
                <th>住民税</th>
                <th>控除合計</th>
              </tr>
            </thead>
            <tbody>
              {payrollData.map((data) => (
                <tr key={data.id} className="hover:bg-gray-50">
                  <td className="font-medium text-gray-900">{data.name}</td>
                  <td>{data.workDays}日</td>
                  <td>{data.absentDays}日</td>
                  <td>{data.paidLeaveDays}日</td>
                  <td>{data.baseSalary.toLocaleString()}円</td>
                  <td>{data.transportationAllowance.toLocaleString()}円</td>
                  <td>{data.overtimePay.toLocaleString()}円</td>
                  <td className="font-medium">{data.totalPay.toLocaleString()}円</td>
                  <td>{data.insuranceTotal.toLocaleString()}円</td>
                  <td>{data.incomeTax.toLocaleString()}円</td>
                  <td>{data.residentTax.toLocaleString()}円</td>
                  <td className="font-medium">{data.totalDeductions.toLocaleString()}円</td>
                  <td className="font-bold text-primary-700">{data.netPay.toLocaleString()}円</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold">
                <td>合計</td>
                <td>{payrollData.reduce((sum, data) => sum + data.workDays, 0)}日</td>
                <td>{payrollData.reduce((sum, data) => sum + data.absentDays, 0)}日</td>
                <td>{payrollData.reduce((sum, data) => sum + data.paidLeaveDays, 0)}日</td>
                <td>{payrollData.reduce((sum, data) => sum + data.baseSalary, 0).toLocaleString()}円</td>
                <td>{payrollData.reduce((sum, data) => sum + data.transportationAllowance, 0).toLocaleString()}円</td>
                <td>{payrollData.reduce((sum, data) => sum + data.overtimePay, 0).toLocaleString()}円</td>
                <td>{payrollData.reduce((sum, data) => sum + data.totalPay, 0).toLocaleString()}円</td>
                <td>{payrollData.reduce((sum, data) => sum + data.insuranceTotal, 0).toLocaleString()}円</td>
                <td>{payrollData.reduce((sum, data) => sum + data.incomeTax, 0).toLocaleString()}円</td>
                <td>{payrollData.reduce((sum, data) => sum + data.residentTax, 0).toLocaleString()}円</td>
                <td>{payrollData.reduce((sum, data) => sum + data.totalDeductions, 0).toLocaleString()}円</td>
                <td>{payrollData.reduce((sum, data) => sum + data.netPay, 0).toLocaleString()}円</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default MonthlyPayrollPage;
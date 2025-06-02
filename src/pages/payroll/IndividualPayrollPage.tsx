import React, { useState } from 'react';
import { format, subMonths } from 'date-fns';
import { User, Calendar, Download, BarChart2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { useEmployeeStore } from '../../stores/employeeStore';

const IndividualPayrollPage: React.FC = () => {
  const employees = useEmployeeStore(state => state.employees);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    employees.length > 0 ? employees[0].id : ''
  );
  
  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  
  // Generate employee options for select
  const employeeOptions = employees.map(employee => ({
    value: employee.id,
    label: `${employee.name} (${employee.employeeNumber})`
  }));
  
  // Generate mock payroll data for the past 12 months
  const generateMonthlyPayrollData = () => {
    if (!selectedEmployee) return [];
    
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      const monthStr = format(date, 'yyyy-MM');
      const isJune = format(date, 'MM') === '06';
      
      // Base values
      const baseSalary = selectedEmployee.baseSalary;
      const transportationAllowance = selectedEmployee.transportationAllowance;
      
      // Random overtime hours between 0-30
      const overtimeHours = Math.floor(Math.random() * 30);
      const overtimePay = Math.round(
        baseSalary * 0.2 * (overtimeHours / (selectedEmployee.salaryType === '時給' ? 1 : 8))
      );
      
      // Calculate allowances
      const allowancesTotal = selectedEmployee.allowances.reduce((sum, allowance) => {
        return sum + (allowance.name ? allowance.amount : 0);
      }, 0);
      
      // Total pay
      const totalPay = baseSalary + transportationAllowance + allowancesTotal + overtimePay;
      
      // Deductions
      const healthInsurance = selectedEmployee.healthInsurance;
      const nursingInsurance = selectedEmployee.nursingInsurance;
      const pensionInsurance = selectedEmployee.pensionInsurance;
      const insuranceTotal = healthInsurance + nursingInsurance + pensionInsurance;
      
      const incomeTax = Math.round(totalPay * 0.05); // Mock income tax
      const residentTax = isJune ? selectedEmployee.residentTax.june : selectedEmployee.residentTax.other;
      
      const totalDeductions = insuranceTotal + incomeTax + residentTax;
      
      // Net pay
      const netPay = totalPay - totalDeductions;
      
      months.push({
        month: monthStr,
        formattedMonth: format(date, 'yyyy年MM月'),
        baseSalary,
        transportationAllowance,
        overtimeHours,
        overtimePay,
        allowancesTotal,
        totalPay,
        healthInsurance,
        nursingInsurance,
        pensionInsurance,
        insuranceTotal,
        incomeTax,
        residentTax,
        totalDeductions,
        netPay
      });
    }
    
    return months.reverse(); // Show most recent month first
  };
  
  const payrollData = generateMonthlyPayrollData();
  
  const handleDownloadPdf = () => {
    alert('個人別年間給与のPDFをダウンロードする機能（未実装）');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">個人別年間給与</h1>
        <Button
          variant="primary"
          icon={<Download size={18} />}
          onClick={handleDownloadPdf}
          disabled={!selectedEmployee}
        >
          PDF出力
        </Button>
      </div>
      
      <Card>
        <div className="mb-6">
          <div className="w-64">
            <Select
              label="従業員"
              options={employeeOptions}
              value={selectedEmployeeId}
              onChange={setSelectedEmployeeId}
              icon={<User size={18} />}
            />
          </div>
        </div>
        
        {selectedEmployee ? (
          <>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500">従業員番号</p>
                  <p className="font-medium">{selectedEmployee.employeeNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">氏名</p>
                  <p className="font-medium">{selectedEmployee.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">給与体系</p>
                  <p className="font-medium">{selectedEmployee.salaryType}</p>
                </div>
              </div>
            </div>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>対象月</th>
                    <th>基本給</th>
                    <th>交通費</th>
                    <th>残業時間</th>
                    <th>残業手当</th>
                    <th>支給合計</th>
                    <th>控除合計</th>
                    <th>差引支給額</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollData.map((data) => (
                    <tr key={data.month} className="hover:bg-gray-50">
                      <td className="font-medium">{data.formattedMonth}</td>
                      <td>{data.baseSalary.toLocaleString()}円</td>
                      <td>{data.transportationAllowance.toLocaleString()}円</td>
                      <td>{data.overtimeHours}時間</td>
                      <td>{data.overtimePay.toLocaleString()}円</td>
                      <td className="font-medium">{data.totalPay.toLocaleString()}円</td>
                      <td>{data.totalDeductions.toLocaleString()}円</td>
                      <td className="font-bold text-primary-700">{data.netPay.toLocaleString()}円</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-semibold">
                    <td>合計</td>
                    <td>{payrollData.reduce((sum, data) => sum + data.baseSalary, 0).toLocaleString()}円</td>
                    <td>{payrollData.reduce((sum, data) => sum + data.transportationAllowance, 0).toLocaleString()}円</td>
                    <td>{payrollData.reduce((sum, data) => sum + data.overtimeHours, 0)}時間</td>
                    <td>{payrollData.reduce((sum, data) => sum + data.overtimePay, 0).toLocaleString()}円</td>
                    <td>{payrollData.reduce((sum, data) => sum + data.totalPay, 0).toLocaleString()}円</td>
                    <td>{payrollData.reduce((sum, data) => sum + data.totalDeductions, 0).toLocaleString()}円</td>
                    <td>{payrollData.reduce((sum, data) => sum + data.netPay, 0).toLocaleString()}円</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">年間推移グラフ</h3>
              <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <BarChart2 size={48} className="mx-auto opacity-30" />
                  <p className="mt-2">給与推移グラフ（実装予定）</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            従業員を選択してください。
          </div>
        )}
      </Card>
    </div>
  );
};

export default IndividualPayrollPage;
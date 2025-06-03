import React, { useState } from 'react';
import { format } from 'date-fns';
import { User, Calendar, Download, BarChart2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { useEmployeeStore } from '../../stores/employeeStore';
import { useAttendanceStore } from '../../stores/attendanceStore';

const IndividualPayrollPage: React.FC = () => {
  const employees = useEmployeeStore(state => state.employees);
  const { getWorkDaysInMonth } = useAttendanceStore();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    employees.length > 0 ? employees[0].id : ''
  );
  
  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  
  // Generate employee options for select
  const employeeOptions = employees.map(employee => ({
    value: employee.id,
    label: `${employee.name} (${employee.employeeNumber})`
  }));
  
  // Generate year options (current year and previous 2 years)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    
    for (let year = currentYear; year >= currentYear - 2; year--) {
      options.push({
        value: year.toString(),
        label: `${year}年`
      });
    }
    
    return options;
  };
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const yearOptions = generateYearOptions();
  
  // Generate payroll data for 12 months (January to December)
  const generateMonthlyPayrollData = () => {
    if (!selectedEmployee) return [];
    
    const months = [];
    const year = parseInt(selectedYear);
    
    for (let month = 1; month <= 12; month++) {
      const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
      const formattedMonth = `${year}年${month}月`;
      
      // 実際の出勤日数を取得
      const actualWorkDays = getWorkDaysInMonth(selectedEmployee.employeeNumber, monthStr);
      
      // 欠勤日数（簡易計算、実際は出退勤記録から計算）
      const absentDays = 0; // TODO: 実際の欠勤記録から計算
      const paidLeaveDays = 0; // TODO: 実際の有給使用記録から計算
      
      // 基本給計算
      let baseSalaryAmount = 0;
      
      switch (selectedEmployee.salaryType) {
        case 'hourly':
          // 時給の場合（8時間/日として計算）
          baseSalaryAmount = selectedEmployee.baseSalary * 8 * actualWorkDays;
          break;
        case 'daily':
        case 'dailyMonthly':
          // 日給・日給月給の場合
          baseSalaryAmount = selectedEmployee.baseSalary * actualWorkDays;
          break;
        case 'fixed':
          // 固定給の場合
          baseSalaryAmount = selectedEmployee.baseSalary;
          break;
        default:
          baseSalaryAmount = selectedEmployee.baseSalary * actualWorkDays;
      }
      
      const transportationAllowance = selectedEmployee.transportationAllowance;
      
      // 手当合計
      const allowancesTotal = selectedEmployee.allowances.reduce((sum, allowance) => {
        return sum + (allowance.name ? allowance.amount : 0);
      }, 0);
      
      // 残業代（実際の記録がないので0）
      const overtimePay = 0;
      
      // 支給合計
      const totalPay = baseSalaryAmount + transportationAllowance + allowancesTotal + overtimePay;
      
      // 控除計算
      const healthInsurance = selectedEmployee.healthInsurance;
      const nursingInsurance = selectedEmployee.nursingInsurance;
      const pensionInsurance = selectedEmployee.pensionInsurance;
      
      // 所得税（簡易計算）
      const incomeTax = Math.round(totalPay * 0.05);
      
      // 住民税
      const residentTax = month === 6 
        ? selectedEmployee.residentTax.june 
        : selectedEmployee.residentTax.other;
      
      // 労働保険（雇用保険）
      const employmentInsurance = Math.round(totalPay * 0.003); // 0.3%
      
      const totalDeductions = healthInsurance + nursingInsurance + pensionInsurance + 
                            incomeTax + residentTax + employmentInsurance;
      
      // 差引支給額
      const netPay = totalPay - totalDeductions;
      
      months.push({
        month: monthStr,
        formattedMonth,
        workDays: actualWorkDays,
        absentDays,
        paidLeaveDays,
        baseSalary: baseSalaryAmount,
        transportationAllowance,
        allowancesTotal,
        overtimePay,
        totalPay,
        healthInsurance,
        nursingInsurance,
        pensionInsurance,
        employmentInsurance,
        incomeTax,
        residentTax,
        totalDeductions,
        netPay
      });
    }
    
    return months;
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
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Select
              label="従業員"
              options={employeeOptions}
              value={selectedEmployeeId}
              onChange={setSelectedEmployeeId}
              icon={<User size={18} />}
            />
          </div>
          <div>
            <Select
              label="対象年度"
              options={yearOptions}
              value={selectedYear}
              onChange={setSelectedYear}
              icon={<Calendar size={18} />}
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
                  <p className="font-medium">
                    {selectedEmployee.salaryType === 'hourly' && '時給'}
                    {selectedEmployee.salaryType === 'dailyMonthly' && '日給月給'}
                    {selectedEmployee.salaryType === 'fixed' && '固定給'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="table-container">
              <table className="data-table text-sm">
                <thead>
                  <tr>
                    <th rowSpan={2}>対象月</th>
                    <th colSpan={3} className="text-center">出退勤</th>
                    <th colSpan={5} className="text-center">支給</th>
                    <th colSpan={6} className="text-center">控除</th>
                    <th rowSpan={2}>差引支給額</th>
                  </tr>
                  <tr>
                    <th>出勤日数</th>
                    <th>欠勤日数</th>
                    <th>有給使用</th>
                    <th>基本給</th>
                    <th>交通費</th>
                    <th>手当</th>
                    <th>残業手当</th>
                    <th>支給合計</th>
                    <th>健康保険</th>
                    <th>厚生年金</th>
                    <th>介護保険</th>
                    <th>労働保険</th>
                    <th>所得税</th>
                    <th>住民税</th>
                    <th>控除合計</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollData.map((data) => (
                    <tr key={data.month} className="hover:bg-gray-50">
                      <td className="font-medium">{data.formattedMonth}</td>
                      <td>{data.workDays}日</td>
                      <td>{data.absentDays}日</td>
                      <td>{data.paidLeaveDays}日</td>
                      <td>{data.baseSalary.toLocaleString()}円</td>
                      <td>{data.transportationAllowance.toLocaleString()}円</td>
                      <td>{data.allowancesTotal.toLocaleString()}円</td>
                      <td>{data.overtimePay.toLocaleString()}円</td>
                      <td className="font-medium">{data.totalPay.toLocaleString()}円</td>
                      <td>{data.healthInsurance.toLocaleString()}円</td>
                      <td>{data.pensionInsurance.toLocaleString()}円</td>
                      <td>{data.nursingInsurance.toLocaleString()}円</td>
                      <td>{data.employmentInsurance.toLocaleString()}円</td>
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
                    <td>{payrollData.reduce((sum, data) => sum + data.allowancesTotal, 0).toLocaleString()}円</td>
                    <td>{payrollData.reduce((sum, data) => sum + data.overtimePay, 0).toLocaleString()}円</td>
                    <td>{payrollData.reduce((sum, data) => sum + data.totalPay, 0).toLocaleString()}円</td>
                    <td>{payrollData.reduce((sum, data) => sum + data.healthInsurance, 0).toLocaleString()}円</td>
                    <td>{payrollData.reduce((sum, data) => sum + data.pensionInsurance, 0).toLocaleString()}円</td>
                    <td>{payrollData.reduce((sum, data) => sum + data.nursingInsurance, 0).toLocaleString()}円</td>
                    <td>{payrollData.reduce((sum, data) => sum + data.employmentInsurance, 0).toLocaleString()}円</td>
                    <td>{payrollData.reduce((sum, data) => sum + data.incomeTax, 0).toLocaleString()}円</td>
                    <td>{payrollData.reduce((sum, data) => sum + data.residentTax, 0).toLocaleString()}円</td>
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
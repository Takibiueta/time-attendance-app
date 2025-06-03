import React, { useState } from 'react';
import { format } from 'date-fns';
import { FileText, Download, Calendar } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { useEmployeeStore } from '../../stores/employeeStore';
import { useAttendanceStore } from '../../stores/attendanceStore';

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
  const { getWorkDaysInMonth, getRecordsByMonth } = useAttendanceStore();
  const monthOptions = getMonthOptions();
  
  // 実際の出退勤データを基に給与計算
  const generatePayrollData = () => {
    return employees.map(employee => {
      // 実際の出勤日数を取得
      const actualWorkDays = getWorkDaysInMonth(employee.employeeNumber, selectedMonth);
      
      // 従業員の月間出退勤記録を取得
      const monthRecords = getRecordsByMonth(selectedMonth).filter(
        record => record.employeeNumber === employee.employeeNumber
      );
      
      // 欠勤日数計算（出勤記録はあるが出勤時刻がnullの日）
      const absentDays = monthRecords.filter(
        record => record.clockInTime === null
      ).length;
      
      // 有給使用日数（この例では0、実際は別途管理が必要）
      const paidLeaveDays = 0;
      
      // 基本給計算
      let baseSalaryAmount = 0;
      
      switch (employee.salaryType) {
        case 'hourly':
          // 時給の場合（8時間/日として計算）
          baseSalaryAmount = employee.baseSalary * 8 * actualWorkDays;
          break;
        case 'daily':
        case 'dailyMonthly':
          // 日給・日給月給の場合
          baseSalaryAmount = employee.baseSalary * actualWorkDays;
          break;
        case 'fixed':
          // 固定給の場合
          baseSalaryAmount = employee.baseSalary;
          break;
        default:
          baseSalaryAmount = employee.baseSalary * actualWorkDays;
      }
      
      const transportationAllowance = employee.transportationAllowance;
      
      // 手当合計
      const allowancesTotal = employee.allowances.reduce((sum, allowance) => {
        return sum + (allowance.name ? allowance.amount : 0);
      }, 0);
      
      // 残業代（実際の計算ロジックが必要、ここでは簡易版）
      const overtimePay = 0; // TODO: 実際の残業時間から計算
      
      // 支給合計
      const totalPay = baseSalaryAmount + transportationAllowance + allowancesTotal + overtimePay;
      
      // 控除計算
      const healthInsurance = employee.healthInsurance;
      const nursingInsurance = employee.nursingInsurance;
      const pensionInsurance = employee.pensionInsurance;
      
      // 所得税（簡易計算、実際は源泉徴収税額表を使用）
      const incomeTax = Math.round(totalPay * 0.05);
      
      // 住民税
      const residentTax = selectedMonth.endsWith('-06') 
        ? employee.residentTax.june 
        : employee.residentTax.other;
      
      // 労働保険（雇用保険）- TODO: システム設定から取得
      const employmentInsurance = Math.round(totalPay * 0.003); // 0.3%
      
      const totalDeductions = healthInsurance + nursingInsurance + pensionInsurance + 
                            incomeTax + residentTax + employmentInsurance;
      
      // 差引支給額
      const netPay = totalPay - totalDeductions;
      
      return {
        id: employee.id,
        name: employee.name,
        employeeNumber: employee.employeeNumber,
        workDays: actualWorkDays,
        absentDays,
        paidLeaveDays,
        baseSalary: baseSalaryAmount,
        transportationAllowance,
        overtimePay,
        allowances: employee.allowances,
        allowancesTotal,
        totalPay,
        healthInsurance,
        nursingInsurance,
        pensionInsurance,
        employmentInsurance,
        incomeTax,
        residentTax,
        totalDeductions,
        netPay
      };
    });
  };
  
  const payrollData = generatePayrollData();
  
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
                <tr key={data.id} className="hover:bg-gray-50">
                  <td className="font-medium text-gray-900">{data.name}</td>
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
                  <td className="text-blue-600 font-medium">{data.employmentInsurance.toLocaleString()}円</td>
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
      </Card>
    </div>
  );
};

export default MonthlyPayrollPage;
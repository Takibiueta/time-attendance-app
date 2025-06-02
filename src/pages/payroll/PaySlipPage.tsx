import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useEmployeeStore } from '../../stores/employeeStore';

const PaySlipPage: React.FC = () => {
  const { id, month } = useParams<{ id: string; month: string }>();
  const navigate = useNavigate();
  const getEmployee = useEmployeeStore(state => state.getEmployee);
  
  const employee = id ? getEmployee(id) : undefined;
  const currentDate = new Date();
  
  // Format the date for display
  const formattedDate = month ? month.replace('-', '年') + '月' : format(currentDate, 'yyyy年MM月');
  
  // Generate mock payslip data
  const generateMockPayslipData = () => {
    if (!employee) return null;
    
    // Base values
    const baseSalary = employee.baseSalary;
    const transportationAllowance = employee.transportationAllowance;
    
    // Allowances
    const allowances = employee.allowances.filter(a => a.name);
    
    // Mock values
    const workDays = 20;
    const absentDays = 0;
    const paidLeaveDays = 1;
    const overtimeHours = 15;
    const overtimePay = Math.round(baseSalary * 0.2 * (overtimeHours / (employee.salaryType === '時給' ? 1 : 8)));
    
    // Total pay
    const allowancesTotal = allowances.reduce((sum, a) => sum + a.amount, 0);
    const totalPay = baseSalary + transportationAllowance + allowancesTotal + overtimePay;
    
    // Deductions
    const healthInsurance = employee.healthInsurance;
    const nursingInsurance = employee.nursingInsurance;
    const pensionInsurance = employee.pensionInsurance;
    const insuranceTotal = healthInsurance + nursingInsurance + pensionInsurance;
    
    const incomeTax = Math.round(totalPay * 0.05);
    const isJune = month?.endsWith('-06') ?? false;
    const residentTax = isJune ? employee.residentTax.june : employee.residentTax.other;
    
    const totalDeductions = insuranceTotal + incomeTax + residentTax;
    
    // Net pay
    const netPay = totalPay - totalDeductions;
    
    return {
      workDays,
      absentDays,
      paidLeaveDays,
      overtimeHours,
      baseSalary,
      transportationAllowance,
      allowances,
      overtimePay,
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
  };
  
  const payslipData = generateMockPayslipData();
  
  if (!employee || !payslipData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">従業員情報が見つかりません。</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate(-1)}
        >
          戻る
        </Button>
      </div>
    );
  }
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownloadPdf = () => {
    alert('給与明細のPDFをダウンロードする機能（未実装）');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            戻る
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">給与明細書</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            icon={<Printer size={18} />}
            onClick={handlePrint}
          >
            印刷
          </Button>
          <Button
            variant="primary"
            icon={<Download size={18} />}
            onClick={handleDownloadPdf}
          >
            PDF出力
          </Button>
        </div>
      </div>
      
      <Card>
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">給与明細書</h2>
          <p className="text-gray-500 mt-1">{formattedDate}分</p>
        </div>
        
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="border-b pb-2">
            <p className="text-sm text-gray-500">従業員番号</p>
            <p className="font-medium">{employee.employeeNumber}</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm text-gray-500">氏名</p>
            <p className="font-medium">{employee.name}</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm text-gray-500">支給日</p>
            <p className="font-medium">{format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 25), 'yyyy年MM月dd日')}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium mb-4 border-b pb-2">出退勤情報</h3>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2 text-gray-600">出勤日数</td>
                  <td className="py-2 text-right">{payslipData.workDays}日</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">欠勤日数</td>
                  <td className="py-2 text-right">{payslipData.absentDays}日</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">有給休暇</td>
                  <td className="py-2 text-right">{payslipData.paidLeaveDays}日</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">残業時間</td>
                  <td className="py-2 text-right">{payslipData.overtimeHours}時間</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4 border-b pb-2">支給額</h3>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2 text-gray-600">基本給</td>
                  <td className="py-2 text-right">{payslipData.baseSalary.toLocaleString()}円</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">交通費</td>
                  <td className="py-2 text-right">{payslipData.transportationAllowance.toLocaleString()}円</td>
                </tr>
                {payslipData.allowances.map((allowance, index) => (
                  <tr key={index}>
                    <td className="py-2 text-gray-600">{allowance.name}</td>
                    <td className="py-2 text-right">{allowance.amount.toLocaleString()}円</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 text-gray-600">残業手当</td>
                  <td className="py-2 text-right">{payslipData.overtimePay.toLocaleString()}円</td>
                </tr>
                <tr className="border-t">
                  <td className="py-2 font-medium">支給額合計</td>
                  <td className="py-2 text-right font-bold">{payslipData.totalPay.toLocaleString()}円</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4 border-b pb-2">控除額</h3>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2 text-gray-600">健康保険料</td>
                  <td className="py-2 text-right">{payslipData.healthInsurance.toLocaleString()}円</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">介護保険料</td>
                  <td className="py-2 text-right">{payslipData.nursingInsurance.toLocaleString()}円</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">厚生年金保険料</td>
                  <td className="py-2 text-right">{payslipData.pensionInsurance.toLocaleString()}円</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">所得税</td>
                  <td className="py-2 text-right">{payslipData.incomeTax.toLocaleString()}円</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">住民税</td>
                  <td className="py-2 text-right">{payslipData.residentTax.toLocaleString()}円</td>
                </tr>
                <tr className="border-t">
                  <td className="py-2 font-medium">控除額合計</td>
                  <td className="py-2 text-right font-bold">{payslipData.totalDeductions.toLocaleString()}円</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4 border-b pb-2">差引支給額</h3>
            <div className="bg-primary-50 p-4 rounded-lg">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="py-2 font-medium">支給額合計</td>
                    <td className="py-2 text-right">{payslipData.totalPay.toLocaleString()}円</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">控除額合計</td>
                    <td className="py-2 text-right">{payslipData.totalDeductions.toLocaleString()}円</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 font-bold text-lg">差引支給額</td>
                    <td className="py-2 text-right font-bold text-lg text-primary-700">{payslipData.netPay.toLocaleString()}円</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-4">
          <p className="text-sm text-gray-500">
            ※ この給与明細に関するご質問は、管理者までお問い合わせください。
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PaySlipPage;
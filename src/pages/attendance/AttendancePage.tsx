import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { QrCode, Clock, Users, FileText } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useEmployeeStore } from '../../stores/employeeStore';

// Placeholder for QR code reader component
// In a real app, you would use a proper QR code reader library
const QRCodeReader: React.FC<{ onScan: (data: string) => void }> = ({ onScan }) => {
  const [manualInput, setManualInput] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput) {
      onScan(manualInput);
      setManualInput('');
    }
  };
  
  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
      <div className="text-center mb-4">
        <QrCode size={48} className="mx-auto text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">
          QRコードリーダーが接続されていない場合は、以下のフォームから従業員番号を入力してください。
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="従業員番号を入力"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
        />
        <Button type="submit" variant="primary">打刻</Button>
      </form>
    </div>
  );
};

interface AttendanceRecord {
  id: string;
  employeeNumber: string;
  employeeName: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  date: string;
}

const AttendancePage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const messageTimeoutRef = useRef<number | null>(null);
  const employees = useEmployeeStore(state => state.employees);
  
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Clear message after 5 seconds
  useEffect(() => {
    if (message && messageTimeoutRef.current === null) {
      messageTimeoutRef.current = window.setTimeout(() => {
        setMessage(null);
        messageTimeoutRef.current = null;
      }, 5000);
    }
    
    return () => {
      if (messageTimeoutRef.current !== null) {
        clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
    };
  }, [message]);
  
  const handleScan = (data: string) => {
    // In a real app, this would parse the QR code data
    // For this demo, we'll assume the data is just the employee number
    const employeeNumber = data.trim();
    const employee = employees.find(e => e.employeeNumber === employeeNumber);
    
    if (!employee) {
      setMessage({
        text: `従業員が見つかりませんでした: ${employeeNumber}`,
        type: 'error'
      });
      return;
    }
    
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const timeStr = format(now, 'HH:mm:ss');
    
    // Check if there's already a record for this employee today
    const existingRecordIndex = records.findIndex(
      r => r.employeeNumber === employeeNumber && r.date === today
    );
    
    if (existingRecordIndex === -1) {
      // No record for today, create a new clock-in record
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        employeeNumber,
        employeeName: employee.name,
        clockInTime: timeStr,
        clockOutTime: null,
        date: today
      };
      
      setRecords([newRecord, ...records]);
      setMessage({
        text: `${employee.name}さんが出勤しました。(${timeStr})`,
        type: 'success'
      });
    } else {
      // Already have a record for today, update clock-out time
      const updatedRecords = [...records];
      updatedRecords[existingRecordIndex] = {
        ...updatedRecords[existingRecordIndex],
        clockOutTime: timeStr
      };
      
      setRecords(updatedRecords);
      setMessage({
        text: `${employee.name}さんが退勤しました。(${timeStr})`,
        type: 'success'
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">出退勤管理</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card title="現在時刻">
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                {format(currentTime, 'yyyy年MM月dd日')}
              </p>
              <p className="text-4xl font-bold text-primary-600 mt-2">
                {format(currentTime, 'HH:mm:ss')}
              </p>
            </div>
          </Card>
          
          <Card title="QRコード読み取り" className="mt-6">
            <QRCodeReader onScan={handleScan} />
            
            {message && (
              <div className={`mt-4 p-3 rounded-md ${
                message.type === 'success' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
              }`}>
                {message.text}
              </div>
            )}
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card title="本日の出退勤記録">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>従業員番号</th>
                    <th>氏名</th>
                    <th>出勤時刻</th>
                    <th>退勤時刻</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        記録がありません。
                      </td>
                    </tr>
                  ) : (
                    records
                      .filter(record => record.date === format(currentTime, 'yyyy-MM-dd'))
                      .map((record) => (
                        <tr key={record.id}>
                          <td>{record.employeeNumber}</td>
                          <td className="font-medium text-gray-900">{record.employeeName}</td>
                          <td>{record.clockInTime}</td>
                          <td>{record.clockOutTime || '-'}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
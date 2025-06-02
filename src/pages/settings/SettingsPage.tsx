import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Database, Upload, Download } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const SettingsPage: React.FC = () => {
  const [laborInsuranceRate, setLaborInsuranceRate] = useState('0.9');
  const [perfectAttendanceAllowance, setPerfectAttendanceAllowance] = useState('5000');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [calendarDates, setCalendarDates] = useState<string[]>([
    format(new Date(2025, 0, 1), 'yyyy-MM-dd'), // 元日
    format(new Date(2025, 0, 13), 'yyyy-MM-dd'), // 成人の日
    format(new Date(2025, 1, 11), 'yyyy-MM-dd'), // 建国記念日
    format(new Date(2025, 1, 23), 'yyyy-MM-dd'), // 天皇誕生日
    format(new Date(2025, 2, 21), 'yyyy-MM-dd'), // 春分の日
    format(new Date(2025, 3, 29), 'yyyy-MM-dd'), // 昭和の日
    format(new Date(2025, 4, 3), 'yyyy-MM-dd'), // 憲法記念日
    format(new Date(2025, 4, 4), 'yyyy-MM-dd'), // みどりの日
    format(new Date(2025, 4, 5), 'yyyy-MM-dd'), // こどもの日
  ]);
  
  // Mock function for file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  const handleFileUpload = () => {
    if (selectedFile) {
      alert(`ファイル「${selectedFile.name}」がアップロードされました（デモ機能）`);
    } else {
      alert('ファイルを選択してください');
    }
  };
  
  const handleBackupData = () => {
    alert('データのバックアップが作成されました（デモ機能）');
  };
  
  const handleRestoreData = () => {
    alert('データを復元するにはバックアップファイルを選択してください（デモ機能）');
  };
  
  const handleSaveSettings = () => {
    alert('設定が保存されました');
  };
  
  // Helper function to format date for display
  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'yyyy年MM月dd日');
  };
  
  // Handle adding a new holiday
  const handleAddHoliday = () => {
    const dateInput = document.getElementById('new-holiday-date') as HTMLInputElement;
    if (dateInput && dateInput.value) {
      setCalendarDates([...calendarDates, dateInput.value]);
      dateInput.value = '';
    }
  };
  
  // Handle removing a holiday
  const handleRemoveHoliday = (dateToRemove: string) => {
    setCalendarDates(calendarDates.filter(date => date !== dateToRemove));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">システム設定</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="年間カレンダー設定">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              休日追加
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                id="new-holiday-date"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
              <Button
                variant="primary"
                onClick={handleAddHoliday}
              >
                追加
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium text-gray-700 mb-2">登録済み休日一覧</h3>
            <div className="max-h-64 overflow-y-auto border rounded-md">
              {calendarDates.length === 0 ? (
                <p className="text-center py-4 text-gray-500">登録された休日はありません</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {calendarDates.map((date) => (
                    <li key={date} className="flex items-center justify-between py-2 px-4 hover:bg-gray-50">
                      <span className="text-gray-700">{formatDateForDisplay(date)}</span>
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={() => handleRemoveHoliday(date)}
                      >
                        削除
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
        
        <Card title="源泉徴収税額表アップロード">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-4">
              源泉徴収税額表を Excel 形式でアップロードしてください。指定フォーマットに従った Excel ファイルが必要です。
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <div className="mb-3">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
              </div>
              <div className="flex text-sm">
                <label
                  htmlFor="file-upload"
                  className="mx-auto cursor-pointer rounded-md bg-white font-medium text-primary-600 focus-within:outline-none"
                >
                  <span>ファイルを選択</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                </label>
              </div>
              <p className="text-xs text-gray-500">XLSX または XLS ファイル</p>
            </div>
            
            {selectedFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">選択ファイル: {selectedFile.name}</p>
                <Button
                  variant="primary"
                  className="mt-2"
                  onClick={handleFileUpload}
                >
                  アップロード
                </Button>
              </div>
            )}
          </div>
        </Card>
        
        <Card title="保険料率設定">
          <div className="space-y-4">
            <div>
              <Input
                label="労働保険料率 (%)"
                type="number"
                step="0.1"
                value={laborInsuranceRate}
                onChange={(e) => setLaborInsuranceRate(e.target.value)}
                helperText="労働保険料率を小数点以下1桁まで入力してください。"
              />
            </div>
            
            <div>
              <Input
                label="皆勤手当 (円)"
                type="number"
                value={perfectAttendanceAllowance}
                onChange={(e) => setPerfectAttendanceAllowance(e.target.value)}
                helperText="皆勤手当の金額を入力してください。"
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleSaveSettings}
              >
                設定を保存
              </Button>
            </div>
          </div>
        </Card>
        
        <Card title="データバックアップ">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">バックアップ作成</h3>
              <p className="text-sm text-gray-500 mb-4">
                現在のシステムデータのバックアップを作成します。定期的にバックアップを行うことをお勧めします。
              </p>
              <Button
                variant="primary"
                icon={<Download size={18} />}
                onClick={handleBackupData}
              >
                バックアップを作成
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-2">データ復元</h3>
              <p className="text-sm text-gray-500 mb-4">
                バックアップからデータを復元します。現在のデータは上書きされます。
              </p>
              <Button
                variant="outline"
                icon={<Database size={18} />}
                onClick={handleRestoreData}
              >
                データを復元
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
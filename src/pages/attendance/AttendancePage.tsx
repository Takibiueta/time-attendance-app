import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { QrCode, Clock, Users, FileText, Camera, Keyboard } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useEmployeeStore } from '../../stores/employeeStore';
import { BrowserQRCodeReader } from '@zxing/browser';

// Enhanced QR code reader component with camera and external reader support
const QRCodeReader: React.FC<{ onScan: (data: string) => void }> = ({ onScan }) => {
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'manual' | 'camera' | 'external'>('manual');
  const [externalInput, setExternalInput] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const externalInputRef = useRef<HTMLInputElement>(null);
  
  // External reader focus management
  useEffect(() => {
    if (scanMode === 'external' && externalInputRef.current) {
      externalInputRef.current.focus();
    }
  }, [scanMode]);
  
  // Handle external reader input (auto-submit on scan)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (externalInput && scanMode === 'external') {
      timer = setTimeout(() => {
        onScan(externalInput);
        setExternalInput('');
      }, 100); // Short delay to ensure complete scan
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [externalInput, scanMode, onScan]);
  
  const startCameraScanning = async () => {
    try {
      setIsScanning(true);
      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;
      
      const result = await codeReader.decodeOnceFromVideoDevice(undefined, videoRef.current!);
      onScan(result.getText());
      stopScanning();
    } catch (error) {
      console.error('カメラスキャンエラー:', error);
      setIsScanning(false);
    }
  };
  
  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setIsScanning(false);
  };
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput) {
      onScan(manualInput);
      setManualInput('');
    }
  };
  
  const handleExternalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExternalInput(value);
    
    // Auto-detect barcode/QR completion (usually ends with Enter or specific length)
    if (value.length >= 8) { // Assuming minimum barcode length
      onScan(value);
      setExternalInput('');
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Scan Mode Selection */}
      <div className="flex space-x-2 border-b border-gray-200 pb-3">
        <Button
          variant={scanMode === 'manual' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setScanMode('manual')}
        >
          <Keyboard className="w-4 h-4 mr-1" />
          手動入力
        </Button>
        <Button
          variant={scanMode === 'camera' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setScanMode('camera')}
        >
          <Camera className="w-4 h-4 mr-1" />
          カメラ
        </Button>
        <Button
          variant={scanMode === 'external' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setScanMode('external')}
        >
          <QrCode className="w-4 h-4 mr-1" />
          外部リーダー
        </Button>
      </div>
      
      {/* Manual Input Mode */}
      {scanMode === 'manual' && (
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center mb-4">
            <Keyboard size={48} className="mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              従業員番号またはQRコードの内容を手動で入力してください。
            </p>
          </div>
          
          <form onSubmit={handleManualSubmit} className="flex items-center space-x-2">
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
      )}
      
      {/* Camera Scanning Mode */}
      {scanMode === 'camera' && (
        <div className="p-4 border-2 border-solid border-primary-300 rounded-lg">
          <div className="text-center mb-4">
            <Camera size={48} className="mx-auto text-primary-500" />
            <p className="mt-2 text-sm text-gray-600">
              カメラでQR/バーコードをスキャンしてください。
            </p>
          </div>
          
          {!isScanning ? (
            <div className="text-center">
              <Button onClick={startCameraScanning} variant="primary">
                <Camera className="w-4 h-4 mr-2" />
                スキャン開始
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <video
                ref={videoRef}
                className="w-full h-48 bg-black rounded-lg"
                autoPlay
                playsInline
              />
              <div className="text-center">
                <Button onClick={stopScanning} variant="outline">
                  スキャン停止
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* External Reader Mode */}
      {scanMode === 'external' && (
        <div className="p-4 border-2 border-solid border-success-300 rounded-lg">
          <div className="text-center mb-4">
            <QrCode size={48} className="mx-auto text-success-500" />
            <p className="mt-2 text-sm text-gray-600">
              外部のQR/バーコードリーダーでスキャンしてください。
              <br />
              (USB接続またはBluetooth接続)
            </p>
          </div>
          
          <div className="relative">
            <input
              ref={externalInputRef}
              type="text"
              value={externalInput}
              onChange={handleExternalInput}
              placeholder="外部リーダーからの入力待機中..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-success-500 focus:ring focus:ring-success-200 focus:ring-opacity-50"
              autoFocus
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <p className="mt-2 text-xs text-gray-500">
            外部リーダーがキーボードとして認識されている場合、この入力欄にフォーカスがあることを確認してください。
          </p>
        </div>
      )}
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
    // Parse the scanned data (could be employee number, QR code content, etc.)
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
      // Already have a record for today
      const existingRecord = records[existingRecordIndex];
      
      if (existingRecord.clockOutTime) {
        // Already clocked out, show message
        setMessage({
          text: `${employee.name}さんは既に退勤済みです。`,
          type: 'error'
        });
      } else {
        // Update clock-out time
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
          
          <Card title="QR/バーコード読み取り" className="mt-6">
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
                    <th>状態</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
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
                          <td>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              record.clockOutTime 
                                ? 'bg-gray-100 text-gray-800' 
                                : 'bg-success-100 text-success-800'
                            }`}>
                              {record.clockOutTime ? '退勤済み' : '出勤中'}
                            </span>
                          </td>
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
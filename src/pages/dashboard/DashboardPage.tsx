import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, Calculator, Settings } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useEmployeeStore } from '../../stores/employeeStore';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  count?: number;
  onClick: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon,
  count,
  onClick,
}) => {
  return (
    <Card className="hover:shadow-card-hover cursor-pointer transition-shadow duration-200\" onClick={onClick}>
      <div className="flex items-start">
        <div className="flex-shrink-0 rounded-md bg-primary-100 p-3 text-primary-600">
          {icon}
        </div>
        <div className="ml-5">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
          {count !== undefined && (
            <p className="mt-3 text-2xl font-semibold text-primary-600">{count}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const employees = useEmployeeStore(state => state.employees);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">ダッシュボード</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <DashboardCard
          title="従業員管理"
          description="従業員情報の登録・変更・削除"
          icon={<Users size={24} />}
          count={employees.length}
          onClick={() => navigate('/employees')}
        />
        
        <DashboardCard
          title="出退勤管理"
          description="出退勤の記録と勤怠情報の確認"
          icon={<Clock size={24} />}
          onClick={() => navigate('/attendance')}
        />
        
        <DashboardCard
          title="給与計算（月次）"
          description="月次給与一覧の表示と計算"
          icon={<Calculator size={24} />}
          onClick={() => navigate('/payroll/monthly')}
        />
        
        <DashboardCard
          title="給与計算（個人別）"
          description="個人別年間給与の表示"
          icon={<Calculator size={24} />}
          onClick={() => navigate('/payroll/individual')}
        />
        
        <DashboardCard
          title="システム設定"
          description="休日設定・各種レートの設定など"
          icon={<Settings size={24} />}
          onClick={() => navigate('/settings')}
        />
      </div>

      <div className="mt-8">
        <Card title="システム情報">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">利用マニュアル</h4>
              <p className="text-sm text-gray-500 mt-1">
                出退勤・給与管理システムの利用方法については、各機能の説明をご覧ください。
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">注意事項</h4>
              <ul className="list-disc list-inside text-sm text-gray-500 mt-1">
                <li>従業員情報は定期的にバックアップを行ってください。</li>
                <li>QRコードリーダーを使用する場合は、事前に接続設定を確認してください。</li>
                <li>源泉徴収税額表は最新のものをアップロードしてください。</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
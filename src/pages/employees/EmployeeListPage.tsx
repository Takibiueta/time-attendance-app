import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useEmployeeStore, SalaryType } from '../../stores/employeeStore';

const EmployeeListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const employees = useEmployeeStore(state => state.employees);
  const searchEmployees = useEmployeeStore(state => state.searchEmployees);
  const deleteEmployee = useEmployeeStore(state => state.deleteEmployee);
  const navigate = useNavigate();

  const filteredEmployees = searchQuery ? searchEmployees(searchQuery) : employees;

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`従業員「${name}」を削除してもよろしいですか？`)) {
      deleteEmployee(id);
    }
  };

  const formatSalary = (type: SalaryType, amount: number) => {
    if (type === SalaryType.Hourly) {
      return `${amount.toLocaleString()}円/時`;
    } else if (type === SalaryType.DailyMonthly) {
      return `${amount.toLocaleString()}円/日`;
    } else {
      return `${amount.toLocaleString()}円/月`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">従業員管理</h1>
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => navigate('/employees/new')}
        >
          新規登録
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <div className="flex items-center">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="氏名または従業員番号で検索"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>従業員番号</th>
                <th>氏名</th>
                <th>給与体系</th>
                <th>基本給</th>
                <th>扶養人数</th>
                <th>有給残日数</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    {searchQuery ? "検索条件に一致する従業員はいません。" : "従業員情報がありません。新規登録してください。"}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td>{employee.employeeNumber}</td>
                    <td className="font-medium text-gray-900">{employee.name}</td>
                    <td>{employee.salaryType}</td>
                    <td>{formatSalary(employee.salaryType, employee.baseSalary)}</td>
                    <td>{employee.dependents}人</td>
                    <td>{employee.paidLeaveRemaining}日</td>
                    <td>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="xs"
                          icon={<Edit size={14} />}
                          onClick={() => navigate(`/employees/${employee.id}`)}
                        >
                          編集
                        </Button>
                        <Button
                          variant="danger"
                          size="xs"
                          icon={<Trash2 size={14} />}
                          onClick={() => handleDelete(employee.id, employee.name)}
                        >
                          削除
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeListPage;
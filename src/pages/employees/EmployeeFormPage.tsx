import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Save, ArrowLeft } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useEmployeeStore, Employee, SalaryType } from '../../stores/employeeStore';

type EmployeeFormData = Omit<Employee, 'id'>;

const EmployeeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const getEmployee = useEmployeeStore(state => state.getEmployee);
  const addEmployee = useEmployeeStore(state => state.addEmployee);
  const updateEmployee = useEmployeeStore(state => state.updateEmployee);
  
  const isEditMode = !!id;
  const employee = id ? getEmployee(id) : undefined;
  
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<EmployeeFormData>({
    defaultValues: employee ? { ...employee } : {
      employeeNumber: '',
      name: '',
      salaryType: SalaryType.Hourly,
      baseSalary: 0,
      transportationAllowance: 0,
      allowances: [
        { name: '', amount: 0 },
        { name: '', amount: 0 },
        { name: '', amount: 0 }
      ],
      dependents: 0,
      healthInsurance: 0,
      nursingInsurance: 0,
      pensionInsurance: 0,
      residentTax: {
        june: 0,
        other: 0
      },
      paidLeaveRemaining: 0
    }
  });
  
  const { fields } = useFieldArray({
    control,
    name: 'allowances'
  });
  
  const salaryType = watch('salaryType');
  
  useEffect(() => {
    if (employee) {
      reset({ ...employee });
    }
  }, [employee, reset]);
  
  const onSubmit = async (data: EmployeeFormData) => {
    setIsLoading(true);
    
    try {
      if (isEditMode && id) {
        updateEmployee(id, data);
      } else {
        addEmployee(data);
      }
      navigate('/employees');
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('従業員情報の保存中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };
  
  const salaryTypeOptions = [
    { value: SalaryType.Hourly, label: '時給' },
    { value: SalaryType.DailyMonthly, label: '日給月給' },
    { value: SalaryType.Fixed, label: '固定給' }
  ];
  
  const getSalaryLabel = () => {
    switch (salaryType) {
      case SalaryType.Hourly:
        return '時給 (円/時)';
      case SalaryType.DailyMonthly:
        return '日給 (円/日)';
      case SalaryType.Fixed:
        return '月給 (円/月)';
      default:
        return '基本給';
    }
  };

  // 数値入力の共通ハンドラー
  const handleNumberChange = (onChange: (value: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // 空文字または無効な値の場合は0、それ以外は数値に変換
    const numValue = inputValue === '' ? 0 : parseInt(inputValue, 10);
    onChange(isNaN(numValue) ? 0 : numValue);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate('/employees')}
            className="mr-4"
          >
            戻る
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditMode ? '従業員情報編集' : '従業員新規登録'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <Card title="基本情報">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Controller
                control={control}
                name="employeeNumber"
                rules={{ required: '従業員番号は必須です' }}
                render={({ field }) => (
                  <Input
                    label="従業員番号"
                    error={errors.employeeNumber?.message}
                    {...field}
                  />
                )}
              />
              
              <Controller
                control={control}
                name="name"
                rules={{ required: '氏名は必須です' }}
                render={({ field }) => (
                  <Input
                    label="氏名"
                    error={errors.name?.message}
                    {...field}
                  />
                )}
              />
              
              <Controller
                control={control}
                name="salaryType"
                render={({ field }) => (
                  <Select
                    label="給与体系"
                    options={salaryTypeOptions}
                    {...field}
                  />
                )}
              />
              
              <Controller
                control={control}
                name="baseSalary"
                rules={{ required: '基本給は必須です', min: { value: 0, message: '0以上の値を入力してください' } }}
                render={({ field: { onChange, value, ...rest } }) => (
                  <Input
                    type="number"
                    label={getSalaryLabel()}
                    value={value || ''}
                    onChange={handleNumberChange(onChange)}
                    error={errors.baseSalary?.message}
                    {...rest}
                  />
                )}
              />
              
              <Controller
                control={control}
                name="transportationAllowance"
                rules={{ min: { value: 0, message: '0以上の値を入力してください' } }}
                render={({ field: { onChange, value, ...rest } }) => (
                  <Input
                    type="number"
                    label="交通費 (月額)"
                    value={value || ''}
                    onChange={handleNumberChange(onChange)}
                    error={errors.transportationAllowance?.message}
                    {...rest}
                  />
                )}
              />
              
              <Controller
                control={control}
                name="dependents"
                rules={{ min: { value: 0, message: '0以上の値を入力してください' } }}
                render={({ field: { onChange, value, ...rest } }) => (
                  <Input
                    type="number"
                    label="扶養家族人数"
                    value={value || ''}
                    onChange={handleNumberChange(onChange)}
                    error={errors.dependents?.message}
                    {...rest}
                  />
                )}
              />
              
              <Controller
                control={control}
                name="paidLeaveRemaining"
                rules={{ min: { value: 0, message: '0以上の値を入力してください' } }}
                render={({ field: { onChange, value, ...rest } }) => (
                  <Input
                    type="number"
                    label="有給休暇残日数"
                    value={value || ''}
                    onChange={handleNumberChange(onChange)}
                    error={errors.paidLeaveRemaining?.message}
                    {...rest}
                  />
                )}
              />
            </div>
          </Card>

          <Card title="手当情報">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex space-x-2">
                  <div className="flex-1">
                    <Controller
                      control={control}
                      name={`allowances.${index}.name`}
                      render={({ field }) => (
                        <Input
                          label={`手当${index + 1} (名称)`}
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <Controller
                      control={control}
                      name={`allowances.${index}.amount`}
                      render={({ field: { onChange, value, ...rest } }) => (
                        <Input
                          type="number"
                          label={`手当${index + 1} (金額)`}
                          value={value || ''}
                          onChange={handleNumberChange(onChange)}
                          {...rest}
                        />
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="保険・税金情報">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Controller
                control={control}
                name="healthInsurance"
                rules={{ min: { value: 0, message: '0以上の値を入力してください' } }}
                render={({ field: { onChange, value, ...rest } }) => (
                  <Input
                    type="number"
                    label="健康保険料 (月額)"
                    value={value || ''}
                    onChange={handleNumberChange(onChange)}
                    error={errors.healthInsurance?.message}
                    helperText={salaryType === SalaryType.Hourly ? "※時給制の場合は対象外" : ""}
                    {...rest}
                  />
                )}
              />
              
              <Controller
                control={control}
                name="nursingInsurance"
                rules={{ min: { value: 0, message: '0以上の値を入力してください' } }}
                render={({ field: { onChange, value, ...rest } }) => (
                  <Input
                    type="number"
                    label="介護保険料 (月額)"
                    value={value || ''}
                    onChange={handleNumberChange(onChange)}
                    error={errors.nursingInsurance?.message}
                    helperText={salaryType === SalaryType.Hourly ? "※時給制の場合は対象外" : ""}
                    {...rest}
                  />
                )}
              />
              
              <Controller
                control={control}
                name="pensionInsurance"
                rules={{ min: { value: 0, message: '0以上の値を入力してください' } }}
                render={({ field: { onChange, value, ...rest } }) => (
                  <Input
                    type="number"
                    label="厚生年金保険料 (月額)"
                    value={value || ''}
                    onChange={handleNumberChange(onChange)}
                    error={errors.pensionInsurance?.message}
                    helperText={salaryType === SalaryType.Hourly ? "※時給制の場合は対象外" : ""}
                    {...rest}
                  />
                )}
              />
              
              <Controller
                control={control}
                name="residentTax.june"
                rules={{ min: { value: 0, message: '0以上の値を入力してください' } }}
                render={({ field: { onChange, value, ...rest } }) => (
                  <Input
                    type="number"
                    label="市民税 (6月分)"
                    value={value || ''}
                    onChange={handleNumberChange(onChange)}
                    error={errors.residentTax?.june?.message}
                    {...rest}
                  />
                )}
              />
              
              <Controller
                control={control}
                name="residentTax.other"
                rules={{ min: { value: 0, message: '0以上の値を入力してください' } }}
                render={({ field: { onChange, value, ...rest } }) => (
                  <Input
                    type="number"
                    label="市民税 (その他の月分)"
                    value={value || ''}
                    onChange={handleNumberChange(onChange)}
                    error={errors.residentTax?.other?.message}
                    {...rest}
                  />
                )}
              />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              icon={<Save size={18} />}
              isLoading={isLoading}
            >
              保存
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmployeeFormPage;
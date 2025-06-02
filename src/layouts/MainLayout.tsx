import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Clock, Calculator, FileText, 
  Settings, LogOut, Menu, X, ChevronDown, ChevronUp 
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import Logo from '../components/ui/Logo';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  hasSubMenu?: boolean;
  isSubMenuItem?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ 
  to, 
  icon, 
  label, 
  hasSubMenu = false, 
  isSubMenuItem = false,
  onClick 
}) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => `
        ${isActive ? 'bg-primary-700 text-white' : 'text-gray-300 hover:bg-primary-700 hover:text-white'}
        ${isSubMenuItem ? 'pl-12' : 'pl-4'}
        group flex items-center py-2 px-2 text-sm font-medium rounded-md
      `}
      end
    >
      <span className="mr-3 h-5 w-5">{icon}</span>
      {label}
      {hasSubMenu && (
        <span className="ml-auto">
          <ChevronDown className="h-4 w-4" />
        </span>
      )}
    </NavLink>
  );
};

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payrollSubmenuOpen, setPayrollSubmenuOpen] = useState(false);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const togglePayrollSubmenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPayrollSubmenuOpen(!payrollSubmenuOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Mobile sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-primary-800 transition-transform duration-300 ease-in-out transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex items-center justify-between h-16 px-4 bg-primary-900">
          <Logo className="h-8 w-auto" />
          <button 
            type="button" 
            className="lg:hidden text-gray-300 hover:text-white"
            onClick={closeSidebar}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-col h-[calc(100%-4rem)] overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            <NavItem 
              to="/dashboard" 
              icon={<LayoutDashboard />} 
              label="ダッシュボード"
              onClick={closeSidebar}
            />
            <NavItem 
              to="/employees" 
              icon={<Users />} 
              label="従業員管理"
              onClick={closeSidebar}
            />
            <NavItem 
              to="/attendance" 
              icon={<Clock />} 
              label="出退勤管理"
              onClick={closeSidebar}
            />

            {/* Payroll submenu */}
            <div>
              <a 
                href="#" 
                className={`
                  text-gray-300 hover:bg-primary-700 hover:text-white
                  group flex items-center py-2 px-2 text-sm font-medium rounded-md
                `}
                onClick={togglePayrollSubmenu}
              >
                <span className="mr-3 h-5 w-5"><Calculator /></span>
                給与計算
                <span className="ml-auto">
                  {payrollSubmenuOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </a>
              
              {payrollSubmenuOpen && (
                <div className="mt-1 ml-2 space-y-1">
                  <NavItem 
                    to="/payroll/monthly" 
                    icon={<FileText />} 
                    label="月次給与一覧"
                    isSubMenuItem
                    onClick={closeSidebar}
                  />
                  <NavItem 
                    to="/payroll/individual" 
                    icon={<FileText />} 
                    label="個人別年間給与"
                    isSubMenuItem
                    onClick={closeSidebar}
                  />
                </div>
              )}
            </div>

            <NavItem 
              to="/settings" 
              icon={<Settings />} 
              label="システム設定"
              onClick={closeSidebar}
            />
          </nav>

          <div className="px-2 py-4 border-t border-primary-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-primary-700 hover:text-white"
            >
              <LogOut className="mr-3 h-5 w-5" />
              ログアウト
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              type="button"
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="text-xl font-semibold text-gray-800">勤怠・給与管理システム</div>
            <div></div> {/* Placeholder for right side items */}
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>

        <footer className="bg-white p-4 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} 勤怠・給与管理システム
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
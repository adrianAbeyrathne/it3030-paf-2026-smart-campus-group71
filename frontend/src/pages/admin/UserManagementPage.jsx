import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import userService from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const roleStyles = {
  ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
  TECHNICIAN: 'bg-blue-100 text-blue-700 border-blue-200',
  TEACHER: 'bg-green-100 text-green-700 border-green-200',
  STUDENT: 'bg-amber-100 text-amber-700 border-amber-200',
  USER: 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole}`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) return <LoadingSpinner label="Opening Campus Directory..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Campus User Management</h1>
          <p className="text-sm text-slate-500">Manage access levels for students, teachers, and staff</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
          Total Users: {users.length}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">User Identity</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Method</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Joined Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Campus Role</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Assign Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full object-cover border border-slate-200" src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=1E3A5F&color=fff`} alt="" />
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border ${user.provider === 'GOOGLE' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    {user.provider}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${roleStyles[user.role] || roleStyles.USER}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <select 
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent outline-none cursor-pointer hover:border-slate-400 transition-all"
                  >
                    <option value="USER">Base User</option>
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="TECHNICIAN">Technician</option>
                    <option value="ADMIN">Campus Head (Admin)</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

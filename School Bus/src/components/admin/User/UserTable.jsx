import { useState } from 'react';
import PropTypes from 'prop-types';
import Table from '../../common/Table';

const UserTable = ({ users = [], loading = false, onAdd, onEdit, onView, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const uniqueRoles = [...new Set(users.map(u => u.role).filter(Boolean))].sort();

    if (loading) {
        return (
            <div className="mx-8">
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-4 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                    <p className="text-gray-500 mt-4">Đang tải danh sách user...</p>
                </div>
            </div>
        );
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = !roleFilter || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const columns = [
        { key: 'id', header: 'ID' },
        { key: 'username', header: 'Username' },
        { key: 'email', header: 'Email' },
        { key: 'role', header: 'Role' },
        { key: 'created_at', header: 'Ngày tạo', render: val => new Date(val).toLocaleString() },
        { key: 'updated_at', header: 'Cập nhật', render: val => new Date(val).toLocaleString() },
    ];

    const filters = [
        {
            placeholder: 'Tất cả vai trò',
            value: roleFilter,
            onChange: setRoleFilter,
            options: uniqueRoles.map(r => ({ value: r, label: r })),
            minWidth: '140px'
        }
    ];

    return (
        <Table
            title="Quản lý User"
            data={filteredUsers}
            columns={columns}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            onAdd={onAdd}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            addButtonText="Thêm user"
            filters={filters}
            emptyMessage={searchTerm || roleFilter ? 'Không tìm thấy user nào phù hợp' : 'Chưa có user nào'}
        />
    );
};

UserTable.propTypes = {
    users: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    onAdd: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onView: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default UserTable;

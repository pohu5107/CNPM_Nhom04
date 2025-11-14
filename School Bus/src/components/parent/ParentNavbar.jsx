import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { UserCircleIcon } from '@heroicons/react/24/solid';

const ParentNavbar = () => {
  const navigation = [
    { name: 'Trang chính', href: '/parents', icon: HomeIcon, end: true },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-center h-20 border-b px-4">
        <UserCircleIcon className="w-12 h-12 text-blue-500" />
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-lg rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-6 w-6 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-6 border-t">
        <NavLink
          to="/logout"
          className="flex items-center px-4 py-3 text-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
        >
          <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-3" />
          Đăng xuất
        </NavLink>
      </div>
    </div>
  );
};

export default ParentNavbar;
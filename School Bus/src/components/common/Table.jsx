import React from 'react';
import { Search, Eye, Edit, Trash2 } from 'lucide-react';

const Table = ({
  data = [],
  columns = [],
  searchValue,
  onSearchChange,
  onAdd,
  onView,
  onEdit,
  onDelete,
  addButtonText = "Thêm mới",
  filters = [],
  isLoading = false,
  emptyMessage = "Không có dữ liệu"
}) => {
  return (
    <div className="space-y-6 ">
      <div className="flex justify-end items-center flex-wrap gap-4">
        <div className="flex gap-3 items-center">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 min-w-[250px]"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Filters */}
          {filters.map((filter, index) => (
            <select
              key={index}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white"
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              style={{ minWidth: filter.minWidth || '120px' }}
            >
              <option value="">{filter.placeholder}</option>
              {filter.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}

          {/* Add Button */}
          {onAdd && (
            <button 
              className="h-10 px-4 bg-bg text-white rounded-md hover:bg-bg2 hover:text-bg transition-colors flex items-center gap-2 font-semibold"
              onClick={onAdd}
            >
              {addButtonText}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto rounded-lg border h-[73vh]">
        <table className="min-w-full divide-y divide-slate-200 bg-white">
          <thead>
            <tr>
              <th className="sticky top-0 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">STT</th>
              {columns.map((column, index) => (
                <th key={index} className="sticky top-0 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                  {column.header}
                </th>
              ))}
              <th className="sticky top-0 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 w-80">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-6 py-8 text-center text-slate-500">
                  Đang tải...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-6 py-8 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr 
                  key={item.id || index}
                  className={`transition-colors ${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100`}
                >
                  <td className="px-6 py-4 text-slate-700">{index + 1}</td>
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 text-slate-700">
                      {(() => {
                        const value = item[column.key];
                        // Allow custom render; pass both value and full item for flexibility
                        const rendered = column.render ? column.render(value, item) : value;
                        // Guard: React can't render plain objects directly (but allow valid React elements)
                        if (rendered !== null && typeof rendered === 'object' && !React.isValidElement(rendered)) {
                          try {
                            return JSON.stringify(rendered);
                          } catch (e) {
                            return String(rendered);
                          }
                        }
                        return rendered;
                      })()}
                    </td>
                  ))}
                  <td className="px-6 py-4 w-80">
                    <div className="flex justify-center items-center gap-2 min-w-fit">
                      {onView && (
                        <button
                          onClick={() => onView(item)}
                          className="h-8 rounded-md border border-slate-300 px-3 text-slate-700 font-medium hover:bg-slate-200 transition flex items-center gap-1 text-xs whitespace-nowrap"
                          title="Xem chi tiết"
                        >
                          <Eye size={12} />
                          Xem chi tiết
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="h-8 rounded-md border border-slate-300 px-3 text-slate-700 font-medium hover:bg-slate-200 transition flex items-center gap-1 text-xs whitespace-nowrap"
                          title="Chỉnh sửa"
                        >
                          <Edit size={12} />
                          Sửa
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="h-8 rounded-md bg-red-500 px-3 text-white font-medium hover:bg-red-600 transition flex items-center gap-1 text-xs whitespace-nowrap"
                          title="Xóa"
                        >
                          <Trash2 size={12} />
                          Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
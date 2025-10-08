import { Search, Eye, Edit, Trash2 } from 'lucide-react';

const Table = ({
  title,
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
    <div className="table-container">
      <div className="table-header">
        <h2 className="table-title">{title}</h2>
        <div className="table-actions">
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6b7280'
            }} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="search-input"
              style={{ paddingLeft: '40px' }}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Filters */}
          {filters.map((filter, index) => (
            <select
              key={index}
              className="form-select"
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              style={{ minWidth: filter.minWidth || '120px' }}
            >
              <option value="">{filter.placeholder}</option>
              {filter.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}

          {/* Add Button */}
          {onAdd && (
            <button className="btn btn-primary" onClick={onAdd}>
              {addButtonText}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>STT</th>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length + 2} style={{ textAlign: 'center', padding: '40px' }}>
                Đang tải...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 2} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.id || index}>
                <td>{index + 1}</td>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
                <td>
                  <div className="action-buttons">
                    {onView && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onView(item)}
                        title="Xem chi tiết"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onEdit(item)}
                        title="Chỉnh sửa"
                      >
                        <Edit size={14} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onDelete(item)}
                        title="Xóa"
                      >
                        <Trash2 size={14} />
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
  );
};

export default Table;
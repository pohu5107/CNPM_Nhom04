import { useState } from 'react';
import Modal from '../UI/Modal';
import Button from './Button';
import { mockParents } from '../../data/mockData';

const ParentSelector = ({ isOpen, onClose, onSelect, selectedParentId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter parents based on search term
  const filteredParents = mockParents
    .filter(p => p.status === 'active')
    .filter(parent => 
      parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.phone.includes(searchTerm) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleSelect = (parent) => {
    onSelect(parent);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chọn phụ huynh"
      size="lg"
    >
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ 
        maxHeight: '400px', 
        overflowY: 'auto',
        border: '1px solid #eee',
        borderRadius: '4px'
      }}>
        {filteredParents.length === 0 ? (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: '#666' 
          }}>
            {searchTerm ? 'Không tìm thấy phụ huynh nào' : 'Chưa có phụ huynh nào'}
          </div>
        ) : (
          filteredParents.map(parent => (
            <div
              key={parent.id}
              onClick={() => handleSelect(parent)}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                backgroundColor: selectedParentId === parent.id ? '#f0f8ff' : 'white',
                ':hover': { backgroundColor: '#f8f9fa' }
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = selectedParentId === parent.id ? '#f0f8ff' : 'white'}
            >
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                {parent.name}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
                📞 {parent.phone} • ✉️ {parent.email}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                📍 {parent.address}
              </div>
              {parent.children && parent.children.length > 0 && (
                <div style={{ fontSize: '12px', color: '#007bff', marginTop: '4px' }}>
                  Con: {parent.children.join(', ')}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ 
        marginTop: '20px', 
        display: 'flex', 
        gap: '10px',
        justifyContent: 'space-between'
      }}>
        <Button 
          variant="outline"
          onClick={() => {
            // TODO: Mở form tạo phụ huynh mới
            alert('Chức năng tạo phụ huynh mới sẽ được thêm sau');
          }}
        >
          + Tạo phụ huynh mới
        </Button>
        
        <Button variant="secondary" onClick={onClose}>
          Hủy
        </Button>
      </div>
    </Modal>
  );
};

export default ParentSelector;
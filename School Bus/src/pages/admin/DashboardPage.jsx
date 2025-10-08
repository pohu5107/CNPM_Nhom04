import { mockParents, mockStudents, mockDrivers } from '../../data/mockData';

const DashboardPage = () => {
  const stats = {
    totalParents: mockParents.length,
    activeParents: mockParents.filter(p => p.status === 'active').length,
    totalStudents: mockStudents.length,
    activeStudents: mockStudents.filter(s => s.status === 'active').length,
    totalDrivers: mockDrivers.length,
    activeDrivers: mockDrivers.filter(d => d.status === 'active').length,
  };

  // Tình trạng bằng lái sắp hết hạn
  const expiringSoonLicenses = mockDrivers.filter(driver => {
    const today = new Date();
    const expiry = new Date(driver.licenseExpiry);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  });

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
          Tổng quan Admin
        </h1>
        <p style={{ color: '#64748b' }}>
          Thống kê tổng quan hệ thống quản lý xe đưa đón học sinh
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Phụ huynh */}
        <div className="table-container" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#3b82f6' }}>
            Phụ huynh
          </h3>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            {stats.totalParents}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            <span style={{ color: '#10b981' }}>{stats.activeParents} hoạt động</span>
            {' • '}
            <span style={{ color: '#ef4444' }}>{stats.totalParents - stats.activeParents} không hoạt động</span>
          </div>
        </div>

        {/* Học sinh */}
        <div className="table-container" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#10b981' }}>
            Học sinh
          </h3>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            {stats.totalStudents}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            <span style={{ color: '#10b981' }}>{stats.activeStudents} hoạt động</span>
            {' • '}
            <span style={{ color: '#ef4444' }}>{stats.totalStudents - stats.activeStudents} không hoạt động</span>
          </div>
        </div>

        {/* Tài xế */}
        <div className="table-container" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#f59e0b' }}>
            Tài xế
          </h3>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            {stats.totalDrivers}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            <span style={{ color: '#10b981' }}>{stats.activeDrivers} hoạt động</span>
            {' • '}
            <span style={{ color: '#ef4444' }}>{stats.totalDrivers - stats.activeDrivers} không hoạt động</span>
          </div>
        </div>
      </div>

      {/* Cảnh báo bằng lái sắp hết hạn */}
      {expiringSoonLicenses.length > 0 && (
        <div className="table-container" style={{ marginBottom: '24px' }}>
          <div style={{ padding: '20px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '16px', 
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⚠️ Cảnh báo bằng lái sắp hết hạn
            </h3>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
              Có {expiringSoonLicenses.length} tài xế có bằng lái sắp hết hạn trong 30 ngày tới:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {expiringSoonLicenses.map(driver => {
                const daysUntilExpiry = Math.ceil(
                  (new Date(driver.licenseExpiry) - new Date()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div key={driver.id} style={{ 
                    padding: '12px', 
                    background: '#fef3c7', 
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong>{driver.name}</strong> ({driver.driverCode})
                      <div style={{ fontSize: '12px', color: '#92400e' }}>
                        Bằng lái: {driver.licenseNumber}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#92400e',
                      fontWeight: '600'
                    }}>
                      Còn {daysUntilExpiry} ngày
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tính năng sẽ phát triển */}
      <div className="table-container">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#64748b' }}>
            Tính năng đang phát triển
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            Dashboard sẽ được bổ sung thêm các tính năng:
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '12px',
            fontSize: '14px',
            color: '#64748b'
          }}>
            <div>📊 Biểu đồ thống kê</div>
            <div>🗺️ Bản đồ tracking real-time</div>
            <div>📋 Báo cáo chi tiết</div>
            <div>🔔 Thông báo hệ thống</div>
            <div>📈 Phân tích dữ liệu</div>
            <div>⏰ Lịch trình xe buýt</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
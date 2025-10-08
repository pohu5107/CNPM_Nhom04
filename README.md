# Smart School Bus Tracking System - Professional Frontend

Đây là phần frontend của hệ thống Smart School Bus Tracking (SSB 1.0) được phát triển bằng React + Vite với cấu trúc chuyên nghiệp và React Router DOM.

## 🚌 Tổng quan dự án

Hệ thống quản lý và giám sát xe đưa đón học sinh cho Admin, bao gồm các chức năng quản lý:
- **Dashboard**: Tổng quan thống kê và cảnh báo hệ thống
- **Phụ huynh**: Quản lý thông tin liên lạc, địa chỉ, con em
- **Học sinh**: Quản lý thông tin cá nhân, lớp học, tuyến xe, điểm đón
- **Tài xế**: Quản lý thông tin cá nhân, bằng lái, xe phụ trách, tuyến đường

## 🏗️ Cấu trúc dự án chuyên nghiệp

```
src/
├── components/              # Các component được tổ chức theo feature
│   ├── common/             # Component tái sử dụng
│   │   ├── Table.jsx       # Component table linh hoạt
│   │   ├── FormInput.jsx   # Component input với validation
│   │   ├── Button.jsx      # Component button tùy chỉnh
│   │   └── ...
│   ├── admin/              # Components cho admin role
│   │   ├── students/       # Feature-based grouping
│   │   │   ├── StudentTable.jsx
│   │   │   ├── StudentForm.jsx
│   │   │   └── StudentCard.jsx
│   │   ├── parents/
│   │   │   ├── ParentTable.jsx
│   │   │   ├── ParentForm.jsx
│   │   │   └── ParentCard.jsx
│   │   └── drivers/
│   │       ├── DriverTable.jsx
│   │       ├── DriverForm.jsx
│   │       └── DriverCard.jsx
│   └── UI/                 # UI components (Modal, Dialog, etc.)
│
├── pages/                  # Page components với routing
│   ├── admin/
│   │   ├── DashboardPage.jsx    # Trang tổng quan
│   │   ├── StudentsPage.jsx     # Trang quản lý học sinh
│   │   ├── ParentsPage.jsx      # Trang quản lý phụ huynh
│   │   └── DriversPage.jsx      # Trang quản lý tài xế
│   ├── parent/             # Placeholder cho team khác
│   ├── driver/             # Placeholder cho team khác
│   └── auth/               # Placeholder cho authentication
│
├── routes/                 # Route configuration
│   └── adminRoutes.jsx     # Admin routes với layout và navigation
│
├── hooks/                  # Custom hooks
│   └── useFakeApi.js       # Mock API với async operations
│
├── data/                   # Mock data và constants
│   └── mockData.js
│
├── styles/                 # Organized stylesheets
│   └── admin.css           # Admin-specific styles
│
├── utils/                  # Utility functions (dự trữ)
├── App.jsx                 # Main app với Router setup (ngắn gọn)
├── main.jsx                # Entry point
└── index.css               # Global styles với CSS variables
```

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js >= 16.0.0
- npm hoặc yarn

### Các bước cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd CNPM_Nhom04
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Chạy dự án development**
```bash
npm run dev
```

4. **Truy cập ứng dụng**
Mở trình duyệt và truy cập: `http://localhost:5175/` (hoặc port khác nếu bị chiếm)
→ Tự động redirect đến `/admin/dashboard`

### Scripts khác

```bash
# Build cho production
npm run build

# Preview build
npm run preview

# Lint code
npm run lint
```

## �️ Routing và Navigation

### URL Structure (với prefix /admin/)
- `/` → Redirect tự động đến `/admin/dashboard`
- `/admin/dashboard` - Trang tổng quan
- `/admin/parents` - Quản lý phụ huynh
- `/admin/students` - Quản lý học sinh  
- `/admin/drivers` - Quản lý tài xế
- Các URL khác → Redirect về dashboard

### Navigation Features
- **Browser History**: Hỗ trợ back/forward button
- **Direct URL Access**: Có thể truy cập trực tiếp bằng URL
- **Active State**: Highlight tab đang active
- **Icons**: Sử dụng Lucide React icons

## �📱 Tính năng hiện tại

### 1. **Dashboard Page** 📊
- ✅ Thống kê tổng quan (số lượng phụ huynh, học sinh, tài xế)
- ✅ Cảnh báo bằng lái sắp hết hạn
- ✅ Cards thống kê với màu sắc phân biệt
- ✅ Roadmap tính năng tương lai

### 2. **Quản lý Phụ huynh** 👨‍👩‍👧‍👦
- ✅ Table component linh hoạt với search
- ✅ Filter theo trạng thái
- ✅ CRUD operations với Modal forms
- ✅ Validation form đầy đủ
- ✅ Hiển thị thông tin con em

### 3. **Quản lý Học sinh** 🎓
- ✅ Advanced filtering (lớp, trạng thái)
- ✅ Liên kết với phụ huynh (dropdown selection)
- ✅ Quản lý tuyến xe và điểm đón
- ✅ Validation tuổi học sinh (6-18)
- ✅ Form với grid layout

### 4. **Quản lý Tài xế** 🚗
- ✅ Filter theo tuyến đường và trạng thái
- ✅ Quản lý bằng lái với cảnh báo hết hạn
- ✅ Phân công xe buýt và tuyến đường
- ✅ Thông tin liên hệ khẩn cấp
- ✅ Visual indicators cho bằng lái

### 5. **Technical Features** ⚙️
- ✅ React Router DOM navigation
- ✅ Reusable component system
- ✅ Mock API với async operations
- ✅ CSS Variables design system
- ✅ Professional folder structure
- ✅ Error handling và loading states
- ✅ Responsive design
- ✅ Accessibility features

## 🎨 Design System

### Color Palette
```css
--primary: #3b82f6      /* Blue */
--success: #10b981      /* Green */
--warning: #f59e0b      /* Yellow */
--danger: #ef4444       /* Red */
--gray-*: #f8fafc to #0f172a  /* Gray scale */
```

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Responsive**: Các size khác nhau cho mobile/desktop

### Component Design
- **Consistent**: Tất cả components follow design system
- **Reusable**: Common components có thể dùng lại
- **Flexible**: Props-based customization
- **Accessible**: Focus states, ARIA labels

## 🔧 Architecture Highlights

### 1. **Component Organization**
- **Feature-based**: Components grouped by functionality
- **Atomic Design**: Common → Specific components
- **Single Responsibility**: Mỗi component có 1 nhiệm vụ rõ ràng

### 2. **State Management**
- **Local State**: useState cho component state
- **Props Drilling**: Controlled để dễ theo dõi data flow
- **Ready for Redux**: Cấu trúc sẵn sàng cho global state

### 3. **Routing Strategy**
- **Clean Structure**: App.jsx ngắn gọn, chỉ định nghĩa route chính
- **Admin Prefix**: Tất cả admin routes có `/admin/` prefix
- **Nested Routes**: adminRoutes.jsx quản lý toàn bộ admin section
- **Future-ready**: Sẵn sàng cho ParentRoutes, DriverRoutes
- **Navigation**: React Router với relative paths trong nested routes

### 4. **API Integration**
- **Mock API**: useFakeApi hook mô phỏng real API
- **Async Operations**: Loading states, error handling
- **Easy Migration**: Chỉ cần thay mock bằng real API calls

## 📊 Dữ liệu mẫu

Dự án sử dụng dữ liệu mẫu realistic:
- **5 phụ huynh** với thông tin liên lạc đầy đủ
- **8 học sinh** với mối quan hệ phụ huynh
- **5 tài xế** với thông tin bằng lái và phân công
- **Danh mục**: 24 lớp học, 5 tuyến xe, 8 điểm đón, 5 xe bus

## 🔮 Roadmap

### Phase 1 - Completed ✅
- [x] Professional project structure
- [x] React Router DOM integration  
- [x] Reusable component system
- [x] All CRUD operations
- [x] Dashboard with statistics
- [x] Responsive design

### Phase 2 - Next Steps 🚧
- [ ] Authentication & Authorization
- [ ] Real API integration
- [ ] Advanced search & filtering
- [ ] Bulk operations
- [ ] Export/Import functionality
- [ ] Real-time notifications

### Phase 3 - Advanced Features 🌟
- [ ] Real-time bus tracking
- [ ] Push notifications
- [ ] Mobile app integration
- [ ] Analytics dashboard
- [ ] Report generation
- [ ] Multi-language support

## 👥 Phân công Team

- **Frontend Lead**: [Tên bạn] - Admin Dashboard (Parents, Students, Drivers)
- **Mobile Team**: Sẽ làm Parent và Driver mobile apps
- **Backend Team**: API development và database
- **UI/UX Team**: Header, Navbar, Sidebar components

## 🛠️ Technology Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 7
- **Routing**: React Router DOM 7
- **Icons**: Lucide React
- **Styling**: Custom CSS với CSS Variables
- **Package Manager**: npm
- **Development**: ESLint, Hot Reload

## 📝 Development Notes

### Code Standards
- **Component Naming**: PascalCase
- **File Organization**: Feature-based grouping
- **CSS**: BEM-like naming convention
- **Props**: Descriptive và well-documented

### Performance Considerations
- **Code Splitting**: Ready cho route-based splitting
- **Memoization**: Sẵn sàng cho React.memo, useMemo
- **Bundle Size**: Minimal dependencies
- **Image Optimization**: Placeholder cho future assets

### Accessibility
- **Keyboard Navigation**: Full support
- **Screen Readers**: ARIA labels
- **Color Contrast**: WCAG compliant
- **Focus Management**: Proper focus flow

---

**🎉 Dự án hoàn chỉnh và sẵn sàng để phát triển tiếp!**

Cấu trúc chuyên nghiệp này giúp:
- ✅ **Scalable**: Dễ mở rộng khi team lớn hơn
- ✅ **Maintainable**: Code organized và dễ maintain  
- ✅ **Professional**: Follow best practices
- ✅ **Team-ready**: Nhiều người có thể work cùng lúc
- ✅ **Future-proof**: Sẵn sàng cho advanced features

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

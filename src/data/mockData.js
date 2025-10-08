// Mock data cho hệ thống SSB Tracking
export const mockParents = [
  {
    id: 1,
    name: "Nguyễn Văn Minh",
    email: "nguyenvanminh@email.com",
    phone: "0901234567",
    address: "123 Đường Lê Loi, Quận 1, TP.HCM",
    status: "active",
    createdAt: "2024-01-15",
    children: ["1", "2"]
  },
  {
    id: 2,
    name: "Trần Thị Lan",
    email: "tranthilan@email.com",
    phone: "0902345678",
    address: "456 Đường Nguyễn Huệ, Quận 3, TP.HCM",
    status: "active",
    createdAt: "2024-02-10",
    children: ["3"]
  },
  {
    id: 3,
    name: "Lê Văn Hòa",
    email: "levanhoa@email.com",
    phone: "0903456789",
    address: "789 Đường Võ Văn Tần, Quận 5, TP.HCM",
    status: "inactive",
    createdAt: "2024-01-20",
    children: ["4", "5"]
  },
  {
    id: 4,
    name: "Phạm Thị Mai",
    email: "phamthimai@email.com",
    phone: "0904567890",
    address: "321 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM",
    status: "active",
    createdAt: "2024-03-05",
    children: ["6"]
  },
  {
    id: 5,
    name: "Hoàng Văn Đức",
    email: "hoangvanduc@email.com",
    phone: "0905678901",
    address: "654 Đường Hai Bà Trưng, Quận 1, TP.HCM",
    status: "active",
    createdAt: "2024-02-25",
    children: ["7", "8"]
  }
];

export const mockStudents = [
  {
    id: 1,
    name: "Nguyễn Minh An",
    studentCode: "HS001",
    class: "6A1",
    parentId: 1,
    parentName: "Nguyễn Văn Minh",
    dateOfBirth: "2012-05-15",
    address: "123 Đường Lê Loi, Quận 1, TP.HCM",
    busRoute: "Tuyến 01",
    pickupPoint: "Điểm đón A1",
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Nguyễn Minh Anh",
    studentCode: "HS002",
    class: "8B2",
    parentId: 1,
    parentName: "Nguyễn Văn Minh",
    dateOfBirth: "2010-08-20",
    address: "123 Đường Lê Loi, Quận 1, TP.HCM",
    busRoute: "Tuyến 01",
    pickupPoint: "Điểm đón A1",
    createdAt: "2024-01-15"
  },
  {
    id: 3,
    name: "Trần Thế Bảo",
    studentCode: "HS003",
    class: "7C1",
    parentId: 2,
    parentName: "Trần Thị Lan",
    dateOfBirth: "2011-03-10",
    address: "456 Đường Nguyễn Huệ, Quận 3, TP.HCM",
    busRoute: "Tuyến 02",
    pickupPoint: "Điểm đón B2",
    createdAt: "2024-02-10"
  },
  {
    id: 4,
    name: "Lê Minh Châu",
    studentCode: "HS004",
    class: "9A3",
    parentId: 3,
    parentName: "Lê Văn Hòa",
    dateOfBirth: "2009-12-05",
    address: "789 Đường Võ Văn Tần, Quận 5, TP.HCM",
    busRoute: "Tuyến 03",
    pickupPoint: "Điểm đón C1",
    createdAt: "2024-01-20"
  },
  {
    id: 5,
    name: "Lê Minh Đức",
    studentCode: "HS005",
    class: "6B1",
    parentId: 3,
    parentName: "Lê Văn Hòa",
    dateOfBirth: "2012-09-18",
    address: "789 Đường Võ Văn Tần, Quận 5, TP.HCM",
    busRoute: "Tuyến 03",
    pickupPoint: "Điểm đón C1",
    createdAt: "2024-01-20"
  },
  {
    id: 6,
    name: "Phạm Thị Hoa",
    studentCode: "HS006",
    class: "8A2",
    parentId: 4,
    parentName: "Phạm Thị Mai",
    dateOfBirth: "2010-11-30",
    address: "321 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM",
    busRoute: "Tuyến 04",
    pickupPoint: "Điểm đón D1",
    createdAt: "2024-03-05"
  },
  {
    id: 7,
    name: "Hoàng Văn Khang",
    studentCode: "HS007",
    class: "7A1",
    parentId: 5,
    parentName: "Hoàng Văn Đức",
    dateOfBirth: "2011-04-22",
    address: "654 Đường Hai Bà Trưng, Quận 1, TP.HCM",
    busRoute: "Tuyến 01",
    pickupPoint: "Điểm đón A2",
    createdAt: "2024-02-25"
  },
  {
    id: 8,
    name: "Hoàng Thị Linh",
    studentCode: "HS008",
    class: "6C2",
    parentId: 5,
    parentName: "Hoàng Văn Đức",
    dateOfBirth: "2012-07-08",
    address: "654 Đường Hai Bà Trưng, Quận 1, TP.HCM",
    busRoute: "Tuyến 01",
    pickupPoint: "Điểm đón A2",
    createdAt: "2024-02-25"
  }
];

export const mockDrivers = [
  {
    id: 1,
    name: "Nguyễn Văn Tài",
    driverCode: "TX001",
    phone: "0911111111",
    email: "nguyenvantai@email.com",
    licenseNumber: "B2-123456789",
    experience: "15 năm",
    busNumber: "Bus 01",
    route: "Tuyến 01",
    status: "active",
    address: "111 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM",
    createdAt: "2024-01-10"
  },
  {
    id: 2,
    name: "Trần Văn Nam",
    driverCode: "TX002",
    phone: "0913333333",
    email: "tranvannam@email.com",
    licenseNumber: "B2-987654321",
    experience: "12 năm",
    busNumber: "Bus 02",
    route: "Tuyến 02",
    status: "active",
    address: "222 Đường Lý Tự Trọng, Quận 1, TP.HCM",
    createdAt: "2024-01-15"
  },
  {
    id: 3,
    name: "Lê Văn Hùng",
    driverCode: "TX003",
    phone: "0915555555",
    email: "levanhung@email.com",
    licenseNumber: "B2-555666777",
    experience: "8 năm",
    busNumber: "Bus 03",
    route: "Tuyến 03",
    status: "inactive",
    address: "333 Đường Pasteur, Quận 3, TP.HCM",
    createdAt: "2024-02-01"
  },
  {
    id: 4,
    name: "Phạm Văn Đức",
    driverCode: "TX004",
    phone: "0917777777",
    email: "phamvanduc@email.com",
    licenseNumber: "B2-888999000",
    experience: "10 năm",
    busNumber: "Bus 04",
    route: "Tuyến 04",
    status: "active",
    address: "444 Đường Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM",
    createdAt: "2024-02-10"
  },
  {
    id: 5,
    name: "Hoàng Văn Sơn",
    driverCode: "TX005",
    phone: "0919999999",
    email: "hoangvanson@email.com",
    licenseNumber: "B2-111222333",
    experience: "6 năm",
    busNumber: "Bus 05",
    route: "Tuyến 05",
    status: "active",
    address: "555 Đường Nguyễn Đình Chiểu, Quận 3, TP.HCM",
    createdAt: "2024-03-01"
  }
];

// Danh sách lớp học
export const classes = [
  "6A1", "6A2", "6B1", "6B2", "6C1", "6C2",
  "7A1", "7A2", "7B1", "7B2", "7C1", "7C2", 
  "8A1", "8A2", "8B1", "8B2", "8C1", "8C2",
  "9A1", "9A2", "9A3", "9B1", "9B2", "9B3"
];

// Danh sách tuyến xe
export const routes = [
  "Tuyến 01", "Tuyến 02", "Tuyến 03", "Tuyến 04", "Tuyến 05"
];

// Danh sách điểm đón
export const pickupPoints = [
  "Điểm đón A1", "Điểm đón A2", "Điểm đón B1", "Điểm đón B2",
  "Điểm đón C1", "Điểm đón C2", "Điểm đón D1", "Điểm đón D2"
];

// Danh sách xe bus
export const buses = [
  "Bus 01", "Bus 02", "Bus 03", "Bus 04", "Bus 05"
];
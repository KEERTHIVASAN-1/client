import type {
  Student,
  Warden,
  Room,
  Fee,
  Attendance,
  Leave,
  Visitor,
  Complaint,
  Notification,
  MessMenuItem,
  Block,
  AdminDashboardStats,
  WardenDashboardStats,
  StudentDashboardStats,
  MonthlyChartData,
} from "@shared/schema";

const blocks: Block[] = ["A", "B", "C", "D"];

export const mockWardens: Warden[] = [
  { id: "w1", userId: "wu1", name: "Dr. Rajesh Kumar", email: "rajesh.kumar@hostel.edu", mobile: "9876543210", block: "A", createdAt: "2024-01-01" },
  { id: "w2", userId: "wu2", name: "Dr. Priya Sharma", email: "priya.sharma@hostel.edu", mobile: "9876543211", block: "B", createdAt: "2024-01-01" },
  { id: "w3", userId: "wu3", name: "Dr. Amit Patel", email: "amit.patel@hostel.edu", mobile: "9876543212", block: "C", createdAt: "2024-01-01" },
  { id: "w4", userId: "wu4", name: "Dr. Sunita Reddy", email: "sunita.reddy@hostel.edu", mobile: "9876543213", block: "D", createdAt: "2024-01-01" },
];

export const mockRooms: Room[] = [];
blocks.forEach((block, bi) => {
  for (let floor = 1; floor <= 3; floor++) {
    for (let room = 1; room <= 10; room++) {
      const roomNum = `${floor}${String(room).padStart(2, "0")}`;
      mockRooms.push({
        id: `r-${block}-${roomNum}`,
        roomNumber: roomNum,
        block,
        floor,
        capacity: 4,
        occupied: Math.floor(Math.random() * 4),
        createdAt: "2024-01-01",
      });
    }
  }
});

const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Atharva", "Advik", "Pranav", "Advaith", "Aarush", "Kabir", "Ritvik", "Anirudh", "Dhruv"];
const lastNames = ["Sharma", "Patel", "Kumar", "Singh", "Reddy", "Nair", "Rao", "Gupta", "Joshi", "Mishra", "Verma", "Chopra", "Kapoor", "Malhotra", "Banerjee", "Chatterjee", "Das", "Bose", "Ghosh", "Sen"];

export const mockStudents: Student[] = [];
let studentSeq: Record<Block, number> = { A: 0, B: 0, C: 0, D: 0 };

blocks.forEach((block) => {
  for (let i = 0; i < 25; i++) {
    studentSeq[block]++;
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const room = mockRooms.filter(r => r.block === block)[Math.floor(Math.random() * 30)];
    const studentId = `HSTL2025${block}${String(studentSeq[block]).padStart(3, "0")}`;
    
    mockStudents.push({
      id: `s-${block}-${i}`,
      studentId,
      userId: `su-${block}-${i}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.edu`,
      mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      parentMobile: `97${Math.floor(10000000 + Math.random() * 90000000)}`,
      address: `${Math.floor(1 + Math.random() * 999)}, ${["MG Road", "Park Street", "Ring Road", "Main Street", "College Road"][Math.floor(Math.random() * 5)]}, ${["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"][Math.floor(Math.random() * 5)]}`,
      block,
      roomId: room.id,
      roomNumber: room.roomNumber,
      bedNumber: Math.floor(Math.random() * 4) + 1,
      admissionDate: "2024-08-01",
      status: Math.random() > 0.1 ? "active" : "removed",
      createdAt: "2024-08-01",
    });
  }
  

});


export const mockFees: Fee[] = mockStudents.filter(s => s.status === "active").map((student, i) => ({
  id: `f-${i}`,
  studentId: student.id,
  studentName: student.name,
  studentIdNumber: student.studentId,
  block: student.block,
  totalAmount: 60000,
  paidAmount: Math.random() > 0.3 ? 60000 : Math.floor(Math.random() * 60000),
  dueDate: "2025-01-15",
  status: Math.random() > 0.3 ? "paid" : Math.random() > 0.5 ? "pending" : "overdue",
  createdAt: "2024-08-01",
}));

const today = new Date().toISOString().split("T")[0];
export const mockAttendance: Attendance[] = mockStudents.filter(s => s.status === "active").map((student, i) => ({
  id: `att-${i}`,
  studentId: student.id,
  studentIdNumber: student.studentId,
  studentName: student.name,
  block: student.block,
  roomNumber: student.roomNumber || "",
  date: today,
  status: Math.random() > 0.15 ? "present" : "absent",
  markedBy: mockWardens.find(w => w.block === student.block)?.id || "",
  createdAt: today,
}));

export const mockLeaves: Leave[] = mockStudents.filter(s => s.status === "active").slice(0, 15).map((student, i) => ({
  id: `l-${i}`,
  studentId: student.id,
  studentIdNumber: student.studentId,
  studentName: student.name,
  block: student.block,
  roomNumber: student.roomNumber || "",
  startDate: "2024-12-20",
  endDate: "2024-12-25",
  reason: ["Family function", "Medical emergency", "Personal work", "Festival celebration", "Doctor appointment"][Math.floor(Math.random() * 5)],
  status: ["pending", "approved", "rejected"][Math.floor(Math.random() * 3)] as any,
  createdAt: "2024-12-15",
}));

export const mockVisitors: Visitor[] = mockStudents.filter(s => s.status === "active").slice(0, 20).map((student, i) => ({
  id: `v-${i}`,
  visitorName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
  studentId: student.id,
  studentIdNumber: student.studentId,
  studentName: student.name,
  block: student.block,
  purpose: ["Parent visit", "Document delivery", "Medical checkup", "General visit", "Fee payment"][Math.floor(Math.random() * 5)],
  inTime: `${today}T${String(9 + Math.floor(Math.random() * 8)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:00`,
  outTime: Math.random() > 0.3 ? `${today}T${String(14 + Math.floor(Math.random() * 6)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:00` : undefined,
  createdAt: today,
}));

export const mockComplaints: Complaint[] = mockStudents.filter(s => s.status === "active").slice(0, 12).map((student, i) => ({
  id: `c-${i}`,
  complaintId: `CMPL${String(i + 1).padStart(3, "0")}`,
  studentId: student.id,
  studentIdNumber: student.studentId,
  studentName: student.name,
  studentMobile: student.mobile,
  block: student.block,
  roomNumber: student.roomNumber || "",
  category: ["mess", "room", "cleanliness", "safety", "other"][Math.floor(Math.random() * 5)] as any,
  title: ["Mess food quality", "AC not working", "Bathroom cleanliness", "Broken window", "Water supply issue", "Wifi connectivity", "Room maintenance", "Pest control needed"][Math.floor(Math.random() * 8)],
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. The issue needs immediate attention and resolution.",
  status: ["new", "in_progress", "resolved"][Math.floor(Math.random() * 3)] as any,
  createdAt: "2024-12-01",
  updatedAt: "2024-12-05",
}));

export const mockNotifications: Notification[] = [
  { id: "n1", title: "Fee Payment Reminder", message: "Please pay your hostel fees before the due date to avoid late charges.", targetType: "all_students", sentBy: "admin", sentByName: "Admin", createdAt: "2024-12-01T10:00:00", read: false },
  { id: "n2", title: "Mess Menu Updated", message: "The mess menu for this week has been updated. Please check the mess section.", targetType: "all_students", sentBy: "admin", sentByName: "Admin", createdAt: "2024-12-02T09:00:00", read: true },
  { id: "n3", title: "Block A Meeting", message: "All Block A students are requested to attend a meeting in the common room at 6 PM.", targetType: "block_students", targetBlock: "A", sentBy: "w1", sentByName: "Dr. Rajesh Kumar", createdAt: "2024-12-05T14:00:00", read: false },
];

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const mealTypes = ["breakfast", "lunch", "dinner"] as const;

const breakfastItems = [["Idli", "Sambar", "Chutney"], ["Poha", "Tea"], ["Paratha", "Curd", "Pickle"], ["Dosa", "Chutney", "Sambar"], ["Upma", "Coconut Chutney"], ["Bread", "Butter", "Jam", "Omelette"], ["Puri", "Bhaji"]];
const lunchItems = [["Rice", "Dal", "Vegetable Curry", "Roti"], ["Biryani", "Raita", "Salad"], ["Rice", "Sambar", "Poriyal", "Rasam"], ["Roti", "Paneer Butter Masala", "Rice", "Dal"], ["Rice", "Chole", "Jeera Rice"], ["Pulao", "Dal Fry", "Raita"], ["Rice", "Rajma", "Roti", "Salad"]];
const dinnerItems = [["Roti", "Mixed Vegetable", "Dal", "Rice"], ["Fried Rice", "Manchurian", "Soup"], ["Roti", "Dal Makhani", "Rice", "Salad"], ["Dosa", "Sambar", "Chutney"], ["Roti", "Palak Paneer", "Rice"], ["Pulao", "Kadhi", "Papad"], ["Roti", "Aloo Gobi", "Dal", "Rice"]];

export const mockMessMenu: MessMenuItem[] = [];
daysOfWeek.forEach((day, di) => {
  mealTypes.forEach((mealType) => {
    let items: string[];
    if (mealType === "breakfast") items = breakfastItems[di];
    else if (mealType === "lunch") items = lunchItems[di];
    else items = dinnerItems[di];
    
    mockMessMenu.push({
      id: `mm-${day}-${mealType}`,
      day,
      mealType,
      items,
      createdAt: "2024-12-01",
      updatedAt: "2024-12-01",
    });
  });
});

export const mockAdminDashboardStats: AdminDashboardStats = {
  totalStudents: mockStudents.filter(s => s.status === "active").length,
  totalRooms: mockRooms.length,
  availableBeds: mockRooms.reduce((acc, r) => acc + (r.capacity - r.occupied), 0),
  pendingFees: mockFees.filter(f => f.status !== "paid").length,
  todayAttendancePercentage: Math.round((mockAttendance.filter(a => a.status === "present").length / mockAttendance.length) * 100),
  visitorCountToday: mockVisitors.filter(v => v.createdAt.startsWith(today)).length,
  activeLeaveRequests: mockLeaves.filter(l => l.status === "pending").length,
  openComplaints: mockComplaints.filter(c => c.status !== "resolved").length,
  blockStats: blocks.map(block => ({
    block,
    studentCount: mockStudents.filter(s => s.block === block && s.status === "active").length,
    roomCount: mockRooms.filter(r => r.block === block).length,
    wardenName: mockWardens.find(w => w.block === block)?.name || "",
    wardenMobile: mockWardens.find(w => w.block === block)?.mobile || "",
  })),
};

export function getWardenDashboardStats(block: Block): WardenDashboardStats {
  const blockStudents = mockStudents.filter(s => s.block === block && s.status === "active");
  const blockAttendance = mockAttendance.filter(a => a.block === block);
  const blockLeaves = mockLeaves.filter(l => l.block === block);
  const blockVisitors = mockVisitors.filter(v => v.block === block && v.createdAt.startsWith(today));
  
  return {
    block,
    totalStudents: blockStudents.length,
    totalRooms: mockRooms.filter(r => r.block === block).length,
    presentToday: blockAttendance.filter(a => a.status === "present").length,
    absentToday: blockAttendance.filter(a => a.status === "absent").length,
    pendingAttendance: blockStudents.length - blockAttendance.length,
    activeLeaves: blockLeaves.filter(l => l.status === "pending").length,
    visitorsToday: blockVisitors.length,
  };
}

export function getStudentDashboardStats(studentId: string): StudentDashboardStats | null {
  const student = mockStudents.find(s => s.id === studentId || s.studentId === studentId);
  if (!student) return null;
  
  const warden = mockWardens.find(w => w.block === student.block);
  const fee = mockFees.find(f => f.studentId === student.id);
  const attendance = mockAttendance.find(a => a.studentId === student.id);
  const leaves = mockLeaves.filter(l => l.studentId === student.id);
  const roommates = mockStudents.filter(s => s.roomNumber === student.roomNumber && s.id !== student.id && s.status === "active");
  
  return {
    studentId: student.studentId,
    name: student.name,
    block: student.block,
    roomNumber: student.roomNumber || "",
    floor: parseInt(student.roomNumber?.charAt(0) || "1"),
    bedNumber: student.bedNumber || 1,
    roommates: roommates.map(r => r.name),
    wardenName: warden?.name || "",
    wardenMobile: warden?.mobile || "",
    totalFee: fee?.totalAmount || 0,
    paidFee: fee?.paidAmount || 0,
    pendingFee: (fee?.totalAmount || 0) - (fee?.paidAmount || 0),
    dueDate: fee?.dueDate || "",
    todayAttendance: attendance?.status || "not_marked",
    monthlyAttendancePercentage: 92,
    totalLeaves: leaves.length,
    pendingLeaves: leaves.filter(l => l.status === "pending").length,
    unreadNotifications: mockNotifications.filter(n => !n.read && (n.targetType === "all_students" || (n.targetType === "block_students" && n.targetBlock === student.block))).length,
  };
}

export const mockMonthlyChartData: MonthlyChartData[] = [
  { month: "Jul", attendance: 94, fees: 85000, occupancy: 88, visitors: 45, complaints: 3 },
  { month: "Aug", attendance: 92, fees: 120000, occupancy: 95, visitors: 62, complaints: 5 },
  { month: "Sep", attendance: 95, fees: 95000, occupancy: 96, visitors: 38, complaints: 2 },
  { month: "Oct", attendance: 91, fees: 78000, occupancy: 94, visitors: 55, complaints: 4 },
  { month: "Nov", attendance: 93, fees: 110000, occupancy: 92, visitors: 48, complaints: 3 },
  { month: "Dec", attendance: 89, fees: 92000, occupancy: 90, visitors: 72, complaints: 6 },
];

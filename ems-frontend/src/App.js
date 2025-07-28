// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/dashboard';
import EquipmentList from './components/Equipment/EquipmentList';
import EquipmentForm from './components/Equipment/EquipmentForm';
import UserManagement from './components/User/UserManagement';
import MaintenanceLogs from './components/Equipment/MaintenanceLog';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import DashboardHome from './components/Dashboard/DashboardHome'; // You'll need to create this component
import RequestList from './components/Requests/RequestList';
import RequestForm from './components/Requests/RequestForm';
import RequestDetail from './components/Requests/RequestDetail';
import Reports from './components/Reports/Reports';
import AssignRoles from './components/User/AssignRoles';
import AddUser from './components/User/AddUser';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      {/* Protected routes with nested structure */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'manager', 'engineer']} />}>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="all-equipment" element={<EquipmentList />} />
          <Route path="add-equipment" element={<EquipmentForm />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="under-maintenance" element={<MaintenanceLogs />} />
          <Route path="requests" element={<RequestList />} />
          <Route path="requests/:id" element={<RequestDetail />} />
          <Route path="new-request" element={<RequestForm />} />
          <Route path="reports" element={<Reports />} />
          <Route path="assign-roles" element={<AssignRoles />} />
          <Route path="add-user" element={<AddUser />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;